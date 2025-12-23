# NestOra - Household & Life Management App

NestOra is a comprehensive application designed to act as a **single source of truth** for managing personal, family, and household operations. It aims to reduce mental load by centralizing tasks and information, improving consistency and accountability for chores and routines.

## 🎯 Overview

### Purpose
The purpose of NestOra is to help individuals or families manage day-to-day responsibilities such as household chores, meal planning, bill payments, kids’ school activities, doctor appointments, grocery management, expense tracking, personal goals, hobbies, and social connections.

### Target Users
- **Single parents** and **Families with kids**
- **Working professionals** managing home + side projects
- **Individuals** seeking structured life management

### Key Objectives
- **Reduce mental load** by centralizing tasks and information.
- **Improve consistency** and accountability for chores and routines.
- **Enable planning, tracking, and reflection** for all aspects of life.
- **Provide flexibility** for different lifestyles and schedules.

---

## 🚀 Implementation Details (Phase 1 MVP)

This section details the current state of the application as of Phase 1.

### Core Modules Implemented

#### 🏠 Household Chores
- Manage recurring tasks like cleaning, laundry, and maintenance.
- Track completion status and estimated time.

#### 🍎 Groceries & Inventory
- **Master Item Database**: Centralized tracking of items with price history.
- **Inventory Tracking**: Monitor stock levels in your pantry and fridge.
- **Shopping Sessions**: Interactive shopping with automatic inventory updates and expense logging.

#### 🍳 Meal Planning & Recipes
- Store recipes with ingredients linked to master items.
- **Cooking History**: Log meal frequency.
- **Auto-Inventory Reduction**: Required ingredients are automatically deducted from inventory when a meal is marked as cooked.

#### 💳 Bills & Subscriptions
- Track recurring bills and due dates.
- **Auto-Expense Logging**: Expenses are automatically logged when a bill is marked as paid.

#### 📅 Schedule & Time Management
- **Daily Planner**: Timeline view of scheduled events.
- **Health Tracking**: Log weight, blood pressure, and visit notes during health appointments.
- **Social Reminders**: Stay connected with friends and family via follow-up reminders.

#### 📊 Dashboard
- High-level summary of pending chores, overdue bills, and low inventory.
- Monthly spending overview and recent expense tracking.
- Manual expense logging.

### 🛠️ Technical Stack
- **Frontend**: React (Vite)
- **Styling**: Modern Vanilla CSS (Variables, Flexbox, Grid, Animations)
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Persistence**: `localStorage` (Offline-first approach)

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd NestOra
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## 📂 Project Structure

```
NestOra/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── modules/      # Feature-specific modules (Chores, Meals, etc.)
│   │   ├── styles/       # Global CSS and variables
│   │   └── App.jsx       # Main application & routing
│   └── package.json
├── requirements.md       # Original project requirements
└── README.md             # This file
```

## 🔮 Future Enhancements
- Backend API integration.
- Multi-user/Family support.
- AI-based meal and shopping recommendations.
- Mobile app (React Native).
