const express=require('express');
const route=express.Router();

const{ createClient,getClient}=require('../controllers/UtilisateurConttrollers');

route.get('/',getClient);

route.post('/',createClient);


module.exports=route;