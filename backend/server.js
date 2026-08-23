const app = require("./app");
const emailService =
    require("./services/email.service");
const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

    emailService.verifyMailConfiguration();

});