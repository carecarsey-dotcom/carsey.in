const authService = require("../services/auth.service");


// ======================================================
// ADMIN / EMPLOYEE LOGIN
// ======================================================

const login = async (
    req,
    res
) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and Password are required."

            });

        }


        // ==================================================
        // SERVICE CALL
        // ==================================================

        const data =
            await authService.login(
                email,
                password
            );


        return res.status(200).json({

            success: true,

            message:
                "Login Successful",

            data

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// ADMIN / EMPLOYEE PROFILE
// ======================================================

const profile = async (
    req,
    res
) => {

    try {

        return res.status(200).json({

            success: true,

            message:
                "Admin Profile",

            data:
                req.admin

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (
    req,
    res
) => {

    try {

        const adminId =
            req.admin.admin_id;


        const {
            oldPassword,
            newPassword
        } = req.body;


        const data =
            await
                authService.changePassword(

                    adminId,

                    oldPassword,

                    newPassword

                );


        return res.status(200).json({

            success: true,

            message:
                "Password Changed Successfully",

            data

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// CREATE EMPLOYEE
// ADMIN ONLY
// ======================================================

const createEmployee = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        const data =
            await
                authService.createEmployeeAccount(

                    name,

                    email,

                    password

                );


        return res.status(201).json({

            success: true,

            message:
                "Employee Account Created Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Create Employee Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// GET ALL EMPLOYEES
// ADMIN ONLY
// ======================================================

const getEmployees = async (
    req,
    res
) => {

    try {

        const employees =
            await
                authService.getEmployees();


        return res.status(200).json({

            success: true,

            message:
                "Employees Retrieved Successfully",

            data: {

                employees

            }

        });

    } catch (error) {

        console.error(
            "Get Employees Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// GET EMPLOYEE BY ID
// ADMIN ONLY
// ======================================================

const getEmployee = async (
    req,
    res
) => {

    try {

        const {
            employeeId
        } = req.params;


        const employee =
            await
                authService.getEmployee(
                    employeeId
                );


        return res.status(200).json({

            success: true,

            message:
                "Employee Retrieved Successfully",

            data: {

                employee

            }

        });

    } catch (error) {

        console.error(
            "Get Employee Error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// UPDATE EMPLOYEE STATUS
// ADMIN ONLY
// ======================================================

const updateEmployeeStatus = async (
    req,
    res
) => {

    try {

        const {
            employeeId
        } = req.params;


        const {
            status
        } = req.body;


        const data =
            await
                authService.changeEmployeeStatus(

                    employeeId,

                    status

                );


        return res.status(200).json({

            success: true,

            message:
                "Employee Status Updated Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Update Employee Status Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    login,

    profile,

    changePassword,

    createEmployee,

    getEmployees,

    getEmployee,

    updateEmployeeStatus

};