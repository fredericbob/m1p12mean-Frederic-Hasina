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

app.use('/users',require('./routes/UtilisateurRoutes'));

app.listen(PORT,()=>console.log(`Serveur demarer sur le port ${PORT}`));