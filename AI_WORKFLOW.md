# How AI Workflow - SME Banking

## Overview

This document explains the complete AI workflow from data ingestion to intelligent insights for the SME Banking application.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web App     │  │  Mobile App  │  │  Bank Admin  │          │
│  │  (Next.js)   │  │ (React Native)│  │  (Next.js)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (FastAPI)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth API    │  │Transaction API│  │  Dashboard API│          │
│  │  /api/auth/* │  │/api/transact-*│  │ /api/dashboard│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI ENGINE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Data        │  │  Analytics   │  │  Insights    │          │
│  │  Processor   │──│  Engine      │──│  Generator   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA STORAGE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  SQLite      │  │  Cache       │  │  Seed Data   │          │
│  │  (Transactions)│ │ (Redis)      │  │ (Demo)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Pipeline

### Phase 1: Data Collection

```
User Action → API Request → Validation → Database Storage
```

**Step-by-step:**

1. **User records a transaction** (income/expense)
   - Input: type, amount, category, date, description
   - Validation: amount > 0, valid category, valid date

2. **Data is sent to FastAPI**
   - Endpoint: `POST /api/transactions`
   - Authentication: JWT token verified
   - User ID extracted from token

3. **Transaction stored in SQLite**
   - Table: `transactions`
   - Fields: id, user_id, type, amount, category, description, date, created_at

```
[User] → [Frontend] → [API Gateway] → [Auth Check] → [DB Storage]
```

---

### Phase 2: Data Processing

```
Raw Data → Cleaning → Aggregation → Analysis
```

**Step-by-step:**

1. **Data Cleaning**
   - Remove duplicate transactions
   - Validate amounts (no negative income)
   - Standardize categories
   - Fill missing dates

2. **Data Aggregation**
   - Group by month
   - Group by category
   - Group by type (income/expense)
   - Calculate totals per group

3. **Data Analysis**
   - Monthly income vs expenses
   - Cash flow trends
   - Category spending patterns
   - Seasonal patterns

```
[Raw Transactions] → [Clean] → [Aggregate] → [Analyze]
```

---

### Phase 3: AI Analytics Engine

```
Processed Data → Pattern Recognition → Insight Generation → Output
```

**Current AI Capabilities:**

#### A. Financial Summary Analysis

```python
# Input: User transactions
# Process: Aggregate income and expenses by month
# Output: Monthly financial summary

Input: [
    {type: "income", amount: 50000, date: "2026-08-28"},
    {type: "expense", amount: 12000, date: "2026-08-27"},
    ...
]

Process:
  - Group by month
  - Sum income, Sum expenses
  - Calculate net cash flow

Output: {
    "monthly_income": 295000,
    "monthly_expenses": 80000,
    "net_cash_flow": 215000
}
```

#### B. Monthly Trend Analysis

```python
# Input: 6 months of transaction data
# Process: Compare month-over-month changes
# Output: Trend data for chart visualization

Process:
  - For each of last 6 months:
    - Calculate total income
    - Calculate total expenses
    - Compare to previous month

Output: {
    "months": ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    "income": [45000, 50000, 55000, 60000, 75000, 110000],
    "expenses": [30000, 35000, 40000, 45000, 50000, 80000]
}
```

#### C. Risk Assessment (Bank Admin)

```python
# Input: SME transaction data
# Process: Calculate risk level based on rules
# Output: Risk classification

Rules:
  - LOW RISK: Balance > K100,000 AND Regular monthly income
  - MEDIUM RISK: Balance K50,000-100,000 OR Irregular income
  - HIGH RISK: Balance < K50,000 AND No income for 2+ months

Process:
  For each SME:
    1. Calculate total balance (income - expenses)
    2. Check monthly income consistency
    3. Apply risk rules
    4. Assign risk level

Output: {
    "business_name": "ABC Trading",
    "balance": 250000,
    "risk_level": "low",
    "transaction_count": 19
}
```

---

### Phase 4: AI Insight Generation

```
Analysis Results → Template Engine → User-Facing Output
```

**Insight Types:**

| Insight Type | Input Data | Output Format |
|-------------|-----------|---------------|
| Financial Health | Balance, income, expenses | Summary card |
| Monthly Trend | 6-month data | Bar chart |
| Spending Pattern | Category breakdown | Category analysis |
| Risk Assessment | Balance, consistency | Risk badge |

---

## 3. Bank Admin AI Workflow

### SME Monitoring Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  All SME     │────▶│  Aggregate   │────▶│  Risk        │
│  Transactions│     │  Data        │     │  Scoring     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Bank        │◀────│  Dashboard   │◀────│  Insights    │
│  Overview    │     │  Generation  │     │  Display     │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Step-by-step:**

1. **Bank Admin logs in** (role = bank_admin)
2. **System fetches all SME data**
3. **AI Engine processes each SME:**
   - Calculate balance
   - Analyze transaction patterns
   - Determine risk level
4. **Results displayed in Bank Dashboard:**
   - Total SMEs count
   - Active SMEs count
   - High risk SMEs count
   - Total transaction volume

---

## 4. Future AI Enhancement Pipeline

### Planned AI Features

```
Phase 1 (Current)          Phase 2 (Planned)          Phase 3 (Future)
─────────────────          ──────────────────          ─────────────────
✓ Financial Summary        → Cash Flow Forecast       → Loan Recommendation
✓ Monthly Trends           → Smart Alerts             → Pricing Insights
✓ Risk Assessment          → Category AI              → Revenue Prediction
✓ Bank Dashboard           → Anomaly Detection        → Competitor Analysis
```

### Phase 2: Cash Flow Forecasting

```
Input: 12 months of historical data
Process:
  1. Identify seasonal patterns
  2. Calculate growth rate
  3. Apply forecasting algorithm
Output: 3-month cash flow prediction
```

### Phase 3: AI Chatbot (Myanmar Language)

```
Input: User question in Myanmar language
Process:
  1. NLP parsing
  2. Intent classification
  3. Context retrieval
  4. Response generation
Output: AI-powered financial advice in Myanmar
```

---

## 5. API Endpoints Summary

### User-Facing APIs

| Endpoint | Method | Description | AI Feature |
|----------|--------|-------------|------------|
| `/api/auth/register` | POST | User registration | - |
| `/api/auth/login` | POST | User login | - |
| `/api/transactions` | GET | Get transactions | - |
| `/api/transactions` | POST | Add transaction | Data collection |
| `/api/transactions/{id}` | PUT | Update transaction | - |
| `/api/transactions/{id}` | DELETE | Delete transaction | - |
| `/api/dashboard/summary` | GET | Financial summary | **AI Aggregation** |
| `/api/dashboard/monthly-summary` | GET | Monthly trends | **AI Analysis** |

### Bank Admin APIs

| Endpoint | Method | Description | AI Feature |
|----------|--------|-------------|------------|
| `/api/bank/sme-list` | GET | All SME list | **AI Risk Scoring** |
| `/api/bank/analytics/summary` | GET | Bank overview | **AI Analytics** |
| `/api/bank/sme/{id}` | GET | SME details | **AI Pattern Analysis** |

---

## 6. Data Model

### Transaction Table

```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,           -- FK to users
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### User Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    role TEXT DEFAULT 'sme_owner',       -- 'sme_owner' or 'bank_admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. AI Processing Flow Diagram

```
                    ┌─────────────────────────┐
                    │      USER INPUT          │
                    │  (Transaction Data)      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    VALIDATION LAYER      │
                    │  - Check amount > 0      │
                    │  - Validate category     │
                    │  - Verify date format    │
                    │  - JWT Authentication    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     DATA STORAGE         │
                    │   (SQLite Database)      │
                    │  - Store transaction     │
                    │  - Update user record    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    AI PROCESSING         │
                    │                          │
                    │  1. Aggregate by month   │
                    │  2. Calculate totals     │
                    │  3. Identify trends      │
                    │  4. Generate insights    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    OUTPUT GENERATION     │
                    │                          │
                    │  - Dashboard summary     │
                    │  - Monthly chart data    │
                    │  - Risk assessment       │
                    │  - Financial health      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      USER DISPLAY        │
                    │  (Web/Mobile Dashboard)  │
                    └─────────────────────────┘
```

---

## 8. Security & Privacy

### Data Protection

| Layer | Security Measure |
|-------|-----------------|
| Authentication | JWT token with 24hr expiry |
| Authorization | Role-based access (sme_owner vs bank_admin) |
| Data Isolation | Users can only access their own data |
| Bank Access | Admin can view all SMEs but not modify |
| Password | bcrypt hashed storage |

### AI Privacy

- User data never leaves the database
- AI processing happens server-side only
- No external data sharing
- All processing is anonymized for bank admin view

---

## 9. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React Native (Expo) |
| Backend | Python FastAPI |
| Database | SQLite |
| AI Engine | Rule-based analytics + Aggregation engine |
| Auth | JWT (PyJWT) |
| Password | bcrypt |
| Charts | Recharts (Web), react-native-chart-kit (Mobile) |

---

## 10. Key Metrics

### AI Accuracy Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Transaction Processing | 100% | 100% |
| Financial Summary Accuracy | 100% | 100% |
| Risk Assessment Accuracy | Rule-based | ML-based |
| Monthly Trend Accuracy | Exact | ±5% forecast |

### Performance Metrics

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms |
| Dashboard Load Time | < 1s |
| Chart Rendering | < 500ms |
| Data Processing | Real-time |
