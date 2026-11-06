
USE bankvision;

CREATE OR REPLACE VIEW vw_loan_analytics AS

SELECT
    b.branch_id,
    b.branch_name,
    b.city,
    b.state,

    COALESCE(l.total_loans, 0) AS total_loans,

    COALESCE(l.active_loans, 0) AS active_loans,

    COALESCE(l.closed_loans, 0) AS closed_loans,

    COALESCE(l.defaulted_loans, 0) AS defaulted_loans,

    COALESCE(l.total_loan_amount, 0)
        AS total_loan_amount,

    COALESCE(l.total_outstanding_amount, 0)
        AS total_outstanding_amount,

    COALESCE(l.average_interest_rate, 0)
        AS average_interest_rate,

    COALESCE(l.average_monthly_emi, 0)
        AS average_monthly_emi,

    COALESCE(l.default_rate, 0)
        AS default_rate

FROM branches b

LEFT JOIN (

    SELECT
        a.branch_id,

        COUNT(l.loan_id) AS total_loans,

        SUM(
            CASE WHEN l.loan_status = 'Active'
            THEN 1 ELSE 0 END
        ) AS active_loans,

        SUM(
            CASE WHEN l.loan_status = 'Closed'
            THEN 1 ELSE 0 END
        ) AS closed_loans,

        SUM(
            CASE WHEN l.loan_status = 'Defaulted'
            THEN 1 ELSE 0 END
        ) AS defaulted_loans,

        SUM(l.loan_amount) AS total_loan_amount,

        SUM(l.outstanding_amount)
            AS total_outstanding_amount,

        AVG(l.interest_rate) AS average_interest_rate,

        AVG(l.monthly_emi) AS average_monthly_emi,

        ROUND(
            100.0 * SUM(
                CASE WHEN l.loan_status = 'Defaulted'
                THEN 1 ELSE 0 END
            ) / NULLIF(COUNT(l.loan_id), 0),
            2
        ) AS default_rate

    FROM loans l

    INNER JOIN accounts a
        ON l.account_id = a.account_id

    GROUP BY a.branch_id

) l

ON b.branch_id = l.branch_id;

SHOW FULL TABLES
WHERE Table_type = 'VIEW';

SELECT *
FROM vw_loan_analytics;

SELECT
    SUM(total_loans) AS total_loans,
    SUM(active_loans) AS active_loans,
    SUM(closed_loans) AS closed_loans,
    SUM(defaulted_loans) AS defaulted_loans,
    ROUND(SUM(total_loan_amount), 2)
        AS total_disbursed
FROM vw_loan_analytics;
