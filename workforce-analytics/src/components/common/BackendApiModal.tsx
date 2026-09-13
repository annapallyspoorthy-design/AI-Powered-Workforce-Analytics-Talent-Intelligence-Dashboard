import React, { useState, useEffect } from 'react';
import { getStoredBackendUrl, saveBackendUrl, testBackendConnection } from '../../services/api';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X, Link, Database, Code, Globe, Shield } from 'lucide-react';

interface BackendApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const BackendApiModal: React.FC<BackendApiModalProps> = ({ isOpen, onClose, onConnected }) => {
  const [urlInput, setUrlInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setUrlInput(getStoredBackendUrl());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      saveBackendUrl('');
      setTestResult({ success: true, message: 'Reset to local zero state.' });
      if (onConnected) onConnected();
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testBackendConnection(urlInput.trim());
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      saveBackendUrl(urlInput.trim());
      if (onConnected) onConnected();
    }
  };

  const handleClearUrl = () => {
    saveBackendUrl('');
    setUrlInput('');
    setTestResult({ success: true, message: 'Backend URL cleared. Resetting numbers to 0.' });
    if (onConnected) onConnected();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-800 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Connect Custom API / Backend</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connect your custom API endpoint (Node, Express, Python, AWS API, MongoDB)</p>
          </div>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Backend API Base URL</span>
              {getStoredBackendUrl() ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> API URL Configured
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Waiting for API URL (Showing 0s)
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://localhost:5000/api or https://api.yourdomain.com"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={handleClearUrl}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[10px] font-bold uppercase"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold transition-all"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={testing}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing Connection...
                </>
              ) : (
                <>
                  <Link className="w-3.5 h-3.5" /> Save & Test API
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-[11px] text-slate-600 dark:text-slate-300 space-y-2">
          <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Expected API Endpoints:
          </p>
          <ul className="space-y-1 font-mono text-[10px] text-slate-700 dark:text-slate-300 pl-2">
            <li>• <strong className="text-blue-600 dark:text-blue-400">GET</strong> <span className="text-slate-800 dark:text-slate-200">/employees</span> (Returns employee list)</li>
            <li>• <strong className="text-blue-600 dark:text-blue-400">GET</strong> <span className="text-slate-800 dark:text-slate-200">/analytics/kpis</span> (Returns aggregated metrics)</li>
            <li>• <strong className="text-emerald-600 dark:text-emerald-400">POST</strong> <span className="text-slate-800 dark:text-slate-200">/employees</span> (Creates new employee)</li>
            <li>• <strong className="text-purple-600 dark:text-purple-400">POST</strong> <span className="text-slate-800 dark:text-slate-200">/assistant/chat</span> (Handles AI assistant query)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
