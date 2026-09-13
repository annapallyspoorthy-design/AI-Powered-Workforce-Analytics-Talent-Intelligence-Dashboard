export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  salary: number;
  experience: number;
  gender: string;
  tenure: number;
  performanceScore: number;
  promotionEligibility: boolean;
  attendance: number;
  skills: string[];
  projects: string[];
  manager: string;
  lastReviewDate: string;
  satisfactionRating: number;
  workLifeBalance: number;
  overtimeHours: number;
  location: string;
  attritionRiskScore?: number;
  flightRiskDrivers?: string[];
  birthdate?: string;
  joiningDate?: string;
}

export interface KPIOverview {
  totalEmployees: number;
  attritionRate: number;
  avgPerformance: number;
  totalDepartments: number;
  avgSalary: number;
  promotionRate: number;
  highRiskCount?: number;
  hiringTrend: Array<{ month: string; hired: number; departed: number }>;
  departmentDistribution: Array<{ name: string; count: number; color: string }>;
  genderDistribution: Array<{ name: string; percentage: number; count: number }>;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'HR Admin' | 'Department Manager' | 'Employee';
  avatar: string;
  department?: string;
  title?: string;
  employeeDetails?: Employee;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  recipientsCount: number;
  recipientNames: string[];
  sentAt: string;
  sender: string;
  status: 'Delivered' | 'Scheduled' | 'Draft';
  templateName?: string;
  targetType?: 'All' | 'Department' | 'Individual';
  targetDepartment?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  method: 'Biometric' | 'Face Recognition' | 'GPS Geofence' | 'QR Code';
  location: string;
  status: 'On-Time' | 'Late' | 'Early Exit' | 'Absent' | 'Anomaly';
  anomalyNote?: string;
  lateMinutes?: number;
  workingHours?: number;
}

export interface ShiftSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftName: 'Morning (08:00 - 16:00)' | 'Afternoon (16:00 - 00:00)' | 'Night (00:00 - 08:00)' | 'Flexible' | string;
  date: string;
  shiftDate?: string;
  isRotational: boolean;
  assignedByAI: boolean;
  overtimeAllocatedHours: number;
  status: 'Scheduled' | 'Completed' | 'Swapped';
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  peerId: string;
  peerName: string;
  shiftDate: string;
  shiftName?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  decisionAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  leaveBalance?: number;
  decisionNote?: string;
  decisionAt?: string;
}

export interface LeaveBalance {
  casualLeave: { used: number; total: number };
  sickLeave: { used: number; total: number };
  earnedLeave: { used: number; total: number };
  unpaidLeave: { used: number; total: number };
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  project: string;
  taskDescription: string;
  hoursWorked: number;
  clientBillingHours: number;
  status: 'Submitted' | 'Approved' | 'Rejected';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  baseSalary: number;
  overtimePay: number;
  incentivesBonus: number;
  leaveDeduction: number;
  netPay: number;
  paymentStatus: 'Processed' | 'Pending' | 'On Hold';
  generatedAt: string;
}

export interface WorkforceForecast {
  month: string;
  actualHeadcount: number;
  predictedDemand: number;
  recommendedHires: number;
  skillGapIndex: number;
}

export interface SkillMatrixItem {
  skillName: string;
  department: string;
  currentProficiencyPct: number;
  targetProficiencyPct: number;
  criticalGap: boolean;
}

export interface GoalItem {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: 'OKR' | 'KPI' | 'Personal Development';
  targetDate: string;
  progressPct: number;
  status: 'On Track' | 'At Risk' | 'Completed';
}

export interface IntegrationStatus {
  id: string;
  name: string;
  category: 'Biometric' | 'ERP' | 'Payroll' | 'Workspace/Collab' | 'Directory';
  provider: string;
  status: 'Connected' | 'Disconnected' | 'Syncing';
  lastSync: string;
  iconName: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Blocked';
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
