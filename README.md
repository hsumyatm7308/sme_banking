# SME Banking - AI-Powered Business Growth

## Project Structure

```
ai-sme-banking/
├── backend/          # Python FastAPI
├── frontend/         # Next.js Web App
└── mobile/           # React Native (Expo)
```

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at: http://localhost:8000

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### 3. Mobile App (React Native)

```bash
cd mobile
npm install
npx expo start
```

## Demo Accounts

| Role | Phone | Password |
|------|-------|----------|
| SME Owner | 09123456789 | password123 |
| Bank Admin | 09987654321 | admin123 |

## Features

### SME Owner Dashboard
- View total balance, monthly income/expenses
- Monthly overview chart
- Recent transactions list

### Transactions
- Filter by type (All/Income/Expense)
- View transaction history

### Profile
- Business information
- Account settings

### Bank Admin Dashboard
- Total SMEs, Active SMEs, High Risk count
- SME list with risk levels
- Total transaction volume

## Tech Stack

- **Backend**: Python, FastAPI, SQLite, JWT Auth
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Recharts
- **Mobile**: React Native, Expo, React Navigation

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/{id}
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}

GET    /api/dashboard/summary
GET    /api/dashboard/monthly-summary

GET    /api/bank/sme-list
GET    /api/bank/analytics/summary
GET    /api/bank/sme/{id}
```
