USE bankvision;

CREATE OR REPLACE VIEW vw_customer_intelligence AS
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.gender,
    c.city,
    c.state,
    c.occupation,
    c.annual_income,
    c.customer_segment,
    b.branch_name,

    COUNT(DISTINCT a.account_id) AS total_accounts,

    COALESCE(SUM(
        CASE
            WHEN a.account_status = 'Active'
            THEN a.balance
            ELSE 0
        END
    ), 0) AS total_active_balance,

    COUNT(DISTINCT l.loan_id) AS total_loans,

    COALESCE(SUM(l.outstanding_amount), 0)
        AS total_loan_outstanding,

    COUNT(DISTINCT fd.fd_id) AS total_fixed_deposits,

    COALESCE(SUM(fd.principal_amount), 0)
        AS total_fd_investment

FROM customers c

LEFT JOIN branches b
    ON c.branch_id = b.branch_id

LEFT JOIN accounts a
    ON c.customer_id = a.customer_id

LEFT JOIN loans l
    ON c.customer_id = l.customer_id

LEFT JOIN fixed_deposits fd
    ON c.customer_id = fd.customer_id

GROUP BY
    c.customer_id,
    c.first_name,
    c.last_name,
    c.gender,
    c.city,
    c.state,
    c.occupation,
    c.annual_income,
    c.customer_segment,
    b.branch_name;
    
    -- Step 17.2: Verify created views
SHOW FULL TABLES
WHERE Table_type = 'VIEW';

-- Display first 10 customer records
SELECT *
FROM vw_customer_intelligence
LIMIT 10;