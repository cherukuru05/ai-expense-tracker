"""
NLP-based expense categorization using keyword matching + TF-IDF model.
Falls back to keyword rules if model not trained yet.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import re

router = APIRouter()

CATEGORY_KEYWORDS = {
    "Food": [
        "swiggy", "zomato", "restaurant", "cafe", "hotel", "food", "grocery",
        "dmart", "bigbasket", "dinner", "lunch", "breakfast", "pizza", "burger",
        "dominos", "mcdonalds", "kfc", "subway", "barbeque", "biryani", "dabba",
        "canteen", "mess", "tiffin", "cook", "fruit", "vegetable", "supermarket",
    ],
    "Transport": [
        "uber", "ola", "metro", "bus", "petrol", "diesel", "cab", "auto",
        "rapido", "train", "irctc", "flight", "airport", "fuel", "parking",
        "toll", "ferry", "rickshaw", "motorbike", "service station",
    ],
    "Entertainment": [
        "netflix", "hotstar", "spotify", "amazon prime", "prime video", "movie",
        "theatre", "pvr", "inox", "concert", "event", "gaming", "youtube",
        "apple music", "disney", "zee5", "sonyliv", "bookmyshow",
    ],
    "Health": [
        "gym", "pharmacy", "hospital", "doctor", "medicine", "apollo", "medplus",
        "clinic", "dentist", "physiotherapy", "yoga", "fitness", "wellness",
        "1mg", "netmeds", "diagnostics", "lab test", "surgery", "consultation",
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "nykaa", "shopping", "mall",
        "clothes", "fashion", "shoes", "bag", "watch", "electronics", "mobile",
        "laptop", "gadget", "furniture", "ikea", "home decor", "meesho",
    ],
    "Utilities": [
        "electricity", "water", "gas", "broadband", "wifi", "airtel", "jio",
        "bsnl", "mobile", "recharge", "bill", "maintenance", "society", "rent",
        "internet", "cable", "postpaid", "prepaid",
    ],
    "Education": [
        "udemy", "coursera", "book", "course", "college", "fees", "school",
        "tuition", "coaching", "byju", "unacademy", "skill", "certificate",
        "exam", "test", "stationery", "pen", "notebook",
    ],
    "Travel": [
        "hotel", "resort", "airbnb", "makemytrip", "goibibo", "yatra", "holiday",
        "tour", "trip", "travel", "visa", "passport", "luggage", "vacation",
    ],
}

class CategorizeRequest(BaseModel):
    description: str
    amount: Optional[float] = None

class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    method: str

def keyword_match(description: str) -> tuple[str, float]:
    text = description.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[cat] = score
    
    if scores:
        best = max(scores, key=scores.get)
        confidence = min(scores[best] / 3.0, 0.95)
        return best, confidence
    
    return "Other", 0.3

@router.post("/categorize", response_model=CategorizeResponse)
def categorize_expense(req: CategorizeRequest):
    """
    Categorize an expense description using NLP.
    Uses keyword matching as baseline; plug in a trained sklearn/transformers model here.
    """
    category, confidence = keyword_match(req.description)
    
    # TODO: replace with trained model
    # from models.classifier import predict_category
    # category, confidence = predict_category(req.description, req.amount)
    
    return CategorizeResponse(
        category=category,
        confidence=round(confidence, 2),
        method="keyword_match",
    )