const jwt = require('jsonwebtoken');

const jwtAuth = (role = null) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Accès refusé ! Aucun token fourni" });
            }
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                req.user = decoded; 
                if (role && req.user.role !== role) {
                    return res.status(403).json({ message: "Accès interdit. Permission refusée." });
                }
                next();
            } catch (error) {
                return res.status(403).json({ message: "Token expiré ou invalide" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }
    };
};

module.exports = jwtAuth;
