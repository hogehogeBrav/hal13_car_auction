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
const carDetail = require("./A_car_detail.js");
const sales = require("./A_sales_divide.js");
const user = require("./A_user.js");
const auction = require("./A_auction.js");


// TOP画面(在庫管理画面)
app.get('/', (req, res) => {
  stock.main(connection,req,res);
});
app.post('/', (req, res) => {
  stock.insert(connection,req,res);
  stock.main(connection,req,res);
});

// 車両詳細画面
app.get('/detail/:car_ID', (req, res) => {
  carDetail.main(connection,req,res);
});
app.post('/detail/:car_ID', (req, res) => {
  carDetail.update(connection,req,res);
  carDetail.main(connection,req,res);
});

// オークション管理画面
app.get('/auctions', (req, res) => {
  auction.main(connection,req,res);
});
app.post('/auctions', (req, res) => {
  console.log("post");
  auction.insert(connection,req,res);
  auction.main(connection,req,res);
});

// ユーザー管理画面
app.get('/user', (req, res) => {
  user.main(connection,req,res);
});


//売上一覧画面(Hirokey8492)
app.get('/sales', (req,res) => {
  sales.main(connection,req,res);
});
app.post('/sales', (req,res) => {
  sales.update(connection,req,res);
});

app.listen(3000);