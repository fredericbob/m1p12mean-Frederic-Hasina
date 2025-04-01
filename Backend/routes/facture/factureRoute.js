const express = require('express');
const router = express.Router();
const facture = require('../../controllers/facture/facture');

router.post('/',facture);

module.exports = router;
