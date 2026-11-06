USE bankvision;

CREATE OR REPLACE VIEW vw_deposit_analytics AS

SELECT
    b.branch_id,
    b.branch_name,
    b.city,
    b.state,

    COUNT(DISTINCT a.account_id) AS total_accounts,

    COUNT(DISTINCT CASE
        WHEN a.account_status = 'Active'
        THEN a.account_id
    END) AS active_accounts,

    COALESCE(SUM(
        CASE
            WHEN a.account_status = 'Active'
            THEN a.balance
            ELSE 0
        END
    ), 0) AS total_account_balance,

    COALESCE(SUM(
        CASE
            WHEN a.account_status = 'Active'
             AND a.account_type = 'Savings'
            THEN a.balance
            ELSE 0
        END
    ), 0) AS savings_balance,

    COALESCE(SUM(
        CASE
            WHEN a.account_status = 'Active'
             AND a.account_type = 'Current'
            THEN a.balance
            ELSE 0
        END
    ), 0) AS current_balance,

    COALESCE(fd.total_fixed_deposits, 0)
        AS total_fixed_deposits,

    COALESCE(fd.total_fd_investment, 0)
        AS total_fd_investment,

    COALESCE(fd.active_fd_investment, 0)
        AS active_fd_investment,

    COALESCE(fd.matured_fd_investment, 0)
        AS matured_fd_investment

FROM branches b

LEFT JOIN accounts a
    ON b.branch_id = a.branch_id

LEFT JOIN (
    SELECT
        a.branch_id,
        COUNT(fd.fd_id) AS total_fixed_deposits,

        SUM(fd.principal_amount)
            AS total_fd_investment,

        SUM(
            CASE
                WHEN fd.fd_status = 'Active'
                THEN fd.principal_amount
                ELSE 0
            END
        ) AS active_fd_investment,

        SUM(
            CASE
                WHEN fd.fd_status = 'Matured'
                THEN fd.principal_amount
                ELSE 0
            END
        ) AS matured_fd_investment

    FROM fixed_deposits fd

    JOIN accounts a
        ON fd.account_id = a.account_id

    GROUP BY a.branch_id
) fd
    ON b.branch_id = fd.branch_id

GROUP BY
    b.branch_id,
    b.branch_name,
    b.city,
    b.state,
    fd.total_fixed_deposits,
    fd.total_fd_investment,
    fd.active_fd_investment,
    fd.matured_fd_investment;
    
SHOW FULL TABLES
WHERE Table_type = 'VIEW';

SELECT *
FROM vw_deposit_analytics;

