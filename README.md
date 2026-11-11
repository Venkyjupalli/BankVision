
BankVision — Banking Analytics & Customer Intelligence Platform
BankVision is a full-stack banking analytics dashboard built to explore synthetic banking data across customers, transactions, loans, fixed deposits, branches, and loan-risk classifications.

Data notice: This project uses synthetic/demo data generated for learning and portfolio demonstration. It is not real customer information, a production banking system, or affiliated with any bank. Branch identifiers and IFSC-like values are illustrative.

Live Demo
Frontend: https://bank-vision-delta.vercel.app
Backend: https://bankvision.onrender.com
Health check: https://bankvision.onrender.com/api/health
Dashboard summary API: https://bankvision.onrender.com/api/dashboard/summary
The backend is hosted on Render Free and the frontend on Vercel. The database is hosted on TiDB Cloud. Free-tier services may sleep or have usage limits.

Features
Overview dashboard: consolidated customer, account, loan, and transaction KPIs.
Customer intelligence: customer segmentation, distribution charts, searchable customer records.
Transaction intelligence: transaction status analytics, success/failure/pending breakdown, searchable and filterable transaction records.
Loan intelligence: loan portfolio and status breakdown, loan-type analysis, searchable loan records.
Fixed deposit management: deposit status and payout-type analytics, principal summaries, searchable FD records.
Branch management: branch coverage and directory, state/city distribution, branch search.
Risk intelligence: illustrative high-, medium-, and low-risk classifications with loan-level risk records.
Settings: dashboard preferences and backend health status.
Technology Stack
Layer	Technologies
Frontend	React, TypeScript, Vite
UI / Charts	Tailwind CSS, Recharts, Lucide React
HTTP client	Axios
Backend	Node.js, Express
Database driver	mysql2
Database	TiDB Cloud (MySQL-compatible)
Data preparation	Python, CSV, Faker (synthetic data generation)
Analytics	SQL views; Power BI dashboard prepared separately
Deployment	Vercel (frontend), Render (backend)
Dataset
The current demo database contains the following synthetic records:

Table	Records
branches	20
customers	5,000
accounts	6,000
transactions	30,000
loans	2,000
fixed_deposits	3,000
Total	46,020
The project includes analytical SQL views for customer intelligence, deposit analytics, loan analytics, transaction analytics, branch performance, and risk intelligence.

Risk categories and calculated portfolio metrics are illustrative and should not be interpreted as real credit decisions or regulated financial analysis.

Repository Structure
BankVision/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   └── dashboardRoutes.js
│   ├── package.json
│   └── server.js
├── database/
│   └── *.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
├── python/
│   └── import_to_tidb.py
└── README.md
Run Locally
Prerequisites
Node.js and npm
Python 3
MySQL-compatible database (the deployed project uses TiDB Cloud)
Git
1. Clone the repository
git clone https://github.com/Venkyjupalli/BankVision.git
cd BankVision
2. Configure the backend
In the current project configuration, the backend loads the project-root .env, so create BankVision/.env:

DB_HOST=your_tidb_host
DB_PORT=4000
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=bankvision
DB_SSL_CA=path_or_pem_contents_for_ca_certificate
The backend database configuration accepts a local CA certificate path or PEM certificate contents. The Python migration script separately reads TiDB credentials from the project-root .env.tidb using TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE, and TIDB_SSL_CA. Never commit .env, .env.tidb, database passwords, or private keys.

Start the backend:

cd backend
npm install
npm start
The API runs on http://localhost:5000 unless PORT is set by the hosting platform.

3. Configure and run the frontend
Create frontend/.env:

VITE_API_URL=http://localhost:5000
Then run:

cd frontend
npm install
npm run dev
Vite displays the local frontend URL in the terminal (normally http://localhost:5173).

For production, set VITE_API_URL to the deployed backend origin, for example:

VITE_API_URL=https://bankvision.onrender.com
Vite environment variables prefixed with VITE_ are included in the browser bundle. Do not put secrets in them.

API Endpoints
All dashboard endpoints are mounted under /api/dashboard.

Method	Endpoint	Purpose
GET	/api/health	Backend and database health check
GET	/api/dashboard/summary	Main dashboard totals
GET	/api/dashboard/customers	Customer segment distribution
GET	/api/dashboard/customers/list	Customer records
GET	/api/dashboard/transactions	Transaction status distribution
GET	/api/dashboard/transactions/list	Transaction records
GET	/api/dashboard/loans	Loan status/portfolio analytics
GET	/api/dashboard/loans/list	Loan records
GET	/api/dashboard/deposits	Fixed deposit analytics
GET	/api/dashboard/deposits/list	Fixed deposit records
GET	/api/dashboard/branches	Branch analytics
GET	/api/dashboard/branches/list	Branch directory
GET	/api/dashboard/risk/summary	Risk summary
GET	/api/dashboard/risk/list	Loan risk records
List endpoints support the search, filtering, and pagination parameters implemented in the backend routes.

Deployment Configuration
Backend — Render
Repository: Venkyjupalli/BankVision
Branch: main
Root directory: backend
Build command: npm install
Start command: npm start
Environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL_CA, and FRONTEND_URL
FRONTEND_URL should contain the deployed Vercel origin.
Frontend — Vercel
Repository: Venkyjupalli/BankVision
Branch: main
Root directory: frontend
Framework: Vite
Build command: npm run build
Output directory: dist
Environment variable: VITE_API_URL=https://bankvision.onrender.com
SQL Analytics Views
The database SQL scripts create these views:

vw_customer_intelligence
vw_deposit_analytics
vw_loan_analytics
vw_transaction_analytics
vw_branch_performance
vw_risk_intelligence
Run the SQL scripts against your database in dependency order. Review each script before applying it to a database containing existing data.

Security and Limitations
Use synthetic data only; do not upload real customer, account, or transaction information.
Keep .env files and credentials out of source control.
Restrict CORS to the deployed frontend origin.
This repository is a portfolio/demo analytics application, not a core banking platform.
Some generated fields and risk classifications are illustrative; validate all calculations before using them for business decisions.
Render Free services may spin down after inactivity. The first request after idle time can be delayed.
Author
Jupalle Venkat
GitHub: https://github.com/Venkyjupalli
Project: https://github.com/Venkyjupalli/BankVision
Live Demo: https://bank-vision-delta.vercel.app

If you find an issue or have a suggestion, feel free to open a GitHub issue.

⋮⋮⋮⋮⋮⋮⋮⋮
⋮⋮⋮⋮