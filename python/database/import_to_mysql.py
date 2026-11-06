
from pathlib import Path
import os

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, URL, text


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "data" / "raw"

load_dotenv(PROJECT_ROOT / ".env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "bankvision")

if not DB_USER or not DB_PASSWORD:
    raise ValueError(
        "Database credentials missing. Check your .env file."
    )

database_url = URL.create(
    drivername="mysql+mysqlconnector",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME
)

engine = create_engine(
    database_url,
    pool_pre_ping=True
)

datasets = [
    "branches",
    "customers",
    "accounts",
    "transactions",
    "loans",
    "fixed_deposits"
]


try:

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT DATABASE()")
        ).scalar()

        print("Connected database:", result)

        if result != DB_NAME:
            raise ValueError("Incorrect database selected.")

       
        for table in datasets:

            count = connection.execute(
                text(f"SELECT COUNT(*) FROM `{table}`")
            ).scalar()

            if count != 0:
                raise ValueError(
                    f"Table '{table}' is not empty. "
                    "Import stopped to prevent duplicate records."
                )


    with engine.begin() as connection:

        for table in datasets:

            file_path = DATA_DIR / f"{table}.csv"

            print(f"\nImporting {table}...")

            if not file_path.exists():
                raise FileNotFoundError(file_path)

            df = pd.read_csv(file_path)

            
            date_columns = {
                "branches": [],
                "customers": [
                    "date_of_birth",
                    "customer_since"
                ],
                "accounts": [
                    "opening_date"
                ],
                "transactions": [
                    "transaction_date"
                ],
                "loans": [
                    "disbursement_date",
                    "maturity_date"
                ],
                "fixed_deposits": [
                    "opening_date",
                    "maturity_date"
                ]
            }

            for column in date_columns[table]:

                df[column] = pd.to_datetime(
                    df[column],
                    errors="raise"
                )

            df.to_sql(
                name=table,
                con=connection,
                if_exists="append",
                index=False,
                chunksize=500,
                method="multi"
            )

            print(
                f"Successfully imported {len(df)} "
                f"records into {table}."
            )

    print("\n========== IMPORT COMPLETED ==========")

except Exception as error:

    print("\nDATABASE IMPORT FAILED!")
    print("Error:", error)

    raise

finally:
    engine.dispose()
