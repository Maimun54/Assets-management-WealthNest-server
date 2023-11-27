const express = require('express')
const app =express();
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 5000

//middleware 
app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pl4mu3l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection =client.db("WealthNest").collection("users")   
    const employeeCollection =client.db("WealthNest").collection("ECustomRequest")
    const adminAssetsCollection =client.db("WealthNest").collection("adminAddAssets")
    
//employee related api

    app.post('/ECustomRequest',async(req,res)=>{
      const ECustomRequest = req.body;
      const result =await employeeCollection.insertOne(ECustomRequest)
      res.send(result)
    })
    
  app.get('/ECustomRequest',async(req,res)=>{
    const assets = req.body;
    const result = await employeeCollection.find(assets).toArray()
    res.send(result)

   })
    //admin related
    app.post('/adminAddAssets',async(req,res)=>{
      const adminAddAssets = req.body;
      const result =await adminAssetsCollection.insertOne(adminAddAssets)
      res.send(result)
    })
    
    app.get('/adminAddAssets',async(req,res)=>{
       const assets = req.body;
       const result = await adminAssetsCollection.find(assets).toArray()
      res.send(result)

    })
    app.delete('/adminAddAssets/:id',async(req,res)=>{
      const id =req.params.id;
      const query ={_id:new ObjectId(id)}
      const result = await adminAssetsCollection.deleteOne(query)
      res.send(result)
    })
    app.delete('/ECustomRequest/:id',async(req,res)=>{
      const id =req.params.id;
      const query ={_id:new ObjectId(id)}
      const result = await employeeCollection.deleteOne(query)
      res.send(result)
    })


  //user related api
    app.post('/users',async(req,res)=>{
      const users = req.body;
      const query ={email:users.email}
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({message:'user already have',insertedId:null})
      }
      
      const result =await usersCollection.insertOne(users)
      res.send(result)
    })


    app.get('/users',async(req,res)=>{
      const users =req.body
      const result = await usersCollection.find(users).toArray()
      res.send(result)
    })

    app.get('/user/:email',async(req,res)=>{
      
      const email =req.params.email;
      const query ={email:email};
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Asset Management System is Running')
})

app.listen(port,()=>{
    console.log(`Asset management system is running Port${port}`);
})