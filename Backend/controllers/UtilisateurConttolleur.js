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

module.exports={createClient,getClient};