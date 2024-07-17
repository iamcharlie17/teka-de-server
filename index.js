const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const port = 3000 || process.env.PORT;
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());

const uri =
  "mongodb+srv://teka_de:Srmxt2Cw0L0a78lj@cluster0.x7zkge4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("TekaDe").collection("users");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const isExist = await userCollection.findOne({
        $or: [{ email: user.email }, { phoneNumber: user.phoneNumber }],
      });
      
      if (isExist) {
        return res
          .status(400)
          .send({
            message: "User already exist with this email or phone number.",
          });
      }
 

      const hashedPin = await bcrypt.hash(user.pin, 10);
      user.pin = hashedPin;

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/login", async (req, res) => {
      const { emailOrPhone, pin } = req.body;
      const user = await userCollection.findOne({
        $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
      });
      if (!user) {
        return res.status(400).send({ message: "Invalid credentials" });
      }
      
      const isMatch = await bcrypt.compare(pin, user.pin);
      if (!isMatch) {
        return res.status(400).send({ message: "Invalid credentials" });
      }

      if(user?.status === 'pending') {
        return res.status(400).send({message: 'Please wait for admin approval.'})
      }
      if(user?.status === 'blocked'){
        return res.status(400).send({message: 'Your account has been blocked by admin.'})
      }
      const token = jwt.sign({ id: user._id, role: user.role }, "IloveYou", {
        expiresIn: "365d",
      });
      res.send({ token, user });
    });

    //get all users for admin---
    app.get('/users', async(req, res) => {
        const search = req.query.search;
        let query = {}
        if(search) {
            query = { name: { $regex: search, $options: 'i' } };
        }
        const result = await userCollection.find(query).toArray()
        res.send(result)
    })

    app.get('/user', (req, res) => {
        res.json(req.user);
    });

    app.get("/", (req, res) => {
      res.send("TEKA DE is running");
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`TEKA DE is running on port: ${port}`);
});
