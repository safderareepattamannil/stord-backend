const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require('fs')
const cors = require('cors')
const app = express();
const port = 8342;

// Serve static files from uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(cors())

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

8
// GET ROUTES //
app.get("/", (req, res) => {
    res.send("Testing Server");
});

app.get("/getfiles", (req, res) => {
    // TODO: ITERATE OVER UPLOADS FOLDER AND SERVE ALL MEDIA CONTENT URLS
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, (err,files)=>{
      if(err){
        return console.log("Unable to scan directory: " + err);
      }
      const fileNames = [];

      files.forEach(file =>{
        fileNames.push(file);
      })

      res.send(fileNames);
    })
  });


// POST ROUTES //
app.post("/upload", upload.array("files"), (req, res) => {
    const files = req.files;
    console.log(files);

    if (!files) {
        const error = new Error("Please upload a file!");
        error.httpStatusCode = 400;
    }
    
    res.send(files);
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
