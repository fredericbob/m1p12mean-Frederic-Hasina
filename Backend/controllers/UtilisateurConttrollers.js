const inscription=require('../models/Utilisateur');


const createClient =async(req,res)=>{
    try {
        const client =new inscription(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({error:error.message});
    
    }
};


const getClient=async(req,res)=>{
  try {
    const client=await inscription.find().select('-mdp');
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({error:error.message});
  }
};

const getMecaniciens = async (req, res) => {
  try {
    const mecaniciens = await inscription.find({ role: "mecanicien" }).select('-mdp');
    res.status(200).json(mecaniciens);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const ajouterMecanicienARendezVous = async (req, res) => {
  const { rendezvousId, mecanicienId } = req.body;  // Vous pouvez obtenir l'ID du RDV et du mécanicien depuis le corps de la requête

  try {
    // On vérifie si le rendez-vous existe
    const rendezVous = await RendezVous.findById(rendezvousId);
    
    if (!rendezVous) {
      return res.status(404).json({ error: 'Rendez-vous introuvable' });
    }

    // On vérifie si le mécanicien existe
    const mecanicien = await inscription.findById(mecanicienId); // 'inscription' étant votre modèle pour les utilisateurs
    
    if (!mecanicien || mecanicien.role !== 'mecanicien') {
      return res.status(404).json({ error: 'Mécanicien introuvable ou rôle incorrect' });
    }

    // On ajoute le mécanicien au rendez-vous
    rendezVous.mecanicien_id = mecanicienId;

    // On enregistre les modifications
    await rendezVous.save();

    res.status(200).json({ message: 'Mécanicien ajouté au rendez-vous avec succès', rendezVous });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!["client", "mecanicien", "manager"].includes(role)) {
          return res.status(400).json({ error: "Rôle invalide" });
      }

      const user = await inscription.findByIdAndUpdate(id, { role }, { new: true });
      if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.status(200).json(user);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
      const { id } = req.params;
      const user = await inscription.findByIdAndDelete(id);
      console.log("ID de l'utilisateur passé :", id);
      
      if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

module.exports={createClient,getClient,updateRole,deleteClient,getMecaniciens,ajouterMecanicienARendezVous};