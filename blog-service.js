const fs = require("fs");

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
  