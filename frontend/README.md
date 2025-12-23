# NestOra Frontend

This is the React-based frontend for the NestOra Household & Life Management App.

## 🛠️ Tech Stack
- **React** (Vite)
- **Lucide React** (Icons)
- **React Router** (Navigation)
- **Vanilla CSS** (Styling)

## 🚀 Setup & Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📂 Folder Structure
- `src/components`: Shared UI components and Layout.
- `src/modules`: Core features (Dashboard, Chores, Groceries, Meals, Bills, Schedule).
- `src/styles`: Global styles and CSS variables.
- `src/App.jsx`: Main entry point with routing logic.

## 💾 Data Persistence
Currently uses `localStorage` for data persistence. Data is stored under keys prefixed with `nestora_`.
