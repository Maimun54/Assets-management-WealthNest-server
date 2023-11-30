const express = require('express')
const app =express();
const cors = require('cors')
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    // await client.connect();

    const usersCollection =client.db("WealthNest").collection("users")   
    const employeeCollection =client.db("WealthNest").collection("ECustomRequest")
    const adminAssetsCollection =client.db("WealthNest").collection("adminAddAssets")
    const employeeRequestAssetsCollection =client.db("WealthNest").collection("employeeRequestAssets")

    
    
//employee related api

    app.post('/ECustomRequest',async(req,res)=>{
      const ECustomRequest = req.body;
      const result =await employeeCollection.insertOne(ECustomRequest)
      res.send(result)
    })
    //this api for when employee click request button then admin received All Request page
    app.post('/EAssetRequest',async(req,res)=>{
      const EAssetRequest = req.body;
      const result =await employeeRequestAssetsCollection.insertOne(EAssetRequest)
      res.send(result)
    })
    
  app.get('/EAssetRequest',async(req,res)=>{
    const assets = req.body;
    const result = await employeeRequestAssetsCollection.find(assets).toArray()
    res.send(result)

   })
  app.get('/ECustomRequest',async(req,res)=>{
    const assets = req.body;
    const result = await employeeCollection.find(assets).toArray()
    res.send(result)

   })

   app.get('/ECustomRequest/:pending',async(req,res)=>{
      
    const pending =req.params.pending;
    const query ={status:pending};
    const result = await employeeCollection.find(query).toArray()
    res.send(result)
  })
  
    //admin related
    app.post('/adminAddAssets',async(req,res)=>{
      const adminAddAssets = req.body;
      const result =await adminAssetsCollection.insertOne(adminAddAssets)
      res.send(result)
    })

   
    
    

    app.get('/adminAddAssets/:id',async(req,res)=>{
      const id =req.params.id;
      const query ={_id:new ObjectId(id)}
      const result = await adminAssetsCollection.findOne(query)
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

    app.delete('/EAssetRequests/:id',async(req,res)=>{
      const id =req.params.id;
      const query ={_id:new ObjectId(id)}
      const result = await employeeRequestAssetsCollection.deleteOne(query)
      res.send(result)
    })


    app.patch('/EAssetRequest/:id',async(req,res)=>{
      const id = req.params.id
      const status =req.body.status
      const filter ={_id:new ObjectId(id)}
      console.log(id,status)
      const updateDoc ={
        $set: {
          status:status
        }
      }
      const result = await employeeRequestAssetsCollection.updateOne(filter,updateDoc)
      res.send(result)
    })
     //update data by id
  app.put('/adminAddAssets/:id',async(req,res)=>{
    const id =req.params.id
    const filter ={_id: new ObjectId(id)}
    const options = { upsert: true };
     const updateBlog=req.body;
     const updateAssets ={
    $set:{    
      
      Product_Name:updateBlog.Product_Name, 
            Product_Type:updateBlog.Product_Type,
            Product_Quantity:updateBlog.Product_Quantity,
            DateAdded:updateBlog.DateAdded
      
    }
  }
  const result = await adminAssetsCollection.updateOne(filter,updateAssets,options)
   res.send(result)
  })
     // Profile update data by id

  app.put('/users/:id',async(req,res)=>{

    const id =req.params.id
    const filter ={_id:new ObjectId (id)}
    const options = { upsert: true };
     const updateProfile=req.body;
     const updateUser ={
    $set:{    
      
            name:updateProfile.name, 
            photo:updateProfile.photo,
            Birthday:updateProfile.Birthday,
            email:updateProfile.email
            
      
    }
  }
  const result = await usersCollection.updateOne(filter,updateUser,options)
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

    app.get('/users/:id',async(req,res)=>{
      
      const id =req.params.id;
      const query ={_id :new ObjectId(id)};
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    

    app.get('/admin/users',async(req,res)=>{
      
      
      const result = await usersCollection.find({role:'employee',haveEmployed:null}).toArray()
      res.send(result)
    })

    app.get('/admin/users/list/:email',async(req,res)=>{
       const email = req.params.email
      // const query ={email:email}

      const result = await usersCollection.find({role:'employee',haveEmployed:email}).toArray()
      res.send(result)
    })
     
    app.patch('/admin/users/:id',async(req,res)=>{
      const id = req.params.id
      const haveEmployed =req.body.status
      const filter ={_id:new ObjectId(id)}
      console.log(id,haveEmployed)
      const updateDoc ={
        $set: {
          haveEmployed:haveEmployed
        }
      }
      const result = await usersCollection.updateOne(filter,updateDoc)
      res.send(result)
    })




    app.get('/user/:email',async(req,res)=>{
      
      const email =req.params.email;
      const query ={email:email};
      const result = await usersCollection.findOne(query)
      res.send(result)
    })

    //payment intend

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      if (!price || amount < 1) {
        return;
      }
      const { client_secret } = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send(client_secret);
    });

    app.patch('/admin/extend-employee-limit',async(req,res)=>{
      const id = req.params.id
      const status =req.body.status
      const filter ={_id:new ObjectId(id)}
      console.log(id,status)
      const updateDoc ={
        $set: {
          status:status
        }
      }
      const result = await employeeRequestAssetsCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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