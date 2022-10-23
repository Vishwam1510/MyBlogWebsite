const fs = require("fs");
const { resolve } = require("path");

let posts = [];
let categories = [];


module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
      fs.readFile("./data/posts.JSON", (err, data) => {
        if (err){
          reject("unable to read the file");
        } else {
          posts = JSON.parse(data);
      }});
      fs.readFile("./data/categories.JSON", (err, data) => {
        if (err){
          reject("unable to read the file");
        } else{
        categories = JSON.parse(data);
        }
      });
      resolve();
    });
  };
  
  module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
      if (posts.length > 0) resolve(posts);
      else reject("No Results Returned");
    });
  };

  module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
      const intPosts = posts.filter((pos) => {
        return pos.published === true;
      });
      if (intPosts.length > 0) resolve(intPosts);
      else reject("No Results Returned");
    });
  };

  module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
      if (categories.length > 0) resolve(categories);
      else reject("No Results Returned");
    });
  };

  module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
      if(typeof postData.published === undefined){
        postData.published =false;
      }
      else{
        postData.published = true;
      }
      postData.id = posts.length + 1;
      posts.push(postData);
      resolve(postData);
    });
  };

  module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
      var post = [];
      for(let i = 0; i < posts.length; i++){
      if(posts[i].category == category){
        post.push(posts[i]);
      }
    }
    if(post){
      resolve(post);
    }else{
      reject("no results returned");
    }
  });
};


module.exports.getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    var post = [];
    for(let i = 0; i < posts.length; i++){
    if(new Date(posts[i].postDate)>=new Date(minDateStr)){
      post.push(posts[i]);
    }
  }
  if(post){
    resolve(post);
  }else{
    reject("no results returned");
  }
});
};

module.exports.getPostbyId = (id) => {
  return new Promise((resolve, reject) => {
    var post;
    if(posts.id === id)
    {
      resolve(posts);
    }
    else{
      reject("no result returned");
    }
  });
};