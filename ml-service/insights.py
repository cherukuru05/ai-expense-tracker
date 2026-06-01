from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ExpenseItem(BaseModel):
    category: str
    amount: float
    description: str

class CategoryLimit(BaseModel):
    name: str
    limit: float

class BudgetInfo(BaseModel):
    totalBudget: float
    categories: List[CategoryLimit]

class InsightsRequest(BaseModel):
    expenses: List[ExpenseItem]
    budget: Optional[BudgetInfo] = None

class InsightItem(BaseModel):
    type: str
    category: Optional[str] = None
    message: str

class InsightsResponse(BaseModel):
    insights: List[InsightItem]

@router.post("/insights", response_model=InsightsResponse)
def generate_insights(req: InsightsRequest):
    insights = []
    
    # Calculate spending by category
    by_category = {}
    total_spent = 0.0
    for e in req.expenses:
        by_category[e.category] = by_category.get(e.category, 0.0) + e.amount
        total_spent += e.amount

    # Check budgets
    if req.budget:
        for bc in req.budget.categories:
            spent = by_category.get(bc.name, 0.0)
            pct = round((spent / bc.limit) * 100) if bc.limit > 0 else 0
            if pct >= 90:
                insights.append(InsightItem(
                    type="warning",
                    category=bc.name,
                    message=f"Category '{bc.name}' budget is {pct}% used. Consider reducing immediate expenses."
                ))
            elif pct >= 70:
                insights.append(InsightItem(
                    type="caution",
                    category=bc.name,
                    message=f"Category '{bc.name}' budget is {pct}% used. Monitor your progress."
                ))

        # Overall budget check
        if req.budget.totalBudget > 0:
            overall_pct = round((total_spent / req.budget.totalBudget) * 100)
            if overall_pct >= 90:
                insights.append(InsightItem(
                    type="warning",
                    message=f"Overall budget is {overall_pct}% exhausted. Critical spending limit reached."
                ))
            elif overall_pct >= 75:
                insights.append(InsightItem(
                    type="caution",
                    message=f"Overall monthly budget is {overall_pct}% consumed."
                ))

    # Top spending category insight
    if by_category:
        top_cat = max(by_category, key=by_category.get)
        top_amount = by_category[top_cat]
        insights.append(InsightItem(
            type="info",
            category=top_cat,
            message=f"Your highest spend is in '{top_cat}' at ₹{top_amount:,.2f}."
        ))

    # General savings suggestions
    if total_spent > 0:
        food_spent = by_category.get("Food", 0.0)
        if food_spent / total_spent > 0.4:
            insights.append(InsightItem(
                type="info",
                category="Food",
                message="Dining out and food deliveries make up over 40% of your expenses. Cooking home meals could save money."
            ))

    return InsightsResponse(insights=insights)
