
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

query = "SELECT * FROM vw_deposit_analytics"

with engine.connect() as connection:
    deposits = pd.read_sql(text(query), connection)

print("\n========== DEPOSIT ANALYSIS ==========")

print("\n1. Dataset Overview")
print(deposits.info())

print("\n2. Total Accounts")
print(deposits["total_accounts"].sum())

print("\n3. Active Accounts")
print(deposits["active_accounts"].sum())

print("\n4. Total Account Balance")
print(round(deposits["total_account_balance"].sum(), 2))

print("\n5. Total Fixed Deposits")
print(deposits["total_fixed_deposits"].sum())

print("\n6. Total Fixed Deposit Investment")
print(round(deposits["total_fd_investment"].sum(), 2))

print("\n7. Active Fixed Deposit Investment")
print(round(deposits["active_fd_investment"].sum(), 2))

print("\n8. Matured Fixed Deposit Investment")
print(round(deposits["matured_fd_investment"].sum(), 2))

print("\n9. Branch-wise Deposit Performance")
print(
    deposits[
        ["branch_name", "total_accounts", "active_accounts",
         "total_account_balance", "total_fixed_deposits",
         "total_fd_investment"]
    ]
    .sort_values("total_fd_investment", ascending=False)
    .to_string(index=False)
)

# Export dataset for Power BI
output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "deposit_analysis.csv")
deposits.to_csv(output_file, index=False)

print(f"\nExported successfully: {output_file}")

engine.dispose()
