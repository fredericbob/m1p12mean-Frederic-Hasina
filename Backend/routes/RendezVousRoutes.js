const express = require('express');
const router = express.Router();
const { addRendezVous, getRendezVous, deleteRendezVous, updateRendezVous } = require('../controllers/Rendezvous/RendezVousControllers');
const jwtAuth = require('../middlewares/jwtAuth');
const {getMecaniciens,ajouterMecanicienARendezVous} = require('../controllers/UtilisateurConttrollers');


router.post('/', addRendezVous);
router.get('/', jwtAuth('manager'),getRendezVous);
router.get('/mecanicien', jwtAuth('manager'),getMecaniciens);
router.post('/ajoutmecanicien', jwtAuth('manager'),ajouterMecanicienARendezVous);
router.delete('/:id', deleteRendezVous);
router.put('/:id', updateRendezVous);

module.exports = router;
