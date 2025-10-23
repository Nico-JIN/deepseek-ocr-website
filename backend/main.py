from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
from pathlib import Path
from typing import Optional, Dict
import json
from datetime import datetime
import time
from ocr_service import OCRService
import asyncio
import uuid
import threading
from pydantic import BaseModel

app = FastAPI(title="DeepSeek-OCR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ocr_service = OCRService()

# 流式处理标志
ENABLE_STREAMING = True  # 设置为True启用流式传输


class CancelRequest(BaseModel):
    job_id: str

active_jobs: Dict[str, Dict[str, object]] = {}
jobs_lock = asyncio.Lock()

@app.on_event("startup")
async def startup_event():
    await ocr_service.initialize()

@app.get("/")
async def root():
    return {"message": "DeepSeek-OCR API is running", "version": "1.0.0"}

@app.get("/api/configs")
async def get_configs():
    """获取所有可用的配置选项"""
    return {
        "modes": [
            {"value": "tiny", "label": "Tiny (512×512, 64 tokens)", "base_size": 512, "image_size": 512, "crop_mode": False},
            {"value": "small", "label": "Small (640×640, 100 tokens)", "base_size": 640, "image_size": 640, "crop_mode": False},
            {"value": "base", "label": "Base (1024×1024, 256 tokens)", "base_size": 1024, "image_size": 1024, "crop_mode": False},
            {"value": "large", "label": "Large (1280×1280, 400 tokens)", "base_size": 1280, "image_size": 1280, "crop_mode": False},
            {"value": "gundam", "label": "Gundam (Dynamic Resolution)", "base_size": 1024, "image_size": 640, "crop_mode": True}
        ],
        "output_formats": [
            {"value": "markdown", "label": "Markdown 文档", "prompt": "<image>\n<|grounding|>Convert the document to markdown.", "requires_input": False, "input_type": "optional"},
            {"value": "ocr", "label": "OCR 图片识别", "prompt": "<image>\n<|grounding|>OCR this image.", "requires_input": False, "input_type": "optional"},
            {"value": "free_ocr", "label": "自由识别（无布局）", "prompt": "<image>\nFree OCR.", "requires_input": False, "input_type": "optional"},
            {"value": "figure", "label": "图表解析", "prompt": "<image>\nParse the figure.", "requires_input": False, "input_type": "optional"},
            {"value": "general", "label": "详细描述", "prompt": "<image>\nDescribe this image in detail.", "requires_input": False, "input_type": "none", "description": "返回图片的详细文本描述"},
            {"value": "rec", "label": "对象定位", "prompt": "<image>\nLocate <|ref|>{target}<|/ref|> in the image.", "requires_input": True, "input_type": "required", "description": "返回带标注框的图片", "placeholder": "请输入要定位的内容，如：红色按钮、标题文字等"}
        ],
        "default_mode": "base",
        "default_format": "markdown"
    }

@app.post("/api/ocr/stream")
async def process_ocr_stream(
    file: UploadFile = File(...),
    mode: str = Form("base"),
    output_format: str = Form("markdown"),
    custom_prompt: Optional[str] = Form(None)
):
    """流式OCR处理端点"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            buffer.flush()
            os.fsync(buffer.fileno())
        
        output_path = OUTPUT_DIR / timestamp
        output_path.mkdir(exist_ok=True)
        
        abs_file_path = str(file_path.absolute())
        abs_output_path = str(output_path.absolute())
        
        job_id = str(uuid.uuid4())
        cancel_event = asyncio.Event()
        thread_cancel_event = threading.Event()
        async with jobs_lock:
            active_jobs[job_id] = {
                "cancel_event": cancel_event,
                "thread_cancel": thread_cancel_event,
                "timestamp": timestamp,
                "task": None
            }

        async def generate():
            try:
                t0 = time.perf_counter()
                start_iso = datetime.now().isoformat()
                # 发送开始信号
                yield f"data: {json.dumps({'type': 'start', 'message': '开始处理...', 'start_time': start_iso, 'job_id': job_id})}\n\n"
                await asyncio.sleep(0.05)

                queue: asyncio.Queue = asyncio.Queue()

                async def on_progress(event: dict):
                    if cancel_event.is_set():
                        return
                    # 将每页/每块的结果送入队列，移除原有type避免冲突
                    clean_event = {k: v for k, v in event.items() if k != 'type'}
                    await queue.put(clean_event)

                # 并发启动处理任务
                task = asyncio.create_task(
                    ocr_service.process(
                        file_path=abs_file_path,
                        mode=mode,
                        output_format=output_format,
                        custom_prompt=custom_prompt,
                        output_path=abs_output_path,
                        on_progress=on_progress,
                        cancel_event=cancel_event,
                        thread_cancel_event=thread_cancel_event
                    )
                )
                async with jobs_lock:
                    job_entry = active_jobs.get(job_id)
                    if job_entry is not None:
                        job_entry["task"] = task

                result = None
                # 消费队列中的事件并转成 SSE，直到处理完成且队列清空
                while True:
                    if cancel_event.is_set() and queue.empty():
                        break
                    if task.done() and queue.empty():
                        break
                    try:
                        event = await asyncio.wait_for(queue.get(), timeout=0.5)
                        print(f"🔍 Processing queue event: {event.keys()}")
                        
                        # 保持向前端的一致结构：type 固定为 'chunk'，携带 text 及可选页码
                        payload = {"type": "chunk", "text": event.get("text", ""), "job_id": job_id}
                        if "page" in event:
                            payload["page"] = event.get("page")
                            payload["total"] = event.get("total")
                        if "image_path" in event and event.get("image_path"):
                            # 转换为相对URL路径
                            img_path = event.get("image_path")
                            print(f"🖼️  Found image_path: {img_path}")
                            rel_path = os.path.relpath(img_path, str(OUTPUT_DIR))
                            payload["image_url"] = f"/outputs/{rel_path.replace(os.sep, '/')}"
                            print(f"✅ Converted to image_url: {payload['image_url']}")
                        
                        print(f"📤 Sending SSE event: page={payload.get('page')}, text_len={len(payload.get('text', ''))}, has_image={bool(payload.get('image_url'))}")
                        yield f"data: {json.dumps(payload)}\n\n"
                        print(f"✅ SSE event sent successfully")
                        
                        queue.task_done()
                    except asyncio.TimeoutError:
                        # 超时时检查是否还有进行中的任务
                        if not task.done():
                            # 任务还在运行，继续等待
                            await asyncio.sleep(0.05)
                        continue

                # 获取最终结果并发送元数据/完成信号
                try:
                    result = await task
                except asyncio.CancelledError:
                    yield f"data: {json.dumps({'type': 'cancelled', 'job_id': job_id})}\n\n"
                    return
                text = str(result.get("text", ""))
                raw_image_paths = result.get("image_paths") or []
                image_urls = []
                for ip in raw_image_paths:
                    try:
                        if ip and os.path.exists(ip):
                            rel_path = os.path.relpath(ip, str(OUTPUT_DIR))
                            image_urls.append(f"/outputs/{rel_path.replace(os.sep, '/')}")
                    except Exception:
                        continue
                elapsed_ms = int((time.perf_counter() - t0) * 1000)
                yield f"data: {json.dumps({'type': 'metadata', 'mode': mode, 'output_format': output_format, 'prompt_used': str(result.get('prompt', '')), 'timestamp': timestamp, 'start_time': start_iso, 'duration_ms': elapsed_ms, 'final_text_length': len(text), 'image_urls': image_urls, 'job_id': job_id})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'duration_ms': elapsed_ms, 'job_id': job_id})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            finally:
                try:
                    async with jobs_lock:
                        active_jobs.pop(job_id, None)
                except Exception:
                    pass
                # 清理文件
                try:
                    os.remove(file_path)
                except:
                    pass
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # disable buffering on some proxies
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ocr/cancel")
async def cancel_ocr(request: CancelRequest):
    async with jobs_lock:
        job = active_jobs.get(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found or already finished")

        cancel_event = job.get("cancel_event")
        thread_cancel = job.get("thread_cancel")
        task = job.get("task")

        if cancel_event and not cancel_event.is_set():
            cancel_event.set()
        if thread_cancel and not thread_cancel.is_set():
            thread_cancel.set()
        if task and not task.done():
            task.cancel()

    return {"success": True}

@app.post("/api/ocr")
async def process_ocr(
    file: UploadFile = File(...),
    mode: str = Form("base"),
    output_format: str = Form("markdown"),
    custom_prompt: Optional[str] = Form(None)
):
    """处理OCR请求"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_ext = Path(file.filename).suffix.lower()
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.pdf', '.bmp', '.tiff', '.webp'}
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        
        # 保存上传的文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            buffer.flush()
            os.fsync(buffer.fileno())
        
        # 验证文件已保存
        if not file_path.exists():
            raise HTTPException(status_code=500, detail="File save failed")
        
        file_size = file_path.stat().st_size
        if file_size == 0:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        print(f"File saved: {file_path} ({file_size} bytes)")
        
        output_path = OUTPUT_DIR / timestamp
        output_path.mkdir(exist_ok=True)
        
        # 使用绝对路径
        abs_file_path = str(file_path.absolute())
        abs_output_path = str(output_path.absolute())
        
        print(f"Processing with absolute paths:")
        print(f"  Input: {abs_file_path}")
        print(f"  Output: {abs_output_path}")
        
        t0 = time.perf_counter()
        result = await ocr_service.process(
            file_path=abs_file_path,
            mode=mode,
            output_format=output_format,
            custom_prompt=custom_prompt,
            output_path=abs_output_path
        )
        duration_ms = int((time.perf_counter() - t0) * 1000)
        
        print(f"\n✅ OCR processing completed!")
        print(f"Result keys: {result.keys()}")
        print(f"Text length: {len(str(result.get('text', '')))} characters")
        print(f"Text preview (first 300 chars):\n{str(result.get('text', ''))[:300]}\n")
        
        os.remove(file_path)
        print(f"🗑️  Cleaned up uploaded file")
        
        # 确保返回值可以被 JSON 序列化
        result_text = str(result["text"]) if result["text"] is not None else ""
        result_prompt = str(result["prompt"]) if result["prompt"] is not None else ""
        raw_image_paths = result.get("image_paths") or []
        image_urls = []
        for ip in raw_image_paths:
            try:
                if ip and os.path.exists(ip):
                    rel_path = os.path.relpath(ip, str(OUTPUT_DIR))
                    image_urls.append(f"/outputs/{rel_path.replace(os.sep, '/')}")
            except Exception:
                continue
        
        response_data = {
            "success": True,
            "data": {
                "text": result_text,
                "mode": str(mode),
                "output_format": str(output_format),
                "prompt_used": result_prompt,
                "timestamp": str(timestamp),
            "duration_ms": duration_ms,
            "image_urls": image_urls
            }
        }
        
        print(f"\n📤 Sending response to frontend:")
        print(f"  - Success: {response_data['success']}")
        print(f"  - Text length: {len(result_text)} chars")
        print(f"  - Text preview: {result_text[:100]}...")
        print(f"  - Mode: {mode}")
        print(f"  - Format: {output_format}")
        print(f"  - Response keys: {response_data['data'].keys()}")
        print(f"\n🎯 Full response data: {response_data}\n")
        
        return JSONResponse(content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in process_ocr: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "model_loaded": ocr_service.is_ready(),
        "timestamp": datetime.now().isoformat()
    }

# 挂载静态文件目录（必须在所有API路由之后）
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
