
import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from dotenv import load_dotenv

# Project configuration
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")
)

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# MySQL connection
db_url = URL.create(
    drivername="mysql+mysqlconnector",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME")
)

engine = create_engine(db_url)

# Load risk intelligence data
query = "SELECT * FROM vw_risk_intelligence"

with engine.connect() as connection:
    risks = pd.read_sql(text(query), connection)

print("\n========== RISK INTELLIGENCE ANALYSIS ==========")

print("\n1. Total Loans Analyzed")
print(risks["loan_id"].nunique())

print("\n2. Risk Category Distribution")
print(risks["risk_category"].value_counts())

print("\n3. Outstanding Amount by Risk Category")
print(
    risks.groupby("risk_category")["outstanding_amount"]
    .sum()
    .round(2)
)

print("\n4. Average EMI-to-Income Percentage by Risk Category")
print(
    risks.groupby("risk_category")["emi_to_income_percentage"]
    .mean()
    .round(2)
)

print("\n5. Defaulted Loans")
print(
    risks[risks["loan_status"] == "Defaulted"]
    [["loan_id", "customer_name", "loan_amount",
      "outstanding_amount", "risk_category"]]
    .to_string(index=False)
)

print("\n6. Top 10 Customers by Loan Outstanding")
print(
    risks[
        ["customer_name", "loan_type", "loan_amount",
         "outstanding_amount", "risk_category"]
    ]
    .sort_values("outstanding_amount", ascending=False)
    .head(10)
    .to_string(index=False)
)

print("\n7. Risk Category Summary")
summary = (
    risks.groupby("risk_category")
    .agg(
        total_loans=("loan_id", "count"),
        total_outstanding=("outstanding_amount", "sum"),
        average_emi_income_ratio=("emi_to_income_percentage", "mean")
    )
    .round(2)
    .reset_index()
)

print(summary.to_string(index=False))

# Export for Power BI
output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "risk_analysis.csv")
risks.to_csv(output_file, index=False)

print(f"\nExported successfully: {output_file}")

engine.dispose()
