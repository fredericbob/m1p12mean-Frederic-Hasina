
const Vehicle = require('../models/Vehicules');  

const addVehicule = async (req, res) => {
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


const deleteVehicule=async(req,res)=>{
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.status(201).json({
            message:"Article suprimer"
        });

    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

const getVehicule=async(req,res)=>{
    try{
        const article=await Vehicle.find();
        res.status(201).json(article);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
}


module.exports={addVehicule,deleteVehicule,getVehicule};