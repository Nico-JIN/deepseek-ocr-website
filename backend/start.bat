@echo off
echo Starting DeepSeek-OCR Backend...
echo.

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
python main.py
