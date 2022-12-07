"use strict"
const db = require("./settings/db");
const express = require('express');
const app = express();
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);
const passport = require('passport');
const mysql = require('mysql2');
const flash = require('connect-flash');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/view" , {index: false}));
app.use(express.static(__dirname + "/public" , {index: false}));
app.use(express.static(__dirname + "/js" , {index: false}));
app.use(express.static(__dirname + "/css" , {index: false}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(flash());

const connection = mysql.createConnection({
  host: db.dbHost,
  user: db.dbUser,
  password: db.dbPassword,
  port: db.dbPort,
  database: db.dbDatabase,
  dateStrings: 'date'
});

const stock = require("./A_stock.js");

// TOP画面(在庫管理画面)
app.get('/', (req, res) => {
  stock.main(connection,req,res);
  
});

// 車両詳細画面
app.get('/detail/:car_ID', (req, res) => {
  res.render('A_car_detail.ejs', {
    
  });
});

// オークション管理画面
app.get('/auctions', (req, res) => {
  res.render('A_auction.ejs', {
    
  });
});



app.listen(9000);