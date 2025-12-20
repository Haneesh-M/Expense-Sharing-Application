# Expense Sharing Application (Full Stack)

A professional full-stack application designed to manage shared expenses, track group balances, and simplify debt settlements. This application leverages a React-based frontend and a Node.js/Express backend to provide a seamless user experience for financial tracking, ensuring data integrity and accuracy through strictly typed calculations.

---

## 📋 Table of Contents

* [Overview](https://www.google.com/search?q=%23-overview)
* [Project Structure](https://www.google.com/search?q=%23-project-structure)
* [Frontend Documentation](https://www.google.com/search?q=%23-frontend-documentation)
* [Backend Documentation](https://www.google.com/search?q=%23-backend-documentation)
* [API Documentation](https://www.google.com/search?q=%23-api-documentation)
* [Setup & Installation](https://www.google.com/search?q=%23-setup--installation)
* [Running the Application (Full Stack)](https://www.google.com/search?q=%23-running-the-application-full-stack)
* [Design Decisions](https://www.google.com/search?q=%23-design-decisions)
* [Testing](https://www.google.com/search?q=%23-testing)

---

## 🚀 Overview

This application acts as a central ledger for groups of users. It allows them to organize into groups, add shared expenses using various split strategies, and view a simplified **"Who owes Whom"** debt graph. The system ensures data integrity using ACID-compliant transactions for expense creation and handles all currency with integer arithmetic to avoid floating-point errors.

---

## 📂 Project Structure

```text
├── config/
│   └── db.js                 # Database connection logic
├── models/
│   ├── User.js               # User schema logic
│   ├── Group.js              # Group schema logic
│   ├── Expense.js            # Expense schema logic
│   └── Settlement.js         # Settlement schema logic
├── routes/
│   ├── userRoutes.js         # User API endpoints
│   ├── groupRoutes.js        # Group API endpoints
│   └── expenseRoutes.js      # Expense API endpoints
├── services/                 # Business Logic Layer
│   ├── BalanceService.js
│   ├── ExpenseService.js
│   ├── GroupService.js
│   └── UserService.js
├── finance.db                # SQLite Database file
├── server.js                 # Backend entry point
├── package.json              # Backend dependencies
├── front/                    # Frontend Folder (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── assets/           # Images and static styles
│       ├── api/              # API instance configuration
│       │   └── axios.js
│       ├── components/       # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── ExpenseForm.jsx
│       │   ├── GroupList.jsx
│       │   └── BalanceSummary.jsx
│       ├── context/          # State management (Context API)
│       │   └── AppContext.jsx
│       ├── pages/            # View components
│       │   ├── Dashboard.jsx
│       │   ├── Groups.jsx
│       │   ├── GroupDetails.jsx
│       │   └── UserManagement.jsx
│       ├── services/         # Frontend API service layer
│       │   └── api.js
│       ├── App.jsx           # Main application component
│       ├── main.jsx          # React entry point
│       └── index.css         # Global styles
└── README.md

```

---

## 💻 Frontend Documentation

### Frontend Overview

The frontend is a modern, responsive Single Page Application (SPA) built with **React** and **Vite**. It provides an intuitive graphical interface for users to visualize debts, manage group memberships, and record complex expense splits.

### Frontend Features

* **Dashboard**: High-level overview of total outstanding debts and credits.
* **Group Management**: Visually manage members and create new expense circles.
* **Expense Wizard**: Interactive forms for Equal, Exact, and Percentage-based split strategies.
* **Settlement Tracking**: Clear visualization of "Who owes Whom" with one-click settlement recording.

### Frontend Tech Stack

* **Framework**: React.js 18+
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **HTTP Client**: Axios (configured to target `http://localhost:3000`)
* **State Management**: React Context API

---

## ⚙️ Backend Documentation

### Backend Overview

A RESTful backend service designed for high financial accuracy. It employs a **Service–Repository pattern** to ensure a clean separation between the database layer and business logic.

### Backend Features

* **User & Group Management**: Create users and organize them into specific groups.
* **Expense Tracking**: Support for Equal splits, Exact amounts, and Percentage splits.
* **Debt Simplification**: Pairwise simplification of bidirectional debts.
* **Settlements**: Record payments to settle debts and reduce balances.

### Backend Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: SQLite (better-sqlite3)
* **Architecture**: Service–Repository Pattern

---

## 📖 API Documentation

All endpoints accept and return JSON. All amounts are handled in **Paise** (₹100 = 10000) to ensure financial accuracy.

### Users & Groups

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/groups` | List groups |
| POST | `/groups` | Create group |
| POST | `/groups/:id/users` | Add user to group |
| GET | `/groups/:id/members` | Get group members |

### Expenses (POST `/expenses`)

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

### Balances & Settlements

* **GET `/groups/:id/balances**`: Retrieve simplified debt relationships.
* **POST `/groups/:id/settle**`: Record a payment between a payer and payee.

---

## 🛠 Setup & Installation

### Prerequisites

* Node.js v14+
* NPM

### 1. Backend Installation

```bash
# From the root directory
npm install

```

### 2. Frontend Installation

```bash
cd front
npm install

```

---

## 🚀 Running the Application (Full Stack)

The application requires both services to run simultaneously. **CORS is enabled** on the backend to allow communication from the frontend.

### Step 1: Start the Backend

```bash
# In the root folder
npm start

```

*Backend runs on: **http://localhost:3000***

### Step 2: Start the Frontend

```bash
# In a new terminal window
cd front
npm run dev

```

*Frontend runs on: **http://localhost:5173***

---

## 🧠 Design Decisions

* **Integer Arithmetic**: All money stored as integers (Paise) to prevent floating-point precision issues.
* **Service–Repository Pattern**: Ensures logic is decoupled from the database layer for easier testing and maintenance.
* **SQLite**: Zero configuration and ACID-compliant, ideal for standalone full-stack applications.
* **Frontend State**: Context API chosen for state management to maintain a lightweight frontend without the overhead of Redux.

---

## 🧪 Testing

The API can be tested via the frontend interface or through tools like Postman, Insomnia, or cURL targeting the backend port.