
import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from dotenv import load_dotenv

# Locate the project root
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")
)

# Load environment variables
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# Read database configuration
db_url = URL.create(
    drivername="mysql+mysqlconnector",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME")
)

engine = create_engine(db_url)

# Load customer intelligence data from MySQL
query = "SELECT * FROM vw_customer_intelligence"

with engine.connect() as connection:
    customers = pd.read_sql(text(query), connection)

print("\n========== CUSTOMER ANALYSIS ==========")

print("\n1. Dataset Overview")
print(customers.info())

print("\n2. Total Customers")
print(customers["customer_id"].nunique())

print("\n3. Customer Segment Distribution")
print(customers["customer_segment"].value_counts())

print("\n4. Average Annual Income by Segment")
print(
    customers.groupby("customer_segment")["annual_income"]
    .mean()
    .round(2)
)

print("\n5. Total Active Account Balance")
print(round(customers["total_active_balance"].sum(), 2))

print("\n6. Total Loan Outstanding")
print(round(customers["total_loan_outstanding"].sum(), 2))

print("\n7. Total Fixed Deposit Investment")
print(round(customers["total_fd_investment"].sum(), 2))

print("\n8. Top 10 Customers by Active Account Balance")
print(
    customers[
        ["customer_name", "customer_segment", "total_active_balance"]
    ]
    .sort_values("total_active_balance", ascending=False)
    .head(10)
    .to_string(index=False)
)

# Export dataset for Power BI
output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "customer_analysis.csv")
customers.to_csv(output_file, index=False)

print(f"\nAnalysis dataset exported to: {output_file}")

engine.dispose()
