import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { fetchEmployees } from '../../services/api';
import { Employee } from '../../types';

export const ReportsPage: React.FC = () => {
  const { addToast } = useNotification();
  const [reportType, setReportType] = useState('headcount');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const departments = ['All', 'Engineering', 'HR', 'Sales', 'Operations', 'IT', 'Finance', 'Marketing', 'Support'];

  useEffect(() => {
    setLoading(true);
    fetchEmployees({ limit: 2000 })
      .then((res) => {
        setEmployees(res.employees);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = employees.filter((e) => departmentFilter === 'All' || e.department === departmentFilter);
  const previewLimit = 25;
  const totalPreviewPages = Math.ceil(filteredEmployees.length / previewLimit) || 1;
  const paginatedPreview = filteredEmployees.slice((previewPage - 1) * previewLimit, previewPage * previewLimit);

  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) {
      addToast('No Data Available', 'No records match filter criteria for export.', 'info');
      return;
    }

    const headers = ['ID', 'Name', 'Role', 'Department', 'Salary', 'PerformanceScore', 'TenureYears', 'AttritionRiskScore', 'Attendance', 'Location'];
    const rows = filteredEmployees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.role}"`,
      `"${e.department}"`,
      e.salary,
      e.performanceScore,
      `${e.tenure} yrs`,
      `${e.attritionRiskScore || 0}%`,
      `${e.attendance || 95}%`,
      `"${e.location || 'Bangalore'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workforce_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Download Started', `Exported ${filteredEmployees.length} employee records to CSV.`, 'success');
  };

  const handleExportExcel = () => {
    handleExportCSV();
    addToast('Excel Export Ready', 'Downloaded dataset report file.', 'success');
  };

  const handlePrintPDF = () => {
    window.print();
    addToast('Print PDF Ready', 'Sent formatted workforce audit page to system print preview.', 'info');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-100 font-sans print:p-0">
      {/* Printable Header Bar - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-2xl print:hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <FileSpreadsheet className="w-3 h-3 text-cyan-400" /> MODULE 10 &bull; AUDIT & COMPLIANCE EXPORT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text flex items-center gap-2">
            Executive Report Generator & Export Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Export audit-ready CSV, Excel, or PDF reports across {employees.length.toLocaleString()} verified personnel records.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>CSV Export ({filteredEmployees.length})</span>
          </button>
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Excel Export</span>
          </button>
          <button
            id="btn-print-pdf"
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-violet-500/30 transition-all cursor-pointer vibe-shimmer hover:scale-102 active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 sm:p-5 rounded-3xl vibe-glass border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-slate-400 font-mono font-bold mb-1">Report Focus</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden"
            >
              <option value="headcount">Workforce Headcount & Tenure Audit</option>
              <option value="compensation">Compensation & Equity Audit</option>
              <option value="performance">Performance & Promotion Matrix</option>
              <option value="risk">Flight Risk & Attrition Diagnostic</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-mono font-bold mb-1">Department Scope</label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPreviewPage(1);
              }}
              className="bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          Matched Records: <strong className="text-cyan-300 font-black">{filteredEmployees.length.toLocaleString()} FTEs</strong>
        </div>
      </div>

      {/* Report Preview Document Canvas */}
      <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 print:shadow-none print:border-none">
        {/* Report Document Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              CONFIDENTIAL EXECUTIVE AUDIT REPORT
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Workforce Intelligence Audit Report
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Generated on {new Date().toLocaleDateString()} &bull; Organization: Global SaaS Enterprise &bull; Total Scope: {filteredEmployees.length.toLocaleString()} FTEs
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            <p className="text-violet-300 font-bold">Report ID: RPT-2026-AUG</p>
            <p>Scope: {departmentFilter}</p>
          </div>
        </div>

        {/* Report Preview Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Performance</th>
                <th className="p-3">Tenure</th>
                <th className="p-3">Flight Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedPreview.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 font-mono">
                    No matching employee records found.
                  </td>
                </tr>
              ) : (
                paginatedPreview.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-mono text-cyan-400 font-semibold">{e.id}</td>
                    <td className="p-3 font-bold text-white">{e.name}</td>
                    <td className="p-3 text-slate-300">{e.role}</td>
                    <td className="p-3 text-slate-400">{e.department}</td>
                    <td className="p-3 font-mono font-semibold text-emerald-300">${e.salary.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-cyan-300">{e.performanceScore} / 5.0</td>
                    <td className="p-3 font-mono text-slate-400">{e.tenure} yrs</td>
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (e.attritionRiskScore || 0) > 70
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {e.attritionRiskScore || 0}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs print:hidden">
          <span className="text-slate-400 font-mono">
            Showing page <strong className="text-white">{previewPage}</strong> of <strong className="text-white">{totalPreviewPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
              disabled={previewPage <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
              disabled={previewPage >= totalPreviewPages}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
