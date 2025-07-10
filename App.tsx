import React, { useState, FC } from 'react';
import * as ReactFlowModule from 'reactflow';
import NavigationSidebar from './components/NavigationSidebar.tsx';
import DashboardPage from './pages/Dashboard.tsx';
import BuilderPage from './pages/Builder.tsx';
import ReportsPage from './pages/Reports.tsx';
import { type Page } from './types.ts';

const App: FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('builder');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'builder':
        return <BuilderPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <BuilderPage />;
    }
  };

  return (
    <ReactFlowModule.ReactFlowProvider>
      <div className="h-screen w-screen bg-slate-100 flex font-sans">
        <NavigationSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </ReactFlowModule.ReactFlowProvider>
  );
};

export default App;