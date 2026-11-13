const db = require('../config/db');

// GET all departments with employee count
exports.getAllDepartments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        d.department_id,
        d.department_name,
        d.location,
        COUNT(e.employee_id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id
      GROUP BY d.department_id
      ORDER BY d.department_id ASC
    `;
    const [rows] = await db.query(sql);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { department_name, location } = req.body;
    if (!department_name) {
      return res.status(400).json({ success: false, message: 'Department name is required.' });
    }

    const sql = 'INSERT INTO departments (department_name, location) VALUES (?, ?)';
    const [result] = await db.query(sql, [department_name, location || 'Chennai']);

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: { department_id: result.insertId, department_name, location: location || 'Chennai' },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Department already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};