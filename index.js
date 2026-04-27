const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let students = [];
let attendance = [];
let grades = [];

app.post("/students", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  const student = {
    id: students.length + 1,
    name
  };

  students.push(student);
  res.json(student);
});

app.get("/students", (req, res) => {
  res.json(students);
});

app.put("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) return res.status(404).json({ message: "Not found" });

  student.name = req.body.name || student.name;
  res.json(student);
});

app.delete("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  students = students.filter(s => s.id !== id);
  res.json({ message: "Deleted" });
});

app.post("/attendance", (req, res) => {
  const { studentId, status, subject, remarks } = req.body;

  if (!studentId || !status) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const record = {
    id: attendance.length + 1,
    studentId,
    status,
    subject: subject || "General",
    remarks: remarks || "",
    date: new Date()
  };

  attendance.push(record);
  res.json(record);
});

app.get("/attendance/:studentId", (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const records = attendance.filter(a => a.studentId === studentId);
  res.json(records);
});

app.put("/attendance/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const record = attendance.find(a => a.id === id);

  if (!record) return res.status(404).json({ message: "Not found" });

  record.status = req.body.status || record.status;
  record.remarks = req.body.remarks || record.remarks;

  res.json(record);
});

app.delete("/attendance/:id", (req, res) => {
  const id = parseInt(req.params.id);
  attendance = attendance.filter(a => a.id !== id);
  res.json({ message: "Deleted" });
});

app.get("/attendance-summary/:studentId", (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const records = attendance.filter(a => a.studentId === studentId);

  let present = 0, absent = 0, late = 0, excused = 0;

  records.forEach(r => {
    if (r.status === "present") present++;
    else if (r.status === "absent") absent++;
    else if (r.status === "late") late++;
    else if (r.status === "excused") excused++;
  });

  let total = records.length;
  let percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;

  res.json({
    total,
    present,
    absent,
    late,
    excused,
    attendancePercentage: percentage
  });
});

app.post("/grades", (req, res) => {
  const { studentId, score, type } = req.body;

  if (!studentId || score == null || !type) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const grade = {
    id: grades.length + 1,
    studentId,
    score,
    type
  };

  grades.push(grade);
  res.json(grade);
});

app.get("/grades/:studentId", (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const result = grades.filter(g => g.studentId === studentId);
  res.json(result);
});

app.put("/grades/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const grade = grades.find(g => g.id === id);

  if (!grade) return res.status(404).json({ message: "Not found" });

  grade.score = req.body.score || grade.score;
  res.json(grade);
});

app.delete("/grades/:id", (req, res) => {
  const id = parseInt(req.params.id);
  grades = grades.filter(g => g.id !== id);
  res.json({ message: "Deleted" });
});

app.get("/final-grade/:studentId", (req, res) => {
  const studentId = parseInt(req.params.studentId);

  const studentGrades = grades.filter(g => g.studentId === studentId);
  const records = attendance.filter(a => a.studentId === studentId);

  if (studentGrades.length === 0) {
    return res.json({ finalGrade: 0 });
  }

  let totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
  let avgGrade = totalScore / studentGrades.length;

  let absent = records.filter(r => r.status === "absent").length;
  let late = records.filter(r => r.status === "late").length;
  let total = records.length;

  let attendanceScore = total > 0
    ? ((total - absent - (late * 0.5)) / total) * 100
    : 100;

  let finalGrade = (avgGrade * 0.7) + (attendanceScore * 0.3);

  let warning = absent >= 5 ? "Too many absences" : "OK";

  res.json({
    academicGrade: avgGrade,
    attendanceScore,
    finalGrade,
    warning
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});