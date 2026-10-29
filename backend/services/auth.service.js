const {
    findAdminByEmail,
    findAdminById,
    updatePassword,
    findAccountByEmail,
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployeeStatus
} = require("../repositories/auth.repository");

const {
    comparePassword,
    hashPassword
} = require("../utils/password");

const {
    generateToken
} = require("../utils/jwt");

// ======================================================
// ADMIN / EMPLOYEE LOGIN
// ======================================================

const login = async (email, password) => {

    const admin = await findAdminByEmail(email);

    if (!admin) {
        throw new Error("Admin not found");
    }

    // CHECK ACCOUNT STATUS

    if (admin.status !== "Active") {
        throw new Error("Admin account is inactive");
    }

    // VERIFY PASSWORD

    const isMatch = await comparePassword(
        password,
        admin.password
    );

    if (!isMatch) {
        throw new Error("Invalid Password");
    }

    // GENERATE JWT

    const token = generateToken({
        admin_id: admin.admin_id,
        email: admin.email,
        role: admin.role
    });

    return {

        admin: {
            admin_id: admin.admin_id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        },

        token

    };

};

// ======================================================
// ADMIN / EMPLOYEE PROFILE
// ======================================================

const getProfile = async (adminId) => {

    const admin = await findAdminById(adminId);

    if (!admin) {
        throw new Error("Admin not found");
    }

    return {

        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status

    };

};

// ======================================================
// EXISTING CHANGE PASSWORD
// CURRENT PASSWORD REQUIRED
// ======================================================

const changePassword = async (
    adminId,
    oldPassword,
    newPassword
) => {

    if (!oldPassword || !newPassword) {
        throw new Error(
            "Old Password and New Password are required."
        );
    }

    if (typeof newPassword !== "string") {
        throw new Error("Invalid new password.");
    }

    if (newPassword.length < 6) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    const admin = await findAdminById(adminId);

    if (!admin) {
        throw new Error("Admin not found");
    }

    const isMatch = await comparePassword(
        oldPassword,
        admin.password
    );

    if (!isMatch) {
        throw new Error(
            "Old Password is incorrect"
        );
    }

    const hashedPassword = await hashPassword(
        newPassword
    );

    await updatePassword(
        adminId,
        hashedPassword
    );

    return {
        message: "Password changed successfully."
    };

};

// ======================================================
// SET OWN PASSWORD
// AUTHENTICATED ADMIN
// OLD PASSWORD NOT REQUIRED
// ======================================================

const setOwnPassword = async (
    adminId,
    newPassword
) => {

    if (!adminId) {
        throw new Error("Admin ID is required.");
    }

    if (
        typeof newPassword !== "string" ||
        !newPassword
    ) {
        throw new Error("New Password is required.");
    }

    if (newPassword.length < 6) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    const admin = await findAdminById(adminId);

    if (!admin) {
        throw new Error("Admin account not found.");
    }

    if (admin.role !== "Admin") {
        throw new Error(
            "Only Admin can use this option."
        );
    }

    if (admin.status !== "Active") {
        throw new Error(
            "Inactive accounts cannot change passwords."
        );
    }

    const hashedPassword = await hashPassword(
        newPassword
    );

    await updatePassword(
        adminId,
        hashedPassword
    );

    return {
        message: "Password updated successfully."
    };

};

// ======================================================
// ADMIN CHANGES EMPLOYEE PASSWORD
// ======================================================

const changeEmployeePassword = async (
    employeeId,
    newPassword
) => {

    if (
        !employeeId ||
        !Number.isInteger(Number(employeeId)) ||
        Number(employeeId) <= 0
    ) {
        throw new Error("Valid Employee ID is required.");
    }

    if (
        typeof newPassword !== "string" ||
        !newPassword
    ) {
        throw new Error("New Password is required.");
    }

    if (newPassword.length < 6) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    const employee = await getEmployeeById(
        employeeId
    );

    if (!employee) {
        throw new Error("Employee not found.");
    }

    const hashedPassword = await hashPassword(
        newPassword
    );

    await updatePassword(
        employeeId,
        hashedPassword
    );

    return {
        employeeId: Number(employeeId),
        message: "Employee password updated successfully."
    };

};

// ======================================================
// CREATE EMPLOYEE
// ADMIN ONLY
// ======================================================

const createEmployeeAccount = async (
    name,
    email,
    mobile,
    city,
    password
) => {

    if (!name || !name.trim()) {
        throw new Error(
            "Employee name is required."
        );
    }

    if (!email || !email.trim()) {
        throw new Error(
            "Employee email is required."
        );
    }

    if (!mobile || !mobile.trim()) {
        throw new Error(
            "Employee mobile number is required."
        );
    }

    if (!city || !city.trim()) {
        throw new Error(
            "Employee city is required."
        );
    }

    if (!password) {
        throw new Error(
            "Employee password is required."
        );
    }

    // NORMALIZE EMAIL

    email = email.trim().toLowerCase();

    // NORMALIZE MOBILE

    mobile = mobile.replace(/\D/g, "").trim();

    // NORMALIZE CITY

    city = city.trim();

    // MOBILE VALIDATION

    if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw new Error(
            "Please enter a valid 10 digit mobile number."
        );
    }

    // PASSWORD VALIDATION

    if (password.length < 6) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    // CHECK EXISTING ACCOUNT

    const existingAccount = await findAccountByEmail(
        email
    );

    if (existingAccount) {
        throw new Error(
            "An account with this email already exists."
        );
    }

    // HASH PASSWORD

    const hashedPassword = await hashPassword(
        password
    );

    // CREATE EMPLOYEE

    const result = await createEmployee(
        name.trim(),
        email,
        mobile,
        city,
        hashedPassword
    );

    return {

        employee: {
            admin_id: result.insertId,
            name: name.trim(),
            email,
            mobile,
            city,
            role: "Employee",
            status: "Active"
        }

    };

};

// ======================================================
// GET ALL EMPLOYEES
// ======================================================

const getEmployees = async () => {

    return await getAllEmployees();

};

// ======================================================
// GET EMPLOYEE BY ID
// ======================================================

const getEmployee = async (employeeId) => {

    if (!employeeId) {
        throw new Error(
            "Employee ID is required."
        );
    }

    const employee = await getEmployeeById(
        employeeId
    );

    if (!employee) {
        throw new Error("Employee not found.");
    }

    return employee;

};

// ======================================================
// UPDATE EMPLOYEE STATUS
// ======================================================

const changeEmployeeStatus = async (
    employeeId,
    status
) => {

    if (!employeeId) {
        throw new Error(
            "Employee ID is required."
        );
    }

    const allowedStatuses = [
        "Active",
        "Inactive"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error(
            "Invalid employee status."
        );
    }

    const employee = await getEmployeeById(
        employeeId
    );

    if (!employee) {
        throw new Error("Employee not found.");
    }

    await updateEmployeeStatus(
        employeeId,
        status
    );

    return {

        employeeId,
        status,

        message:
            "Employee status updated successfully."

    };

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    login,
    getProfile,

    // Password Management

    changePassword,
    setOwnPassword,
    changeEmployeePassword,

    // Employee Management

    createEmployeeAccount,
    getEmployees,
    getEmployee,
    changeEmployeeStatus

};