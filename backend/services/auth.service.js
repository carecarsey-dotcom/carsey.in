const {
    findAdminByEmail,
    findAdminById,
    updatePassword
} = require("../repositories/auth.repository");

const {
    comparePassword,
    hashPassword
} = require("../utils/password");

const { generateToken } = require("../utils/jwt");

// ==========================
// Admin Login
// ==========================
const login = async (email, password) => {

    // Find Admin
    const admin = await findAdminByEmail(email);

    if (!admin) {
        throw new Error("Admin not found");
    }

    // Check Status
    if (admin.status !== "Active") {
        throw new Error("Admin account is inactive");
    }

    // Compare Password
    const isMatch = await comparePassword(password, admin.password);

    if (!isMatch) {
        throw new Error("Invalid Password");
    }

    // Generate JWT
    const token = generateToken({
        admin_id: admin.admin_id,
        email: admin.email,
        role: admin.role
    });

    // Return Response
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

// ==========================
// Admin Profile
// ==========================
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

// ==========================
// Change Password
// ==========================
const changePassword = async (
    adminId,
    oldPassword,
    newPassword
) => {

    const admin = await findAdminById(adminId);

    if (!admin) {
        throw new Error("Admin not found");
    }

    const isMatch = await comparePassword(
        oldPassword,
        admin.password
    );

    if (!isMatch) {
        throw new Error("Old Password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);

    await updatePassword(adminId, hashedPassword);

    return {
        message: "Password changed successfully."
    };
};

module.exports = {
    login,
    getProfile,
    changePassword
};