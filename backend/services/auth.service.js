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

const login = async (
    email,
    password
) => {

    // ==================================================
    // FIND ACCOUNT
    // ==================================================

    const admin =
        await findAdminByEmail(email);

    if (!admin) {
        throw new Error(
            "Admin not found"
        );
    }

    // ==================================================
    // CHECK STATUS
    // ==================================================

    if (
        admin.status !== "Active"
    ) {
        throw new Error(
            "Admin account is inactive"
        );
    }

    // ==================================================
    // COMPARE PASSWORD
    // ==================================================

    const isMatch =
        await comparePassword(
            password,
            admin.password
        );

    if (!isMatch) {
        throw new Error(
            "Invalid Password"
        );
    }

    // ==================================================
    // GENERATE JWT
    // ==================================================

    const token =
        generateToken({
            admin_id:
                admin.admin_id,

            email:
                admin.email,

            role:
                admin.role
        });

    // ==================================================
    // RETURN RESPONSE
    // ==================================================

    return {
        admin: {
            admin_id:
                admin.admin_id,

            name:
                admin.name,

            email:
                admin.email,

            role:
                admin.role
        },

        token
    };
};

// ======================================================
// ADMIN PROFILE
// ======================================================

const getProfile = async (
    adminId
) => {

    const admin =
        await findAdminById(
            adminId
        );

    if (!admin) {
        throw new Error(
            "Admin not found"
        );
    }

    return {
        admin_id:
            admin.admin_id,

        name:
            admin.name,

        email:
            admin.email,

        role:
            admin.role,

        status:
            admin.status
    };
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (
    adminId,
    oldPassword,
    newPassword
) => {

    if (
        !oldPassword ||
        !newPassword
    ) {
        throw new Error(
            "Old Password and New Password are required."
        );
    }

    const admin =
        await findAdminById(
            adminId
        );

    if (!admin) {
        throw new Error(
            "Admin not found"
        );
    }

    const isMatch =
        await comparePassword(
            oldPassword,
            admin.password
        );

    if (!isMatch) {
        throw new Error(
            "Old Password is incorrect"
        );
    }

    const hashedPassword =
        await hashPassword(
            newPassword
        );

    await updatePassword(
        adminId,
        hashedPassword
    );

    return {
        message:
            "Password changed successfully."
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
    password
) => {

    // ==================================================
    // VALIDATION
    // ==================================================

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

    if (!password) {
        throw new Error(
            "Employee password is required."
        );
    }

    // ==================================================
    // NORMALIZE EMAIL
    // ==================================================

    email =
        email
            .trim()
            .toLowerCase();

    // ==================================================
    // NORMALIZE MOBILE
    // ==================================================

    mobile =
        mobile
            .replace(/\D/g, '')
            .trim();

    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw new Error(
            "Please enter a valid 10 digit mobile number."
        );
    }

    // ==================================================
    // PASSWORD LENGTH
    // ==================================================

    if (
        password.length < 6
    ) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    // ==================================================
    // CHECK EXISTING ACCOUNT
    // ==================================================

    const existingAccount =
        await findAccountByEmail(
            email
        );

    if (existingAccount) {
        throw new Error(
            "An account with this email already exists."
        );
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword =
        await hashPassword(
            password
        );

    // ==================================================
    // CREATE EMPLOYEE
    // ==================================================

    const result =
        await createEmployee(
            name.trim(),
            email,
            mobile,
            hashedPassword
        );

    // ==================================================
    // RETURN CREATED EMPLOYEE
    // ==================================================

    return {
        employee: {
            admin_id:
                result.insertId,

            name:
                name.trim(),

            email,

            mobile,

            role:
                "Employee",

            status:
                "Active"
        }
    };
};

// ======================================================
// GET ALL EMPLOYEES
// ADMIN ONLY
// ======================================================

const getEmployees = async () => {

    return await getAllEmployees();

};

// ======================================================
// GET EMPLOYEE BY ID
// ADMIN ONLY
// ======================================================

const getEmployee = async (
    employeeId
) => {

    if (!employeeId) {
        throw new Error(
            "Employee ID is required."
        );
    }

    const employee =
        await getEmployeeById(
            employeeId
        );

    if (!employee) {
        throw new Error(
            "Employee not found."
        );
    }

    return employee;
};

// ======================================================
// UPDATE EMPLOYEE STATUS
// ADMIN ONLY
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

    if (
        !allowedStatuses.includes(status)
    ) {
        throw new Error(
            "Invalid employee status."
        );
    }

    const employee =
        await getEmployeeById(
            employeeId
        );

    if (!employee) {
        throw new Error(
            "Employee not found."
        );
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

    changePassword,

    createEmployeeAccount,

    getEmployees,

    getEmployee,

    changeEmployeeStatus

};