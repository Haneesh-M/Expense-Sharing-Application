
# Expense Sharing Application (Backend)

A RESTful backend service designed to manage shared expenses, track balances, and simplify debts among users in a group. This system is designed as a simplified version of Splitwise, built to demonstrate clean architecture and financial accuracy.

---

## 📋 Table of Contents

- Overview  
- Features  
- Tech Stack  
- Project Structure  
- Setup & Installation  
- API Documentation  
- Design Decisions  
- Testing  

---

## 🚀 Overview

This application acts as a central ledger for groups of users. It allows them to organize into groups, add shared expenses using various split strategies, and view a simplified **"Who owes Whom"** debt graph.

The system ensures data integrity using ACID-compliant transactions for expense creation and strictly typed financial calculations.

---

## ✨ Features

### User & Group Management
- Create users and organize them into specific groups  
- Users can belong to multiple groups  

### Expense Tracking
- **Equal Split**: Automatically divides the total amount equally  
- **Exact Amount**: Specify exact owed amounts  
- **Percentage**: Split bills by percentage (must total 100%)  

### Balance Calculation
- Tracks detailed debt relationships  
- Pairwise simplification of bidirectional debts  

### Settlements
- Record payments to settle debts and reduce balances  

---

## 🛠 Tech Stack

- **Runtime**: Node.js  
- **Framework**: Express.js  
- **Database**: SQLite (better-sqlite3)  
- **Architecture**: Service–Repository Pattern  

### Dependencies
- better-sqlite3  
- body-parser  
- cors  

---

## 📂 Project Structure

```text
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Group.js
│   ├── Expense.js
│   └── Settlement.js
├── routes/
│   ├── userRoutes.js
│   ├── groupRoutes.js
│   └── expenseRoutes.js
├── services/
│   ├── BalanceService.js
│   ├── ExpenseService.js
│   ├── GroupService.js
│   └── UserService.js
├── finance.db
├── server.js
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v14+  
- NPM  

### Installation

```bash
git clone <repository-url>
cd expense-backend
npm install
```

### Running the Server

```bash
npm start
# or
node server.js
```

Server runs on **http://localhost:3000**

---

## 📖 API Documentation

All endpoints accept and return JSON.

### Users & Groups

| Method | Endpoint | Description |
|------|---------|-------------|
| GET | /users | List users |
| POST | /users | Create user |
| GET | /groups | List groups |
| POST | /groups | Create group |
| POST | /groups/:id/users | Add user to group |
| GET | /groups/:id/members | Get group members |

---

### Expenses

**POST /expenses**  
All amounts are in **Paise** (₹100 = 10000)

#### Equal Split
```json
{
  "groupId": 1,
  "payerId": 1,
  "amount": 300000,
  "description": "Team Lunch",
  "splitType": "EQUAL",
  "splitDetails": []
}
```

#### Exact Split
```json
{
  "groupId": 1,
  "payerId": 1,
  "amount": 150000,
  "description": "Concert Tickets",
  "splitType": "EXACT",
  "splitDetails": [
    { "userId": 2, "value": 50000 },
    { "userId": 3, "value": 100000 }
  ]
}
```

#### Percentage Split
```json
{
  "groupId": 1,
  "payerId": 1,
  "amount": 200000,
  "description": "Shared Cab",
  "splitType": "PERCENT",
  "splitDetails": [
    { "userId": 2, "value": 40 },
    { "userId": 3, "value": 60 }
  ]
}
```

---

## 💰 Balances & Settlements

### Get Balances
**GET /groups/:id/balances**

```json
{
  "balances": [
    { "from": 2, "to": 1, "amount": 50000 },
    { "from": 3, "to": 1, "amount": 100000 }
  ]
}
```

### Settle Up
**POST /groups/:id/settle**

```json
{
  "payerId": 2,
  "payeeId": 1,
  "amount": 50000
}
```

---

## 🧠 Design Decisions

### Integer Arithmetic
- All money stored as integers (Paise)
- Prevents floating-point precision issues

### Service–Repository Pattern
- Clear separation of concerns
- Easier testing and maintenance

### SQLite
- Zero configuration
- ACID-compliant
- Ideal for standalone backend

---

## 🧪 Testing

Use Postman, Insomnia, or cURL.

