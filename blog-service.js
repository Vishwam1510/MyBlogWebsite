const Sequelize = require('sequelize');

var sequelize = new Sequelize('umpajnjw', 'umpajnjw', 'c9GzVgGclIaD_ftz1yMG2R2OdTzmcl3R', {
  host: 'queenie.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

var Post = sequelize.define('Post', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
  category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = function(){
  return new Promise((resolve, reject) => {
    sequelize.sync().then(()=>{
        resolve("Database Sync Successful");
    }).catch(()=>{
        reject("unable to sync the database");
    });
});
};
  
  module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
      Post.findAll().then(function(data){
          resolve(data);
      }).catch((err)=>{
          reject("no results returned");
      })
  });
  };

  module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
      Post.findAll({
        where: {
          published: true
      }
    }).then((data) => {
      console.log("Operation successful");
      resolve(data);
    }).catch((err)=>{
      console.log("No results returned");
      reject();
    })
  });
};


  module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
      Category.findAll().then(function(data){
          resolve(data);
      }).catch((err)=>{
          reject("no results returned");
      })
  });
};

module.exports.addPost=function (postData){
  return new Promise((resolve, reject) => {
      postData.published = (postData.published) ? true : false;
      for(var d in postData){
          if(postData[d]=='') postData[d] = null;
      }
      postData.postDate=new Date();
      Post.create(postData).then(()=>{
          resolve();
      }).catch((err)=>{
          reject("unable to create post");
      });
  });

}
module.exports.addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    for(var d in categoryData){
        if(categoryData[d]=='') categoryData[d] = null;
    }
    Category.create(categoryData).then(()=>{
        resolve();
    }).catch((err)=>{
        reject("unable to create category");
    });
});
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
      Post.findAll({
        where: {
          category: category
        }
      }).then(function(data){
        resolve(data);
    }).catch((err)=>{
        reject("no results returned");
    });
});
};
      

module.exports.getPostsByMinDate = function(minDateStr){
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Post.findAll({
        where: {
            postDate: {
                [gte]: new Date(minDateStr)
            }
        }
    }).then((data)=>{
        resolve(data);
    }).catch((err)=>{
        reject("no results returned");
    })
});
};

module.exports.getPostById = function(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
        where:{
            id:id
        }
    }).then((data)=>{
        resolve(data[0]);
    }).catch((err)=>{
        reject("no results returned.");
    });
});
};

module.exports.getPublishedPostsByCategory = function(category){
  return new Promise((resolve, reject) => {
    Post.findAll({
        where:{
            published: true,
            category: category
        }
    }).then(function(data){
        resolve(data);
    }).catch((err)=>{
        reject("no results returned");
    });
});
}

module.exports.deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id:id
      }
    }).then(() => {
      console.log("Category deleted");
      resolve();
    }).catch((err)=>{
      console.log("Category Deletion Error!" +err);
      reject();
    });
  })
};

module.exports.deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id:id
      }
    }).then(() => {
      console.log("Post deleted");
      resolve();
    }).catch((err)=>{
      console.log("Post Deletion Error!" +err);
      reject();
    });
  })
};