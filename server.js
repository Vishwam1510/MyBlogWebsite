/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Vishwam Shailesh Kapadia Student ID: 154933212 Date: 21-10-22
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 


const express = require("express");
const app = express();
const path = require("path");
const blogData = require("./blog-service.js");
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
    blogData.getAllPosts().then((data) =>{
        res.json(data);
    })
    .catch((err) => {
        res.json({Message: "Error"});
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