from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import pandas as pd
import os
from fastapi import HTTPException



class DQN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(4, 64), nn.ReLU(),
            nn.Linear(64, 64), nn.ReLU(),
            nn.Linear(64, 3) 
        )
    def forward(self, x):
        return self.net(x)


app = FastAPI(title="FinTrader AI Engine")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading DQN Model Weights...")
device = torch.device("cpu") 
model = DQN().to(device)

try:
    model.load_state_dict(torch.load("trading_model.pth", map_location=device, weights_only=True))
    model.eval()
    print("Model loaded successfully.")
except FileNotFoundError:
    print("ERROR: 'trading_model.pth' not found. Ensure it is in the same directory.")


class PortfolioState(BaseModel):
    price: float
    balance: float
    shares: int
    net_worth: float


@app.post("/predict")
def predict_action(state: PortfolioState):
    state_tensor = torch.FloatTensor([
        state.price / 1000, 
        state.balance / 10000, 
        state.shares / 100, 
        state.net_worth / 10000
    ]).to(device)
    
    with torch.no_grad():
        q_values = model(state_tensor)
        action_idx = torch.argmax(q_values).item()
        
    actions = ["HOLD", "BUY", "SELL"]
    
    return {
        "action_code": action_idx,
        "action_text": actions[action_idx],
        "confidence": float(torch.max(q_values).item())
    }

@app.get("/tickers")
def list_tickers():
    """Return all available tickers (CSV filenames without extension)."""
    files = [f.replace(".csv", "") for f in os.listdir("data") if f.endswith(".csv")]
    return {"tickers": sorted(files)}

@app.get("/data/{ticker}")
def get_stock_data(ticker: str):
    file_path = f"data/{ticker}.csv"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Data for {ticker} not found offline.")
        
    try:
        df = pd.read_csv(file_path)
        # Sort by date ascending so history flows oldest → newest
        if "Date" in df.columns:
            df = df.sort_values("Date")
            dates = df["Date"].tolist()
        else:
            dates = []
        prices = df["Close"].tolist()
        return {"ticker": ticker, "prices": prices, "dates": dates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))