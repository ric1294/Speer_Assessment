const express = require("express");
const mysql = require("mysql");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//session management
const session = require('express-session');
app.use(session({secret: 'mysecretsession',saveUninitialized: true,resave: true}));

//Db Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "speer",
  });

db.connect((err)=> {
    if(!err)
    console.log('Connection Established Successfully');
    else
    console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

//
app.get("/createdDB", (req, res) => {
    let sql = "CREATE DATABASE speertest";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("Database created");
    });
});

app.get("/createUserTable", (req, res) => {
    let sql =
    "CREATE TABLE speer.User(user_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,user_name VARCHAR(20) NOT NULL,first_name  VARCHAR(50),last_name VARCHAR(50),password VARCHAR(20),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("User table created");
    });
  
});  


//Registration API
app.post("/registration", (req, res) => {
    let userName = req.body.user_name;
    let email = req.body.email;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let password = req.body.password;
    let sql = "INSERT INTO speer.User (user_name , email , first_name , last_name , password) VALUES ('"+userName+"', '"+email+"' , '"+firstName+"' ,'"+lastName+"' , '"+password+"')";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("User has been created");
    });
  
  });


//Login API
  var sess; 
  app.post("/login", (req, res) => {
    sess = req.session;
    let email = req.body.email;
    let password = req.body.password;
    let sql = "SELECT * from speer.user where email='"+email+"' AND password='"+password+"'";
    db.query(sql, (err , result) => {
      if(result.length > 0){
        req.session.email = req.body.email;
        req.session.userId = result[0].user_id;
       
        if (err) {
            throw err;
          }
          res.json({ message: 'User logged in succesfully' })
         
      }else{
        res.json({ message: 'Opps!!!Wrong Credentials' })
     
      }
    });
});

//create Tweet for user
app.post("/createTweet", (req, res) => {
    let createdBy = req.body.created_by;
    let description = req.body.description;
    let sql = "INSERT INTO speer.tweets ( description, created_by ) VALUES ('"+description+"', '"+createdBy+"')";
    db.query(sql, (err , result) => {
        if (err) {
          throw err;
          }
        res.send("Tweet posted successfully");
    });
});


//read tweet of user
app.get("/getTweet/:userId", (req, res) => {
  let userId = req.params.user_id;
  let sql = "SELECT * from speer.tweet where created_by='"+userId+"'";
  db.query(sql, (err , result) => {
      if (err) {
        throw err;
        }
        res.json(result);
  });
});

//delete Tweet of user
app.get("/deleteTweet/:userId", (req, res) => {
  let userId = req.params.user_id;
  let sql = "delete from speer.tweet where created_by='"+userId+"'";
  db.query(sql, (err , result) => {
      if (err) {
        throw err;
        }
        res.send("Tweet deleted successfully");
  });
});


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));    

