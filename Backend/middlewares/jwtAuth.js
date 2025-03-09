const jwt=require('jsonwebtoken');

const jwtAuth=()=>{
    return async(req,res,next)=>{
        try {
            const autheader=req.headers.authorization;

            if(!autheader || !autheader.startsWith("Bearer ")){
                return res.status(401).json({message:"Acces refuser ! aucune token servis"});
            }

            const token=autheader.split(" ")[1];
            try {
                const decoded=jwt.verify(token,process.env.JWT_KEY);
                req.user=decoded;
                next();
            } catch (error) {
                res.status(403).json({message:"Token expirer"});
            }

        } catch (error) {
            res.status(500).json({message:"Erreur du serveur"});
        }
    };
};

module.exports=jwtAuth;