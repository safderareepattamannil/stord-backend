const express = require("express");
const multer = require("multer");
const path = require('path')

const app = express();
const port = 8080;
app.use(express.static(__dirname + '/public'));

// SET STORAGE
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Testing Server");
});

app.post("/upload", upload.array("media", 10), (req, res, next) => {
  const files = req.files;

  if (!files) {
    const error = new Error("Please upload a file!");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(files);
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
