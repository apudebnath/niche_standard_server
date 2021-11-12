const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require("mongodb");
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;


const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mthak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try{
        await client.connect();
        const database = client.db('ancient_pottery');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');

        //Order Data user to database
        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })

        //Order query Data database to user
        app.get('/orders', async(req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray();
            res.json(result);
        })

        // All Order Data database to admin
        app.get('/allOrders', async(req, res) => {
            const cursor = orderCollection.find({});
            const result = await cursor.toArray(cursor);
            res.json(result);
        })

        // Updated Status Data
        app.put('/statusUpdate/:id', async(req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.currentStatus;
            const filter = { _id: ObjectId(id) };
            const result = await orderCollection.updateOne(filter, {
                $set:{status: updatedStatus}
            })
            res.json(result);
        })

        // Delete an Order
        app.delete('/deleteOrder/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result);
            console.log(result)
        })

        // Store Users data
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result); 
        })

        // Make an Admin
        app.put('/users/admin', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Check admin 
        app.get('/users/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('My Pottery Server is Running');
})

app.listen(port, () => {
    console.log('Pottery server run on port', port);
})