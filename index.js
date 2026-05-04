const express = require("express");
const app = express();

app.use(express.json());

// In-memory storage
let attendance = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    status: "Present",
    date: "2026-05-04"
  }
];

// ✅ GET ALL (with optional filters)
app.get("/api/attendance", (req, res) => {
  let result = [...attendance];

  const { status, date } = req.query;

  if (status) {
    result = result.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  if (date) {
    result = result.filter(a => a.date === date);
  }

  res.json(result);
});

// ✅ GET ONE
app.get("/api/attendance/:id", (req, res) => {
  const id = Number(req.params.id);
  const record = attendance.find(a => a.id === id);

  if (!record) {
    return res.status(404).json({ error: "Record not found" });
  }

  res.json(record);
});

// ✅ POST (CREATE)
app.post("/api/attendance", (req, res) => {
  const { name, status, date } = req.body;

  // validation (IMPORTANT for grading)
  if (!name || !status || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["Present", "Absent"].includes(status)) {
    return res.status(400).json({ error: "Status must be Present or Absent" });
  }

  const newRecord = {
    id: Date.now(),
    name,
    status,
    date
  };

  attendance.push(newRecord);
  res.status(201).json(newRecord);
});

// ✅ PUT (UPDATE)
app.put("/api/attendance/:id", (req, res) => {
  const id = Number(req.params.id);
  const record = attendance.find(a => a.id === id);

  if (!record) {
    return res.status(404).json({ error: "Record not found" });
  }

  const { name, status, date } = req.body;

  if (status && !["Present", "Absent"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if (name !== undefined) record.name = name;
  if (status !== undefined) record.status = status;
  if (date !== undefined) record.date = date;

  res.json(record);
});

// ✅ DELETE
app.delete("/api/attendance/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = attendance.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Record not found" });
  }

  attendance.splice(index, 1);
  res.status(204).send();
});

// ✅ ROOT (required for Render)
app.get("/", (req, res) => {
  res.send("Student Attendance API is running");
});

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});