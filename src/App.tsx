import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CreateTicket from './components/CreateTicket';
import MyTickets from './components/MyTickets';
import AllTickets from './components/AllTickets';
import UserManagement from './components/UserManagement';
import OrganizationManagement from './components/OrganizationManagement';
import AssetInventory from './components/AssetInventory';
import IPAMDashboard from './components/IPAMDashboard';
import Settings from './components/Settings';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'create-ticket':
        return <CreateTicket />;
      case 'tickets':
        return <MyTickets />;
      case 'all-tickets':
        return <AllTickets />;
      case 'assets':
        return <AssetInventory />;
      case 'ipam':
        return <IPAMDashboard />;
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
            <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'organizations':
        return <OrganizationManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderCurrentView()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
