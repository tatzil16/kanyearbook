
/* Important */
process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage yearbook.js PORT_NUMBER`);
    process.exit(1);
}

const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");
const portNumber = process.argv[2];
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("homepage");
 });

app.get("/entry", (req, res) => {
    const variables = {formHeader: `<form method='post' action='http://localhost:${portNumber}/processEntry'>`}
    res.render("entryPage", variables);
 });

 app.post("/processEntry", async (request, response) => {
    let { name, major, quoteButton, quote } = request.body;

    // HERE IS MY API CALL
    const getKanyeQuote = async () => {
        try {
            const apiResponse = await axios.get('https://api.kanye.rest');
            return apiResponse.data.quote;
        } catch (error) {
            console.error(`Error fetching Kanye West quote: ${error.message}`);
            throw error; // Rethrow the error to be caught in the outer catch block
        }
    };

    async function insertApp(client, databaseAndCollection, newApp) {
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newApp);
    
        console.log(`Yearbook entry created with id ${result.insertedId}`);
    }

    try {
        if (quoteButton === 'kanyeQuote') {
            const kanyeQuote = await getKanyeQuote();

            // Now you can include the Kanye West quote in your MongoDB insertion
            const kanyeEntry = { name, major, quote: kanyeQuote };

            const path = require("path");
            require("dotenv").config({ path: path.resolve(__dirname, './.env') });

            const uri = process.env.MONGO_CONNECTION_STRING;
            const databaseAndCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION };

            const { MongoClient, ServerApiVersion } = require('mongodb');

            async function main() {
                const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
                try {
                    await client.connect();
                    console.log("***** Inserting one yearbook entry with Kanye quote *****");
                    await insertApp(client, databaseAndCollection, kanyeEntry);
                } catch (e) {
                    console.error(e);
                } finally {
                    await client.close();
                }
            }

            main().catch(console.error);

            const variables = { name, major, quote: kanyeQuote };
            return response.render("showEntry", variables);
        } else {
            const kanyeEntry = { name, major, quote };
            const path = require("path");
            require("dotenv").config({ path: path.resolve(__dirname, './.env') });

            const uri = process.env.MONGO_CONNECTION_STRING;
            const databaseAndCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION };

            const { MongoClient, ServerApiVersion } = require('mongodb');

            async function main() {
                const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
                try {
                    await client.connect();
                    console.log("***** Inserting one yearbook entry with custom quote *****");
                    await insertApp(client, databaseAndCollection, kanyeEntry);
                } catch (e) {
                    console.error(e);
                } finally {
                    await client.close();
                }
            }

            main().catch(console.error);

            const variables = { name, major, quote };
            return response.render("showEntry", variables);
        }
    } catch (error) {
        // Handle any errors thrown in the try block
        console.error(`Error processing entry: ${error.message}`);
        // Respond with an error page or redirect as needed
        response.render("errorPage", { error: error.message });
    }
});

app.get("/view", (req, res) => {
    
    
    const path = require("path");
    require("dotenv").config({ path: path.resolve(__dirname, './.env') })  
    
    const uri = process.env.MONGO_CONNECTION_STRING;
    
     /* Our database and collection */
     const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
    
    /****** DO NOT MODIFY FROM THIS POINT ONE ******/
    const { MongoClient, ServerApiVersion } = require('mongodb');
    async function main() {
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    
        try {
            await client.connect();
            let filter = {};
            const cursor = client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .find(filter);
            
            const result = await cursor.toArray();
            let entry_table_str = '<table border="1" class="center"><tr><th>Name</th><th>Major</th><th>Quote</th></tr>';
            result.forEach((element) => entry_table_str += `<tr><td>${element.name}</td><td>${element.major}</td><td>${element.quote}</td></tr>`);
            entry_table_str += `</table>`;
            const variables = {entry_table_str}
            res.render("yearbookDisplay", variables);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
    
    main().catch(console.error);
    
 });

 const server = app.listen(portNumber);
 console.log(`Web server started and running at http://localhost:${portNumber}/`);
 server.keepAliveTimeout = 120 * 1000;
 server.headersTimeout = 120 * 1000;

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
  let dataInput = process.stdin.read();
  if (dataInput !== null) {
    let command = dataInput.trim();
    if (command === "stop") {
      process.stdout.write("Shutting down the server\n");
      process.exit(0);
    }
    process.stdout.write(prompt);
    process.stdin.resume();
  }
});


