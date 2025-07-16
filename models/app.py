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
    # Legal keyword check (same as in /qa)
    legal_keywords = [
        "law", "legal", "contract", "agreement", "court", "rights", "obligation", "liability", "statute", "regulation", "compliance", "intellectual property", "license", "dispute", "evidence", "witness", "testimony", "case", "plaintiff", "defendant", "judge", "attorney", "counsel", "jurisdiction", "damages", "settlement", "arbitration", "litigation", "clause", "breach", "terms", "conditions", "policy", "privacy", "confidentiality", "indemnity", "warranty", "guarantee", "appeal", "verdict", "sentence", "prosecution", "defense", "trial", "hearing", "summons", "subpoena", "evidence", "testament", "will", "trust", "estate", "property", "ownership", "lease", "tenant", "landlord", "employment", "employee", "employer", "labor", "union", "discrimination", "harassment", "divorce", "custody", "alimony", "child support", "immigration", "citizenship", "visa", "asylum", "deportation", "bankruptcy", "insolvency", "tax", "audit", "patent", "copyright", "trademark", "merger", "acquisition", "shareholder", "stock", "securities", "fraud", "antitrust", "competition", "monopoly", "consumer", "protection", "product liability", "recall", "environmental", "pollution", "hazardous", "safety", "compliance", "insurance", "claim", "premium", "coverage", "beneficiary", "pension", "retirement", "social security", "disability", "compensation", "criminal", "civil", "tort", "negligence", "malpractice", "damages", "injunction", "restraining order", "probation", "parole", "sentence", "conviction", "acquittal", "plea", "bail", "bond", "arrest", "detention", "incarceration", "parole", "probation", "warrant", "indictment", "arraignment", "plea bargain", "testify", "testimony", "evidence", "exhibit", "cross-examination", "verdict", "sentence", "appeal", "restitution", "expungement", "pardon", "clemency", "commutation", "extradition", "habeas corpus", "injunction", "mandamus", "certiorari", "subpoena", "deposition", "affidavit", "notary", "oath", "affirmation", "perjury", "contempt", "sanction", "fine", "penalty", "forfeiture", "seizure", "confiscation", "garnishment", "lien", "levy", "foreclosure", "repossession", "eviction", "partition", "quiet title", "easement", "encroachment", "zoning", "eminent domain", "condemnation", "inverse condemnation", "nuisance", "trespass", "conversion", "replevin", "detinue", "bailment", "chattel", "fixture", "intestate", "testate", "probate", "executor", "administrator", "guardian", "conservator", "ward", "trustee", "beneficiary", "fiduciary", "power of attorney", "living will", "advance directive", "health care proxy", "do not resuscitate", "organ donation", "autopsy", "coroner", "medical examiner", "mortgage", "deed", "title", "escrow", "closing", "settlement", "abstract", "survey", "appraisal", "real estate", "broker", "agent", "listing", "offer", "acceptance", "counteroffer", "earnest money", "contingency", "disclosure", "inspection", "walk-through", "possession", "move-in", "move-out", "rent", "security deposit", "utilities", "maintenance", "repair", "improvement", "alteration", "addition", "remodel", "renovation", "restoration", "preservation", "conservation", "demolition"]
    if not any(keyword in text.lower() for keyword in legal_keywords):
        return {"summary": "This is not a legal file. Please upload a legal document."}
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
    # Simple keyword-based legal check
    legal_keywords = [
        "law", "legal", "contract", "agreement", "court", "rights", "obligation", "liability", "statute", "regulation", "compliance", "intellectual property", "license", "dispute", "evidence", "witness", "testimony", "case", "plaintiff", "defendant", "judge", "attorney", "counsel", "jurisdiction", "damages", "settlement", "arbitration", "litigation", "clause", "breach", "terms", "conditions", "policy", "privacy", "confidentiality", "indemnity", "warranty", "guarantee", "appeal", "verdict", "sentence", "prosecution", "defense", "trial", "hearing", "summons", "subpoena", "evidence", "testament", "will", "trust", "estate", "property", "ownership", "lease", "tenant", "landlord", "employment", "employee", "employer", "labor", "union", "discrimination", "harassment", "divorce", "custody", "alimony", "child support", "immigration", "citizenship", "visa", "asylum", "deportation", "bankruptcy", "insolvency", "tax", "audit", "patent", "copyright", "trademark", "merger", "acquisition", "shareholder", "stock", "securities", "fraud", "antitrust", "competition", "monopoly", "consumer", "protection", "product liability", "recall", "environmental", "pollution", "hazardous", "safety", "compliance", "insurance", "claim", "premium", "coverage", "beneficiary", "pension", "retirement", "social security", "disability", "compensation", "criminal", "civil", "tort", "negligence", "malpractice", "damages", "injunction", "restraining order", "probation", "parole", "sentence", "conviction", "acquittal", "plea", "bail", "bond", "arrest", "detention", "incarceration", "parole", "probation", "warrant", "indictment", "arraignment", "plea bargain", "testify", "testimony", "evidence", "exhibit", "cross-examination", "verdict", "sentence", "appeal", "restitution", "expungement", "pardon", "clemency", "commutation", "extradition", "habeas corpus", "injunction", "mandamus", "certiorari", "subpoena", "deposition", "affidavit", "notary", "oath", "affirmation", "perjury", "contempt", "sanction", "fine", "penalty", "forfeiture", "seizure", "confiscation", "garnishment", "lien", "levy", "foreclosure", "repossession", "eviction", "partition", "quiet title", "easement", "encroachment", "zoning", "eminent domain", "condemnation", "inverse condemnation", "nuisance", "trespass", "conversion", "replevin", "detinue", "bailment", "chattel", "fixture", "intestate", "testate", "probate", "executor", "administrator", "guardian", "conservator", "ward", "trustee", "beneficiary", "fiduciary", "power of attorney", "living will", "advance directive", "health care proxy", "do not resuscitate", "organ donation", "autopsy", "coroner", "medical examiner", "mortgage", "deed", "title", "escrow", "closing", "settlement", "abstract", "survey", "appraisal", "real estate", "broker", "agent", "listing", "offer", "acceptance", "counteroffer", "earnest money", "contingency", "disclosure", "inspection", "walk-through", "possession", "move-in", "move-out", "rent", "security deposit", "utilities", "maintenance", "repair", "improvement", "alteration", "addition", "remodel", "renovation", "restoration", "preservation", "conservation", "demolition", "abatement", "abatement notice", "abatement order", "abatement action", "abatement cost", "abatement proceeding", "abatement process", "abatement requirement", "abatement standard", "abatement work", "abatement zone", "abatement area", "abatement plan", "abatement program", "abatement project", "abatement schedule", "abatement system", "abatement team", "abatement unit", "abatement violation", "abatement warrant", "abatement work plan", "abatement work zone", "abatement zone plan", "abatement zone schedule", "abatement zone system", "abatement zone team", "abatement zone unit", "abatement zone violation", "abatement zone warrant", "abatement zone work", "abatement zone work plan", "abatement zone work zone", "abatement zone zone", "abatement zone zone plan", "abatement zone zone schedule", "abatement zone zone system", "abatement zone zone team", "abatement zone zone unit", "abatement zone zone violation", "abatement zone zone warrant", "abatement zone zone work", "abatement zone zone work plan", "abatement zone zone work zone", "abatement zone zone zone", "abatement zone zone zone plan", "abatement zone zone zone schedule", "abatement zone zone zone system", "abatement zone zone zone team", "abatement zone zone zone unit", "abatement zone zone zone violation", "abatement zone zone zone warrant", "abatement zone zone zone work", "abatement zone zone zone work plan", "abatement zone zone zone work zone", "abatement zone zone zone zone"]
    if not any(keyword in question.lower() for keyword in legal_keywords):
        return {"answer": "Failed to answer...Please ask a legal question about your document"}
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