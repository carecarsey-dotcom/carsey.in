const authService = require("../services/auth.service");

// ======================================================
// ADMIN / EMPLOYEE LOGIN
// ======================================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });
        }

        const data = await authService.login(
            email,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(401).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// ADMIN / EMPLOYEE PROFILE
// ======================================================

const profile = async (req, res) => {

    try {

        return res.status(200).json({
            success: true,
            message: "Admin Profile",
            data: req.admin
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// EXISTING CHANGE PASSWORD
// CURRENT PASSWORD REQUIRED
// ======================================================

const changePassword = async (req, res) => {

    try {

        const adminId = req.admin.admin_id;

        const {
            oldPassword,
            newPassword
        } = req.body;

        const data = await authService.changePassword(
            adminId,
            oldPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password Changed Successfully",
            data
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// SET OWN PASSWORD
// ADMIN ONLY
// ======================================================

const setOwnPassword = async (req, res) => {

    try {

        const adminId = req.admin.admin_id;

        const {
            newPassword
        } = req.body;

        const data = await authService.setOwnPassword(
            adminId,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: data.message
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// ADMIN CHANGES EMPLOYEE PASSWORD
// ======================================================

const changeEmployeePassword = async (req, res) => {

    try {

        const {
            employeeId
        } = req.params;

        const {
            newPassword
        } = req.body;

        const data =
            await authService.changeEmployeePassword(
                employeeId,
                newPassword
            );

        return res.status(200).json({
            success: true,
            message: data.message
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// CREATE EMPLOYEE
// ADMIN ONLY
// ======================================================

const createEmployee = async (req, res) => {

    try {

        const {
            name,
            email,
            mobile,
            city,
            password
        } = req.body;

        const data =
            await authService.createEmployeeAccount(
                name,
                email,
                mobile,
                city,
                password
            );

        return res.status(201).json({
            success: true,
            message: "Employee Account Created Successfully",
            data
        });

    } catch (error) {

        console.error("Create Employee Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// GET ALL EMPLOYEES
// ADMIN ONLY
// ======================================================

const getEmployees = async (req, res) => {

    try {

        const employees = await authService.getEmployees();

        return res.status(200).json({
            success: true,
            message: "Employees Retrieved Successfully",
            data: {
                employees
            }
        });

    } catch (error) {

        console.error("Get Employees Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// GET EMPLOYEE BY ID
// ADMIN ONLY
// ======================================================

const getEmployee = async (req, res) => {

    try {

        const {
            employeeId
        } = req.params;

        const employee = await authService.getEmployee(
            employeeId
        );

        return res.status(200).json({
            success: true,
            message: "Employee Retrieved Successfully",
            data: {
                employee
            }
        });

    } catch (error) {

        console.error("Get Employee Error:", error);

        return res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// UPDATE EMPLOYEE STATUS
// ADMIN ONLY
// ======================================================

const updateEmployeeStatus = async (req, res) => {

    try {

        const {
            employeeId
        } = req.params;

        const {
            status
        } = req.body;

        const data =
            await authService.changeEmployeeStatus(
                employeeId,
                status
            );

        return res.status(200).json({
            success: true,
            message: "Employee Status Updated Successfully",
            data
        });

    } catch (error) {

        console.error(
            "Update Employee Status Error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    login,
    profile,

    // Password Management

    changePassword,
    setOwnPassword,
    changeEmployeePassword,

    // Employee Management

    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployeeStatus

};