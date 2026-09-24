import React, { useState } from 'react';
import type { AppScreen, DriverProfile } from '../types';
import { Logo } from './Logo';
import { 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  User,
  Truck, 
  Bell, 
  ChevronDown, 
  Plus, 
  BellRing, 
  Package, 
  Check 
} from 'lucide-react';

export type CustomerHeaderSection = 'new_request' | 'new_offers' | 'my_requests';
export type DriverHeaderSection = 'profile' | 'new_requests' | 'subscription';

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenNewRequest: () => void;
  onOpenSubscription?: () => void;
  currentDriver?: DriverProfile;
  customerSection?: CustomerHeaderSection;
  onSelectCustomerSection?: (section: CustomerHeaderSection) => void;
  driverSection?: DriverHeaderSection;
  onSelectDriverSection?: (section: DriverHeaderSection) => void;
  unreadNotificationsCount?: number;
  unreadDriverNotificationsCount?: number;
  totalOffersCount?: number;
  openRequestsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenSubscription: _onOpenSubscription,
  currentDriver,
  customerSection = 'my_requests',
  onSelectCustomerSection,
  driverSection = 'new_requests',
  onSelectDriverSection,
  unreadNotificationsCount = 0,
  unreadDriverNotificationsCount = 0,
  totalOffersCount = 0,
  openRequestsCount = 0
}) => {
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);

  const getCustomerSectionLabel = (sec: CustomerHeaderSection) => {
    switch (sec) {
      case 'new_request':
        return 'طلب جديد';
      case 'new_offers':
        return 'العروض الجديدة';
      case 'my_requests':
        return 'طلباتي';
    }
  };

  const getDriverSectionLabel = (sec: DriverHeaderSection) => {
    switch (sec) {
      case 'profile':
        return 'الملف الشخصي';
      case 'new_requests':
        return 'الطلبات الجديدة';
      case 'subscription':
        return 'الاشتراك';
    }
  };

  const handleCustomerSelect = (sec: CustomerHeaderSection | 'logout') => {
    setIsCustomerDropdownOpen(false);
    if (sec === 'logout') {
      onNavigate('landing');
      return;
    }
    if (onSelectCustomerSection) {
      onSelectCustomerSection(sec);
    }
  };

  const handleDriverSelect = (sec: DriverHeaderSection | 'logout') => {
    setIsDriverDropdownOpen(false);
    if (sec === 'logout') {
      onNavigate('landing');
      return;
    }
    if (onSelectDriverSection) {
      onSelectDriverSection(sec);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-zinc-800 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Official Logo Brand */}
          <div 
            className="flex items-center cursor-pointer group active:scale-95 transition-transform" 
            onClick={() => onNavigate('landing')}
            title="العودة للصفحة الرئيسية"
          >
            <Logo size="md" />
          </div>

          {/* Current Mode Badge / Breadcrumb for driver/admin on desktop */}
          {currentScreen !== 'landing' && currentScreen !== 'customer' && (
            <div className="hidden md:flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs font-bold">
              {currentScreen === 'driver' && currentDriver && (
                <span className="text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-white" />
                  <span>حساب السائق: {currentDriver.name}</span>
                </span>
              )}
              {(currentScreen === 'driver_portal' || currentScreen === 'driver_login') && (
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-zinc-300" />
                  <span>بوابة السائقين المستقلين</span>
                </span>
              )}
              {currentScreen === 'admin' && (
                <span className="text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>لوحة الإدارة المعتمدة</span>
                </span>
              )}
            </div>
          )}

          {/* Action Area: In Customer Screen -> Dropdown + Bell Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* If on Customer screen: Dropdown and Bell Notification Button */}
            {currentScreen === 'customer' && (
              <div className="flex items-center gap-2">
                
                {/* 1. Customer Dropdown Selector in Header */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                    className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-500 font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    <UserCheck className="w-4 h-4 text-white shrink-0" />
                    <span>{getCustomerSectionLabel(customerSection)}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Popup Menu */}
                  {isCustomerDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsCustomerDropdownOpen(false)} 
                      />
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-40 w-56 bg-zinc-950 border-2 border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-zinc-800 text-right">
                        
                        {/* Option: طلب جديد */}
                        <button
                          type="button"
                          onClick={() => handleCustomerSelect('new_request')}
                          className={`w-full p-3 flex items-center justify-between text-xs transition-colors ${
                            customerSection === 'new_request' ? 'bg-white text-black font-black' : 'text-white hover:bg-zinc-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>طلب جديد</span>
                          </div>
                          {customerSection === 'new_request' && <Check className="w-4 h-4" />}
                        </button>

                        {/* Option: العروض الجديدة */}
                        <button
                          type="button"
                          onClick={() => handleCustomerSelect('new_offers')}
                          className={`w-full p-3 flex items-center justify-between text-xs transition-colors ${
                            customerSection === 'new_offers' ? 'bg-white text-black font-black' : 'text-white hover:bg-zinc-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BellRing className="w-4 h-4" />
                            <span>العروض الجديدة</span>
                          </div>
                          {totalOffersCount > 0 && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              customerSection === 'new_offers' ? 'bg-black text-white' : 'bg-white text-black'
                            }`}>
                              {totalOffersCount}
                            </span>
                          )}
                        </button>

                        {/* Option: طلباتي */}
                        <button
                          type="button"
                          onClick={() => handleCustomerSelect('my_requests')}
                          className={`w-full p-3 flex items-center justify-between text-xs transition-colors ${
                            customerSection === 'my_requests' ? 'bg-white text-black font-black' : 'text-white hover:bg-zinc-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>طلباتي</span>
                          </div>
                          {customerSection === 'my_requests' && <Check className="w-4 h-4" />}
                        </button>

                        {/* Option: تسجيل خروج */}
                        <button
                          type="button"
                          onClick={() => handleCustomerSelect('logout')}
                          className="w-full p-3 flex items-center justify-between text-xs text-white hover:bg-zinc-900 font-bold transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span>تسجيل خروج</span>
                          </div>
                        </button>

                      </div>
                    </>
                  )}
                </div>

                {/* 2. Bell Notification Button in Header */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCustomerSection) {
                      onSelectCustomerSection('new_offers');
                    }
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-all active:scale-95"
                  title="الإشعارات والعروض الجديدة"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  
                  {/* Notification Counter Badge */}
                  {(unreadNotificationsCount > 0 || totalOffersCount > 0) && (
                    <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {unreadNotificationsCount > 0 ? unreadNotificationsCount : totalOffersCount}
                    </span>
                  )}
                </button>

              </div>
            )}

            {/* If on Driver screen: Dropdown Selector + Bell Notification Button */}
            {currentScreen === 'driver' && currentDriver && (
              <div className="flex items-center gap-2">
                
                {/* 1. Driver Dropdown Selector in Header */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                    className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-500 font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    <Truck className="w-4 h-4 text-white shrink-0" />
                    <span>{getDriverSectionLabel(driverSection)}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isDriverDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Popup Menu */}
                  {isDriverDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsDriverDropdownOpen(false)} 
                      />
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-40 w-56 bg-zinc-950 border-2 border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-zinc-800 text-right">
                        
                        {/* Option 1: الملف الشخصي */}
                        <button
                          type="button"
                          onClick={() => handleDriverSelect('profile')}
                          className={`w-full p-3 flex items-center justify-between text-xs transition-colors ${
                            driverSection === 'profile' ? 'bg-white text-black font-black' : 'text-white hover:bg-zinc-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>الملف الشخصي</span>
                          </div>
                          {driverSection === 'profile' && <Check className="w-4 h-4" />}
                        </button>

                        {/* Option 2: الطلبات الجديدة */}
                        <button
                          type="button"
                          onClick={() => handleDriverSelect('new_requests')}
                          className={`w-full p-3 flex items-center justify-between text-xs transition-colors ${
                            driverSection === 'new_requests' ? 'bg-white text-black font-black' : 'text-white hover:bg-zinc-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>الطلبات الجديدة</span>
                          </div>
                          {openRequestsCount > 0 && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              driverSection === 'new_requests' ? 'bg-black text-white' : 'bg-white text-black'
                            }`}>
                              {openRequestsCount}
                            </span>
                          )}
                        </button>

                        {/* Option 3: الاشتراك */}
                        <button
                          type="button"
                          onClick={() => handleDriverSelect('subscription')}
                          className={`w-full p-3 flex items-center justify-between text-xs transition-colors ${
                            driverSection === 'subscription' ? 'bg-white text-black font-black' : 'text-white hover:bg-zinc-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>الاشتراك</span>
                          </div>
                          {driverSection === 'subscription' && <Check className="w-4 h-4" />}
                        </button>

                        {/* Option 4: تسجيل خروج */}
                        <button
                          type="button"
                          onClick={() => handleDriverSelect('logout')}
                          className="w-full p-3 flex items-center justify-between text-xs text-white hover:bg-zinc-900 font-bold transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span>تسجيل خروج</span>
                          </div>
                        </button>

                      </div>
                    </>
                  )}
                </div>

                {/* 2. Bell Notification Button in Header for Driver */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectDriverSection) {
                      onSelectDriverSection('new_requests');
                    }
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-all active:scale-95"
                  title="الطلبات والإشعارات الجديدة"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  
                  {/* Notification Counter Badge */}
                  {(unreadDriverNotificationsCount > 0 || openRequestsCount > 0) && (
                    <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {unreadDriverNotificationsCount > 0 ? unreadDriverNotificationsCount : openRequestsCount}
                    </span>
                  )}
                </button>

              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
