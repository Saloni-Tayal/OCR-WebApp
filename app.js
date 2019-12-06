// Declaring Imports whatever we need
const express = require("express");
const app = express();
const fs = require("fs"); // to read & create files
const multer = require("multer"); // to upload files on the server
const {TesseractWorker} = require("tesseract.js"); // to read our images; :: we imported (specific class) TesseractWorker only

const worker = new TesseractWorker(); // to analyse imgs; :: created object worker

// to create storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {  // cb == callBack
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

//upload file
const upload = multer({storage: storage}).single("avatar");


app.set("view engine", "ejs"); //for some front-end; :: its where we are gon drop files


// ROUTES : To save  :: render
app.get("/", (req, res) => {// it responds to req
    res.render("index");
});

app.post("/upload", (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log("This is Error", err);

            worker
            .recognize(data, "eng", {tessjs_create_pdf: "1"})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                res.redirect("/download");
            })
            .finally(() => worker.terminate());
        });
    });
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file); 
});


// Start up the server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey I'm running on port ${PORT}`));