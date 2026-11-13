const db = require('../config/db');

// 1. GET all employees (with optional search by name, job_role, or department_id)
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, role, department_id } = req.query;

    let sql = `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.job_role,
        e.salary,
        e.hire_date,
        d.department_id,
        d.department_name,
        d.location
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)';
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }

    if (role) {
      sql += ' AND e.job_role LIKE ?';
      params.push(`%${role}%`);
    }

    if (department_id) {
      sql += ' AND e.department_id = ?';
      params.push(department_id);
    }

    sql += ' ORDER BY e.employee_id DESC';

    const [rows] = await db.query(sql, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        e.*,
        d.department_name,
        d.location
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.employee_id = ?
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, job_role, salary, hire_date, department_id } = req.body;

    if (!first_name || !last_name || !email || !job_role || !salary || !hire_date) {
      return res.status(400).json({
        success: false,
        message: 'first_name, last_name, email, job_role, salary, and hire_date are required.',
      });
    }

    const sql = `
      INSERT INTO employees (first_name, last_name, email, phone, job_role, salary, hire_date, department_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      first_name,
      last_name,
      email,
      phone || null,
      job_role,
      salary,
      hire_date,
      department_id || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Employee added successfully.',
      data: { employee_id: result.insertId, first_name, last_name, email, job_role, department_id },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid department_id provided.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. PUT update employee details / role / department
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, job_role, salary, hire_date, department_id } = req.body;

    // Check if employee exists
    const [existing] = await db.query('SELECT * FROM employees WHERE employee_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const current = existing[0];
    const sql = `
      UPDATE employees
      SET first_name = ?, last_name = ?, email = ?, phone = ?, job_role = ?, salary = ?, hire_date = ?, department_id = ?
      WHERE employee_id = ?
    `;

    await db.query(sql, [
      first_name ?? current.first_name,
      last_name ?? current.last_name,
      email ?? current.email,
      phone ?? current.phone,
      job_role ?? current.job_role,
      salary ?? current.salary,
      hire_date ?? current.hire_date,
      department_id !== undefined ? department_id : current.department_id,
      id,
    ]);

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email is already in use by another employee.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid department_id provided.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE employee record
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM employees WHERE employee_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Employee with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};