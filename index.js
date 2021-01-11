const dotenv = require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const sharp = require("sharp");

// Required Models
const Media = require("./models/media");

// Setup
const app = express();
const port = 8342;

// Database Setup
mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Connected to database");
});

// Serve static files from uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(cors());

// Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
var upload = multer({ storage: storage });

// *  GET ROUTES  --------------------------------------------//
app.get("/", (req, res) => {
    res.send("Testing Server");
});

app.get("/getfiles", (req, res) => {
    const directoryPath = path.join(__dirname, "uploads");
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }
        const fileNames = [];
        files.forEach((file) => {
            fileNames.push(file);
        });
        res.send(fileNames);
    });
});

// * POST ROUTES  -------------------------------------------- //
app.post("/upload", upload.array("files"), (req, res) => {
    const files = req.files;
    if (!files) {
        const error = new Error("Please upload a file!");
        error.httpStatusCode = 400;
    }

    // Add and upload to metadata database
    let fileModels = [];

    files.forEach((file) => {
        const media = new Media({
            name: file.filename,
            dateUploaded: Date.now(),
            dateTaken: Date.now(),
            location: [-322, 344],
            delete: { marked: false, expiryDate: Date.now() },
            fileSize: file.size,
        });

        fileModels.push(media);

        // TODO : Process image thumbnail / get this working

        sharp(path.join(__dirname, file.filename))
            .resize({ width: 200 })
            .toFormat("jpeg")
            .toFile(path.join(__dirname, `/previews/resized.jpg`));
    });

    if (fileModels.length) {
        db.collection("media")
            .insertMany(fileModels)
            .then((result) => {
                console.log(`Successfully inserted ${files.length} items!`);
                return result;
            })
            .catch((err) =>
                console.error(`Failed to insert documents: ${err}`)
            );
    }

    res.send(files);
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
