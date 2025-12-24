import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';

import TasksContainer from './modules/Tasks/TasksContainer';

import Groceries from './modules/Groceries/Groceries';

import Meals from './modules/Meals/Meals';


import Dashboard from './modules/Dashboard/Dashboard';
import Settings from './modules/Settings/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksContainer />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/groceries" element={<Groceries />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
