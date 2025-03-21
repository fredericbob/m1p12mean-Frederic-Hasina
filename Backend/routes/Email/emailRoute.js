const express = require('express');
const router = express.Router();
const emails = require('../../controllers/email/emailControllers'); 

router.post('/', emails); 
module.exports = router;
