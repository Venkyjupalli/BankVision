
USE bankvision;

CREATE OR REPLACE VIEW vw_branch_performance AS

SELECT
    b.branch_id,
    b.branch_name,
    b.city,
    b.state,

    COALESCE(c.total_customers, 0)
        AS total_customers,

    COALESCE(d.total_accounts, 0)
        AS total_accounts,

    COALESCE(d.active_accounts, 0)
        AS active_accounts,

    COALESCE(d.total_account_balance, 0)
        AS total_account_balance,

    COALESCE(d.total_fd_investment, 0)
        AS total_fd_investment,

    COALESCE(l.total_loans, 0)
        AS total_loans,

    COALESCE(l.total_outstanding_amount, 0)
        AS total_loan_outstanding,

    COALESCE(t.total_transactions, 0)
        AS total_transactions,

    COALESCE(t.successful_transactions, 0)
        AS successful_transactions,

    COALESCE(t.failed_transactions, 0)
        AS failed_transactions,

    COALESCE(t.total_credit_amount, 0)
        AS total_credit_amount,

    COALESCE(t.total_debit_amount, 0)
        AS total_debit_amount

FROM branches b

LEFT JOIN (
    SELECT
        branch_id,
        COUNT(*) AS total_customers
    FROM customers
    GROUP BY branch_id
) c
    ON b.branch_id = c.branch_id

LEFT JOIN vw_deposit_analytics d
    ON b.branch_id = d.branch_id

LEFT JOIN vw_loan_analytics l
    ON b.branch_id = l.branch_id

LEFT JOIN vw_transaction_analytics t
    ON b.branch_id = t.branch_id;
    
    SELECT *
FROM vw_branch_performance;

SELECT
    SUM(total_customers) AS total_customers,
    SUM(total_accounts) AS total_accounts,
    SUM(total_loans) AS total_loans,
    SUM(total_transactions) AS total_transactions
FROM vw_branch_performance;
