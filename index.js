const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config()


// middleware--------
app.use(cors());
app.use(express.json());


// MongoBD---------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixkdtuw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const carCategoryCollection = client.db('AutoCarServer').collection('carCategory');
        const bookingsCollection = client.db('AutoCarServer').collection('bookings');
        const usersCollection = client.db('AutoCarServer').collection('users');


        //   Get --------
        //   Get the carCategory--------
        app.get('/carCategory', async (req, res) => {
            const query = {};
            const options = await carCategoryCollection.find(query).toArray();
            res.send(options);
        });

        // login Email diye booking query-------
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });




        // Post--------
        // carCategory booking create
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            console.log(bookings);
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
        });

        // jwt token--------
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            console.log(user);
            res.status(403).send({ accessToken: '' });
        })

        // user create-----
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


    }
    finally {

    }
};
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Auto car server is Running')
});
app.listen(port, () => {
    console.log(`working tree is running port ${port}`);
});