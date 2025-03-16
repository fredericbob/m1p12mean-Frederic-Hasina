const express = require('express');
const router = express.Router();
const { addRendezVous, getRendezVous, deleteRendezVous, updateRendezVous } = require('../controllers/Rendezvous/RendezVousControllers');
const jwtAuth = require('../middlewares/jwtAuth');

router.post('/',jwtAuth('manager'), addRendezVous);
router.get('/', getRendezVous);
router.delete('/:id', deleteRendezVous);
router.put('/:id', updateRendezVous);

module.exports = router;
