
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Customer distribution by segment
router.get("/customers", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        customer_segment AS name,
        COUNT(*) AS value
      FROM customers
      GROUP BY customer_segment
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch customer analytics" });
  }
});


// Transaction distribution by status
router.get("/transactions", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        transaction_status AS name,
        COUNT(*) AS value
      FROM transactions
      GROUP BY transaction_status
      ORDER BY value DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Transaction analytics error:", error.message);

    res.status(500).json({
      message: "Failed to fetch transaction analytics"
    });
  }
});


// Branch-wise account balance analytics
router.get("/branches", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        b.branch_name AS branch,
        ROUND(SUM(a.balance) / 10000000, 2) AS balance
      FROM branches b
      LEFT JOIN accounts a
        ON b.branch_id = a.branch_id
      GROUP BY b.branch_id, b.branch_name
      ORDER BY b.branch_id
    `);

    res.json(rows);
  } catch (error) {
    console.error("Branch analytics error:", error.message);

    res.status(500).json({
      message: "Failed to fetch branch analytics"
    });
  }
});



// Outstanding loan amount by branch
router.get("/loans", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        b.branch_id,
        b.branch_name AS branch,
        ROUND(
          COALESCE(SUM(l.outstanding_amount), 0) / 10000000,
          2
        ) AS outstanding
      FROM branches b
      LEFT JOIN accounts a
        ON b.branch_id = a.branch_id
      LEFT JOIN loans l
        ON a.account_id = l.account_id
      GROUP BY b.branch_id, b.branch_name
      ORDER BY b.branch_id
    `);

    res.json(rows);
  } catch (error) {
    console.error("Loan analytics error:", error.message);

    res.status(500).json({
      message: "Failed to fetch loan analytics"
    });
  }
});


// Fixed deposit investment by branch
router.get("/deposits", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        b.branch_id,
        b.branch_name AS branch,
        ROUND(
          COALESCE(SUM(fd.principal_amount), 0) / 10000000,
          2
        ) AS investment
      FROM branches b
      LEFT JOIN accounts a
        ON b.branch_id = a.branch_id
      LEFT JOIN fixed_deposits fd
        ON a.account_id = fd.account_id
      GROUP BY b.branch_id, b.branch_name
      ORDER BY b.branch_id
    `);

    res.json(rows);
  } catch (error) {
    console.error("Deposit analytics error:", error.message);

    res.status(500).json({
      message: "Failed to fetch deposit analytics"
    });
  }
});


// Dashboard summary statistics
router.get("/summary", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM customers) AS totalCustomers,
        (SELECT COUNT(*) FROM accounts) AS totalAccounts,
        (SELECT COUNT(*) FROM loans) AS totalLoans,
        (SELECT COUNT(*) FROM transactions) AS totalTransactions
    `);

    res.json(rows[0]);
  } catch (error) {
    console.error("Dashboard summary error:", error.message);

    res.status(500).json({
      message: "Failed to fetch dashboard summary"
    });
  }
});


// Get all customers with search and pagination
router.get("/customers/list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit) || 10)
    );

    const search = String(req.query.search || "").trim();
    const offset = (page - 1) * limit;

    const searchCondition = `
      WHERE first_name LIKE ?
      OR last_name LIKE ?
      OR email LIKE ?
      OR phone LIKE ?
      OR city LIKE ?
      OR customer_segment LIKE ?
    `;

    const searchValue = `%${search}%`;

    const [customers] = await db.query(
      `
      SELECT
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        city,
        state,
        occupation,
        customer_segment
      FROM customers
      ${search ? searchCondition : ""}
      ORDER BY customer_id
      LIMIT ? OFFSET ?
      `,
      search
        ? [
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            limit,
            offset
          ]
        : [limit, offset]
    );

    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM customers
      ${search ? searchCondition : ""}
      `,
      search
        ? [
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
          ]
        : []
    );

    res.json({
      customers,
      pagination: {
        currentPage: page,
        limit,
        totalRecords: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error("Customer list error:", error.message);

    res.status(500).json({
      message: "Failed to fetch customers"
    });
  }
});


// Get transactions with search, filters and pagination
router.get("/transactions/list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const type = String(req.query.type || "").trim();
    const mode = String(req.query.mode || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push("transaction_reference LIKE ?");
      values.push(`%${search}%`);
    }

    if (status) {
      conditions.push("transaction_status = ?");
      values.push(status);
    }

    if (type) {
      conditions.push("transaction_type = ?");
      values.push(type);
    }

    if (mode) {
      conditions.push("transaction_mode = ?");
      values.push(mode);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const [transactions] = await db.query(
      `
      SELECT
        transaction_id,
        transaction_reference,
        account_id,
        transaction_type,
        transaction_category,
        amount,
        transaction_date,
        transaction_mode,
        transaction_status
      FROM transactions
      ${whereClause}
      ORDER BY transaction_date DESC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM transactions ${whereClause}`,
      values
    );

    res.json({
      transactions,
      pagination: {
        currentPage: page,
        limit,
        totalRecords: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error("Transaction list error:", error.message);
    res.status(500).json({
      message: "Failed to fetch transactions"
    });
  }
});


// Get loans with search, status filter and pagination
router.get("/loans/list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const type = String(req.query.type || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`
        (
          loan_reference LIKE ?
          OR CAST(customer_id AS CHAR) LIKE ?
          OR CAST(account_id AS CHAR) LIKE ?
        )
      `);

      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      conditions.push("loan_status = ?");
      values.push(status);
    }

    if (type) {
      conditions.push("loan_type = ?");
      values.push(type);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const [loans] = await db.query(
      `
      SELECT
        loan_id,
        loan_reference,
        customer_id,
        account_id,
        loan_type,
        loan_amount,
        interest_rate,
        loan_tenure_months,
        monthly_emi,
        outstanding_amount,
        loan_status,
        disbursement_date,
        maturity_date
      FROM loans
      ${whereClause}
      ORDER BY loan_id DESC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM loans ${whereClause}`,
      values
    );

    res.json({
      loans,
      pagination: {
        currentPage: page,
        limit,
        totalRecords: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Loan list error:", error.message);

    res.status(500).json({
      message: "Failed to fetch loans",
    });
  }
});


// Get fixed deposits with search, status filter and pagination
router.get("/deposits/list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const payoutType = String(req.query.payoutType || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`
        (
          fd_reference LIKE ?
          OR CAST(customer_id AS CHAR) LIKE ?
          OR CAST(account_id AS CHAR) LIKE ?
        )
      `);

      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      conditions.push("fd_status = ?");
      values.push(status);
    }

    if (payoutType) {
      conditions.push("payout_type = ?");
      values.push(payoutType);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const [deposits] = await db.query(
      `
      SELECT
        fd_id,
        fd_reference,
        customer_id,
        account_id,
        principal_amount,
        interest_rate,
        tenure_months,
        maturity_amount,
        opening_date,
        maturity_date,
        fd_status,
        payout_type
      FROM fixed_deposits
      ${whereClause}
      ORDER BY fd_id DESC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM fixed_deposits ${whereClause}`,
      values
    );

    res.json({
      deposits,
      pagination: {
        currentPage: page,
        limit,
        totalRecords: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Fixed deposit list error:", error.message);

    res.status(500).json({
      message: "Failed to fetch fixed deposits",
    });
  }
});


// Get branches with search and pagination
router.get("/branches/list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = String(req.query.search || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`
        (
          branch_name LIKE ?
          OR branch_code LIKE ?
          OR ifsc_code LIKE ?
          OR city LIKE ?
          OR state LIKE ?
          OR manager_name LIKE ?
        )
      `);

      const keyword = `%${search}%`;
      values.push(keyword, keyword, keyword, keyword, keyword, keyword);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const [branches] = await db.query(
      `
      SELECT
        branch_id,
        branch_name,
        branch_code,
        city,
        state,
        ifsc_code,
        manager_name
      FROM branches
      ${whereClause}
      ORDER BY branch_id ASC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM branches ${whereClause}`,
      values
    );

    res.json({
      branches,
      pagination: {
        currentPage: page,
        limit,
        totalRecords: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Branch list error:", error.message);

    res.status(500).json({
      message: "Failed to fetch branches",
    });
  }
});



router.get("/risk/summary", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS totalLoans,

        SUM(
          CASE
            WHEN BINARY risk_category = BINARY 'High'
            THEN 1 ELSE 0
          END
        ) AS highRisk,

        SUM(
          CASE
            WHEN BINARY risk_category = BINARY 'Medium'
            THEN 1 ELSE 0
          END
        ) AS mediumRisk,

        SUM(
          CASE
            WHEN BINARY risk_category = BINARY 'Low'
            THEN 1 ELSE 0
          END
        ) AS lowRisk,

        SUM(
          CASE
            WHEN BINARY risk_category = BINARY 'Closed'
            THEN 1 ELSE 0
          END
        ) AS closedLoans

      FROM vw_risk_intelligence
    `);

    res.json(rows[0]);
  } catch (error) {
    console.error("Risk summary error:", error.message);

    res.status(500).json({
      message: "Failed to fetch risk summary",
    });
  }
});



router.get("/risk/list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`
        (
          CAST(loan_id AS CHAR) LIKE ?
          OR loan_reference LIKE ?
          OR CAST(customer_id AS CHAR) LIKE ?
          OR customer_name LIKE ?
        )
      `);

      const keyword = `%${search}%`;
      values.push(keyword, keyword, keyword, keyword);
    }

    if (category) {
      conditions.push("BINARY risk_category = BINARY ?");
      values.push(category);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const [records] = await db.query(
      `
      SELECT
        loan_id,
        loan_reference,
        customer_id,
        customer_name,
        annual_income,
        monthly_income,
        loan_type,
        loan_amount,
        monthly_emi,
        outstanding_amount,
        loan_status,
        emi_to_income_percentage,
        risk_category
      FROM vw_risk_intelligence
      ${whereClause}
      ORDER BY
  CASE
    WHEN BINARY risk_category = BINARY 'High' THEN 1
    WHEN BINARY risk_category = BINARY 'Medium' THEN 2
    WHEN BINARY risk_category = BINARY 'Low' THEN 3
    ELSE 4
  END,
  loan_id ASC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM vw_risk_intelligence ${whereClause}`,
      values
    );

    const totalRecords = Number(countResult[0].total);

    res.json({
      records,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    });
  } catch (error) {
    console.error("Risk records error:", error.message);
    res.status(500).json({
      message: "Failed to fetch risk records",
    });
  }
});


module.exports = router;
