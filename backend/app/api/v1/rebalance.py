"""
Rebalancing API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.database import User, Portfolio, RebalanceHistory
from app.services.stellar_oracle import stellar_oracle_client
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter()

# Pydantic models
class RebalanceRequest(BaseModel):
    wallet_address: str
    threshold: float = 0.05  # 5% threshold
    max_slippage: float = 0.01  # 1% max slippage

class RebalanceResponse(BaseModel):
    should_rebalance: bool
    current_allocation: Dict[str, float]
    target_allocation: Dict[str, float]
    suggested_orders: List[Dict[str, Any]]
    estimated_cost: float
    risk_improvement: float

class RebalanceExecute(BaseModel):
    wallet_address: str
    orders: List[Dict[str, Any]]

@router.post("/suggest", response_model=RebalanceResponse)
async def suggest_rebalancing(
    request: RebalanceRequest, 
    db: Session = Depends(get_db)
):
    """Suggest rebalancing for a portfolio"""
    try:
        # Get user and portfolio
        user = db.query(User).filter(User.wallet_address == request.wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        
        if not portfolios:
            raise HTTPException(status_code=404, detail="No portfolio found")
        
        # Get current prices and calculate allocations
        current_allocation = {}
        target_allocation = {}
        total_value = 0.0
        
        for portfolio in portfolios:
            price = await stellar_oracle_client.get_asset_price(
                portfolio.asset_code, 
                portfolio.asset_issuer
            )
            
            if price:
                value = portfolio.balance * price
                total_value += value
                
                current_allocation[portfolio.asset_code] = {
                    "value": value,
                    "allocation": 0.0,  # Will be calculated after total_value
                    "target_allocation": portfolio.target_allocation / 100.0
                }
        
        # Calculate current allocations
        for asset_code in current_allocation:
            current_allocation[asset_code]["allocation"] = (
                current_allocation[asset_code]["value"] / total_value
                if total_value > 0 else 0
            )
            target_allocation[asset_code] = current_allocation[asset_code]["target_allocation"]
        
        # Check if rebalancing is needed
        should_rebalance = check_rebalance_needed(current_allocation, target_allocation, request.threshold)
        
        # Generate suggested orders
        suggested_orders = []
        estimated_cost = 0.0
        risk_improvement = 0.0
        
        if should_rebalance:
            suggested_orders = generate_rebalance_orders(
                current_allocation, 
                target_allocation, 
                total_value
            )
            estimated_cost = calculate_estimated_cost(suggested_orders)
            risk_improvement = calculate_risk_improvement(current_allocation, target_allocation)
        
        return RebalanceResponse(
            should_rebalance=should_rebalance,
            current_allocation={k: v["allocation"] for k, v in current_allocation.items()},
            target_allocation=target_allocation,
            suggested_orders=suggested_orders,
            estimated_cost=estimated_cost,
            risk_improvement=risk_improvement
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting rebalancing: {str(e)}")

@router.post("/execute")
async def execute_rebalancing(
    request: RebalanceExecute, 
    db: Session = Depends(get_db)
):
    """Execute rebalancing orders (simulated)"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == request.wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Simulate execution
        execution_results = []
        total_cost = 0.0
        
        for order in request.orders:
            # Simulate order execution
            result = simulate_order_execution(order)
            execution_results.append(result)
            total_cost += result.get("cost", 0.0)
        
        # Save to rebalance history
        rebalance_history = RebalanceHistory(
            user_id=user.id,
            old_allocation=json.dumps({}),  # Would store actual old allocation
            new_allocation=json.dumps(request.orders),
            rebalance_type="manual",
            success=True
        )
        
        db.add(rebalance_history)
        db.commit()
        
        return {
            "message": "Rebalancing executed successfully",
            "execution_results": execution_results,
            "total_cost": total_cost,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error executing rebalancing: {str(e)}")

@router.get("/{wallet_address}/history")
async def get_rebalance_history(wallet_address: str, db: Session = Depends(get_db)):
    """Get rebalancing history for a wallet"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get rebalance history
        history = db.query(RebalanceHistory).filter(
            RebalanceHistory.user_id == user.id
        ).order_by(RebalanceHistory.executed_at.desc()).limit(20).all()
        
        return [
            {
                "id": record.id,
                "rebalance_type": record.rebalance_type,
                "old_allocation": json.loads(record.old_allocation),
                "new_allocation": json.loads(record.new_allocation),
                "executed_at": record.executed_at.isoformat(),
                "success": record.success,
                "error_message": record.error_message
            }
            for record in history
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting rebalance history: {str(e)}")

def check_rebalance_needed(
    current_allocation: Dict[str, Dict], 
    target_allocation: Dict[str, float], 
    threshold: float
) -> bool:
    """Check if rebalancing is needed based on threshold"""
    
    for asset_code, current_data in current_allocation.items():
        current_alloc = current_data["allocation"]
        target_alloc = target_allocation.get(asset_code, 0.0)
        
        # Check if deviation exceeds threshold
        deviation = abs(current_alloc - target_alloc)
        if deviation > threshold:
            return True
    
    return False

def generate_rebalance_orders(
    current_allocation: Dict[str, Dict], 
    target_allocation: Dict[str, float], 
    total_value: float
) -> List[Dict[str, Any]]:
    """Generate rebalancing orders"""
    
    orders = []
    
    for asset_code, current_data in current_allocation.items():
        current_alloc = current_data["allocation"]
        target_alloc = target_allocation.get(asset_code, 0.0)
        current_value = current_data["value"]
        
        # Calculate target value
        target_value = total_value * target_alloc
        
        # Calculate difference
        value_diff = target_value - current_value
        
        if abs(value_diff) > 1.0:  # Only rebalance if difference is significant
            order_type = "buy" if value_diff > 0 else "sell"
            
            orders.append({
                "asset_code": asset_code,
                "order_type": order_type,
                "current_value": current_value,
                "target_value": target_value,
                "value_difference": value_diff,
                "current_allocation": current_alloc,
                "target_allocation": target_alloc
            })
    
    return orders

def calculate_estimated_cost(orders: List[Dict[str, Any]]) -> float:
    """Calculate estimated cost of rebalancing"""
    
    total_cost = 0.0
    
    for order in orders:
        # Estimate cost based on order size and type
        value_diff = abs(order["value_difference"])
        
        # Mock cost calculation (in production, use real exchange fees)
        if order["order_type"] == "buy":
            cost = value_diff * 0.001  # 0.1% fee
        else:
            cost = value_diff * 0.0005  # 0.05% fee
        
        total_cost += cost
    
    return total_cost

def calculate_risk_improvement(
    current_allocation: Dict[str, Dict], 
    target_allocation: Dict[str, float]
) -> float:
    """Calculate expected risk improvement from rebalancing"""
    
    # Simplified risk improvement calculation
    # In production, use actual risk models
    
    total_deviation = 0.0
    
    for asset_code, current_data in current_allocation.items():
        current_alloc = current_data["allocation"]
        target_alloc = target_allocation.get(asset_code, 0.0)
        
        deviation = abs(current_alloc - target_alloc)
        total_deviation += deviation
    
    # Risk improvement is proportional to reduction in deviation
    risk_improvement = min(total_deviation * 10, 100.0)  # Cap at 100%
    
    return risk_improvement

def simulate_order_execution(order: Dict[str, Any]) -> Dict[str, Any]:
    """Simulate order execution"""
    
    # Mock execution result
    execution_result = {
        "asset_code": order["asset_code"],
        "order_type": order["order_type"],
        "requested_value": abs(order["value_difference"]),
        "executed_value": abs(order["value_difference"]) * 0.99,  # 99% execution
        "cost": abs(order["value_difference"]) * 0.001,  # 0.1% fee
        "status": "executed",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    return execution_result
