import torch
import os
from transformers import AutoModel, AutoTokenizer
from pathlib import Path
from typing import Optional, Dict, Callable, Awaitable
from threading import Event
import fitz  # PyMuPDF
from PIL import Image
import io
import asyncio

class OCRService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = 'D:\\models\\deepseek-ocr\\'
        self._ready = False
        
    async def initialize(self):
        """初始化模型"""
        try:
            print(torch.__version__)
            print(torch.cuda.device_count())  # 显示可见 GPU 数量
            print(torch.cuda.is_available())  # 是否检测到 GPU
            print("Loading DeepSeek-OCR model...")
            os.environ["CUDA_VISIBLE_DEVICES"] = '0'
            
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            # 减少生成警告：若无 pad_token，则用 eos 兜底
            try:
                if getattr(self.tokenizer, 'pad_token_id', None) is None and getattr(self.tokenizer, 'eos_token', None) is not None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                    print(f"Set tokenizer.pad_token to eos_token: id={self.tokenizer.pad_token_id}")
            except Exception as _:
                pass
            
            self.model = AutoModel.from_pretrained(
                self.model_name,
                _attn_implementation='flash_attention_2',
                trust_remote_code=True,
                use_safetensors=True
            )
            
            self.model = self.model.eval().cuda().to(torch.bfloat16)
            self._ready = True
            print("Model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def is_ready(self) -> bool:
        """检查模型是否已加载"""
        return self._ready
    
    def _get_stream_path(self, out_dir: str) -> str:
        """返回用于增量写入的结果文件路径，避免与模型自带保存冲突。"""
        os.makedirs(out_dir, exist_ok=True)
        return os.path.join(out_dir, "result_stream.md")

    def _append_stream(self, out_dir: str, text: str, header: str = "") -> None:
        """将内容追加写入流式结果文件。"""
        try:
            path = self._get_stream_path(out_dir)
            with open(path, "a", encoding="utf-8", errors="ignore") as f:
                if header:
                    f.write(header + "\n")
                f.write(text or "")
                f.write("\n\n")
                f.flush()
        except Exception:
            pass

    def _wait_for_file(self, file_path: str, timeout: float = 5.0, interval: float = 0.1) -> bool:
        """等待文件在指定时间内生成，返回是否成功检测到文件。"""
        import time

        if not file_path:
            return False

        elapsed = 0.0
        while elapsed < timeout:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                return True
            time.sleep(interval)
            elapsed += interval
        return os.path.exists(file_path) and os.path.getsize(file_path) > 0

    def _get_prompt(self, output_format: str, custom_prompt: Optional[str] = None) -> str:
        """获取提示词"""
        fmt = (output_format or "").strip().lower()

        # rec 模式特殊处理：需要从 custom_prompt 中提取定位目标
        if fmt == "rec":
            if custom_prompt and custom_prompt.strip():
                target = custom_prompt.strip()
                prompt = f"<image>\nLocate <|ref|>{target}<|/ref|> in the image."
                print(f"🎯 Using rec prompt with target: {target}")
                return prompt
            raise ValueError("rec 模式需要指定定位目标（custom_prompt不能为空）")

        # 其他模式：优先使用自定义提示词
        if custom_prompt and custom_prompt.strip():
            print(f"🎯 Using custom prompt: {custom_prompt}")
            return custom_prompt

        default_prompts = {
            "markdown": "<image>\n<|grounding|>Convert the document to markdown.",
            "ocr": "<image>\n<|grounding|>OCR this image.",
            "free_ocr": "<image>\nFree OCR.",
            "figure": "<image>\nParse the figure.",
            "general": "<image>\nDescribe this image in detail.",
        }

        prompt = default_prompts.get(fmt)
        if prompt:
            print(f"🎯 Using default prompt for {fmt}: {prompt[:60]}...")
            return prompt

        raise ValueError(f"未知的输出格式：{output_format}")
    
    def _get_mode_params(self, mode: str) -> Dict:
        """获取模式参数"""
        modes = {
            "tiny": {"base_size": 512, "image_size": 512, "crop_mode": False},
            "small": {"base_size": 640, "image_size": 640, "crop_mode": False},
            "base": {"base_size": 1024, "image_size": 1024, "crop_mode": False},
            "large": {"base_size": 1280, "image_size": 1280, "crop_mode": False},
            "gundam": {"base_size": 1024, "image_size": 640, "crop_mode": True}
        }
        
        return modes.get(mode, modes["base"])

    def _read_fallback_output(self, out_dir: str) -> str:
        """当 model.infer 返回 None 时，尝试从输出目录读取结果文件。"""
        try:
            print(f"📂 Reading fallback from: {out_dir}")
            candidates = []
            preferred = {"result.mmd", "result.md", "result.txt"}
            
            # 先检查常见文件名
            for name in preferred:
                p = os.path.join(out_dir, name)
                if self._wait_for_file(p, timeout=6.0):
                    size = os.path.getsize(p)
                    print(f"  🔍 Found {name}, size: {size} bytes")
                    if size > 0:
                        with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            print(f"  ✅ Read {len(content)} chars from {name}")
                            print(f"  📄 Preview: {content[:200]}...")
                            return content
            
            # 兜底：搜索目录下所有文本结果
            print(f"  🔍 Searching all .mmd/.md/.txt files in {out_dir}")
            import time as time_module
            time_module.sleep(0.2)
            for root, _, files in os.walk(out_dir):
                for fn in files:
                    if fn.lower().endswith((".mmd", ".md", ".txt")):
                        fp = os.path.join(root, fn)
                        try:
                            if not self._wait_for_file(fp, timeout=2.0):
                                continue
                            size = os.path.getsize(fp)
                            mtime = os.path.getmtime(fp)
                            print(f"    Found: {fn} ({size} bytes)")
                            if size > 0:
                                candidates.append((mtime, fp))
                        except Exception:
                            continue
            
            if candidates:
                candidates.sort(reverse=True)
                _, fp = candidates[0]
                print(f"  ✅ Using most recent file: {os.path.basename(fp)}")
                with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    print(f"  📄 Read {len(content)} chars")
                    print(f"  📄 Preview: {content[:200]}...")
                    return content
            else:
                print(f"  ⚠️  No fallback files found")
        except Exception as e:
            print(f"  ❌ Fallback read error: {e}")
            pass
        return ""

    def _post_save_outputs(self, out_dir: str, text: str, output_format: str = "") -> None:
        """在输出目录中保存结果文件：若包含 mermaid 则生成 result.mmd，否则保存为 result.md。
        rec模式跳过保存，因为只需要图片。"""
        try:
            # rec模式不需要保存文本结果，只需要result_with_boxes.jpg
            if output_format == "rec":
                print(f"🎯 rec模式：跳过文本文件保存，只依赖图片")
                return
            
            os.makedirs(out_dir, exist_ok=True)
            content = text or ""
            
            # 检查是否为空或占位符
            if not content.strip() or "[OCR返回为空" in content:
                print(f"⚠️  内容为空或错误占位符，跳过保存")
                return
            
            has_mermaid = ("```mermaid" in content) or content.strip().startswith("graph ") or content.strip().startswith("flowchart ")
            if has_mermaid:
                mmd_path = os.path.join(out_dir, "result.mmd")
                with open(mmd_path, "w", encoding="utf-8", errors="ignore") as f:
                    if "```mermaid" not in content:
                        f.write("```mermaid\n" + content.strip() + "\n```")
                    else:
                        f.write(content)
                print(f"✅ 保存 mermaid 结果到: {mmd_path}")
            else:
                md_path = os.path.join(out_dir, "result.md")
                with open(md_path, "w", encoding="utf-8", errors="ignore") as f:
                    f.write(content)
                print(f"✅ 保存 markdown 结果到: {md_path}")
        except Exception as e:
            print(f"❌ 保存输出文件失败: {e}")
            pass
    
    def _pdf_to_images(self, pdf_path: str, output_dir: str) -> list:
        """将PDF转换为图片列表"""
        try:
            pdf_document = fitz.open(pdf_path)
            image_paths = []
            
            print(f"PDF has {len(pdf_document)} page(s)")
            
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                # 使用较高的DPI以获得更好的质量
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom = 144 DPI
                
                img_path = os.path.join(output_dir, f"page_{page_num + 1}.png")
                pix.save(img_path)
                image_paths.append(img_path)
                print(f"Converted PDF page {page_num + 1} to {img_path}")
            
            pdf_document.close()
            return image_paths
            
        except Exception as e:
            raise RuntimeError(f"PDF conversion failed: {str(e)}")
    
    async def process(
        self,
        file_path: str,
        mode: str,
        output_format: str,
        custom_prompt: Optional[str] = None,
        output_path: str = "",
        on_progress: Optional[Callable[[Dict], Awaitable[None]]] = None,
        cancel_event: Optional[asyncio.Event] = None,
        thread_cancel_event: Optional[Event] = None
    ) -> Dict:
        """处理OCR请求"""
        if not self._ready:
            raise RuntimeError("Model is not ready")
        
        prompt = self._get_prompt(output_format, custom_prompt)
        mode_params = self._get_mode_params(mode)
        collected_image_paths = []
        
        try:
            def _check_cancel():
                if cancel_event is not None and cancel_event.is_set():
                    print("⛔ Cancellation requested inside OCR process")
                    raise asyncio.CancelledError()

            _check_cancel()
            # 验证文件存在
            if not os.path.exists(file_path):
                raise RuntimeError(f"File not found: {file_path}")
            
            file_size = os.path.getsize(file_path)
            if file_size == 0:
                raise RuntimeError(f"File is empty: {file_path}")
            
            # 检测文件类型
            file_ext = os.path.splitext(file_path)[1].lower()
            print(f"Processing OCR with mode={mode}, format={output_format}")
            print(f"File: {file_path} ({file_size} bytes)")
            print(f"File type: {file_ext}")
            print(f"Mode params: {mode_params}")
            
            # 处理 PDF 文件
            if file_ext == '.pdf':
                print("PDF file detected, converting to images...")
                pdf_images_dir = os.path.join(output_path, "pdf_pages")
                os.makedirs(pdf_images_dir, exist_ok=True)
                os.makedirs(output_path, exist_ok=True)
                
                image_paths = self._pdf_to_images(file_path, pdf_images_dir)
                
                # 处理每一页
                all_results = []
                # 初始化/清空流式结果文件
                try:
                    open(self._get_stream_path(output_path), "w", encoding="utf-8", errors="ignore").close()
                except Exception:
                    pass
                
                # 创建线程池用于同步推理
                import asyncio
                import concurrent.futures
                loop = asyncio.get_event_loop()
                executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
                try:
                    for idx, img_path in enumerate(image_paths):
                        _check_cancel()
                        print(f"\nProcessing page {idx + 1}/{len(image_paths)}...")
                        print(f"Prompt: {prompt[:100]}...")
                        
                        # 为每一页创建独立的输出目录
                        page_output_dir = os.path.join(output_path, f"page_{idx + 1}")
                        os.makedirs(page_output_dir, exist_ok=True)
                        
                        # 在线程池中运行同步推理，避免阻塞事件循环
                        def sync_infer():
                            return self.model.infer(
                                self.tokenizer,
                                prompt=prompt,
                                image_file=img_path,
                                output_path=page_output_dir,
                                base_size=mode_params["base_size"],
                                image_size=mode_params["image_size"],
                                crop_mode=mode_params["crop_mode"],
                                save_results=True,
                                test_compress=False,
                                cancel_event=thread_cancel_event
                            )
                        
                        print(f"⏳ Starting async inference for page {idx + 1}...")
                        try:
                            result = await loop.run_in_executor(executor, sync_infer)
                        except asyncio.CancelledError:
                            raise
                        except RuntimeError as infer_error:
                            if "inference_cancelled" in str(infer_error).lower():
                                raise asyncio.CancelledError()
                            raise
                        print(f"⏳ Inference completed for page {idx + 1}")
                    
                        print(f"📋 Page {idx + 1} infer result type: {type(result)}")
                        print(f"📋 Page {idx + 1} infer result: {result}")
                        
                        # 转换结果为字符串
                        if result is None:
                            # 模型返回None时，尝试从保存的文件读取
                            print(f"⚠️  Page {idx + 1}: Model returned None, trying fallback read...")
                            fallback_text = self._read_fallback_output(page_output_dir)
                            if fallback_text and fallback_text.strip():
                                page_text = fallback_text
                                print(f"✅ Page {idx + 1}: Fallback read success, {len(page_text)} chars")
                            else:
                                page_text = "[OCR返回为空，请检查图片质量或prompt]"
                                print(f"❌ Page {idx + 1}: Model returned None and no saved file found")
                        elif isinstance(result, (list, tuple)):
                            page_text = str(result[0]) if result else ""
                            print(f"✅ Page {idx + 1}: Got result from list/tuple, {len(page_text)} chars")
                        elif isinstance(result, dict):
                            page_text = str(result.get('text', result))
                            print(f"✅ Page {idx + 1}: Got result from dict, {len(page_text)} chars")
                        else:
                            page_text = str(result)
                            print(f"✅ Page {idx + 1}: Got result as string, {len(page_text)} chars")
                        
                        print(f"📝 Page {idx + 1} text length: {len(page_text)} chars")
                        all_results.append(f"--- Page {idx + 1} ---\n{page_text}")

                        # 检查是否有带框图片（等待写入完成）
                        result_with_boxes = os.path.join(page_output_dir, "result_with_boxes.jpg")
                        has_image = self._wait_for_file(result_with_boxes, timeout=6.0)

                        image_path = None
                        if has_image:
                            collected_image_paths.append(result_with_boxes)
                            image_path = result_with_boxes
                            print(f"✅ Page {idx + 1} result_with_boxes.jpg found")
                        else:
                            # 即使图片不存在，也继续处理，不影响文本结果
                            print(f"⚠️  Page {idx + 1} result_with_boxes.jpg NOT found after waiting, continuing...")

                        # 边解析边保存与输出
                        self._append_stream(output_path, page_text, header=f"--- Page {idx + 1} ---")
                        try:
                            print(f"\n[Stream] Page {idx + 1} output (first 200 chars):\n{page_text[:200]}\n")
                        except Exception:
                            pass

                        # 即时向上层回调，驱动前端实时显示
                        print(f"🚀 Sending page {idx + 1} to frontend via callback...")
                        if on_progress is not None:
                            try:
                                await on_progress({
                                    "type": "page",
                                    "page": idx + 1,
                                    "total": len(image_paths),
                                    "text": page_text,
                                    "image_path": image_path
                                })
                                print(f"✅ Page {idx + 1} callback completed")
                                # 重要：让出控制权给事件循环，确保SSE立即发送
                                import asyncio
                                await asyncio.sleep(0.1)
                            except Exception as e:
                                print(f"❌ Page {idx + 1} callback failed: {e}")
                                pass
                        _check_cancel()
                        
                        # 不删除临时图片，保留用于预览
                        # 注释掉：os.remove(img_path)
                finally:
                    executor.shutdown(wait=False)
                
                _check_cancel()

                # 合并所有页面结果
                final_result = "\n\n".join(all_results)
                # 如果每页均为空占位，尝试整体回退读取一次
                if not final_result.strip() or all('[OCR返回为空' in r for r in all_results):
                    fb_all = self._read_fallback_output(output_path)
                    if fb_all.strip():
                        final_result = fb_all
                print(f"\nProcessed {len(image_paths)} pages successfully")
                _check_cancel()
                if not (output_format == "rec" and final_result == ""):
                    try:
                        self._post_save_outputs(output_path, final_result, output_format)
                    except Exception:
                        pass
                
            else:
                # 处理图片文件
                try:
                    with Image.open(file_path) as test_img:
                        test_img.verify()
                    with Image.open(file_path) as test_img:
                        _ = test_img.convert("RGB")
                    print(f"PIL image validation: OK")
                except Exception as pil_error:
                    raise RuntimeError(f"Invalid image file: {pil_error}")
                
                print(f"\n🔍 Starting image OCR inference...")
                print(f"  Full Prompt: {prompt}")
                print(f"  Image file: {file_path}")
                print(f"  Output path: {output_path}")
                print(f"  Base size: {mode_params['base_size']}")
                print(f"  Image size: {mode_params['image_size']}")
                print(f"  Crop mode: {mode_params['crop_mode']}")
                os.makedirs(output_path, exist_ok=True)
                
                _check_cancel()

                try:
                    result = self.model.infer(
                        self.tokenizer,
                        prompt=prompt,
                        image_file=file_path,
                        output_path=output_path,
                        base_size=mode_params["base_size"],
                        image_size=mode_params["image_size"],
                        crop_mode=mode_params["crop_mode"],
                        save_results=True,
                        test_compress=False,
                        cancel_event=thread_cancel_event
                    )
                except RuntimeError as infer_error:
                    if "inference_cancelled" in str(infer_error).lower():
                        raise asyncio.CancelledError()
                    raise
                
                print(f"🔍 Inference completed!")
                _check_cancel()
                
                print(f"\n📋 Raw infer result:")
                print(f"  Type: {type(result)}")
                print(f"  Content: {result}")
                print(f"  Preview (first 500 chars): {str(result)[:500]}...")
                
                # 确保 result 是字符串类型
                if result is None:
                    if output_format == "rec":
                        print("⚠️  Model returned None but rec mode only needs image; skipping fallback text read")
                        final_result = ""
                    else:
                        fallback_text = self._read_fallback_output(output_path)
                        final_result = fallback_text if fallback_text.strip() else "[OCR返回为空，请检查图片质量或prompt]"
                        print(f"⚠️  Model returned None!")
                elif isinstance(result, (list, tuple)):
                    final_result = str(result[0]) if result else ""
                    print(f"✅ Converted from list/tuple, length: {len(final_result)}")
                elif isinstance(result, dict):
                    final_result = str(result.get('text', result))
                    print(f"✅ Converted from dict, length: {len(final_result)}")
                else:
                    final_result = str(result)
                    print(f"✅ Converted to string, length: {len(final_result)}")
                
                print(f"\n✨ Final result length: {len(final_result)} characters")
                print(f"✨ Final result preview (first 200 chars): {final_result[:200]}...")
                # 立即写入流式结果文件
                self._append_stream(output_path, final_result, header="--- Image Result ---")

                # 检查是否有带框图片
                result_with_boxes = os.path.join(output_path, "result_with_boxes.jpg")
                image_path = result_with_boxes if self._wait_for_file(result_with_boxes, timeout=6.0) else None
                if image_path:
                    collected_image_paths.append(image_path)
                    print(f"✅ result_with_boxes.jpg found for single image")
                    if output_format == "rec" and final_result == "":
                        print("🎯 rec模式：仅返回标注图，无需文本")

                # 单图也向上层回调一次，便于统一前端逻辑
                if on_progress is not None:
                    try:
                        print(f"📤 Sending image callback to frontend, image_path: {image_path}")
                        await on_progress({
                            "type": "image",
                            "text": final_result,
                            "image_path": image_path
                        })
                        print(f"✅ Image callback sent successfully")
                    except Exception as e:
                        print(f"❌ Image callback failed: {e}")
                        pass
                # 强制保存输出，确保生成 .mmd/.md 文件
                try:
                    self._post_save_outputs(output_path, final_result, output_format)
                except Exception:
                    pass
            
            return {
                "text": final_result,
                "prompt": prompt,
                "image_paths": collected_image_paths
            }   
            
        except asyncio.CancelledError:
            print("OCR processing cancelled by user")
            raise
        except Exception as e:
            print(f"OCR processing error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"OCR processing failed: {type(e).__name__}: {str(e)}")
