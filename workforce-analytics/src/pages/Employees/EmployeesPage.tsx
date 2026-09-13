import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/api';
import { Employee } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmailComposerModal } from '../../components/email/EmailComposerModal';
import { useNotification } from '../../context/NotificationContext';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  LayoutGrid,
  List,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Mail,
  MapPin,
  Send,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const EmployeesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Query state
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || 'All';
  const sort = searchParams.get('sort') || 'name_asc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [limit, setLimit] = useState(15);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalEmployees / limit));

  // Email Composer state
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [selectedEmailEmpIds, setSelectedEmailEmpIds] = useState<string[]>([]);

  // Drawer & Modal state
  const [selectedEmpDrawer, setSelectedEmpDrawer] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  // Form input state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'IT',
    email: '',
    salary: 110000,
    experience: 5,
    gender: 'Female',
    tenure: 2,
    performanceScore: 4.5,
    location: 'Bangalore Campus',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchEmployees({ search, department, sort, page, limit });
      setEmployees(res.employees);
      setTotalEmployees(res.total);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, department, sort, page, limit]);

  const updateQuery = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleToggleSelectForEmail = (id: string) => {
    setSelectedEmailEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllForEmail = () => {
    if (selectedEmailEmpIds.length === employees.length) {
      setSelectedEmailEmpIds([]);
    } else {
      setSelectedEmailEmpIds(employees.map((e) => e.id));
    }
  };

  const handleOpenEmailForSingle = (empId: string) => {
    setSelectedEmailEmpIds([empId]);
    setIsEmailComposerOpen(true);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      role: '',
      department: 'Engineering',
      email: '',
      salary: 130000,
      experience: 5,
      gender: 'Female',
      tenure: 2,
      performanceScore: 4.5,
      location: 'San Francisco, CA',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      department: emp.department,
      email: emp.email,
      salary: emp.salary,
      experience: emp.experience,
      gender: emp.gender,
      tenure: emp.tenure,
      performanceScore: emp.performanceScore,
      location: emp.location || 'San Francisco, CA',
    });
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await updateEmployee(editingEmp.id, formData);
        addToast('Employee Updated', `Updated records for ${formData.name}`, 'success');
        setEditingEmp(null);
      } else {
        await createEmployee(formData);
        addToast('Employee Added', `Created employee profile for ${formData.name}`, 'success');
        setIsAddModalOpen(false);
      }
      loadData();
    } catch (err) {
      addToast('Operation Failed', 'Could not save employee details.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmpId) return;
    try {
      await deleteEmployee(deletingEmpId);
      addToast('Profile Deleted', 'Employee record removed from organization database.', 'info');
      setDeletingEmpId(null);
      loadData();
    } catch (err) {
      addToast('Error', 'Failed to delete record.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header Bar */}
      <div className="vibe-glass border border-violet-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400 animate-spin" /> TALENT ROSTER &bull; {totalEmployees} PROFILES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text flex items-center gap-2">
            Employee Directory & Talent Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Search, filter, and inspect employee performance telemetry and compensation profiles across all business units.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* Quick Email Broadcast button */}
          <button
            id="btn-open-group-email"
            onClick={() => setIsEmailComposerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-violet-500/40 hover:bg-slate-200 dark:hover:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Email Selective ({selectedEmailEmpIds.length})</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
            <button
              id="btn-view-table"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              id="btn-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Cards</span>
            </button>
          </div>

          <button
            id="btn-add-employee"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-violet-500/30 transition-all shrink-0 cursor-pointer vibe-shimmer hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Profile</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 sm:p-5 rounded-3xl vibe-glass border border-slate-200 dark:border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="employee-search-filter"
              type="text"
              value={search}
              onChange={(e) => updateQuery('search', e.target.value)}
              placeholder="Search by name, role, ID..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-violet-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden font-mono"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <select
              id="select-dept-filter"
              value={department}
              onChange={(e) => updateQuery('department', e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-violet-500/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono font-semibold focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              <option value="IT">IT & Engineering</option>
              <option value="HR">Human Resources (HR)</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Support">Customer Support</option>
            </select>
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <select
            id="select-sort-filter"
            value={sort}
            onChange={(e) => updateQuery('sort', e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-violet-500/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono font-semibold focus:outline-hidden"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="salary_desc">Salary (High to Low)</option>
            <option value="performance_desc">Performance Rating</option>
          </select>
        </div>
      </div>

      {/* Main Content View (Table or Grid) */}
      {loading ? (
        <LoadingSkeleton count={5} height="h-16" />
      ) : employees.length === 0 ? (
        <div className="text-center py-16 vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-lg">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Employees Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No employees matching your current search criteria. Try adjusting filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl shadow-lg">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100/90 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase font-mono font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4 w-10">
                  <button onClick={handleSelectAllForEmail} title="Select/Deselect All for Email" className="cursor-pointer">
                    {selectedEmailEmpIds.length === employees.length && employees.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Employee</th>
                <th className="py-4 px-4">Department & Role</th>
                <th className="py-4 px-4">Salary</th>
                <th className="py-4 px-4">Performance</th>
                <th className="py-4 px-4">Promotion Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {employees.map((emp) => {
                const isCheckedForEmail = selectedEmailEmpIds.includes(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition-colors group">
                    <td className="py-4 px-4">
                      <button onClick={() => handleToggleSelectForEmail(emp.id)} className="cursor-pointer">
                        {isCheckedForEmail ? (
                          <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400" />
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-violet-500/40 group-hover:ring-cyan-400 transition-all"
                        />
                        <div>
                          <button
                            id={`emp-name-btn-${emp.id}`}
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            className="font-bold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 text-sm transition-colors text-left cursor-pointer"
                          >
                            {emp.name}
                          </button>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{emp.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{emp.role}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{emp.department}</p>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${emp.salary.toLocaleString()}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-300">
                      {emp.performanceScore} / 5.0
                    </td>

                    <td className="py-4 px-4">
                      {emp.promotionEligibility ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40">
                          ★ Eligible
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">Standard</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEmailForSingle(emp.id)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Send Direct Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-view-drawer-${emp.id}`}
                          onClick={() => setSelectedEmpDrawer(emp)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Quick Drawer Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-edit-${emp.id}`}
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-${emp.id}`}
                          onClick={() => setDeletingEmpId(emp.id)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <motion.div
              key={emp.id}
              whileHover={{ y: -4 }}
              className="vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg flex flex-col justify-between relative group vibe-card"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-violet-500/40 group-hover:ring-cyan-400 transition-all"
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="font-bold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 text-sm cursor-pointer transition-colors"
                      >
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{emp.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Base Compensation:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${emp.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Performance Score:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-300">{emp.performanceScore} / 5.0</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Full Profile &rarr;
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEmailForSingle(emp.id)}
                    className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedEmpDrawer(emp)}
                    className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingEmpId(emp.id)}
                    className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination & Rows Per Page Toolbar */}
      {!loading && employees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl vibe-glass border border-slate-200 dark:border-white/10 shadow-lg text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              Showing <strong>{((page - 1) * limit) + 1}</strong> - <strong>{Math.min(page * limit, totalEmployees)}</strong> of <strong>{totalEmployees}</strong> employee profiles
            </span>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  updateQuery('page', '1');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
              >
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuery('page', String(Math.max(1, page - 1)))}
              disabled={page <= 1}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all shadow-xs cursor-pointer"
            >
              &larr; Prev
            </button>

            <span className="px-3.5 py-2 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40 font-black">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => updateQuery('page', String(Math.min(totalPages, page + 1)))}
              disabled={page >= totalPages}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all shadow-xs cursor-pointer"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* QUICK PROFILE DRAWER */}
      <Drawer
        id="drawer-employee-preview"
        isOpen={!!selectedEmpDrawer}
        onClose={() => setSelectedEmpDrawer(null)}
        title={selectedEmpDrawer?.name || ''}
        subtitle={`${selectedEmpDrawer?.role} · ${selectedEmpDrawer?.department}`}
      >
        {selectedEmpDrawer && (
          <div className="space-y-6 text-xs text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={selectedEmpDrawer.avatar}
                alt={selectedEmpDrawer.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500"
              />
              <div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {selectedEmpDrawer.email}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {selectedEmpDrawer.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold">Salary</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  ${selectedEmpDrawer.salary.toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold">Performance Score</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedEmpDrawer.performanceScore} / 5.0
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-white text-sm">Key Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmpDrawer.skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const id = selectedEmpDrawer.id;
                setSelectedEmpDrawer(null);
                navigate(`/employees/${id}`);
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all text-center"
            >
              Open Full Employee Profile &rarr;
            </button>
          </div>
        )}
      </Drawer>

      {/* EMAIL COMPOSER MODAL */}
      <EmailComposerModal
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        allEmployees={employees}
        preSelectedEmployeeIds={selectedEmailEmpIds}
      />

      {/* ADD / EDIT EMPLOYEE MODAL */}
      <Modal
        id="modal-add-edit-employee"
        isOpen={isAddModalOpen || !!editingEmp}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmp(null);
        }}
        title={editingEmp ? `Edit Profile: ${editingEmp.name}` : 'Add New Employee Profile'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs text-slate-800 dark:text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Alex Morgan"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Role Title</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Staff AI Engineer"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="IT">IT & Engineering</option>
                <option value="HR">Human Resources (HR)</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Support">Customer Support</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex.morgan@company.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Base Salary ($)</label>
              <input
                type="number"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Performance Score (1.0 - 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={formData.performanceScore}
                onChange={(e) => setFormData({ ...formData, performanceScore: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingEmp(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        id="modal-delete-confirm"
        isOpen={!!deletingEmpId}
        onClose={() => setDeletingEmpId(null)}
        title="Confirm Employee Profile Removal"
      >
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
          <p>
            Are you sure you want to permanently delete this employee record from the system database?
            This operation is logged for auditing compliance.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDeletingEmpId(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
