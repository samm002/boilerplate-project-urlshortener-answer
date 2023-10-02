require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("node:dns");

// Basic Configuration
const host = process.env.HOST;
const port = process.env.PORT;
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Creating "URL" Schema
const Schema = mongoose.Schema;
const URLSchema = new Schema({
  original_url: {
    type: String,
    required: true,
    unique: true,
  },
  short_url: {
    type: String,
    required: true,
    unique: true,
  },
});


// Creating URL Model from URL Schema
const URLModel = mongoose.model("URL", URLSchema);

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get('/DocumentCount', async (req, res) => {
  try {
    const totalDocuments = await URLModel.countDocuments({});
    res.json({ totalDocuments });
  } catch (err) {
    console.error(err);
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let short_url = req.params.short_url;
  try {
    // find the stored url in database
    URLModel.findOne({ short_url: short_url }).then((short_urlFound) => {
      // if the url exist, redirect to the url
      if (short_urlFound) {
        const original_url = short_urlFound.original_url;
        res.redirect(original_url);
      } else {
        res.json({ error: "invalid url" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/api/shorturl", (req, res) => {
  let url = req.body.url;
  try {
    // Creating url object for validation
    checkUrl = new URL(url);
    console.log('checkUrl :', checkUrl)

    // Checking if it is a valid URL
    dns.lookup(checkUrl.hostname, async (err, address, family) => {
      // if the url has a valid domain
      console.log('address', address)
      if (address) {
        const original_url = checkUrl.href;
        const short_url = await URLModel.countDocuments({});

        URLModel.findOne({ original_url: original_url })
        .then((urlExist) => {
          // check whether the url posted was already stored in database
          if (urlExist) {
            // if the url already stored, return the orginal url and short url
            res.json({
              original_url: urlExist.original_url,
              short_url: urlExist.short_url
            });
          } else {
            // if it not stored yet, save the input to database and output the original url and short url
            let resData = {
              original_url: original_url,
              short_url: short_url+1,
            };
            let savedURL = new URLModel(resData);
            savedURL.save();
            res.json(resData);
          }
        });
      } else {
        // if the domain of url not found
        res.json({
          error: "invalid url",
        });
      }
    });
  } catch (err) {
    // if the input is not url
    res.json({
      err: err,
      error: "invalid url",
    });
  }
});

// Custom route to pass original url value to html
// Route to fetch original URL as JSON
app.get("/api/originalurl/:short_url", (req, res) => {
  let short_url = req.params.short_url;
  try {
    // Find the stored URL in the database
    URLModel.findOne({ short_url: short_url }).then((short_urlFound) => {
      // If the URL exists, send the original URL as JSON
      if (short_urlFound) {
        const original_url = short_urlFound.original_url;
        res.json({ original_url });
      } else {
        res.status(404).json({ error: "Short URL not found" });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, host, function () {
  console.log(`Listening on http://${host}:${port}`);
});
