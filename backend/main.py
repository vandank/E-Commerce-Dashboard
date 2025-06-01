import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from backend.analysis_engine import (
    get_monthly_revenue,
    get_top_products,
    get_customers_by_country,
    get_orders_by_country,
    get_clv,
    get_rfm
)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Define API routes first
@app.get("/monthly-revenue")
def monthly_revenue():
    return get_monthly_revenue()

@app.get("/top-products")
def top_products():
    return get_top_products()

@app.get("/customers-by-country")
def customers_by_country():
    return get_customers_by_country()

@app.get("/orders-by-country")
def orders_by_country():
    return get_orders_by_country()

@app.get("/clv")
def clv():
    return get_clv()

@app.get("/rfm")
def rfm():
    return get_rfm()

# ✅ Mount frontend afterwards
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend-react", "build")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

# Fallback route to serve React index.html
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    index_file = os.path.join(frontend_path, "index.html")
    return FileResponse(index_file)
