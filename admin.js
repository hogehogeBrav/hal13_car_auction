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
  carDetail.main(connection,req,res);
});

// オークション管理画面
app.get('/auctions', (req, res) => {
  res.render('A_auction.ejs', {
    
  });
});

app.get('/sales', isAuthenticated, (req, res)=> {
  let sql = "";
  if(req.query.search){
    if(req.query.date != "" && req.query.state != ""){
      let bid_date_sql = "s.bid_date BETWEEN '" + req.query.date + " 00:00:00' AND '" + req.query.date + " 23:59:59'";
      let state_sql = "s.sales_status_ID = '" + req.query.state + "'";

      sql = "WHERE " + bid_date_sql + " AND " + state_sql;
    }
    else if(req.query.date != ""){
      let bid_date_sql = "s.bid_date BETWEEN '" + req.query.date + " 00:00:00' AND '" + req.query.date + " 23:59:59'";

      sql = "WHERE " + bid_date_sql;
    }
    else if(req.query.state != ""){
      let state_sql = "s.sales_status_ID = '" + req.query.state + "'";

      sql = "WHERE " + state_sql;
    }
    console.log(sql);
  }
  connection.query(
    `SELECT s.sales_ID, s.bid_price, s.bid_date, s.sales_status_ID, ss.state, u.name as user_name, m.name as model_name 
    FROM sales as s 
    INNER JOIN sales_status as ss 
    ON s.sales_status_ID = ss.sales_status_ID 
    INNER JOIN user as u 
    ON s.user_ID = u.user_ID 
    INNER JOIN stock as st 
    ON s.car_ID = st.car_ID 
    INNER JOIN model as m 
    ON st.car_model_ID = m.car_model_ID `
    + sql + 
    `ORDER BY sales_ID DESC`,
    (error, results) => {
      if(error) {
        console.log('error conenction: ' + error.stack);
        return;
      }

      for(let i=0; i < results.length; i++){
        // デフォルト値
        let format = 'YYYY年MM月DD日 hh:mm';

        format = format.replace(/YYYY/g, results[i].bid_date.getFullYear());
        format = format.replace(/MM/g, ('0' + (results[i].bid_date.getMonth() + 1)).slice(-2));
        format = format.replace(/DD/g, ('0' + results[i].bid_date.getDate()).slice(-2));
        format = format.replace(/hh/g, ('0' + results[i].bid_date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + results[i].bid_date.getMinutes()).slice(-2));

        results[i].bid_date = format;
      }
      connection.query(
        'SELECT * FROM sales_status',
        (error, options) => {
          if(error) {
              console.log('error conenction: ' + error.stack);
              return; 
          }
          let json_option = JSON.stringify(options);
          res.render('A_sales_lists.ejs', {values:results, options:options, json_option:json_option});
        }
      );
    }
  );
});



io_socket.on('connection', function(socket){
  console.log('connected');
  
  socket.on('c-sales-save', function(data){
    console.log('c-sales-save: ' + data);
    // DB処理
    let loop = Object.keys(data);
    if(loop != []){
        for(let i=0; i<loop.length; i++){
            let values = [];
            values[i] = [
                data[i].sales_state_ID,
                data[i].sales_ID
            ];
            connection.query(
                "UPDATE sales SET sales_status_ID=? WHERE sales_ID=?;", values[i],
                (error, results, fields) => {
                    if(error) {
                        console.log('error connecting: ' + error.stack);
                        res.status(400).send({ message: 'Error!!' });
                        return;
                    }
                    console.log(results);
                }
            );
        }
    }
    io_socket.emit('s-sales-save');
  });
});


app.listen(9000);