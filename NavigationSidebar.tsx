import React from 'react';
import { type Page } from '../types.ts';
import { HomeIcon, WrenchScrewdriverIcon, ChartBarIcon, ChevronUpDownIcon } from './Icons.tsx';

interface NavigationSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem = ({ icon, label, page, currentPage, onNavigate }: { icon: React.ReactNode, label: string, page: Page, currentPage: Page, onNavigate: (page: Page) => void }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onNavigate(page)}
      className={`flex items-center w-full px-3 py-2.5 rounded-lg text-base font-semibold transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      <div className="mr-3">{icon}</div>
      {label}
    </button>
  );
};

const UserProfile = () => {
    // TODO: Заменить на реальные данные пользователя из контекста аутентификации
    const user = {
        name: 'Антон Ковалев',
        initials: 'АК',
        role: 'Администратор'
    };

    return (
        <button className="flex items-center w-full p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3 flex-shrink-0">
                {user.initials}
            </div>
            <div className="text-left overflow-hidden">
                <p className="font-semibold text-sm text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <ChevronUpDownIcon className="w-5 h-5 text-slate-500 ml-auto flex-shrink-0"/>
        </button>
    );
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 flex-shrink-0 z-30">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="p-2 bg-blue-600 rounded-lg">
          <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">FinFlow</h1>
      </div>

      <div className="flex-grow space-y-2">
        <NavItem
          page="dashboard"
          label="Дашборд"
          icon={<HomeIcon className="w-5 h-5" />}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
        <NavItem
          page="builder"
          label="Конструктор"
          icon={<WrenchScrewdriverIcon className="w-5 h-5" />}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
        <NavItem
          page="reports"
          label="Отчеты"
          icon={<ChartBarIcon className="w-5 h-5" />}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
      </div>
      
      <div className="mt-auto">
        <UserProfile />
      </div>
    </nav>
  );
};

export default NavigationSidebar;