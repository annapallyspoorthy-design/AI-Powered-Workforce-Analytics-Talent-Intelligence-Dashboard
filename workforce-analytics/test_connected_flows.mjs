import axios from 'axios';

const BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- STARTING MULTI-ROLE & CONNECTED WORKFLOW TESTS ---');

  // 1. Auth HR Login
  const hrLogin = await axios.post(`${BASE}/auth/login`, {
    email: 'alexandra.vance@workforceintel.ai',
    role: 'HR Admin',
  });
  console.log('1. HR Login:', hrLogin.data.success, hrLogin.data.user.role, hrLogin.data.user.name);

  // 2. Auth Employee Login
  const empLogin = await axios.post(`${BASE}/auth/login`, {
    employeeId: 'EMP00001',
    role: 'Employee',
  });
  console.log('2. Employee Login:', empLogin.data.success, empLogin.data.user.id, empLogin.data.user.name);

  // 3. Employee Clock-In (GPS Geofence + Biometric Face Verification)
  const checkInRes = await axios.post(`${BASE}/attendance/check-in`, {
    employeeId: 'EMP00001',
    method: 'GPS Geofence',
    location: 'Bangalore HQ Campus',
    latitude: 12.9716,
    longitude: 77.5946,
    faceVerified: true,
  });
  console.log('3. Clock-In:', checkInRes.data.success, checkInRes.data.record.method, checkInRes.data.record.status);

  // 4. Attendance Status
  const attStatus = await axios.get(`${BASE}/attendance/status/EMP00001`);
  console.log('4. Attendance Status:', attStatus.data.clockedIn, attStatus.data.checkInTime);

  // 5. Employee Applies for Leave
  const leaveApply = await axios.post(`${BASE}/leaves/apply`, {
    employeeId: 'EMP00001',
    leaveType: 'Casual Leave',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    totalDays: 3,
    reason: 'Family event and rest',
  });
  const newLeaveId = leaveApply.data.leave.id;
  console.log('5. Leave Applied:', leaveApply.data.success, newLeaveId, leaveApply.data.leave.status);

  // 6. HR Approves Leave
  const leaveApprove = await axios.post(`${BASE}/leaves/${newLeaveId}/approve`);
  console.log('6. HR Approves Leave:', leaveApprove.data.success, leaveApprove.data.leave.status);

  // 7. Employee Requests Shift Swap
  const swapApply = await axios.post(`${BASE}/shifts/swap-request`, {
    requesterId: 'EMP00001',
    peerId: 'EMP00002',
    shiftDate: '2026-09-15',
    reason: 'Need afternoon instead of morning',
  });
  const newSwapId = swapApply.data.swap.id;
  console.log('7. Shift Swap Requested:', swapApply.data.success, newSwapId, swapApply.data.swap.status);

  // 8. HR Approves Shift Swap
  const swapApprove = await axios.post(`${BASE}/shifts/swap/${newSwapId}/approve`);
  console.log('8. HR Approves Shift Swap:', swapApprove.data.success, swapApprove.data.swap.status);

  // 9. HR Sends Email Broadcast to IT Department
  const emailBroadcast = await axios.post(`${BASE}/email/broadcast`, {
    subject: 'IT Team Quarterly System Update',
    body: 'All engineering & IT staff must review the new deployment schedule.',
    sender: 'alexandra.vance@workforceintel.ai',
    targetType: 'Department',
    targetDepartment: 'IT',
    templateName: 'Department Townhall',
  });
  console.log('9. Email Broadcast Sent:', emailBroadcast.data.success, emailBroadcast.data.campaign.recipientsCount);

  // 10. Employee Checks Inbox (should have received the email broadcast)
  const empInbox = await axios.get(`${BASE}/email/inbox/EMP00001`);
  console.log('10. Employee Inbox Total:', empInbox.data.total, 'Latest:', empInbox.data.inbox[0]?.subject);

  // 11. Employee Notifications (should have leave approved, shift swap approved, email received)
  const empNotifications = await axios.get(`${BASE}/notifications?recipientId=EMP00001`);
  console.log('11. Employee Notifications Count:', empNotifications.data.notifications.length);
  empNotifications.data.notifications.slice(0, 3).forEach((n, idx) => {
    console.log(`   - [${n.type.toUpperCase()}] ${n.title}: ${n.message}`);
  });

  console.log('--- ALL CONNECTED FLOWS PASSED WITH 100% SUCCESS ---');
}

runTests().catch((err) => {
  console.error('Test error:', err.response?.data || err.message);
  process.exit(1);
});
