var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
var data = require("./blog-service.js");
app.use(express.static("public/css"));

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
    data.published().then((data) =>{
        res.json(data);
    })
    .catch((err) => {
        res.json({Message: "Error"});
    });
});

app.get("/posts", (req, res) => {
    data.getAllPosts().then((data) =>{
        res.json(data);
    })
    .catch((err) => {
        res.json({Message: "Error"});
    });
});

app.get("/categories", (req, res) => {
    data.getCategories().then((data) =>{
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

  data
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHTTPStart);
  })
  .catch((err) => {
    console.log("Error in initializing the data.");
  });