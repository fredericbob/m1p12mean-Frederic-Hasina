const Prestation = require("../../models/Prestation");

// Recupere uniquement les noms  des prestations
exports.getPrestations = async (req, res) => {
    try {
        const prestations = await Prestation.find({}, "nom _id");

        res.status(200).json(prestations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Récupérer les détails d'une prestation par ID
exports.getPrestationById = async (req, res) => {
    try {
        const prestation = await Prestation.findById(req.params.id);

        if (!prestation) {
            return res.status(404).json({ message: "Prestation non trouvée" });
        }

        res.status(200).json(prestation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
