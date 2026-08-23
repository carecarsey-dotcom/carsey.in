const authService = require("../services/auth.service");

/**
 * Admin Login Controller
 */
const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });
        }

        // Service Call
        const data = await authService.login(email, password);

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data
        });

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: error.message
        });

    }
};
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
const changePassword = async (req, res) => {
    try {
        const adminId = req.admin.admin_id;
        const { oldPassword, newPassword } = req.body;

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

module.exports = {
    login,
    profile,
    changePassword
};