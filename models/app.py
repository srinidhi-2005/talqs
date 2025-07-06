from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import uvicorn
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, T5Tokenizer, T5ForConditionalGeneration

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Summarization Model (facebook/bart-base) ---
summary_model_path = os.getenv("SUMMARY_MODEL_PATH")
summary_tokenizer = AutoTokenizer.from_pretrained("facebook/bart-base")
summary_model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-base")
summary_model.load_state_dict(torch.load(summary_model_path, map_location="cpu"))
summary_model.eval()

# --- QA Model (t5-base) ---
qa_model_path = os.getenv("QA_MODEL_PATH")
qa_tokenizer = T5Tokenizer.from_pretrained("t5-base")
qa_model = T5ForConditionalGeneration.from_pretrained("t5-base")
qa_model.load_state_dict(torch.load(qa_model_path, map_location="cpu"))
qa_model.eval()

class QARequest(BaseModel):
    question: str

@app.post("/summarize")
async def summarize(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")
    # Preprocess and chunk if needed (for long docs)
    inputs = summary_tokenizer([text], max_length=1024, truncation=True, return_tensors="pt")
    with torch.no_grad():
        summary_ids = summary_model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=128,
            num_beams=4,
            early_stopping=True
        )
    summary = summary_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return {"summary": summary}

@app.post("/qa")
async def qa(request: QARequest):
    question = request.question
    # You may want to add context or allow context input
    input_text = f"question: {question} context: "  # Add context if needed
    inputs = qa_tokenizer([input_text], max_length=512, truncation=True, return_tensors="pt")
    with torch.no_grad():
        output_ids = qa_model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=64,
            num_beams=4,
            early_stopping=True
        )
    answer = qa_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return {"answer": answer}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)