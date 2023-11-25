const express = require('express')
const app =express();
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 5000

//middleware 
app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
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
    // const adminCollection =client.db("WealthNest").collection("admin")
    
//employee related api

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
//admin related api 
// app.post('/employees',async(req,res)=>{
//   const employee = req.body;
//   const query ={email:employee.email}
//   const existingUser = await employeeCollection.findOne(query)
//   if(existingUser){
//     return res.send({message:'user already have',insertedId:null})
//   }
  
//   const result =await employeeCollection.insertOne(employee)
//   res.send(result)
// })

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