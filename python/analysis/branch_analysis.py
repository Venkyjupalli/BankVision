
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

query = "SELECT * FROM vw_branch_performance"

with engine.connect() as connection:
    branches = pd.read_sql(text(query), connection)

print("\n========== BRANCH PERFORMANCE ANALYSIS ==========")

print("\n1. Dataset Overview")
print(branches.info())

print("\n2. Total Branches")
print(branches["branch_id"].nunique())

print("\n3. Total Customers")
print(branches["total_customers"].sum())

print("\n4. Total Accounts")
print(branches["total_accounts"].sum())

print("\n5. Total Loans")
print(branches["total_loans"].sum())

print("\n6. Total Transactions")
print(branches["total_transactions"].sum())

print("\n7. Top 5 Branches by Customer Count")
print(
    branches[
        ["branch_name", "total_customers"]
    ]
    .sort_values("total_customers", ascending=False)
    .head(5)
    .to_string(index=False)
)

print("\n8. Top 5 Branches by Account Balance")
print(
    branches[
        ["branch_name", "total_account_balance"]
    ]
    .sort_values("total_account_balance", ascending=False)
    .head(5)
    .to_string(index=False)
)

print("\n9. Top 5 Branches by Transaction Volume")
print(
    branches[
        ["branch_name", "total_transactions"]
    ]
    .sort_values("total_transactions", ascending=False)
    .head(5)
    .to_string(index=False)
)

print("\n10. Branch-wise Overall Performance")
print(
    branches[
        ["branch_name", "total_customers", "total_accounts",
         "total_account_balance", "total_fd_investment",
         "total_loans", "total_transactions"]
    ]
    .sort_values("total_customers", ascending=False)
    .to_string(index=False)
)

# Export dataset for Power BI
output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "branch_analysis.csv")
branches.to_csv(output_file, index=False)

print(f"\nExported successfully: {output_file}")

engine.dispose()
