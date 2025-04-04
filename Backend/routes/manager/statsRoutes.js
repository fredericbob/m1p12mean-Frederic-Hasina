const express = require('express');
const router = express.Router();
const { getGeneralStats, getTopPrestations } = require('../../controllers/manager/statsController');

router.get('/general', getGeneralStats);
router.get('/top-prestations', getTopPrestations);

module.exports = router;
