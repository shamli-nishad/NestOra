import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';

import Chores from './modules/Chores/Chores';

import Groceries from './modules/Groceries/Groceries';

import Meals from './modules/Meals/Meals';

import Bills from './modules/Bills/Bills';

import Dashboard from './modules/Dashboard/Dashboard';
import Schedule from './modules/Schedule/Schedule';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/groceries" element={<Groceries />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
