















// export const students = [
//   { id: "STU001", name: "Aisha Rahman", class: "10-A", photo: "" },
//   { id: "STU002", name: "Marcus Chen", class: "10-A", photo: "" },
//   { id: "STU003", name: "Priya Patel", class: "10-B", photo: "" },
//   { id: "STU004", name: "James Wilson", class: "10-B", photo: "" },
//   { id: "STU005", name: "Sofia Garcia", class: "11-A", photo: "" },
//   { id: "STU006", name: "Liam O'Brien", class: "11-A", photo: "" },
//   { id: "STU007", name: "Yuki Tanaka", class: "11-B", photo: "" },
//   { id: "STU008", name: "Fatima Al-Sayed", class: "11-B", photo: "" },
//   { id: "STU009", name: "Noah Kim", class: "12-A", photo: "" },
//   { id: "STU010", name: "Emma Johnson", class: "12-A", photo: "" },
// ];

// export const attendanceRecords = [
//   { studentId: "STU001", studentName: "Aisha Rahman", date: "2026-03-28", checkInTime: "08:02", checkOutTime: "15:30", status: "Present" },
//   { studentId: "STU002", studentName: "Marcus Chen", date: "2026-03-28", checkInTime: "08:15", checkOutTime: "15:25", status: "Present" },
//   { studentId: "STU003", studentName: "Priya Patel", date: "2026-03-28", checkInTime: "08:35", checkOutTime: "15:20", status: "Late" },
//   { studentId: "STU004", studentName: "James Wilson", date: "2026-03-28", checkInTime: "-", checkOutTime: "-", status: "Absent" },
//   { studentId: "STU005", studentName: "Sofia Garcia", date: "2026-03-28", checkInTime: "07:58", checkOutTime: "-", status: "Incomplete" },
//   { studentId: "STU006", studentName: "Liam O'Brien", date: "2026-03-28", checkInTime: "08:05", checkOutTime: "15:35", status: "Present" },
//   { studentId: "STU007", studentName: "Yuki Tanaka", date: "2026-03-28", checkInTime: "08:40", checkOutTime: "15:10", status: "Late" },
//   { studentId: "STU008", studentName: "Fatima Al-Sayed", date: "2026-03-28", checkInTime: "-", checkOutTime: "-", status: "Absent" },
//   { studentId: "STU009", studentName: "Noah Kim", date: "2026-03-28", checkInTime: "08:00", checkOutTime: "15:30", status: "Present" },
//   { studentId: "STU010", studentName: "Emma Johnson", date: "2026-03-28", checkInTime: "08:10", checkOutTime: "-", status: "Incomplete" },
//   { studentId: "STU001", studentName: "Aisha Rahman", date: "2026-03-27", checkInTime: "08:00", checkOutTime: "15:30", status: "Present" },
//   { studentId: "STU002", studentName: "Marcus Chen", date: "2026-03-27", checkInTime: "08:30", checkOutTime: "15:20", status: "Late" },
//   { studentId: "STU003", studentName: "Priya Patel", date: "2026-03-27", checkInTime: "08:05", checkOutTime: "15:25", status: "Present" },
//   { studentId: "STU004", studentName: "James Wilson", date: "2026-03-27", checkInTime: "08:01", checkOutTime: "15:35", status: "Present" },
//   { studentId: "STU005", studentName: "Sofia Garcia", date: "2026-03-27", checkInTime: "-", checkOutTime: "-", status: "Absent" },
// ];

// export const weeklyData = [
//   { day: "Mon", present: 42, absent: 3, late: 5 },
//   { day: "Tue", present: 44, absent: 2, late: 4 },
//   { day: "Wed", present: 40, absent: 5, late: 5 },
//   { day: "Thu", present: 45, absent: 1, late: 4 },
//   { day: "Fri", present: 43, absent: 4, late: 3 },
// ];

// export const monthlyReport = students.map((s) => {
//   const percent = Math.floor(Math.random() * 20 + 80);
//   const incomplete = Math.floor(Math.random() * 4);
//   return {
//     ...s,
//     attendancePercent: percent,
//     daysPresent: Math.floor(Math.random() * 5 + 18),
//     totalDays: 22,
//     incompleteCount: incomplete,
//   };
// });
