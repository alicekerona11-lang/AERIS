AERIS READY-TO-RUN PROJECT
==========================

FOLDER STRUCTURE
- backend/main.py
- backend/requirements.txt
- backend/data/master.csv (included sample data so it runs immediately)
- frontend/package.json
- frontend/src/App.jsx
- frontend/src/App.css
- frontend/src/main.jsx
- frontend/src/index.css

RUN BACKEND (PowerShell window 1)
1. Open PowerShell in this extracted AERIS_READY_TO_RUN folder.
2. Run:
   cd backend
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --reload --port 8000
3. Test http://127.0.0.1:8000/api/health

RUN FRONTEND (PowerShell window 2)
1. Open another PowerShell in this extracted AERIS_READY_TO_RUN folder.
2. Run:
   cd frontend
   npm.cmd install
   npm.cmd run dev
3. Open the URL Vite prints, normally http://localhost:5173

DATASET NOTE
The included backend/data/master.csv is DEMO / SYNTHETIC data to make the project runnable immediately.
For your real Tamil Nadu dataset, replace it with your own master.csv. It must include:
- date
- tn_peak_demand_mw
Optional:
- tn_shortage_at_peak_mw

This project does not invent zone-level grid allocation data. Zone allocation stays disabled until real zone/substation/network data are provided.
Forecasting uses a simple rolling-average baseline. LR/RR/GB/RF models are evaluated with a chronological holdout when enough data and scikit-learn are available. Drift is a prototype screening signal, not causal proof.
