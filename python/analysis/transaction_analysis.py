
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

query = "SELECT * FROM vw_transaction_analytics"

with engine.connect() as connection:
    transactions = pd.read_sql(text(query), connection)

print("\n========== TRANSACTION ANALYSIS ==========")

print("\n1. Dataset Overview")
print(transactions.info())

print("\n2. Total Transactions")
print(transactions["total_transactions"].sum())

print("\n3. Successful Transactions")
print(transactions["successful_transactions"].sum())

print("\n4. Failed Transactions")
print(transactions["failed_transactions"].sum())

print("\n5. Pending Transactions")
print(transactions["pending_transactions"].sum())

print("\n6. Total Credit Amount")
print(round(transactions["total_credit_amount"].sum(), 2))

print("\n7. Total Debit Amount")
print(round(transactions["total_debit_amount"].sum(), 2))

print("\n8. Branch-wise Transaction Volume")
print(
    transactions[
        ["branch_name", "total_transactions",
         "successful_transactions", "failed_transactions"]
    ]
    .sort_values("total_transactions", ascending=False)
    .to_string(index=False)
)

print("\n9. Transaction Mode Summary")
mode_columns = [
    "upi_transactions",
    "atm_transactions",
    "neft_transactions",
    "imps_transactions"
]

print(transactions[mode_columns].sum())

# Export dataset for Power BI
output_dir = os.path.join(PROJECT_ROOT, "data", "processed")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "transaction_analysis.csv")
transactions.to_csv(output_file, index=False)

print(f"\nExported successfully: {output_file}")

engine.dispose()
