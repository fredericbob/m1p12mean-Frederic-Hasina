// authController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendResetPasswordEmail = require('../../models/email');
const User = require('../../models/Utilisateur'); // ton modèle d'utilisateur



// Fonction d'oubli de mot de passe, génère et envoie un lien de réinitialisation
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        // Générer un JWT pour la réinitialisation du mot de passe avec expiration de 1 heure
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_KEY, // Clé secrète pour signer le token
            { expiresIn: '1h' }      // Expiration dans 1 heure
        );

        // Générer le lien de réinitialisation
        const resetLink = `http://localhost:4200/reset-password?token=${token}`;

        // Envoyer l'email avec le lien de réinitialisation
        await sendResetPasswordEmail(email, resetLink);

        res.status(200).json({ message: 'Lien de réinitialisation envoyé.', resetLink });
    } catch (error) {
        console.error("Erreur dans la fonction forgotPassword:", error); // Ajoute un log d'erreur
        res.status(500).send("Erreur du serveur: " + error.message); // Ajoute le message de l'erreur dans la réponse
    }
};

// Fonction de réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Vérifier et décoder le token JWT
        const decoded = jwt.verify(token, process.env.JWT_KEY,);

        // Trouver l'utilisateur à partir de l'ID et de l'email décodés
        const user = await User.findOne({ _id: decoded.id, email: decoded.email });

        if (!user) {
            return res.status(400).send("Token invalide ou expiré.");
        }

        // Réinitialiser le mot de passe
        user.mdp = newPassword;
        await user.save();

        res.status(200).json({message:"Mot de passe réinitialisé."});
    } catch (error) {
        console.error("Erreur dans la fonction resetPassword:", error); // Ajoute un log d'erreur
        return res.status(400).send("Token invalide ou expiré. Détail de l'erreur: " + error.message);
    }
};
