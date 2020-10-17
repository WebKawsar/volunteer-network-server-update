const express = require('express')
const cors = require('cors')
const bodyParser = require("body-parser")
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u2izr.mongodb.net/${process.env.DB_HOST}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload());
const port = 8080
app.use(express.static("public"))


// root api
app.get('/', (req, res) => {
  res.send('Welcome to Volunteer Network')
})


client.connect(err => {
  const eventsCollection = client.db(`${process.env.DB_HOST}`).collection("events");

  // admin create an event
  app.post("/addEvent", (req, res) => {
          
    const file = req.files.image;
    const fileName = file.name;
    file.mv("./public/"+fileName)

    const insert = JSON.parse(req.body.data);
    insert.img = fileName;
    eventsCollection.insertOne(insert)
    .then(result => {

        res.send(result.insertedCount > 0)
    })

  })


  //for add volunter in database
  const volunteersCollection = client.db(`${process.env.DB_HOST}`).collection("volunteersActivity");
  app.post("/addVolunteerActivity", (req, res) => {

    const data = req.body;
    volunteersCollection.insertOne(data)
    .then(result => {
      res.send(result.insertedCount > 0)
    })

  })


  // volunteer choose works 
  app.get("/register/volunteer/:id", (req, res) => {

    eventsCollection.find({_id: ObjectId(req.params.id)})
    .toArray((error, documents) => {

      res.send(documents[0])
    })
  })


  // delete volunteer task
  app.delete("/deleteTask/:id", (req, res) => {
    volunteersCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount > 0)
    })

  })


  app.get("/admin/volunteers", (req, res) => {
    volunteersCollection.find({})
    .toArray((error, documents) => {
        res.send(documents)
    })

  })


  app.get("/events", (req, res) => {
    eventsCollection.find({})
    .toArray((error, documents) => {
        res.send(documents)
    })

  })


  app.get("/volunteer/myTasks", (req, res) => {
    volunteersCollection.find({email: req.query.email})
    .toArray((error, documents) => {
        res.send(documents)
    })

  })

  app.delete("/deleteVolunteer/:id", (req, res) => {

    volunteersCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {

      res.send(result.deletedCount > 0)
    })
  })
  console.log("Database Conected");

});


app.listen( process.env.PORT || port, () => {
  console.log(`listening at http://localhost:${port}`)
})