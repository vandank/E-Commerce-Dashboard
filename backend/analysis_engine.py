# Step 1: Extract backend logic from notebook into Python functions (backend/analysis_engine.py)
import pandas as pd
import os
# Load cleaned data

def load_data():
    base_path = os.path.dirname(os.path.dirname(__file__))  # go up from /backend
    file_path = os.path.join(base_path, 'datasets', 'data.csv')

    df = pd.read_csv(file_path, encoding='ISO-8859-1')
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
    df = df.dropna(subset=['CustomerID'])
    df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
    df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
    return df


    #df = pd.read_csv('datasets/data.csv', encoding='ISO-8859-1')
    #df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
    #df = df.dropna(subset=['CustomerID'])
    #df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
    #df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
    #return df

# RFM analysis
def get_rfm():
    df = load_data()
    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)

    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
        'InvoiceNo': 'nunique',
        'TotalPrice': 'sum'
    }).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalPrice': 'Monetary'}).reset_index()

    return {
        'recency': rfm['Recency'].tolist(),
        'frequency': rfm['Frequency'].tolist(),
        'monetary': rfm['Monetary'].tolist()
    }

# Total monthly revenue
def get_monthly_revenue():
    df = load_data()
    df['YearMonth'] = df['InvoiceDate'].dt.to_period('M')
    monthly = df.groupby('YearMonth')['TotalPrice'].sum().reset_index()
    monthly['YearMonth'] = monthly['YearMonth'].astype(str)
    return monthly.to_dict(orient='records')

# Top-selling products by quantity
def get_top_products():
    df = load_data()
    top_products = df.groupby('Description')['Quantity'].sum().sort_values(ascending=False).head(10).reset_index()
    return top_products.to_dict(orient='records')

# Number of customers by country (Excluding UK)
def get_customers_by_country():
    df = load_data()
    df = df[df['Country'] != 'United Kingdom']
    country_data = df.groupby('Country')['CustomerID'].nunique().reset_index(name='UniqueCustomers')
    top_countries = country_data.sort_values(by='UniqueCustomers', ascending=False).head(10)
    return top_countries.to_dict(orient='records')

# Total revenue by country (Excluding UK)
def get_revenue_by_country():
    df = load_data()
    df = df[df['Country'] != 'United Kingdom']
    country_sales = df.groupby('Country')['TotalPrice'].sum().reset_index(name='TotalRevenue')
    top_countries = country_sales.sort_values(by='TotalRevenue', ascending=False).head(10)
    return top_countries.to_dict(orient='records')

# Average revenue per customer
def get_avg_revenue_per_customer():
    df = load_data()
    avg_revenue = df.groupby('CustomerID')['TotalPrice'].sum().mean()
    return {"average_revenue_per_customer": avg_revenue}

# Orders by country (Excluding UK)
def get_orders_by_country():
    df = load_data()
    df = df[df['Country'] != 'United Kingdom']
    order_data = df.groupby('Country')['InvoiceNo'].nunique().reset_index(name='NumOrders')
    top_countries = order_data.sort_values(by='NumOrders', ascending=False).head(10)
    return top_countries.to_dict(orient='records')

# Average revenue per order
def get_avg_revenue_per_order():
    df = load_data()
    avg_order_value = df['TotalPrice'].sum() / df['InvoiceNo'].nunique()
    return {"average_order_value": avg_order_value}

# Customer lifetime value (simple)
def get_clv():
    df = load_data()
    clv = df.groupby('CustomerID').agg({
        'TotalPrice': ['sum', 'mean'],
        'InvoiceNo': 'nunique'
    })

    clv.columns = ['TotalRevenue', 'AvgOrderValue', 'NumOrders']
    clv['SimpleCLV'] = clv['AvgOrderValue'] * clv['NumOrders']
    clv = clv.reset_index()

    return clv[['CustomerID', 'SimpleCLV']].to_dict(orient='records')
