const RendezVous = require('../../models/RendezVous');

const addRendezVous = async (req, res) => {
    try {
        const { client_id, mecanicien_id, vehicule_id, date_rdv, prestations } = req.body;

        if (!client_id || !vehicule_id || !date_rdv || !prestations) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

   
        for (const prestation of prestations) {
            if (!prestation.prestation_id) {
                return res.status(400).json({ message: "Chaque prestation doit avoir un prestation_id." });
            }
        }

        const newRendezVous = new RendezVous({
            client_id,
            mecanicien_id,
            vehicule_id,
            date_rdv,
            prestations
        });

        await newRendezVous.save();

        res.status(201).json({ message: "Rendez-vous créé avec succès", rendezVous: newRendezVous });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const deleteRendezVous = async (req, res) => {
    try {
        await RendezVous.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Rendez-vous supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const getRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.find().populate('client_id', 'nom email').populate('vehicule_id', 'marque modele annee immatriculation kilometrage ').populate('mecanicien_id', 'nom').populate('prestations.prestation_id', 'nom').populate('prestations.prestation_id', 'nom');
        res.status(200).json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const updateRendezVous = async (req, res) => {
    try {
        const { statut } = req.body;
        const rendezVous = await RendezVous.findByIdAndUpdate(req.params.id, { statut }, { new: true });

        if (!rendezVous) {
            return res.status(404).json({ message: "Rendez-vous non trouvé" });
        }

        res.status(200).json({ message: "Statut mis à jour", rendezVous });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports = {
    addRendezVous,
    deleteRendezVous,
    getRendezVous,
    updateRendezVous
};
