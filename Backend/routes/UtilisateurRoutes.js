const express=require('express');
const route=express.Router();

const{ createClient,getClient}=require('../controllers/UtilisateurConttolleur');

route.get('/',getClient);

route.post('/',createClient);


module.exports=route;