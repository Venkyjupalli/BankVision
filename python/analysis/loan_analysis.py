
import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from dotenv import load_dotenv

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")
)

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

db_url = URL.create(
    drivername="mysql+mysqlconnector",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME")
)

engine = create_engine(db_url)

query = "SELECT * FROM vw_loan_analytics"

with engine.connect() as connection:
    loans = pd.read_sql(text(query), connection)

print("\n========== LOAN ANALYSIS ==========")

print("\n1. Dataset Overview")
print(loans.info())

print("\n2. Total Loans")
print(loans["total_loans"].sum())

print("\n3. Active Loans")
print(loans["active_loans"].sum())

print("\n4. Closed Loans")
print(loans["closed_loans"].sum())

print("\n5. Defaulted Loans")
print(loans["defaulted_loans"].sum())

print("\n6. Total Loan Amount")
print(round(loans["total_loan_amount"].sum(), 2))

print("\n7. Total Outstanding Amount")
print(round(loans["total_outstanding_amount"].sum(), 2))

print("\n8. Average Interest Rate")
print(round(loans["average_interest_rate"].mean(), 2))

print("\n9. Branch-wise Loan Performance")
print(
    loans[
        ["branch_name", "total_loans", "active_loans",
         "closed_loans", "defaulted_loans",
         "total_outstanding_amount", "default_rate"]
    ]
    .sort_values("total_loans", ascending=False)
    .to_string(index=False)
)

# Export dataset for Power BI
output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "loan_analysis.csv")
loans.to_csv(output_file, index=False)

print(f"\nExported successfully: {output_file}")

engine.dispose()
