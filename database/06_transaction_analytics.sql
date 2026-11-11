
USE bankvision;

CREATE OR REPLACE VIEW vw_transaction_analytics AS

SELECT
    b.branch_id,
    b.branch_name,
    b.city,
    b.state,

    COUNT(t.transaction_id) AS total_transactions,

    SUM(
        CASE WHEN t.transaction_status = 'Success'
        THEN 1 ELSE 0 END
    ) AS successful_transactions,

    SUM(
        CASE WHEN t.transaction_status = 'Failed'
        THEN 1 ELSE 0 END
    ) AS failed_transactions,

    SUM(
        CASE WHEN t.transaction_status = 'Pending'
        THEN 1 ELSE 0 END
    ) AS pending_transactions,

    COALESCE(SUM(
        CASE
            WHEN t.transaction_status = 'Success'
             AND t.transaction_type = 'Credit'
            THEN t.amount ELSE 0
        END
    ), 0) AS total_credit_amount,

    COALESCE(SUM(
        CASE
            WHEN t.transaction_status = 'Success'
             AND t.transaction_type = 'Debit'
            THEN t.amount ELSE 0
        END
    ), 0) AS total_debit_amount,

    COALESCE(AVG(
        CASE
            WHEN t.transaction_status = 'Success'
            THEN t.amount
        END
    ), 0) AS average_transaction_amount,

    SUM(
        CASE
            WHEN t.transaction_status = 'Success'
             AND t.transaction_category = 'UPI'
            THEN 1 ELSE 0
        END
    ) AS upi_transactions,

    SUM(
        CASE
            WHEN t.transaction_status = 'Success'
             AND t.transaction_category = 'ATM'
            THEN 1 ELSE 0
        END
    ) AS atm_transactions,

    SUM(
        CASE
            WHEN t.transaction_status = 'Success'
             AND t.transaction_category = 'NEFT'
            THEN 1 ELSE 0
        END
    ) AS neft_transactions,

    SUM(
        CASE
            WHEN t.transaction_status = 'Success'
             AND t.transaction_category = 'IMPS'
            THEN 1 ELSE 0
        END
    ) AS imps_transactions

FROM branches b

LEFT JOIN accounts a
    ON b.branch_id = a.branch_id

LEFT JOIN transactions t
    ON a.account_id = t.account_id

GROUP BY
    b.branch_id,
    b.branch_name,
    b.city,
    b.state;


-- Verify transaction analytics
SHOW FULL TABLES
WHERE Table_type = 'VIEW';

SELECT *
FROM vw_transaction_analytics;
