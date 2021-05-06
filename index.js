const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qijdl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());


client.connect(err => {
    const appointmentCollection = client.db("DoctorPortal").collection("appointment");
    const doctorCollection = client.db("DoctorPortal").collection("doctors");

    app.post("/addAppointment", (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(name, file, email);
        file.mv(`${__dirname}/doctors/${file.name}`, err=>{
            if(err){
                console.log(err)
                return res.status(500).send({msg:'Failed to upload'})
            }
            return res.send({name: file.name, path:`/${file.name}`})
        })
        // const newImg = file.data;
        // const encImg = newImg.toString('base64');

        // var image = {
        //     contentType: file.mimetype,
        //     size: file.size,
        //     img: Buffer.from(encImg, 'base64')
        // };

        // doctorCollection.insertOne({ name, email, image })
        //     .then(result => {
        //         res.send(result.insertedCount > 0);
        //     })
    })


    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    });


    app.post("/appointmentsByDate", (req, res) => {
        const date = req.body;
        appointmentCollection.find({ date: date.date })
            .toArray((err, documents) => {
                res.send(documents);
            });


        


    });

});

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("HEllo Bangla")
})

app.listen(port)