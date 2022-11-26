const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
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


        //   Get --------
        app.get('/carCategory', async (req, res) => {
            const query = {};
            const options = await carCategoryCollection.find(query).toArray();
            res.send(options);
        });

        // Post--------
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            console.log(bookings);
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
        })



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