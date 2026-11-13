const express = require('express');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Employee Management System API is running.',
  });
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});