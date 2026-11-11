
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

    COALESCE(a.total_accounts, 0) AS total_accounts,
    COALESCE(a.total_active_balance, 0) AS total_active_balance,

    COALESCE(l.total_loans, 0) AS total_loans,
    COALESCE(l.total_loan_outstanding, 0) AS total_loan_outstanding,

    COALESCE(fd.total_fixed_deposits, 0) AS total_fixed_deposits,
    COALESCE(fd.total_fd_investment, 0) AS total_fd_investment

FROM customers c

LEFT JOIN branches b
    ON c.branch_id = b.branch_id

LEFT JOIN (
    SELECT
        customer_id,
        COUNT(*) AS total_accounts,
        SUM(
            CASE
                WHEN account_status = 'Active' THEN balance
                ELSE 0
            END
        ) AS total_active_balance
    FROM accounts
    GROUP BY customer_id
) a
    ON c.customer_id = a.customer_id

LEFT JOIN (
    SELECT
        customer_id,
        COUNT(*) AS total_loans,
        SUM(outstanding_amount) AS total_loan_outstanding
    FROM loans
    GROUP BY customer_id
) l
    ON c.customer_id = l.customer_id

LEFT JOIN (
    SELECT
        customer_id,
        COUNT(*) AS total_fixed_deposits,
        SUM(principal_amount) AS total_fd_investment
    FROM fixed_deposits
    GROUP BY customer_id
) fd
    ON c.customer_id = fd.customer_id;


-- Verify created views
SHOW FULL TABLES
WHERE Table_type = 'VIEW';

-- Display first 10 customer records
SELECT *
FROM vw_customer_intelligence
LIMIT 10;
