USE bankvision;

SELECT 'branches' AS table_name, COUNT(*) AS total_records
FROM branches

UNION ALL

SELECT 'customers', COUNT(*) FROM customers

UNION ALL

SELECT 'accounts', COUNT(*) FROM accounts

UNION ALL

SELECT 'transactions', COUNT(*) FROM transactions

UNION ALL

SELECT 'loans', COUNT(*) FROM loans

UNION ALL

SELECT 'fixed_deposits', COUNT(*) FROM fixed_deposits;

-- Step 16.2: Check customer and transaction records
SELECT * FROM customers LIMIT 10;

SELECT * FROM transactions LIMIT 10;


-- Step 16.3: Check customer-branch relationship
SELECT COUNT(*) AS invalid_customer_branches
FROM customers c
LEFT JOIN branches b
ON c.branch_id = b.branch_id
WHERE b.branch_id IS NULL;


-- Check transaction-account relationship
SELECT COUNT(*) AS invalid_transaction_accounts
FROM transactions t
LEFT JOIN accounts a
ON t.account_id = a.account_id
WHERE a.account_id IS NULL;

SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.branch_id,
    b.branch_name
FROM customers c
LEFT JOIN branches b
    ON c.branch_id = b.branch_id
WHERE b.branch_id IS NULL;

SELECT
    t.transaction_id,
    t.transaction_reference,
    t.account_id,
    a.account_number
FROM transactions t
LEFT JOIN accounts a
    ON t.account_id = a.account_id
WHERE a.account_id IS NULL;

USE bankvision;

SELECT DATABASE();

SELECT COUNT(*) AS invalid_customer_branches
FROM customers c
LEFT JOIN branches b
ON c.branch_id = b.branch_id
WHERE b.branch_id IS NULL;

SELECT COUNT(*) AS invalid_transaction_accounts
FROM transactions t
LEFT JOIN accounts a
ON t.account_id = a.account_id
WHERE a.account_id IS NULL;