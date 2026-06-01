/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Users, 
  Bell, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle,
  Database,
  Terminal,
  SmartphoneNfc
} from 'lucide-react';
import { UserRole, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  syncLog: string[];
  addToSyncLog: (msg: string) => void;
  onResetDb: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({
  children,
  activeRole,
  setActiveRole,
  isOffline,
  setIsOffline,
  notifications,
  onMarkNotificationsRead,
  syncLog,
  addToSyncLog,
  onResetDb,
  activeTab,
  setActiveTab
}: LayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState(true); // default true for Mobile feel
  const [showSyncLog, setShowSyncLog] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  // Handle Offline state toggles with fake Synchronization Logs
  const toggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    if (!nextState) {
      // Transition to Online - run Sync
      addToSyncLog("Detecting connectivity... Resuming host standard sockets.");
      addToSyncLog("Checking local SQLite cache queue (localStorage).");
      addToSyncLog("Uploading 3 deferred pending transactions...");
      setTimeout(() => {
        addToSyncLog("Local database synced with cloud PostgreSQL successfully.");
        addToSyncLog("Conflict Resolution Engine: 0 conflicts detected (Timestamp priority).");
      }, 1000);
    } else {
      addToSyncLog("Network disconnected. Switching SQLite cache to OFFLINE mode.");
      addToSyncLog("All sales and inventory sessions will queue locally on-device.");
    }
  };

  const getRoleLabel = (r: UserRole) => {
    if (r === 'ADMIN') return 'Administrator';
    if (r === 'CASHIER') return 'Shop Attendant';
    return 'Inventory Manager';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', roles: ['ADMIN', 'CASHIER', 'INVENTORY_MANAGER'] },
    { id: 'pos', label: 'POS Checkout', roles: ['ADMIN', 'CASHIER'] },
    { id: 'inventory', label: 'Inventory', roles: ['ADMIN', 'INVENTORY_MANAGER'] },
    { id: 'customers', label: 'Customers', roles: ['ADMIN', 'CASHIER'] },
    { id: 'debts', label: 'Credit & Debts', roles: ['ADMIN', 'CASHIER'] },
    { id: 'expenses', label: 'Expenses', roles: ['ADMIN'] },
    { id: 'feedback', label: 'Customer Feedback', roles: ['ADMIN', 'CASHIER', 'INVENTORY_MANAGER'] },
    { id: 'api_docs', label: 'API Playground', roles: ['ADMIN'] },
    { id: 'database_schema', label: 'DB Schema (ERD)', roles: ['ADMIN'] },
    { id: 'flutter_code', label: 'Flutter Source', roles: ['ADMIN'] }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col font-sans select-none antialiased">
      
      {/* Upper Status / Control Board (Workspace Utilities) */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-2 text-sm flex flex-wrap gap-4 items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <SmartphoneNfc className="h-6 w-6 text-emerald-400" />
          <div>
            <span className="font-bold text-emerald-400 text-base">NyamNyam Groceries</span>
            <span className="text-xs text-slate-400 block -mt-1">Mombasa County • Digitized Retail</span>
          </div>
        </div>

        {/* Action controls for simulating operational parameters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Database Reset */}
          <button 
            id="reset-db-btn"
            onClick={onResetDb}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 rounded border border-slate-700 transition"
            title="Reset to Fresh Mombasa Sample Seed Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="font-medium text-[11px] uppercase">Seed Data</span>
          </button>

          {/* Offline Switch */}
          <button 
            id="offline-toggle"
            onClick={toggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition border cursor-pointer ${
              isOffline 
                ? 'bg-rose-950/50 border-rose-500 text-rose-300' 
                : 'bg-emerald-950/20 border-emerald-550/40 text-emerald-300 hover:bg-slate-880'
            }`}
          >
            {isOffline ? <WifiOff className="h-3.5 w-3.5 animate-pulse" /> : <Wifi className="h-3.5 w-3.5" />}
            <span className="font-semibold text-[11px] tracking-wider uppercase">
              {isOffline ? 'OFFLINE MODE' : 'ONLINE'}
            </span>
          </button>

          {/* Sync Trigger History Drawer */}
          <button
            id="sync-logs-btn"
            onClick={() => setShowSyncLog(!showSyncLog)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 transition"
          >
            <Terminal className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-[11px] font-semibold">SYNC LOGS</span>
          </button>

          {/* Phone Frame Toggle */}
          <button 
            id="frame-toggle"
            onClick={() => setDeviceFrame(!deviceFrame)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition border ${
              deviceFrame ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="font-medium text-[11px]">{deviceFrame ? "PHONE PREVIEW" : "RESPONSIVE FULLSCREEN"}</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              id="notifications-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded relative text-slate-300"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[9px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full animate-bounce">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 bg-slate-950 border border-slate-850 rounded-lg shadow-xl w-76 z-50 text-xs overflow-hidden">
                <div className="p-3 border-b border-slate-900 font-bold flex items-center justify-between bg-slate-900/50">
                  <span>System Alerts</span>
                  {unreadNotifications.length > 0 && (
                    <button 
                      onClick={() => { onMarkNotificationsRead(); setShowNotifications(false); }}
                      className="text-[10px] text-emerald-400 font-bold uppercase hover:underline"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-900">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 ${n.read ? 'opacity-65' : 'bg-emerald-950/10 border-l-2 border-emerald-500'}`}>
                        <div className="font-semibold text-slate-200">{n.title}</div>
                        <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-500 block mt-1">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Sync Log Slider Indicator */}
      {showSyncLog && (
        <div className="bg-slate-950 border-b border-slate-800 p-4 font-mono text-xs text-orange-400 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-orange-500 animate-pulse" />
              SQLite ⇆ PostgreSQL background database synchronization logs
            </span>
            <button 
              onClick={() => setShowSyncLog(false)}
              className="text-[10px] uppercase text-slate-500 hover:text-slate-300 font-bold"
            >
              Close
            </button>
          </div>
          <div className="space-y-1">
            {syncLog.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-slate-600 font-sans">[{index + 1}]</span>
                <span className="text-slate-300">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frame boundary wrapper: Desktop center if device is selected, layout fills all space if fullscreen */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-900 md:p-3">
        <div className={`transition-all duration-300 bg-slate-950 flex flex-col overflow-hidden ${
          deviceFrame 
            ? 'w-full max-w-sm md:h-[812px] h-full shadow-2xl md:border-[10px] border-slate-800 md:rounded-[40px] relative' 
            : 'w-full h-full'
        }`}>
          
          {/* Top Speaker / Camera Notch Mock for Mobile View */}
          {deviceFrame && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-5 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
            </div>
          )}

          {/* Android-style top status bar */}
          <div className={`bg-emerald-950 text-white px-5 py-2 text-[11px] flex items-center justify-between ${deviceFrame ? 'pt-6' : 'pt-2'}`}>
            <div className="font-bold tracking-wider">09:39</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] px-1 bg-emerald-900 rounded font-medium text-emerald-200">Mombasa</span>
              {isOffline ? <WifiOff className="h-3 w-3 text-rose-300" /> : <Wifi className="h-3 w-3 text-emerald-200" />}
              <span className="font-bold">78%</span>
            </div>
          </div>

          {/* Quick Role Settings Hub in Mobile App Frame */}
          <div className="bg-emerald-950/40 border-b border-emerald-900/30 px-3 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">{getRoleLabel(activeRole)}</span>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
              <span className="text-[10px] text-slate-400 pr-1">Role:</span>
              <select 
                id="role-select"
                value={activeRole} 
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setActiveRole(r);
                  // Auto redirect back to dashboard if tab not supported
                  if (r === 'CASHIER' && ['expenses', 'api_docs', 'database_schema', 'flutter_code'].includes(activeTab)) {
                    setActiveTab('dashboard');
                  }
                  if (r === 'INVENTORY_MANAGER' && ['pos', 'expenses', 'customers', 'debts', 'api_docs', 'database_schema', 'flutter_code'].includes(activeTab)) {
                    setActiveTab('dashboard');
                  }
                }}
                className="bg-transparent border-none text-[10px] text-emerald-300 font-bold focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="ADMIN" className="bg-slate-950 text-slate-200">Admin</option>
                <option value="CASHIER" className="bg-slate-950 text-slate-200">Cashier</option>
                <option value="INVENTORY_MANAGER" className="bg-slate-950 text-slate-200">Stock Keeper</option>
              </select>
            </div>
          </div>

          {/* Interactive syncing warning banner */}
          {isOffline && (
            <div className="bg-rose-500/20 border-b border-rose-500/30 px-3 py-1.5 text-[11px] flex items-center gap-2 text-rose-300 animate-pulse">
              <WifiOff className="h-3 w-3 inline text-rose-400" />
              <span>Offline mode active: transactions buffer automatically.</span>
            </div>
          )}

          {/* Main Module Output Area */}
          <main className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
            {children}
          </main>

          {/* Sticky Mobile/Tablet POS bottom bar */}
          <nav className="bg-slate-950 border-t border-slate-900 grid grid-cols-4 gap-1 py-1.5 px-1 relative z-10 select-none">
            <button 
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all ${
                activeTab === 'dashboard' ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-medium">Dashboard</span>
            </button>

            {/* Render conditional navigations depending on authorizations */}
            {(activeRole === 'ADMIN' || activeRole === 'CASHIER') ? (
              <button 
                id="nav-tab-pos"
                onClick={() => setActiveTab('pos')}
                className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all ${
                  activeTab === 'pos' ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SmartphoneNfc className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 font-medium">Till / POS</span>
              </button>
            ) : (
              <button 
                disabled
                className="flex flex-col items-center justify-center p-1 rounded-lg text-slate-700 cursor-not-allowed"
                title="Unauthorized"
              >
                <SmartphoneNfc className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">POS (Locked)</span>
              </button>
            )}

            <button 
              id="nav-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all ${
                activeTab === 'inventory' ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-medium">Inventory</span>
            </button>

            {/* Context Actions Drawer for more panels */}
            <div className="relative flex flex-col items-center justify-center">
              {showMoreMenu && (
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setShowMoreMenu(false)}
                />
              )}
              <button 
                id="more-nav-trigger"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all w-full relative z-50 ${
                  showMoreMenu || !['dashboard', 'pos', 'inventory'].includes(activeTab)
                    ? 'text-emerald-400 bg-emerald-950/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 font-medium">More...</span>
              </button>
              
              {/* Flyout popup list representing comprehensive modules */}
              <div 
                id="flyout-menu" 
                className={`absolute bottom-12 right-0 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 w-48 z-50 text-xs transition-all duration-150 ${
                  showMoreMenu ? 'block' : 'hidden'
                }`}
              >
                <div className="px-3 py-1 border-b border-slate-800 text-slate-400 font-bold mb-1 text-[10px] tracking-wide uppercase">
                  Operational Pages
                </div>
                {visibleMenuItems.map(item => {
                  // Skip three main tabs as they are on the sticky nav
                  if (['dashboard', 'pos', 'inventory'].includes(item.id)) return null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowMoreMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-emerald-900 hover:text-white transition flex items-center justify-between ${
                        activeTab === item.id ? 'text-emerald-400 bg-slate-950 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeTab === item.id && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

          </nav>
        </div>
      </div>
    </div>
  );
}
