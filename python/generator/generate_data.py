
from pathlib import Path

import numpy as np
import pandas as pd
from faker import Faker


fake = Faker("en_IN")

Faker.seed(42)
np.random.seed(42)

TOTAL_BRANCHES = 20
TOTAL_CUSTOMERS = 5000


PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)



branch_locations = [
    ("Madanapalle", "Andhra Pradesh"),
    ("Hyderabad", "Telangana"),
    ("Vijayawada", "Andhra Pradesh"),
    ("Visakhapatnam", "Andhra Pradesh"),
    ("Tirupati", "Andhra Pradesh"),
    ("Bengaluru", "Karnataka"),
    ("Mysuru", "Karnataka"),
    ("Chennai", "Tamil Nadu"),
    ("Coimbatore", "Tamil Nadu"),
    ("Mumbai", "Maharashtra"),
    ("Pune", "Maharashtra"),
    ("New Delhi", "Delhi"),
    ("Gurugram", "Haryana"),
    ("Ahmedabad", "Gujarat"),
    ("Vadodara", "Gujarat"),
    ("Kochi", "Kerala"),
    ("Thiruvananthapuram", "Kerala"),
    ("Kolkata", "West Bengal"),
    ("Bhubaneswar", "Odisha"),
    ("Jaipur", "Rajasthan")
]

branches = []

for i, (city, state) in enumerate(branch_locations, start=1):

    branch = {
        "branch_id": i,
        "branch_name": f"{city} Main Branch",
        "branch_code": f"BV{i:03d}",
        "city": city,
        "state": state,
        "ifsc_code": f"SYNB0{i:06d}",
        "manager_name": fake.name()
    }

    branches.append(branch)

branches_df = pd.DataFrame(branches)

branches_df.to_csv(
    RAW_DATA_DIR / "branches.csv",
    index=False
)

print("Branch dataset generated successfully!")



customers = []

genders = ["Male", "Female", "Other"]

occupations = [
    "Software Engineer",
    "Business Owner",
    "Teacher",
    "Doctor",
    "Government Employee",
    "Private Employee",
    "Student",
    "Farmer",
    "Self Employed",
    "Accountant",
    "Manager"
]

segments = ["Regular", "Premium", "VIP"]

used_phones = set()

for i in range(1, TOTAL_CUSTOMERS + 1):

    first_name = fake.first_name()
    last_name = fake.last_name()

    gender = np.random.choice(genders)

    annual_income = int(
        np.random.randint(180000, 2500000)
    )

    # Assign customer segment based on income
    if annual_income < 500000:
        customer_segment = "Regular"

    elif annual_income < 1200000:
        customer_segment = "Premium"

    else:
        customer_segment = "VIP"

    # Generate unique phone numbers
    while True:
        phone = "9" + str(fake.random_number(
            digits=9,
            fix_len=True
        ))

        if phone not in used_phones:
            used_phones.add(phone)
            break

    # Randomly assign an existing branch
    branch_id = int(
        np.random.randint(1, TOTAL_BRANCHES + 1)
    )

    branch = branch_locations[branch_id - 1]

    customer = {
        "customer_id": i,
        "first_name": first_name,
        "last_name": last_name,
        "gender": gender,
        "date_of_birth": fake.date_of_birth(
            minimum_age=18,
            maximum_age=75
        ),
        "email": f"customer{i}@bankvision.example",
        "phone": phone,
        "city": branch[0],
        "state": branch[1],
        "occupation": np.random.choice(occupations),
        "annual_income": annual_income,
        "customer_segment": customer_segment,
        "branch_id": branch_id,
        "customer_since": fake.date_between(
            start_date="-10y",
            end_date="today"
        )
    }

    customers.append(customer)

customers_df = pd.DataFrame(customers)

customers_df.to_csv(
    RAW_DATA_DIR / "customers.csv",
    index=False
)

print("Customer dataset generated successfully!")



print("\n========== BANKVISION DATA SUMMARY ==========")

print("Total branches:", len(branches_df))
print("Total customers:", len(customers_df))

print("\nBranch sample:")
print(branches_df.head())

print("\nCustomer sample:")
print(customers_df.head())

print("\nCustomer segment distribution:")
print(customers_df["customer_segment"].value_counts())

print("\nGenerated files:")
print(RAW_DATA_DIR / "branches.csv")
print(RAW_DATA_DIR / "customers.csv")

print("\nBankVision initial data generation completed!")


# --------------------------------------------------
# 5. ACCOUNT DATA GENERATION
# --------------------------------------------------

TOTAL_ACCOUNTS = 6000

accounts = []

account_types = ["Savings", "Current", "Salary"]

account_statuses = ["Active", "Dormant", "Closed"]

account_id = 1

# Give every customer one account first
customer_records = customers_df.to_dict("records")

# Add 1,000 extra accounts to randomly selected customers
extra_customer_indices = np.random.choice(
    len(customer_records),
    size=TOTAL_ACCOUNTS - len(customer_records),
    replace=True
)

account_customer_indices = list(range(len(customer_records))) + list(
    extra_customer_indices
)

# Shuffle so account assignments are not grouped by customer
np.random.shuffle(account_customer_indices)

for customer_index in account_customer_indices:

    customer = customer_records[customer_index]

    account_type = np.random.choice(account_types)

    balance = round(
        float(np.random.uniform(1000, 500000)),
        2
    )

    if account_type == "Savings":
        interest_rate = 3.00
        minimum_balance = 1000.00

    elif account_type == "Current":
        interest_rate = 0.00
        minimum_balance = 5000.00

    else:
        interest_rate = 3.00
        minimum_balance = 0.00

    opening_date = fake.date_between(
        start_date=customer["customer_since"],
        end_date="today"
    )

    account = {
        "account_id": account_id,
        "account_number": f"BVACC{account_id:012d}",
        "customer_id": customer["customer_id"],
        "branch_id": customer["branch_id"],
        "account_type": account_type,
        "balance": balance,
        "interest_rate": interest_rate,
        "minimum_balance": minimum_balance,
        "account_status": np.random.choice(
            account_statuses,
            p=[0.85, 0.10, 0.05]
        ),
        "opening_date": opening_date
    }

    accounts.append(account)

    account_id += 1


accounts_df = pd.DataFrame(accounts)

accounts_df.to_csv(
    RAW_DATA_DIR / "accounts.csv",
    index=False
)


print("\n========== ACCOUNT DATA SUMMARY ==========")

print("Total accounts:", len(accounts_df))

print("\nAccount type distribution:")
print(accounts_df["account_type"].value_counts())

print("\nAccount status distribution:")
print(accounts_df["account_status"].value_counts())

print("\nUnique customers with accounts:",
      accounts_df["customer_id"].nunique())

print("\nDuplicate account numbers:",
      accounts_df["account_number"].duplicated().sum())

print("\nAccount sample:")
print(accounts_df.head())

print("\nAccounts CSV generated successfully!")


# --------------------------------------------------
# 7. TRANSACTION DATA GENERATION
# --------------------------------------------------

TOTAL_TRANSACTIONS = 30000

transactions = []

transaction_types = ["Credit", "Debit"]

transaction_categories = [
    "UPI",
    "ATM",
    "NEFT",
    "IMPS",
    "RTGS",
    "POS",
    "Online Payment",
    "Cash Deposit",
    "Cash Withdrawal"
]

transaction_modes = [
    "Mobile Banking",
    "Internet Banking",
    "ATM",
    "Branch",
    "Debit Card"
]

transaction_statuses = [
    "Success",
    "Failed",
    "Pending"
]

# Only active accounts should generate normal transactions
active_accounts = accounts_df[
    accounts_df["account_status"] == "Active"
].copy()

if active_accounts.empty:
    raise ValueError("No active accounts available for transactions.")

account_records = active_accounts.to_dict("records")

for i in range(1, TOTAL_TRANSACTIONS + 1):

    account = account_records[
        np.random.randint(0, len(account_records))
    ]

    transaction_type = np.random.choice(transaction_types)

    amount = round(
        float(np.random.uniform(100, 100000)),
        2
    )

    category = np.random.choice(transaction_categories)

    transaction_mode = np.random.choice(transaction_modes)

    transaction_status = np.random.choice(
        transaction_statuses,
        p=[0.94, 0.04, 0.02]
    )

    transaction = {
        "transaction_id": i,
        "transaction_reference": f"BVTXN{i:012d}",
        "account_id": account["account_id"],
        "transaction_type": transaction_type,
        "transaction_category": category,
        "amount": amount,
        "transaction_date": fake.date_time_between(
            start_date="-2y",
            end_date="now"
        ),
        "transaction_mode": transaction_mode,
        "transaction_status": transaction_status,
        "description": f"{transaction_type} via {category}"
    }

    transactions.append(transaction)

transactions_df = pd.DataFrame(transactions)

transactions_df.to_csv(
    RAW_DATA_DIR / "transactions.csv",
    index=False
)


print("\n========== TRANSACTION DATA SUMMARY ==========")

print("Total transactions:", len(transactions_df))

print("\nTransaction type distribution:")
print(transactions_df["transaction_type"].value_counts())

print("\nTransaction category distribution:")
print(transactions_df["transaction_category"].value_counts())

print("\nTransaction status distribution:")
print(transactions_df["transaction_status"].value_counts())

print("\nTotal transaction amount:",
      round(transactions_df["amount"].sum(), 2))

print("\nDuplicate transaction references:",
      transactions_df["transaction_reference"].duplicated().sum())

print("\nTransaction sample:")
print(transactions_df.head())

print("\nTransactions CSV generated successfully!")


# --------------------------------------------------
# 9. LOAN DATA GENERATION
# --------------------------------------------------

TOTAL_LOANS = 2000

loans = []

loan_types = [
    "Personal Loan",
    "Home Loan",
    "Vehicle Loan",
    "Education Loan"
]

loan_statuses = [
    "Active",
    "Closed",
    "Defaulted"
]

for i in range(1, TOTAL_LOANS + 1):

    # Select a random customer
    customer = customers_df.iloc[
        np.random.randint(0, len(customers_df))
    ]

    customer_id = int(customer["customer_id"])

    # Find accounts belonging to this customer
    customer_accounts = accounts_df[
        accounts_df["customer_id"] == customer_id
    ]

    account = customer_accounts.sample(
        n=1,
        random_state=None
    ).iloc[0]

    loan_type = np.random.choice(loan_types)

    loan_amount = round(
        float(np.random.uniform(50000, 5000000)),
        2
    )

    interest_rate = round(
        float(np.random.uniform(7.5, 16.0)),
        2
    )

    loan_tenure_months = int(
        np.random.choice([12, 24, 36, 60, 84, 120, 180, 240])
    )

    monthly_rate = interest_rate / (12 * 100)

    # EMI calculation
    if monthly_rate == 0:
        monthly_emi = loan_amount / loan_tenure_months
    else:
        monthly_emi = (
            loan_amount
            * monthly_rate
            * (1 + monthly_rate) ** loan_tenure_months
            / ((1 + monthly_rate) ** loan_tenure_months - 1)
        )

    monthly_emi = round(monthly_emi, 2)

    loan_status = np.random.choice(
        loan_statuses,
        p=[0.75, 0.20, 0.05]
    )

    disbursement_date = fake.date_between(
        start_date="-5y",
        end_date="today"
    )

    maturity_date = (
        pd.Timestamp(disbursement_date)
        + pd.DateOffset(months=loan_tenure_months)
    ).date()

    # Generate synthetic outstanding amount
    if loan_status == "Closed":
        outstanding_amount = 0.00

    elif loan_status == "Defaulted":
        outstanding_amount = round(
            loan_amount * np.random.uniform(0.30, 1.00),
            2
        )

    else:
        outstanding_amount = round(
            loan_amount * np.random.uniform(0.10, 0.90),
            2
        )

    loan = {
        "loan_id": i,
        "loan_reference": f"BVLOAN{i:010d}",
        "customer_id": customer_id,
        "account_id": int(account["account_id"]),
        "loan_type": loan_type,
        "loan_amount": loan_amount,
        "interest_rate": interest_rate,
        "loan_tenure_months": loan_tenure_months,
        "monthly_emi": monthly_emi,
        "outstanding_amount": outstanding_amount,
        "loan_status": loan_status,
        "disbursement_date": disbursement_date,
        "maturity_date": maturity_date
    }

    loans.append(loan)


loans_df = pd.DataFrame(loans)

loans_df.to_csv(
    RAW_DATA_DIR / "loans.csv",
    index=False
)


print("\n========== LOAN DATA SUMMARY ==========")

print("Total loans:", len(loans_df))

print("\nLoan type distribution:")
print(loans_df["loan_type"].value_counts())

print("\nLoan status distribution:")
print(loans_df["loan_status"].value_counts())

print("\nTotal loan amount:",
      round(loans_df["loan_amount"].sum(), 2))

print("\nTotal outstanding amount:",
      round(loans_df["outstanding_amount"].sum(), 2))

print("\nDuplicate loan references:",
      loans_df["loan_reference"].duplicated().sum())

print("\nLoan sample:")
print(loans_df.head())

print("\nLoans CSV generated successfully!")

# --------------------------------------------------
# 11. FIXED DEPOSIT DATA GENERATION
# --------------------------------------------------

TOTAL_FIXED_DEPOSITS = 3000

fixed_deposits = []

fd_statuses = ["Active", "Matured", "Closed"]

payout_types = ["Cumulative", "Monthly", "Quarterly"]

for i in range(1, TOTAL_FIXED_DEPOSITS + 1):

    # Select a random customer
    customer = customers_df.iloc[
        np.random.randint(0, len(customers_df))
    ]

    customer_id = int(customer["customer_id"])

    # Find the customer's accounts
    customer_accounts = accounts_df[
        accounts_df["customer_id"] == customer_id
    ]

    account = customer_accounts.sample(
        n=1,
        random_state=None
    ).iloc[0]

    principal_amount = round(
        float(np.random.uniform(10000, 2000000)),
        2
    )

    interest_rate = round(
        float(np.random.uniform(5.5, 8.5)),
        2
    )

    tenure_months = int(
        np.random.choice([6, 12, 18, 24, 36, 48, 60])
    )

    opening_date = fake.date_between(
        start_date="-5y",
        end_date="today"
    )

    maturity_date = (
        pd.Timestamp(opening_date)
        + pd.DateOffset(months=tenure_months)
    ).date()

    # Approximate compound maturity calculation
    years = tenure_months / 12

    maturity_amount = round(
        principal_amount
        * (1 + interest_rate / 100) ** years,
        2
    )

    fd_status = np.random.choice(
        fd_statuses,
        p=[0.65, 0.25, 0.10]
    )

    payout_type = np.random.choice(payout_types)

    fd = {
        "fd_id": i,
        "fd_reference": f"BVFD{i:010d}",
        "customer_id": customer_id,
        "account_id": int(account["account_id"]),
        "principal_amount": principal_amount,
        "interest_rate": interest_rate,
        "tenure_months": tenure_months,
        "maturity_amount": maturity_amount,
        "opening_date": opening_date,
        "maturity_date": maturity_date,
        "fd_status": fd_status,
        "payout_type": payout_type
    }

    fixed_deposits.append(fd)


fixed_deposits_df = pd.DataFrame(fixed_deposits)

fixed_deposits_df.to_csv(
    RAW_DATA_DIR / "fixed_deposits.csv",
    index=False
)


print("\n========== FIXED DEPOSIT SUMMARY ==========")

print("Total fixed deposits:", len(fixed_deposits_df))

print("\nFD status distribution:")
print(fixed_deposits_df["fd_status"].value_counts())

print("\nPayout type distribution:")
print(fixed_deposits_df["payout_type"].value_counts())

print("\nTotal FD principal:",
      round(fixed_deposits_df["principal_amount"].sum(), 2))

print("\nTotal FD maturity value:",
      round(fixed_deposits_df["maturity_amount"].sum(), 2))

print("\nDuplicate FD references:",
      fixed_deposits_df["fd_reference"].duplicated().sum())

print("\nFixed deposit sample:")
print(fixed_deposits_df.head())

print("\nFixed deposits CSV generated successfully!")
