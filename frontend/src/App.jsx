import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';

// Public Pages (loaded immediately)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PendingApproval from './pages/PendingApproval';
import SetupAdmin from './pages/SetupAdmin';

// Dashboard Pages (lazy loaded for better performance)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ZoningIntelligence = lazy(() => import('./pages/ZoningIntelligence'));
const DealRoom = lazy(() => import('./pages/DealRoom'));
const ComplianceGateway = lazy(() => import('./pages/ComplianceGateway'));
const Admin = lazy(() => import('./pages/Admin'));

// Phase 2+ Pages
const CreateListing = lazy(() => import('./pages/CreateListing'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const ProjectWorkspace = lazy(() => import('./pages/ProjectWorkspace'));
const AttorneyMarketplace = lazy(() => import('./pages/AttorneyMarketplace'));
const AffordableHousing = lazy(() => import('./pages/AffordableHousing'));
const InvestorPortfolio = lazy(() => import('./pages/InvestorPortfolio'));
const RealtorManagement = lazy(() => import('./pages/RealtorManagement'));
const PropertyManagement = lazy(() => import('./pages/PropertyManagement'));

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

// Component to protect internal routes
function PrivateRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!userData) return <LoadingFallback />;

  if (userData.approvalStatus === 'pending' && userData.role !== 'admin') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (userData.approvalStatus === 'rejected' && userData.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }



  return children;
}



function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Website Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Home />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/setup-admin" element={<SetupAdmin />} />

                {/* Authenticated Dashboard Routes */}
                <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="marketplace/:id" element={<PropertyDetail />} />
                  <Route path="create-listing" element={<CreateListing />} />
                  <Route path="zoning" element={<ZoningIntelligence />} />
                  <Route path="deal-room" element={<DealRoom />} />
                  <Route path="deal-room/:projectId" element={<ProjectWorkspace />} />
                  <Route path="compliance" element={<ComplianceGateway />} />
                  <Route path="attorneys" element={<AttorneyMarketplace />} />
                  <Route path="affordable-housing" element={<AffordableHousing />} />
                  <Route path="portfolio" element={<InvestorPortfolio />} />
                  <Route path="referrals" element={<RealtorManagement />} />
                  <Route path="property-management" element={<PropertyManagement />} />
                  <Route path="admin" element={<Admin />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
