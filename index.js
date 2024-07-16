const express = require('express');
const cors = require('cors');
const port = 3000 || process.env.PORT;
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()


//middleware
app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
      optionSuccessStatus: 200,
    })
  );
  app.use(express.json());

  const uri = "mongodb+srv://teka_de:Srmxt2Cw0L0a78lj@cluster0.x7zkge4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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

        const userCollection = client.db('TekaDe').collection('users')

        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user)

            const result = await userCollection.insertOne(user)
            res.send(result)
        })


      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("TEKA DE is running")
})
app.listen(port, ()=>{
    console.log(`TEKA DE is running on port: ${port}`)
})