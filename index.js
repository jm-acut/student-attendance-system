const express = require("express");
const app = express();

app.use(express.json());

// In-memory database
let students = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    status: "Present",
    date: "2026-05-04"
  }
];

// GET all attendance
app.get("/api/attendance", (req, res) => {
  res.json(students);
});

// GET single student
app.get("/api/attendance/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

// POST - add attendance
app.post("/api/attendance", (req, res) => {
  const { name, status, date } = req.body;

  if (!name || !status || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newStudent = {
    id: Date.now(),
    name,
    status,
    date
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT - update attendance
app.put("/api/attendance/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { name, status, date } = req.body;

  if (name !== undefined) student.name = name;
  if (status !== undefined) student.status = status;
  if (date !== undefined) student.date = date;

  res.json(student);
});

// DELETE - remove record
app.delete("/api/attendance/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  students.splice(index, 1);
  res.status(204).send();
});

// Root route
app.get("/", (req, res) => {
  res.send("Student Attendance API is running");
});

// PORT for Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});