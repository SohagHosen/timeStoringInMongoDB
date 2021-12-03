const express = require("express");
const { MongoClient } = require("mongodb");
const moment = require("moment");
const app = express();
require("dotenv").config();
const port = 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sz6ue.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("timeStore");
    const times = database.collection("times");
    // create a document to insert

    app.post("/time", async (req, res) => {
      //current date
      const now = new Date();

      const minus10 = moment(now).subtract(10, "minutes").toDate();

      const plus10 = moment(now).add(10, "minutes").toDate();

      const result = await times
        .find({
          time: {
            $gte: minus10,
            $lt: plus10,
          },
        })
        .toArray();

      if (result.length) {
        res.send("This time is not available!");
      } else {
        const time = {
          time: new Date(),
        };
        const result = await times.insertOne(time);
        res.send("Data inserted successfully");
        console.log(
          `A document was inserted with the _id: ${result.insertedId}`
        );
      }
    });

    // app.get("/time", async (req, res) => {
    //   res.send("successful");
    // });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
