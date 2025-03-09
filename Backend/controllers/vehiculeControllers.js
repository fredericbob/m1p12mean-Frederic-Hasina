const jwt = require('jsonwebtoken');
const Vehicle = require('../models/Vehicules');  

const addVehicle = async (req, res) => {
    try {
        const { marque, modele, annee, immatriculation, kilometrage } = req.body;
        const userId = req.user.id; 
        const newVehicle = new Vehicle({
            proprietaire_id: userId,  
            marque,
            modele,
            annee,
            immatriculation,
            kilometrage
        });
        const savedVehicle = await newVehicle.save();

        res.status(201).json({
            message: 'Vehicule ajouté avec succès',
            vehicle: savedVehicle
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l ajout du véhicule', error: err });
    }
};


module.exports=addVehicle;