const RendezVous = require('../../models/RendezVous');

// Recupere le statut de chaque prestations pour un rendez-vous donné
exports.getSuiviReparations = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id).populate('prestations.prestation_id');

        if (!rendezVous) {
            return res.status(404).json({ message: "Rendez-vous non trouvé" });
        }

        const prestationsSuivi = rendezVous.prestations.map(prestation => {
            // Recuperer le statut ayant le timestamp le plus recent
            const statuts = prestation.statuts;
            let statutActuel = "En attente";
            let dernierTimestamp = statuts.En_attente;

            Object.entries(statuts).forEach(([statut, timestamp]) => {
                if (timestamp && timestamp > dernierTimestamp) {
                    statutActuel = statut;
                    dernierTimestamp = timestamp;
                }
            });

            return {
                prestation: prestation.prestation_id.nom,
                statut: statutActuel
            };
        });

        res.status(200).json(prestationsSuivi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
