from transformers import AutoModel, AutoTokenizer
import torch
import os


os.environ["CUDA_VISIBLE_DEVICES"] = '0'

print(torch.__version__)
print(torch.cuda.device_count())  # 显示可见 GPU 数量
print(torch.cuda.is_available()) 
model_name = 'D:\\models\\deepseek-ocr\\'


tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModel.from_pretrained(model_name, _attn_implementation='flash_attention_2', trust_remote_code=True, use_safetensors=True)
model = model.eval().cuda().to(torch.bfloat16)



# prompt = "<image>\nFree OCR. "
#prompt = "<image>\n<|grounding|>解析该图片内容"
prompt = "<image>\nParse the figure."
image_file = 'D:\\models\\DeepSeek-OCR-1\\DeepSeek-OCR-master\\DeepSeek-OCR-hf\\1761035474.png'
output_path = 'D:\\models\\DeepSeek-OCR-1\\DeepSeek-OCR-master\\DeepSeek-OCR-hf'



# infer(self, tokenizer, prompt='', image_file='', output_path = ' ', base_size = 1024, image_size = 640, crop_mode = True, test_compress = False, save_results = False):

# Tiny: base_size = 512, image_size = 512, crop_mode = False
# Small: base_size = 640, image_size = 640, crop_mode = False
# Base: base_size = 1024, image_size = 1024, crop_mode = False
# Large: base_size = 1280, image_size = 1280, crop_mode = False

# Gundam: base_size = 1024, image_size = 640, crop_mode = True

res = model.infer(tokenizer, prompt=prompt, image_file=image_file, output_path = output_path, base_size = 1024, image_size = 640, crop_mode=True, save_results = True, test_compress = True)

