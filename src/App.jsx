import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TradingProvider } from './context/TradingContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import DashboardLayout from './components/Layout/DashboardLayout';
import BalanceChip from './components/Dashboard/BalanceChip';
import StockList from './components/Dashboard/StockList';
import PriceChart from './components/Dashboard/PriceChart';
import StockAnalytics from './components/Dashboard/StockAnalytics';
import TradePanel from './components/Dashboard/TradePanel';
import AISuggestion from './components/Dashboard/AISuggestion';
import StatsCard from './components/Dashboard/StatsCard';
import HoldingsTable from './components/Portfolio/HoldingsTable';
import HistoryTable from './components/History/HistoryTable';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { TrendingUp } from 'lucide-react';

// Route protection guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Authentication View (Combines login and register with tab toggle)
const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <TrendingUp size={32} />
            <span><span>Fin</span>Trader</span>
          </div>
          <span className="auth-subtitle">Simulated paper trading terminal. Zero risk.</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TradingProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Dashboard Protected views */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="dashboard-layout">
                      <BalanceChip />
                      <div className="dashboard-grid">
                        {/* Column 1: Market Stock Discovery */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <StockList />
                        </div>
                        {/* Column 2: Selected Stock Chart */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <PriceChart />
                          <StockAnalytics />
                        </div>
                        {/* Column 3: Trading Action Terminal & statistics */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <TradePanel />
                          <AISuggestion />
                          <StatsCard />
                        </div>
                      </div>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="dashboard-layout">
                      <HoldingsTable />
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="dashboard-layout">
                      <HistoryTable />
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TradingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
