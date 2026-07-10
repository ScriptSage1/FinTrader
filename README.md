# FinTrader

A simulated paper-trading terminal powered by a **Deep Q-Network (DQN)** AI model.
Trade real NSE-listed stocks with zero financial risk, replay historical price data,
and get live AI buy/sell/hold signals from the trained model.

---

## What's inside

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite (port 5174) |
| Backend | FastAPI + PyTorch (port 8000) |
| AI Model | DQN trained on NSE stock data (`trading_model.pth`) |
| Data | 5 NSE tickers — historical OHLCV CSVs in `backend/data/` |

---

## Prerequisites

Make sure you have all of the following installed before you start.

### Python (3.9 or newer)

```
python --version
```

Install the required Python packages:

```
pip install fastapi uvicorn torch pandas
```

### Node.js (18 or newer)

```
node --version
npm --version
```

---

## Setup

Clone or download the project, then open **two separate terminals** — one for the
backend and one for the frontend.

---

## Terminal 1 — Start the Backend (FastAPI)

```bash
cd FinTrader-main/backend
uvicorn api:app --reload --port 8000
```

You should see:

```
Loading DQN Model Weights...
Model loaded successfully.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

The backend exposes three endpoints:

| Endpoint | Description |
|---|---|
| `GET /tickers` | Lists all available NSE tickers |
| `GET /data/{ticker}` | Returns full price history (close prices + dates) for a ticker |
| `POST /predict` | Runs the DQN model and returns BUY / SELL / HOLD + confidence |

You can explore the auto-generated API docs at:
**http://localhost:8000/docs**

---

## Terminal 2 — Start the Frontend (React + Vite)

```bash
cd FinTrader-main
npm install
npm run dev
```

You should see:

```
VITE ready in ...ms
Local: http://localhost:5174/
```

Open **http://localhost:5174/** in your browser.

> Note: Both servers must be running at the same time. The frontend proxies all
> `/api/*` requests to the backend automatically — no manual CORS setup needed.

---

## Logging in

The app uses a local paper-trading account stored in your browser.

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `password123` |

You can also register a new account from the login screen.

---

## Using the app

### Dashboard

- **Market Discovery** (left panel) — click any of the 5 NSE stocks to load its chart
- **Price Chart** (centre) — shows historical close prices for the selected stock
- **Skip Forward buttons** — the chart opens at the *oldest* available data (2020);
  use `+1 Week`, `+1 Month`, and `+1 Year` to advance the view toward the present.
  Click **Now** to jump straight to the latest data.
- **AI Signals** (right panel) — the DQN model's live recommendation (BUY / SELL / HOLD)
  and confidence score, calculated from your current portfolio state
- **Trade Terminal** — enter a quantity and execute simulated BUY or SELL orders

### Portfolio & History

Use the navigation sidebar to view your current holdings and full trade history.

---

## Available stocks

| Ticker | Company |
|---|---|
| `EQUITASBNK.NS` | Equitas Small Finance Bank |
| `GMRAIRPORT.NS` | GMR Airports Infrastructure |
| `HGINFRA.NS` | H.G. Infra Engineering |
| `MOSCHIP.NS` | MosChip Technologies |
| `UJJIVANSFB.NS` | Ujjivan Small Finance Bank |

---

## Project structure

```
FinTrader-main/
|-- backend/
|   |-- api.py                  # FastAPI server + DQN inference endpoints
|   |-- trading_model.pth       # Trained DQN model weights
|   |-- train_rl_model.py       # Training script (for reference)
|   |-- fetch_data.py           # Data download helper
|   `-- data/
|       |-- EQUITASBNK.NS.csv
|       |-- GMRAIRPORT.NS.csv
|       |-- HGINFRA.NS.csv
|       |-- MOSCHIP.NS.csv
|       `-- UJJIVANSFB.NS.csv
|
|-- src/
|   |-- components/
|   |   |-- Dashboard/
|   |   |   |-- PriceChart.jsx   # Chart + skip-forward navigation
|   |   |   |-- AISuggestion.jsx # DQN signal panel
|   |   |   |-- TradePanel.jsx   # Buy / Sell / Hold terminal
|   |   |   |-- StockList.jsx    # Left-panel market discovery
|   |   |   `-- ...
|   |   |-- Portfolio/
|   |   `-- History/
|   |-- context/
|   |   `-- TradingContext.jsx   # Global state (balance, holdings, stocks)
|   |-- services/
|   |   `-- api.js               # All backend API calls
|   `-- utils/
|       `-- mockData.js          # Ticker definitions + price history builder
|
|-- vite.config.js               # Dev proxy: /api/* -> http://localhost:8000
`-- package.json
```

---

## Common issues

**"Data for {ticker} not found offline"**
Make sure you are running `uvicorn` from inside the `backend/` folder so it can
find the `data/` directory and `trading_model.pth`.

**Stocks show $0.00 / no chart**
The frontend cannot reach the backend. Check that the FastAPI server is running
on port 8000 and that you started the frontend with `npm run dev` (not a static
file open).
