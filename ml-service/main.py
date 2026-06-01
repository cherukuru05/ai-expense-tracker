import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import calendar
from datetime import datetime

from categorize import router as categorize_router
from insights import router as insights_router

app = FastAPI(title="FinTrack AI ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    userId: str
    currentSpent: float
    dayOfMonth: int

class PredictResponse(BaseModel):
    prediction: float
    currentSpent: float
    dayOfMonth: int

@app.get("/health")
def health():
    return {"status": "healthy", "service": "ml-service"}

@app.post("/predict", response_model=PredictResponse)
def predict_spend(req: PredictRequest):
    # Get total days in the current month
    now = datetime.now()
    _, num_days = calendar.monthrange(now.year, now.month)
    
    # Avoid division by zero
    day = max(req.dayOfMonth, 1)
    
    # Linear projection prediction
    prediction = (req.currentSpent / day) * num_days
    
    # Add a slight adjustments (simulate AI models refining predictions)
    # in real scenarios, this could use regression on historical daily spending patterns
    
    return PredictResponse(
        prediction=round(prediction, 2),
        currentSpent=req.currentSpent,
        dayOfMonth=req.dayOfMonth
    )

# Include sub-routers
app.include_router(categorize_router)
app.include_router(insights_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
