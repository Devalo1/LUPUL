/* eslint-disable no-console */
// This is a debugging component where console statements are intentionally used
// We disable the lint rule for this specific file as it's only used during development

import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/debug';

type LogEntry = {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
};

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    
    console.log = function(...args) {
      setLogs(prev => [...prev, { 
        type: 'log', 
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
        timestamp: new Date()
      }]);
      originalLog.apply(console, args);
    };
    
    console.warn = function(...args) {
      setLogs(prev => [...prev, { 
        type: 'warn', 
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
        timestamp: new Date()
      }]);
      originalWarn.apply(console, args);
    };
    
    console.error = function(...args) {
      setLogs(prev => [...prev, { 
        type: 'error', 
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
        timestamp: new Date()
      }]);
      originalError.apply(console, args);
    };
    
    console.info = function(...args) {
      setLogs(prev => [...prev, { 
        type: 'info', 
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
        timestamp: new Date()
      }]);
      originalInfo.apply(console, args);
    };
    
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);
  
  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);
  
  return (
    <>
      <button 
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full z-50"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'X' : 'Debug'}
      </button>
      
      {isVisible && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-40 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Debug Console</h2>
              <div className="flex space-x-2">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="all">All</option>
                  <option value="log">Logs</option>
                  <option value="warn">Warnings</option>
                  <option value="error">Errors</option>
                  <option value="info">Info</option>
                </select>
                <button 
                  onClick={() => setLogs([])}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="border rounded h-96 overflow-auto bg-gray-50 p-2">
              {filteredLogs.length === 0 ? (
                <p className="text-gray-500 p-4">No logs to display</p>
              ) : (
                filteredLogs.map((log, index) => (
                  <div 
                    key={index}
                    className={`mb-1 p-1 rounded ${
                      log.type === 'error' ? 'bg-red-100' : 
                      log.type === 'warn' ? 'bg-yellow-100' : 
                      log.type === 'info' ? 'bg-blue-100' : 'bg-white'
                    }`}
                  >
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`ml-2 ${
                      log.type === 'error' ? 'text-red-700' : 
                      log.type === 'warn' ? 'text-yellow-700' : 
                      log.type === 'info' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  onClick={() => logger.debug('Current route:', { data: { path: window.location.pathname } })}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Log Route
                </button>
                <button 
                  onClick={() => {
                    const reactRoot = document.getElementById('root');
                    logger.info('React tree:', { data: { root: reactRoot ? 'Found' : 'Not found' } });
                  }}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Log React Root
                </button>
                <button 
                  onClick={() => {
                    try {
                      window.checkFirebase && window.checkFirebase();
                    } catch (error) {
                      logger.error('Firebase check failed:', error instanceof Error ? error : new Error(String(error)));
                    }
                  }}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Check Firebase
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('debug_test', 'test');
                    logger.debug('LocalStorage test:', { data: { value: localStorage.getItem('debug_test') } });
                  }}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Test Storage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
