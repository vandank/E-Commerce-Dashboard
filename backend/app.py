# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from analysis_engine import (
    get_rfm, get_monthly_revenue, get_top_products,
    get_customers_by_country, get_revenue_by_country, get_avg_revenue_per_customer,
    get_orders_by_country, get_avg_revenue_per_order, get_clv
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Ecommerce Dashboard API is running."}

@app.get("/rfm")
def rfm():
    return get_rfm()

@app.get("/monthly-revenue")
def monthly_revenue():
    return get_monthly_revenue()

@app.get("/top-products")
def top_products():
    return get_top_products()

@app.get("/customers-by-country")
def customers_by_country():
    return get_customers_by_country()

@app.get("/revenue-by-country")
def revenue_by_country():
    return get_revenue_by_country()

@app.get("/avg-revenue-per-customer")
def avg_revenue_customer():
    return get_avg_revenue_per_customer()

@app.get("/orders-by-country")
def orders_by_country():
    return get_orders_by_country()

@app.get("/avg-revenue-per-order")
def avg_revenue_order():
    return get_avg_revenue_per_order()

@app.get("/clv")
def clv():
    return get_clv()
