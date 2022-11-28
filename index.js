require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');



// middleware--------
app.use(cors());
app.use(express.json());


// MongoBD---------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixkdtuw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// JWT Verify middleware-------
function JWTVerify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unAuthorized access token')
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const carCategoryCollection = client.db('AutoCarServer').collection('carCategory');
        const bookingsCollection = client.db('AutoCarServer').collection('bookings');
        const usersCollection = client.db('AutoCarServer').collection('users');
        const addProductsCollection = client.db('AutoCarServer').collection('addProducts');


        //  <---------- Middleware verify admin function----------------> 
        const verifyAdmin = async (req, res, next) => {
            const deCodedEmail = req.decoded.email;
            const query = { email: deCodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access a' })
            }
            next()
        }


        //   Get --------
        //   Get the carCategory--------
        app.get('/carCategory', async (req, res) => {
            const query = {};
            const options = await carCategoryCollection.find(query).toArray();
            res.send(options);
        });


        // login Email diye booking query-------
        app.get('/bookings', JWTVerify, async (req, res) => {
            const email = req.query.email;
            //    console.log('token deu', req.headers.authorization);
            const deCodedEmail = req.decoded.email;
            if (email !== deCodedEmail) {
                return res.status(403).send({ message: 'forbidden Access' })
            }
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });


        //  All Users load--------
        app.get('/allusers', async (req, res) => {
            const query = {}
            const allUsers = await usersCollection.find(query).toArray();
            res.send(allUsers);
        });






        //------------- Post--------
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
        });



        // user Admin kina seta check------
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })


        // user create-----
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        //------------ Put--------------
        app.put('/users/admin/:id', JWTVerify, verifyAdmin, async (req, res) => {
            // const deCodedEmail = req.decoded.email;
            // const query = { email: deCodedEmail };
            // const user = await usersCollection.findOne(query);

            // if (user?.role !== 'admin') {
            //     return res.status(403).send({ message: 'forbidden access a' })
            // }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });



        // <------------ADD PRODUCT------------>

        app.get('/addProducts', JWTVerify, verifyAdmin, async (req, res) => {
            const query = {};
            const result = await addProductsCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/addProducts', JWTVerify, verifyAdmin, async (req, res) => {
            const products = req.body;
            const result = await addProductsCollection.insertOne(products)
            res.send(result);
        });

        app.delete('/addProducts/:id', JWTVerify, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await addProductsCollection.deleteOne(filter);
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