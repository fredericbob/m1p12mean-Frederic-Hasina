const RendezVous = require('../../models/RendezVous');
const Piece = require('../../models/Piece'); // Ajuste le chemin en fonction de l'emplacement de ton fichier
const Vehicule = require('../../models/Vehicules');
const TypeVehicule = require('../../models/TypeVehicule'); 

const searchOrCreateVehicule = async (req, res) => {
    const { marque, modele, annee, type_moteur, type_vehicule } = req.body;

    if (!marque || !modele || !annee || !type_moteur || !type_vehicule) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    try {
       
        let vehicule = await Vehicule.findOne({
            marque: { $regex: new RegExp(marque, "i") }, 
            modele: { $regex: new RegExp(modele, "i") },
            annee,
            type_moteur,
            type_vehicule
        });

      
        if (!vehicule && marque === "Nisanee") {
            marque = "Nissan"; 
            vehicule = await Vehicule.findOne({
                marque: { $regex: new RegExp(marque, "i") },
                modele: { $regex: new RegExp(modele, "i") },
                annee,
                type_moteur,
                type_vehicule
            });
        }

        if (!vehicule) {
            vehicule = new Vehicule({ marque, modele, annee, type_moteur, type_vehicule });
            await vehicule.save();
        }

        res.status(200).json({ vehicule_id: vehicule._id, message: "Véhicule trouvé ou créé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const addRendezVous = async (req, res) => {
    try {
        const { client_id, mecanicien_id, vehicule_id, date_rdv, prestations } = req.body;


        if (!client_id || !date_rdv || !prestations || !vehicule_id) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        let vehiculeTrouve = await Vehicule.findOne({
            marque: { $regex: new RegExp(vehicule_id.marque, "i") }, 
            modele: { $regex: new RegExp(vehicule_id.modele, "i") }, 
            annee: vehicule_id.annee,
            type_moteur: vehicule_id.type_moteur
        });

        let rendezVousData = {
            client_id,
            mecanicien_id: mecanicien_id || null,
            date_rdv,
            prestations,
        };

        if (vehiculeTrouve) {
        
            rendezVousData.vehicule_enregistrer = vehiculeTrouve._id;
        } else {
         
            rendezVousData.vehicule_id = {
                modele: vehicule_id.modele,
                annee: vehicule_id.annee,
                marque: vehicule_id.marque,
                type: vehicule_id.type ,
                type_autre: vehicule_id.type_autre || '', 
                type_moteur: vehicule_id.type_moteur
            };
        }

        for (const prestation of prestations) {
            if (!prestation.prestation_id) {
                return res.status(400).json({ message: "Chaque prestation doit avoir un prestation_id." });
            }
        }

        const newRendezVous = new RendezVous(rendezVousData);
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
const ajouterMecanicienARendezVous = async (req, res) => {
    try {
        const { id } = req.params;
        const { mecanicienId } = req.body;

        if (!id) {
            console.log("Erreur : aucun ID de rendez-vous reçu.");
            return res.status(400).json({ error: "L'ID du rendez-vous est requis." });
        }

        if (!mecanicienId) {
            console.log("Erreur : aucun ID de mécanicien reçu.");
            return res.status(400).json({ error: "L'ID du mécanicien est requis." });
        }

        // Vérifie si le rendez-vous existe dans la base de données
        const rendezVous = await RendezVous.findByIdAndUpdate(id, {  mecanicien_id:mecanicienId }, { new: true });

        if (!rendezVous) {
            console.log("Aucun rendez-vous trouvé avec cet ID :", id);
            return res.status(404).json({ error: "Rendez-vous non trouvé" });
        }

        return res.status(200).json({ message: "Mécanicien ajouté avec succès", rendezVous });

    } catch (error) {
        console.error("Erreur lors de l'ajout du mécanicien :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
};

const updateStatutRdv = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rdv = await RendezVous.findByIdAndUpdate(
            id,
            { statut: 'Confirmé' },
            { new: true }
        );
        
        if (!rdv) {
            return res.status(404).json({ error: "Rendez-vous non trouvé" });
        }
        
        res.status(200).json(rdv);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




const getRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.find().populate('client_id', 'nom prenom email').populate('vehicule_id', 'marque modele annee immatriculation kilometrage ').populate('mecanicien_id', 'nom prenom').populate('prestations.prestation_id', 'nom').populate('prestations.prestation_id', 'nom').populate({
            path: 'vehicule_id',
            populate: { path: 'type', select: 'nom' }
        }).populate('vehicule_enregistrer','marque modele annee type_moteur type_vehicule');
        res.status(200).json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const getRendezVousByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;

        if (!clientId) {
            return res.status(400).json({ message: "L'ID du client est requis." });
        }

        const rendezVous = await RendezVous.find({ client_id: clientId })
            .populate('client_id', 'nom prenom email')
            .populate('vehicule_id', 'marque modele annee immatriculation kilometrage')
            .populate('mecanicien_id', 'nom prenom')
            .populate('prestations.prestation_id', 'nom');

        if (!rendezVous || rendezVous.length === 0) {
            return res.status(404).json({ message: "Aucun rendez-vous trouvé pour ce client." });
        }

        res.status(200).json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const updateDateRdv = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDate } = req.body; 

        if (!newDate) {
            return res.status(400).json({ error: "La nouvelle date est requise" });
        }

        const rdv = await RendezVous.findByIdAndUpdate(
            id,
            { date_rdv: newDate },
            { new: true } 
        );

        if (!rdv) {
            return res.status(404).json({ error: "Rendez-vous non trouvé" });
        }

        res.status(200).json({ message: "Date mise à jour avec succès", rendezVous: rdv });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getMecanicienForRendezVous = async (req, res) => {
    try {
       
        const rendezVous = await RendezVous.find().populate('mecanicien_id', 'nom email');

     
        if (!rendezVous) {
            return res.status(404).json({ message: "Aucun rendez-vous trouvé" });
        }

      
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
}

const genererfacture = async (req, res) => {
  try {
    const { rendezVousId } = req.body; 
    const rendezVous = await RendezVous.findById(rendezVousId)
      .populate({
        path: "prestations.prestation_id",
        populate: {
          path: "processus.pieces_possibles",
          model: "Piece"
        }
      })
      .populate("vehicule_enregistrer")
      .exec();

    if (!rendezVous) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    let totalFacture = 0;
    let piecesFacture = [];

    const vehicule = rendezVous.vehicule_enregistrer;
    const typeVehicule = vehicule?.type || null;

    // 🔹 Boucle sur les prestations
    for (let prestation of rendezVous.prestations) {
      const prestationDetails = prestation.prestation_id;
      if (!prestationDetails) continue;

      // Prix de la main d’œuvre
      totalFacture += prestationDetails.prix_main_oeuvre || 0;

      // Boucle sur les étapes du processus
      for (let processus of prestationDetails.processus) {
        for (let piece of processus.pieces_possibles) {
          if (!piece) continue;

          // Recherche compatibilité
          let pieceVariante = null;
          if (Array.isArray(piece.compatibilites) && vehicule?._id) {
            pieceVariante = piece.compatibilites.find(
              c => String(c.vehicule) === String(vehicule._id)
            );
          }

          const prixPiece = pieceVariante?.prix || 0;

          piecesFacture.push({
            prestation: prestationDetails.nom,
            etape: processus.nom_etape,
            nom: piece.nom,
            prix: prixPiece
          });

          totalFacture += prixPiece;
        }
      }
    }

   res.status(200).json({
  rendezVousId,
  vehicule,
  prestations: rendezVous.prestations.map(p => ({
    nom: p.prestation_id?.nom || "",
    description: p.prestation_id?.description || "",
    prix_main_oeuvre: p.prestation_id?.prix_main_oeuvre || 0
  })),
  pieces: piecesFacture,
  total: totalFacture
});

  } catch (error) {
    console.error("Erreur lors de la génération de la facture:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};




const getAllTypeVehicule = async (req, res) => {
    try {
        const typesVehicules = await TypeVehicule.find();

        if (!typesVehicules.length) {
            return res.status(404).json({ message: "Aucun type de véhicule trouvé" });
        }

        res.status(200).json({ typesVehicules });
    } catch (error) {
        console.error('Erreur lors de la récupération des types de véhicules', error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



module.exports = {
    addRendezVous,
    deleteRendezVous,
    getRendezVous,
    updateRendezVous,
    getMecanicienForRendezVous,
    ajouterMecanicienARendezVous,
    updateStatutRdv,
    updateDateRdv,
    getRendezVousByClientId,
    genererfacture,
    searchOrCreateVehicule,
    getAllTypeVehicule
};
