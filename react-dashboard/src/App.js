import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DirectoryTree from './components/DirectoryTree';
import UserManagement from './components/UserManagement';
import AuditLogs from './components/AuditLogs';
import Monitoring from './components/Monitoring';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/directory"
          element={isAuthenticated ? <DirectoryTree /> : <Navigate to="/login" />}
        />
        <Route
          path="/users"
          element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />}
        />
        <Route
          path="/audit"
          element={isAuthenticated ? <AuditLogs /> : <Navigate to="/login" />}
        />
        <Route
          path="/monitoring"
          element={isAuthenticated ? <Monitoring /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default App;

