import yfinance as yf
import pandas as pd
import os

os.makedirs("data", exist_ok=True)

stock_map = {
    "Ujjivan SFB": "UJJIVANSFB.NS",
    "Equitas SFB": "EQUITASBNK.NS",
    "GMR Airports": "GMRAIRPORT.NS",
    "MosChip": "MOSCHIP.NS",
    "HG Infra": "HGINFRA.NS"
}


for name, ticker in stock_map.items():
    print(f"Fetching {name} ({ticker})...")
    try:
        data = yf.download(ticker, start="2018-01-01", progress=False)
        

        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.droplevel(1)
            
        data = data.reset_index()
        data.to_csv(f"data/{ticker}.csv", index=False)
        print(f"Saved data for {ticker}")

    except Exception as e:
        print(f"Failed to fetch {ticker}: {e}")