CREATE DATABASE IF NOT EXISTS employee_management_db;
USE employee_management_db;
SHOW TABLES;
 

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) DEFAULT 'Chennai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees Table (Linked to Departments via Foreign Key)
CREATE TABLE IF NOT EXISTS employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    job_role VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    hire_date DATE NOT NULL,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- 3. Seed Initial Departments
INSERT IGNORE INTO departments (department_name, location) VALUES
('Software Engineering', 'Chennai'),
('Quality Assurance', 'Chennai'),
('Human Resources', 'Bengaluru'),
('IT Operations', 'Hyderabad');

-- 4. Seed Initial Employees
INSERT IGNORE INTO employees (first_name, last_name, email, phone, job_role, salary, hire_date, department_id) VALUES
('Arjun', 'Kumar', 'arjun.kumar@company.com', '9876543210', 'Backend Developer', 650000.00, '2025-06-15', 1),
('Priya', 'Sharma', 'priya.sharma@company.com', '9876543211', 'Database Administrator', 720000.00, '2025-03-10', 4),
('Karthik', 'Reddy', 'karthik.reddy@company.com', '9876543212', 'QA Analyst', 500000.00, '2025-08-01', 2);