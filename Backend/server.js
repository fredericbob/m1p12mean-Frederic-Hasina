const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');

require('dotenv').config();

const app=express();

const PORT=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo Connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.use('/send-email', require('./routes/Email/emailRoute')); 
app.use('/users',require('./routes/UtilisateurRoutes'));
app.use('/login',require('./routes/LoginRoutes'));
app.use('/vehicules',require('./routes/VehiculeRoutes'));
app.use('/rendezvous',require('./routes/RendezVousRoutes'));
app.use('/piece',require('./routes/PieceRoutes'));

// ---------- Routes profil client -----------
app.use('/acceuil', require('./routes/client/AcceuilRoutes'));
app.use('/rendez-vous', require('./routes/client/SuivisReparationRoutes'));
app.use('/rendez-vous', require('./routes/client/AvisRoutes'));

// ---------- Routes profil mecanicien -----------
app.use('/mecanicien/rendez-vous', require('./routes/mecanicien/ListeRendezVousRoutes'));

// ---------- Routes profil manager -----------
app.use('/services-proposes', require('./routes/manager/ServiceProposeRoutes'));



app.listen(PORT,()=>console.log(`Serveur demarer sur le port ${PORT}`));
