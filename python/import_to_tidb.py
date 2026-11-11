
import csv
import os
import sys
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "raw"

load_dotenv(ROOT / ".env.tidb")


# --------------------------------------------------
# TABLES AND EXPECTED RECORD COUNTS
# Import order preserves foreign-key dependencies.
# --------------------------------------------------

TABLES = [
    ("branches", "branches.csv", 20),
    ("customers", "customers.csv", 5000),
    ("accounts", "accounts.csv", 6000),
    ("transactions", "transactions.csv", 30000),
    ("loans", "loans.csv", 2000),
    ("fixed_deposits", "fixed_deposits.csv", 3000),
]

BATCH_SIZE = 1000


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def connect_database():

    required = [
        "TIDB_HOST",
        "TIDB_USER",
        "TIDB_PASSWORD",
        "TIDB_DATABASE",
        "TIDB_SSL_CA",
    ]

    missing = [
        key for key in required
        if not os.getenv(key)
    ]

    if missing:
        raise ValueError(
            "Missing environment variables: "
            + ", ".join(missing)
        )

    ca_file = Path(os.environ["TIDB_SSL_CA"])

    if not ca_file.is_file():
        raise FileNotFoundError(
            f"CA certificate not found: {ca_file}"
        )

    connection = mysql.connector.connect(
        host=os.environ["TIDB_HOST"],
        port=int(os.getenv("TIDB_PORT", "4000")),
        user=os.environ["TIDB_USER"],
        password=os.environ["TIDB_PASSWORD"],
        database=os.environ["TIDB_DATABASE"],
        ssl_ca=str(ca_file),
        ssl_verify_cert=True,
        autocommit=False,
        connection_timeout=30,
    )

    return connection


# --------------------------------------------------
# IMPORT ONE CSV TABLE
# --------------------------------------------------

def import_table(connection, table, filename, expected_count):

    csv_path = DATA_DIR / filename

    if not csv_path.is_file():
        raise FileNotFoundError(
            f"CSV file not found: {csv_path}"
        )

    cursor = connection.cursor()

    try:

        # Prevent duplicate imports
        cursor.execute(
            f"SELECT COUNT(*) FROM `{table}`"
        )

        existing_count = cursor.fetchone()[0]

        if existing_count != 0:
            raise RuntimeError(
                f"{table} already contains "
                f"{existing_count} records. "
                "Import stopped to prevent duplicates."
            )

        print(f"\nStarting import: {table}")

        with csv_path.open(
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as csv_file:

            reader = csv.DictReader(csv_file)

            columns = reader.fieldnames

            if not columns:
                raise ValueError(
                    f"No CSV headers found in {filename}"
                )

            column_sql = ", ".join(
                f"`{column}`" for column in columns
            )

            placeholders = ", ".join(
                ["%s"] * len(columns)
            )

            query = (
                f"INSERT INTO `{table}` "
                f"({column_sql}) "
                f"VALUES ({placeholders})"
            )

            batch = []
            imported = 0

            for row in reader:

                values = [
                    value if value != "" else None
                    for value in row.values()
                ]

                batch.append(tuple(values))

                if len(batch) >= BATCH_SIZE:

                    cursor.executemany(query, batch)

                    imported += len(batch)

                    connection.commit()

                    batch.clear()

                    print(
                        f"{table}: "
                        f"{imported} records imported"
                    )

            # Import remaining records
            if batch:

                cursor.executemany(query, batch)

                imported += len(batch)

                connection.commit()

        # Verify database count
        cursor.execute(
            f"SELECT COUNT(*) FROM `{table}`"
        )

        actual_count = cursor.fetchone()[0]

        if (
            imported != expected_count
            or actual_count != expected_count
        ):
            raise RuntimeError(
                f"{table}: expected {expected_count}, "
                f"imported {imported}, "
                f"database contains {actual_count}"
            )

        print(
            f"SUCCESS: {table} - "
            f"{actual_count} records imported"
        )

    except Exception:

        connection.rollback()
        raise

    finally:

        cursor.close()


# --------------------------------------------------
# MAIN MIGRATION FUNCTION
# --------------------------------------------------

def main():

    selected_table = (
        sys.argv[1].lower()
        if len(sys.argv) > 1
        else None
    )

    selected = [
        item for item in TABLES
        if selected_table is None
        or item[0] == selected_table
    ]

    if not selected:
        raise ValueError(
            f"Unknown table: {selected_table}"
        )

    print("Connecting to TiDB Cloud...")

    connection = connect_database()

    try:

        print("Connected to TiDB successfully.")

        for table, filename, expected_count in selected:

            import_table(
                connection,
                table,
                filename,
                expected_count
            )

        print("\nMigration checkpoint completed.")

    finally:

        connection.close()


# --------------------------------------------------
# SCRIPT ENTRY POINT
# --------------------------------------------------

if __name__ == "__main__":

    try:

        main()

    except Exception as error:

        print(f"\nIMPORT FAILED: {error}")

        sys.exit(1)
