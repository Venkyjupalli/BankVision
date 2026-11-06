
from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "raw"

expected_counts = {
    "branches": 20,
    "customers": 5000,
    "accounts": 6000,
    "transactions": 30000,
    "loans": 2000,
    "fixed_deposits": 3000
}


data = {}

print("\n========== BANKVISION DATA VALIDATION ==========\n")

for table, expected_count in expected_counts.items():

    file_path = DATA_DIR / f"{table}.csv"

    if not file_path.exists():
        raise FileNotFoundError(f"Missing file: {file_path}")

    df = pd.read_csv(file_path)
    data[table] = df

    print(
        f"{table:20} | "
        f"Records: {len(df):6} | "
        f"Expected: {expected_count:6} | "
        f"{'PASS' if len(df) == expected_count else 'FAIL'}"
    )


print("\n========== PRIMARY KEY VALIDATION ==========")

primary_keys = {
    "branches": "branch_id",
    "customers": "customer_id",
    "accounts": "account_id",
    "transactions": "transaction_id",
    "loans": "loan_id",
    "fixed_deposits": "fd_id"
}

for table, key in primary_keys.items():

    duplicates = data[table][key].duplicated().sum()

    print(f"{table:20} | Duplicate IDs: {duplicates}")


print("\n========== UNIQUE REFERENCE VALIDATION ==========")

unique_columns = {
    "branches": ["branch_code", "ifsc_code"],
    "customers": ["email", "phone"],
    "accounts": ["account_number"],
    "transactions": ["transaction_reference"],
    "loans": ["loan_reference"],
    "fixed_deposits": ["fd_reference"]
}

for table, columns in unique_columns.items():

    for column in columns:

        duplicates = data[table][column].duplicated().sum()

        print(f"{table}.{column}: {duplicates} duplicates")


print("\n========== FOREIGN KEY VALIDATION ==========")

branches = data["branches"]
customers = data["customers"]
accounts = data["accounts"]
transactions = data["transactions"]
loans = data["loans"]
fds = data["fixed_deposits"]

checks = {
    "Customer -> Branch":
        customers["branch_id"].isin(branches["branch_id"]).all(),

    "Account -> Customer":
        accounts["customer_id"].isin(customers["customer_id"]).all(),

    "Account -> Branch":
        accounts["branch_id"].isin(branches["branch_id"]).all(),

    "Transaction -> Account":
        transactions["account_id"].isin(accounts["account_id"]).all(),

    "Loan -> Customer":
        loans["customer_id"].isin(customers["customer_id"]).all(),

    "Loan -> Account":
        loans["account_id"].isin(accounts["account_id"]).all(),

    "FD -> Customer":
        fds["customer_id"].isin(customers["customer_id"]).all(),

    "FD -> Account":
        fds["account_id"].isin(accounts["account_id"]).all()
}

for relationship, result in checks.items():

    print(
        f"{relationship:25} | "
        f"{'PASS' if result else 'FAIL'}"
    )

# --------------------------------------------------
# CUSTOMER AND ACCOUNT RELATIONSHIP VALIDATION
# --------------------------------------------------

print("\n========== ACCOUNT OWNERSHIP VALIDATION ==========")

account_owners = accounts[
    ["account_id", "customer_id", "branch_id"]
]

loan_check = loans.merge(
    account_owners,
    on="account_id",
    suffixes=("_loan", "_account")
)

fd_check = fds.merge(
    account_owners,
    on="account_id",
    suffixes=("_fd", "_account")
)

loan_ownership_valid = (
    loan_check["customer_id_loan"]
    == loan_check["customer_id_account"]
).all()

fd_ownership_valid = (
    fd_check["customer_id_fd"]
    == fd_check["customer_id_account"]
).all()

print("Loan account ownership:",
      "PASS" if loan_ownership_valid else "FAIL")

print("FD account ownership:",
      "PASS" if fd_ownership_valid else "FAIL")


active_account_ids = set(
    accounts.loc[
        accounts["account_status"] == "Active",
        "account_id"
    ]
)

transaction_accounts_valid = transactions[
    "account_id"
].isin(active_account_ids).all()

print(
    "Transactions use active accounts:",
    "PASS" if transaction_accounts_valid else "FAIL"
)


all_checks = list(checks.values()) + [
    loan_ownership_valid,
    fd_ownership_valid,
    transaction_accounts_valid
]

print("\n========== FINAL VALIDATION RESULT ==========")

if all(all_checks):
    print("ALL FOREIGN KEY RELATIONSHIPS PASSED!")
else:
    print("SOME RELATIONSHIP CHECKS FAILED!")

print("\nBankVision dataset validation completed!")
