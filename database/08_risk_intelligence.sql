USE bankvision;

CREATE OR REPLACE VIEW vw_risk_intelligence AS
SELECT
    l.loan_id,
    l.loan_reference,
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.annual_income,
    l.loan_type,
    l.loan_amount,
    l.monthly_emi,
    l.outstanding_amount,
    l.loan_status,

    ROUND(c.annual_income / 12, 2) AS monthly_income,

    ROUND(
        (l.monthly_emi / NULLIF(c.annual_income / 12, 0)) * 100,
        2
    ) AS emi_to_income_percentage,

    CASE
        WHEN l.loan_status = 'Defaulted' THEN 'High'
        WHEN l.loan_status = 'Closed' THEN 'Closed'
        WHEN (l.monthly_emi / NULLIF(c.annual_income / 12, 0)) * 100 > 40
            THEN 'High'
        WHEN (l.monthly_emi / NULLIF(c.annual_income / 12, 0)) * 100 > 25
            THEN 'Medium'
        ELSE 'Low'
    END AS risk_category

FROM loans l
JOIN customers c
    ON l.customer_id = c.customer_id;
    
    SELECT *
FROM vw_risk_intelligence
LIMIT 20;

SELECT
    risk_category,
    COUNT(*) AS total_loans,
    ROUND(SUM(outstanding_amount), 2) AS total_outstanding
FROM vw_risk_intelligence
GROUP BY risk_category;

SELECT
    loan_status,
    risk_category,
    COUNT(*) AS total_loans
FROM vw_risk_intelligence
GROUP BY loan_status, risk_category
ORDER BY loan_status, risk_category;