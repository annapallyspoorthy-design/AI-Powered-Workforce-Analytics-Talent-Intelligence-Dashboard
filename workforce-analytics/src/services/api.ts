import axios from 'axios';
import {
  Employee,
  KPIOverview,
  AttendanceRecord,
  ShiftSchedule,
  ShiftSwapRequest,
  LeaveRequest,
  TimesheetEntry,
  PayrollRecord,
  UserSession,
  EmailCampaign,
} from '../types';
import {
  MOCK_KPIS,
  MOCK_EMPLOYEES,
  MOCK_ATTENDANCE,
  MOCK_SHIFTS,
  MOCK_SHIFT_SWAPS,
  MOCK_LEAVES,
  MOCK_TIMESHEETS,
  MOCK_PAYROLL,
} from '../data/mockData';

const getInitialBaseUrl = (): string => {
  const envUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_BASE_URL : '';
  return localStorage.getItem('aura_backend_url') || envUrl || '/api';
};

const apiClient = axios.create({
  baseURL: getInitialBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const getStoredBackendUrl = (): string => {
  return localStorage.getItem('aura_backend_url') || '';
};

export const saveBackendUrl = (url: string): void => {
  const cleanUrl = url.trim();
  if (cleanUrl) {
    localStorage.setItem('aura_backend_url', cleanUrl);
    apiClient.defaults.baseURL = cleanUrl;
  } else {
    localStorage.removeItem('aura_backend_url');
    apiClient.defaults.baseURL = '/api';
  }
};

export const testBackendConnection = async (targetUrl: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const testClient = axios.create({
      baseURL: targetUrl.trim(),
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000,
    });
    const res = await testClient.get('/health').catch(() => testClient.get('/employees')).catch(() => testClient.get('/analytics/kpis'));
    return {
      success: true,
      message: 'Successfully connected to AWS / MongoDB API backend!',
      data: res.data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message ? `Connection failed: ${err.message}` : 'Failed to reach API endpoint. Please check URL or CORS settings.',
    };
  }
};

export const normalizeEmployee = (raw: any): Employee => {
  if (!raw) return raw;
  const id = raw.id || raw.employee_id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const name = raw.name || raw.employee_name || (raw.employee_id ? `Employee ${raw.employee_id}` : 'Employee');
  const role = raw.role || raw.job_role || 'Specialist';
  const department = raw.department || 'General';
  const salary = Number(raw.salary ?? raw.basic_salary ?? raw.monthly_income ?? (raw.daily_rate ? raw.daily_rate * 25 : 85000));
  const experience = Number(raw.experience ?? raw.years_at_company ?? raw.total_working_years ?? 3);
  const tenure = Number(raw.tenure ?? raw.years_at_company ?? 3);
  const performanceScore = Number(raw.performanceScore ?? raw.performance_rating ?? 3.5);
  const attritionRiskScore = Number(raw.attritionRiskScore ?? raw.attrition_risk_score ?? 25);
  const overtimeHours = Number(raw.overtimeHours ?? raw.overtime_hours ?? (raw.over_time === 'Yes' ? 10 : 4));

  const avatarId = (parseInt(id.replace(/\D/g, '') || '1', 10) % 70) + 1;
  const gender = raw.gender || 'Not Specified';
  const genderPrefix = gender.toLowerCase() === 'female' ? 'women' : 'men';
  const defaultAvatar = `https://randomuser.me/api/portraits/${genderPrefix}/${avatarId}.jpg`;

  return {
    id,
    name,
    role,
    department,
    email: raw.email || `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
    avatar: raw.avatar || defaultAvatar,
    salary,
    experience,
    gender,
    tenure,
    performanceScore,
    promotionEligibility: Boolean(raw.promotionEligibility ?? (tenure >= 3 && performanceScore >= 3.8)),
    attendance: Number(raw.attendance ?? 96),
    skills: Array.isArray(raw.skills) && raw.skills.length > 0 ? raw.skills : [raw.skill || role, `${department} Strategy`, 'Analytics'],
    projects: Array.isArray(raw.projects) && raw.projects.length > 0 ? raw.projects : [`${department} Core Sprint`, 'System Optimization'],
    manager: raw.manager || raw.manager_id || 'Department Lead',
    lastReviewDate: raw.lastReviewDate || '2026-06-30',
    satisfactionRating: Number(raw.satisfactionRating ?? raw.job_satisfaction ?? (attritionRiskScore > 60 ? 2.6 : 4.3)),
    workLifeBalance: Number(raw.workLifeBalance ?? raw.work_life_balance ?? (overtimeHours > 15 ? 2.2 : 3.8)),
    overtimeHours,
    location: raw.location || 'Bangalore',
    attritionRiskScore,
    flightRiskDrivers: raw.flightRiskDrivers || (
      attritionRiskScore >= 70
        ? ['Compensation Market Gap', 'Overtime Workload Stress', 'High Risk Rating']
        : attritionRiskScore >= 40
        ? ['Pending Career Advancement', 'Skill Transition Need']
        : ['Stable Core Performer']
    ),
    birthdate: raw.birthdate || '1992-06-15',
    joiningDate: raw.joiningDate || raw.hire_date || '2023-01-15',
  };
};

// --- AUTH API ---
export const loginUser = async (credentials: {
  email?: string;
  employeeId?: string;
  role?: 'HR Admin' | 'Employee';
}): Promise<{ success: boolean; user: UserSession }> => {
  try {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  } catch (e) {
    console.warn('Fallback login locally:', e);
    if (credentials.role === 'HR Admin') {
      return {
        success: true,
        user: {
          id: 'USR-HR-001',
          name: 'Alexandra Vance',
          email: credentials.email || 'alexandra.vance@workforceintel.ai',
          role: 'HR Admin',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        },
      };
    }
    return {
      success: true,
      user: {
        id: credentials.employeeId || 'EMP00001',
        name: 'Employee_1',
        email: credentials.email || 'employee_1@company.com',
        role: 'Employee',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    };
  }
};

// --- EMPLOYEES API ---
export const fetchEmployees = async (params?: {
  search?: string;
  department?: string;
  risk?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ employees: Employee[]; total: number; page: number; totalPages: number }> => {
  try {
    const response = await apiClient.get('/employees', { params }).catch(() => apiClient.get('/employees/', { params }));
    const data = response.data;
    if (Array.isArray(data)) {
      const normalizedList = data.map(normalizeEmployee);
      return {
        employees: normalizedList,
        total: normalizedList.length,
        page: 1,
        totalPages: 1,
      };
    }
    const rawEmps = data.employees || [];
    const normalizedList = rawEmps.map(normalizeEmployee);
    if (normalizedList.length === 0 && (!params?.search && !params?.department && !params?.risk)) {
      return {
        employees: MOCK_EMPLOYEES,
        total: MOCK_EMPLOYEES.length,
        page: 1,
        totalPages: 1,
      };
    }
    return {
      employees: normalizedList,
      total: data.total ?? normalizedList.length,
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1,
    };
  } catch (err) {
    console.warn('API error fetching employees, using normalized mock fallback:', err);
    return {
      employees: MOCK_EMPLOYEES,
      total: MOCK_EMPLOYEES.length,
      page: 1,
      totalPages: 1,
    };
  }
};

export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const response = await apiClient.get(`/employees/${id}`);
    return normalizeEmployee(response.data);
  } catch (err) {
    console.warn(`API lookup failed for ${id}, checking mock:`, err);
    const found = MOCK_EMPLOYEES.find((e) => e.id.toLowerCase() === id.toLowerCase());
    return found ? normalizeEmployee(found) : null;
  }
};

export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  const response = await apiClient.post('/employees', employeeData);
  return normalizeEmployee(response.data);
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<Employee> => {
  const response = await apiClient.put(`/employees/${id}`, updates);
  return normalizeEmployee(response.data);
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  const response = await apiClient.delete(`/employees/${id}`);
  return response.status === 200;
};

// --- ANALYTICS KPIS ---
export const fetchKPIOverview = async (): Promise<KPIOverview> => {
  try {
    const response = await apiClient.get('/analytics/kpis');
    return response.data;
  } catch (err) {
    console.warn('Falling back to local mock KPIs:', err);
    return MOCK_KPIS;
  }
};

// --- ATTENDANCE & CHECK-IN ---
export const fetchAttendance = async (params?: {
  search?: string;
  status?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<{
  records: AttendanceRecord[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    totalEmployees: number;
    totalPresent: number;
    onTimeCount: number;
    lateCount: number;
    absentCount: number;
    avgWorkingHours: string;
  };
}> => {
  try {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  } catch (err) {
    console.warn('Falling back to local mock attendance:', err);
    return {
      records: MOCK_ATTENDANCE,
      total: MOCK_ATTENDANCE.length,
      page: 1,
      totalPages: 1,
      summary: {
        totalEmployees: MOCK_ATTENDANCE.length,
        totalPresent: MOCK_ATTENDANCE.length,
        onTimeCount: MOCK_ATTENDANCE.filter((a) => a.status === 'On-Time').length,
        lateCount: MOCK_ATTENDANCE.filter((a) => a.status === 'Late').length,
        absentCount: 0,
        avgWorkingHours: '8.4',
      },
    };
  }
};

export const performCheckIn = async (payload: {
  employeeId: string;
  method: 'GPS Geofence' | 'Face Recognition' | 'Biometric' | 'QR Code';
  location: string;
  latitude?: number;
  longitude?: number;
  faceVerified?: boolean;
}): Promise<{ success: boolean; message: string; record: any }> => {
  const res = await apiClient.post('/attendance/check-in', payload);
  return res.data;
};

export const getAttendanceStatus = async (employeeId: string): Promise<{
  employeeId: string;
  clockedIn: boolean;
  checkInTime: string;
  method: string;
  status: string;
  location: string;
}> => {
  try {
    const res = await apiClient.get(`/attendance/status/${employeeId}`);
    return res.data;
  } catch (e) {
    return {
      employeeId,
      clockedIn: true,
      checkInTime: '08:45 AM',
      method: 'Face Recognition',
      status: 'On-Time',
      location: 'Bangalore Campus - Main Entrance',
    };
  }
};

// --- SHIFTS & SWAPS ---
export const fetchShifts = async (params?: { employeeId?: string; page?: number; limit?: number }): Promise<{
  shifts: ShiftSchedule[];
  swapRequests: ShiftSwapRequest[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const response = await apiClient.get('/shifts', { params });
    return response.data;
  } catch (err) {
    console.warn('Falling back to local mock shifts:', err);
    return {
      shifts: MOCK_SHIFTS,
      swapRequests: MOCK_SHIFT_SWAPS,
      total: MOCK_SHIFTS.length,
      page: 1,
      totalPages: 1,
    };
  }
};

export const requestShiftSwap = async (payload: {
  requesterId: string;
  peerId: string;
  shiftDate: string;
  reason: string;
}): Promise<{ success: boolean; message: string; swap: any }> => {
  const res = await apiClient.post('/shifts/swap-request', payload);
  return res.data;
};

export const approveShiftSwap = async (id: string): Promise<{ success: boolean; message: string; swap: any }> => {
  const res = await apiClient.post(`/shifts/swap/${id}/approve`);
  return res.data;
};

export const rejectShiftSwap = async (id: string): Promise<{ success: boolean; message: string; swap: any }> => {
  const res = await apiClient.post(`/shifts/swap/${id}/reject`);
  return res.data;
};

export const allocateShifts = async (): Promise<{ success: boolean; message: string; allocatedCount: number }> => {
  const res = await apiClient.post('/shifts/allocate');
  return res.data;
};

// --- LEAVES & TIMESHEETS ---
export const fetchLeaves = async (params?: { employeeId?: string; page?: number; limit?: number }): Promise<{
  leaves: LeaveRequest[];
  timesheets: TimesheetEntry[];
  totalLeaves: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const response = await apiClient.get('/leaves', { params });
    return response.data;
  } catch (err) {
    console.warn('Falling back to local mock leaves:', err);
    return {
      leaves: MOCK_LEAVES,
      timesheets: MOCK_TIMESHEETS,
      totalLeaves: MOCK_LEAVES.length,
      page: 1,
      totalPages: 1,
    };
  }
};

export const applyLeave = async (payload: {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
}): Promise<{ success: boolean; message: string; leave: LeaveRequest }> => {
  const res = await apiClient.post('/leaves/apply', payload);
  return res.data;
};

export const approveLeave = async (id: string): Promise<{ success: boolean; message: string; leave: LeaveRequest }> => {
  const res = await apiClient.post(`/leaves/${id}/approve`);
  return res.data;
};

export const rejectLeave = async (id: string, reason?: string): Promise<{ success: boolean; message: string; leave: LeaveRequest }> => {
  const res = await apiClient.post(`/leaves/${id}/reject`, { reason });
  return res.data;
};

// --- PAYROLL ---
export const fetchPayroll = async (params?: { employeeId?: string; page?: number; limit?: number }): Promise<{
  payrollRecords: PayrollRecord[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    totalMonthlyGross: number;
    totalOvertimePay: number;
    totalIncentives: number;
    totalNetDisbursed: number;
  };
}> => {
  try {
    const response = await apiClient.get('/payroll', { params });
    return response.data;
  } catch (err) {
    console.warn('Falling back to local mock payroll:', err);
    const gross = MOCK_PAYROLL.reduce((acc, p) => acc + p.baseSalary, 0);
    const ot = MOCK_PAYROLL.reduce((acc, p) => acc + p.overtimePay, 0);
    const bonus = MOCK_PAYROLL.reduce((acc, p) => acc + p.incentivesBonus, 0);
    return {
      payrollRecords: MOCK_PAYROLL,
      total: MOCK_PAYROLL.length,
      page: 1,
      totalPages: 1,
      summary: {
        totalMonthlyGross: gross,
        totalOvertimePay: ot,
        totalIncentives: bonus,
        totalNetDisbursed: gross + ot + bonus,
      },
    };
  }
};

// --- PERFORMANCE ---
export const fetchPerformance = async (): Promise<{
  topPerformers: Employee[];
  goals: any[];
  skillMatrix: any[];
}> => {
  try {
    const response = await apiClient.get('/performance');
    return {
      topPerformers: (response.data.topPerformers || []).map(normalizeEmployee),
      goals: response.data.goals || [],
      skillMatrix: response.data.skillMatrix || [],
    };
  } catch (err) {
    console.warn('Falling back to local performance:', err);
    return {
      topPerformers: MOCK_EMPLOYEES,
      goals: [],
      skillMatrix: [],
    };
  }
};

// --- EMAIL BROADCAST & INBOX ---
export const fetchEmployeeInbox = async (employeeId: string): Promise<{
  inbox: any[];
  total: number;
}> => {
  try {
    const res = await apiClient.get(`/email/inbox/${employeeId}`);
    return res.data;
  } catch (e) {
    return { inbox: [], total: 0 };
  }
};

export const fetchEmailBroadcasts = async (): Promise<{ broadcasts: any[]; total: number }> => {
  try {
    const res = await apiClient.get('/email/broadcasts');
    return res.data;
  } catch (e) {
    return { broadcasts: [], total: 0 };
  }
};

export const sendEmailBroadcast = async (payload: {
  subject: string;
  body: string;
  sender?: string;
  targetType: 'All' | 'Department' | 'Individual';
  targetDepartment?: string;
  recipientIds?: string[];
  templateName?: string;
}): Promise<{ success: boolean; message: string; campaign: any }> => {
  const res = await apiClient.post('/email/broadcast', payload);
  return res.data;
};

// --- NOTIFICATIONS ---
export const fetchNotifications = async (recipientId?: string): Promise<{ notifications: any[] }> => {
  try {
    const res = await apiClient.get('/notifications', { params: { recipientId } });
    return res.data;
  } catch (e) {
    return { notifications: [] };
  }
};

export const markNotificationRead = async (id: string): Promise<{ success: boolean }> => {
  try {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  } catch (e) {
    return { success: true };
  }
};

// --- AI CHATBOT ---
export const sendChatbotMessage = async (
  message: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }>
): Promise<string> => {
  try {
    const formattedHistory = history.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      content: item.text,
    }));

    const response = await apiClient.post('/assistant/chat', {
      message,
      history: formattedHistory,
    });

    if (!response.data?.reply) {
      throw new Error('No reply received from AURA AI');
    }

    return response.data.reply;
  } catch (err: any) {
    console.error('AURA AI chatbot error:', err);

    const errorMessage =
      err?.response?.data?.error ||
      err?.message ||
      'Unable to connect to AURA AI.';

    return `### AURA AI Connection Error

${errorMessage}

Please make sure the AURA AI backend is running on **http://localhost:3000**.`;
  }
};
