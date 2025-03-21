const mailService = require('../../models/email'); 

const emails = async (req, res) => {
    try {
        const response = await mailService.sendMail(req, res);
        res.status(200).json({
            status: "success",
            message: "Email sent successfully",
            data: response,
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).json({
            status: "error",
            message: "Email not sent",
        });
    }
};

module.exports = emails; 
