/*********************************************************************************
*  WEB322 – Assignment 6
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Vishwam Shailesh Kapadia Student ID: 154933212 Date: 11-11-22
*
*  Cyclic Web App URL: https://cyan-amused-seahorse.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Vishwam1510/MyBlogWebsite.git
*
********************************************************************************/ 


const express = require("express");
const app = express();
const path = require("path");
const blogData = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
app.use(express.static('public'));
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const { mainModule } = require("process");
const authData = require("./auth-service");
const clientSessions = require("client-sessions");




cloudinary.config({
    cloud_name: 'ddt5ny5ij',
    api_key: '655472754624978',
    api_secret: 'AWzF2P59--JWExrbT2i7PBUxYPY',
    secure: true
});


const HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {
    console.log("Express http server listening on port " + HTTP_PORT);
  }  

const upload = multer();

app.use(express.urlencoded({extended: true}));

app.use(clientSessions({
    cookieName: "session", 
    secret: "assignment06", 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
}

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});


 
app.engine('.hbs', exphbs.engine({ extname: '.hbs',
helpers: {    
navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
},
equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
},
safeHTML: function(context){
    return stripJs(context);
},
formatDate: function(dateObj){
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
}}
 }));

app.set('view engine', '.hbs');

app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    res.render('about');
  });

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        console.log(err)
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", ensureLogin, (req, res) => {
    if(req.query.category){
        blogData.getPostsByCategory(req.query.category).then((data)=>{
            if(data.length>0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        })
        .catch((err)=>{
            res.render("posts", {message: "no results"});
        });
    }
    if(req.query.minDate){
        blogData.getPostsByMinDate(req.query.minDate).then((data)=>{
            if(data.length>0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        })
        .catch((err)=>{
            res.render("posts", {message: "no results"});
        });
    }
    blogData.getAllPosts().then((data) =>{
        if(data.length>0){
            res.render("posts", {posts: data});
        }
        else{
            res.render("posts", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("posts", {message: "no results"});
    });
});

app.get('/post/:id', ensureLogin, (req,res)=>{
    blogData.getPostById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});


app.get("/categories", ensureLogin, (req, res) => {
    blogData.getCategories().then((data) =>{
        if(data.length >0){
            res.render("categories", {categories: data});
        }
        else{
            res.render("categories", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("categories", {message: "no results"});
    });
});

app.get("/posts/add", ensureLogin, (req, res) => {
    blogData.getCategories().then((data)=>{
        res.render("addPost",{layout:"main.hbs", categories:data});
    }).catch((err)=>{
        res.render("addPost", {categories: []}); 
    })
});

app.get("/categories/add", ensureLogin, (req, res) => {
    res.render('addCategory');
});

app.get("/categories/delete/:id", ensureLogin, (req, res)=>{
    blogData.deleteCategoryById(req.params.id).then(()=>{
        res.redirect("/categories");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found)");
    })
});

app.get("/posts/delete/:id", ensureLogin, (req, res)=>{
    blogData.deletePostById(req.params.id).then(()=>{
        res.redirect("/posts");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found)");
    })
});

app.get("/login", (req, res) => { 
    res.render("login");
});

app.get("/register", (req, res) => { 
    res.render("register");
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.post("/categories/add", ensureLogin, (req, res)=>{
    blogData.addCategory(req.body).then(()=>{
        res.redirect("/categories");
    })
})


app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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
  });

app.post("/register", (req, res) => { 
    authData.registerUser(req.body)
    .then(() => {
        res.render("register", {successMessage: "User created"});
    })
    .catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName});
    })
});

app.post("/login", (req, res) => { 
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
    
        res.redirect('/posts');
    })
    .catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName});
    })  
});


app.use((req, res) => {
    res.render("404");
  });

  blogData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
