USE bankvision;

CREATE TABLE branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    branch_code VARCHAR(20) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) UNIQUE NOT NULL,
    manager_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DESCRIBE branches;

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    date_of_birth DATE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    city VARCHAR(100),
    state VARCHAR(100),
    occupation VARCHAR(100),
    annual_income DECIMAL(15,2),
    customer_segment VARCHAR(30),
    branch_id INT,
    customer_since DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
);
DESCRIBE customers;

CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    branch_id INT NOT NULL,
    account_type VARCHAR(30) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    interest_rate DECIMAL(5,2) DEFAULT 0.00,
    minimum_balance DECIMAL(15,2) DEFAULT 0.00,
    account_status VARCHAR(20) DEFAULT 'Active',
    opening_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_account_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT fk_account_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
);

DESCRIBE accounts;

CREATE TABLE transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(50) UNIQUE NOT NULL,
    account_id INT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    transaction_category VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATETIME NOT NULL,
    transaction_mode VARCHAR(30),
    transaction_status VARCHAR(20) DEFAULT 'Success',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
);

DESCRIBE transactions;


CREATE TABLE loans (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    loan_reference VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    account_id INT,
    loan_type VARCHAR(50) NOT NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    loan_tenure_months INT NOT NULL,
    monthly_emi DECIMAL(15,2),
    outstanding_amount DECIMAL(15,2),
    loan_status VARCHAR(30) DEFAULT 'Active',
    disbursement_date DATE,
    maturity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_loan_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT fk_loan_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
);

DESCRIBE loans;

CREATE TABLE fixed_deposits (
    fd_id INT AUTO_INCREMENT PRIMARY KEY,
    fd_reference VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    account_id INT NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INT NOT NULL,
    maturity_amount DECIMAL(15,2),
    opening_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    fd_status VARCHAR(20) DEFAULT 'Active',
    payout_type VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fd_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT fk_fd_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
);

DESCRIBE fixed_deposits;

SHOW TABLES;