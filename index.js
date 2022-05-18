const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');

// DB CONNECTION
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


require('dotenv').config()

app.use(cors());
app.use(express.json())


// verifyToken

const verifyToken = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (authorization) {

        const accessToken = authorization.split(" ")[1];
        // console.log(accessToken);

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(403).send({ message: "Forbidden Access 1" });
            }
            req.decoded = decoded;
            next()
        })
    }
    else {
        return res.status(401).send({ message: "Unauthorised" })
    }

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@doctorportal.tp7ce.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const connectDB = async () => {

    try {
        await client.connect();
        const todoCollection = client.db("todo-app").collection("todos");

        // add new task
        app.post("/task/add", async (req, res)=>{
            const task = req.body;
            const result = await todoCollection.insertOne(task);
            res.send(result);
        })

        // get all tasks by user
        app.get("/tasks/:email", async (req, res)=>{

            const email = req.params.email;

            const filter = {
                user:email
            }

            const userTasks = await todoCollection.find(filter).toArray();

            res.send(userTasks);
        })

        // update task
        app.put("/task/update/:id", async (req, res) => {

            const taskId = req.params.id;

            const filter = {

                _id:ObjectId(taskId),

            }
            const updateDoc = {
                $set:{
                    status:'completed',
                }
            }

            const result = await todoCollection.updateOne(filter,updateDoc)

            res.send(result)

        })

        // delete a task
        app.delete("/task/delete/:id", async(req, res)=>{

            const taskId = req.params.id;

            const filter = {

                _id:ObjectId(taskId),

            }

            const result = await todoCollection.deleteOne(filter)
            res.send(result)

        })



    }

    catch (err) {
        console.error(err);
    }


}

connectDB().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello from todo app server")

})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`)
})