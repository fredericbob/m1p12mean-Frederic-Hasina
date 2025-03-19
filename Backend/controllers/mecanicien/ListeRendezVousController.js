const RendezVous = require('../../models/RendezVous');

// Recupere la liste des rendez-vous d'un mecanicien authentifié
exports.getRendezVousMecanicien = async (req, res) => {
    try {
        // Recupere l'ID du mécanicien à partir du middleware jwtAuth
        const mecanicienId = req.user.id;

        // Recupere les rendez-vous du mécanicien qui ne sont pas terminés
        const rendezVous = await RendezVous.find({
            mecanicien_id: mecanicienId,
            statut: { $ne: "Terminé" }
        })
        .populate("client_id", "nom")
        .populate("vehicule_id", "nom")
        .select("date_rdv client_id vehicule_id");

        // Formater les données
        const result = rendezVous.map(rdv => ({
            id: rdv._id,
            client: rdv.client_id.nom,
            vehicule: rdv.vehicule_id.nom,
            date_rdv: rdv.date_rdv
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
