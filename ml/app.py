from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from features import build_frame

app = FastAPI()
model = joblib.load("model.pkl")
VALUE = {"poor": 2.0, "average": 5.5, "good": 9.0}

class ScoreRequest(BaseModel):
    answer: str
    keywords: list[str]

@app.post("/score")
def score(req: ScoreRequest):
    X = build_frame([req.answer], [req.keywords])
    probs = model.predict_proba(X)[0]
    classes = list(model.classes_)
    label = classes[int(probs.argmax())]
    value = sum(p * VALUE[c] for p, c in zip(probs, classes))
    return {"label": label, "score": round(max(1.0, min(10.0, value)), 1)}

@app.get("/health")
def health():
    return {"status": "ok"}