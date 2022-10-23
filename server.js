/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Vishwam Shailesh Kapadia Student ID: 154933212 Date: 21-10-22
*
*  Cyclic Web App URL: https://cyan-amused-seahorse.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Vishwam1510/web-322.git
*
********************************************************************************/ 


const express = require("express");
const app = express();
const path = require("path");
const blogData = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamify = require('streamifier');
app.use(express.static('public'));


const HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {
    console.log("Express http server listening on port " + HTTP_PORT);
  }  

app.get("/", (req, res) => {
    res.redirect('/about');
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/about.html"));
  });

app.get("/blog", (req, res) => {
    blogData.getAllPosts().then((data) =>{
        res.json(data);
    })
    .catch((err) => {
        res.json({Message: "Error"});
    });
});

app.get("/posts", (req, res) => {
    if(req.query.category){
        blogData.getPostsByCategory(req.query.category).then((data)=>{
            res.json(data);
        })
        .catch((err)=>{
            res.json({Message: "Error"});
        });
    }
    if(req.query.minDate){
        blogData.getPostsByMinDate(req.query.minDate).then((data)=>{
            res.json(data);
        })
        .catch((err)=>{
            res.json({Message: "Error"});
        });
    }
    blogData.getAllPosts().then((data) =>{
        res.json(data);
    })
    .catch((err) => {
        res.json({Message: "Error"});
    });
});

app.get("/post/value", (req, res) => {
    data
      .getPostById(id)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ Message: "Error" });
      });
  });

app.get("/categories", (req, res) => {
    blogData.getCategories().then((data) =>{
        res.json(data);
    })
    .catch((err) => {
        res.json({Message: "Error"});
    });
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
    console.log("hello");
});

cloudinary.config({
    cloud_name: 'ddt5ny5ij',
    api_key: '655472754624978',
    api_secret: 'AWzF2P59--JWExrbT2i7PBUxYPY',
    secure: true
});

const upload = multer();

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }
     
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
        blogData.addPost(req.body).then(()=>{
            res.redirect("/posts");
        })
    }   
    res.redirect("/posts"); 
  });


app.use((req, res) => {
    res
      .status(404)
      .send(
        "<h1>ERROR 404. PAGE NOT FOUND.</h1>"
      );
  });

  blogData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHTTPStart);
  })
  .catch((err) => {
    console.log("Error in initializing the data.");
  });