"use strict"
const db = require("./settings/db");
const express = require('express');
const app = express();
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);
const passport = require('passport');
const mysql = require('mysql2');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/view" , {index: false}));
app.use(express.static(__dirname + "/public" , {index: false}));
app.use(express.static(__dirname + "/js" , {index: false}));
app.use(express.static(__dirname + "/css" , {index: false}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const connection = mysql.createConnection({
  host: db.dbHost,
  user: db.dbUser,
  password: db.dbPassword,
  port: db.dbPort,
  database: db.dbDatabase
});

// オークション情報取得SQL(TOP画面)
const indexsql = `SELECT auction.auction_ID, model.name, maker.maker_name, stock.grade, auction.start_time, auction.ending_time, auction.minimum_amount, MAX(auction_bid.amount) AS max_amount
                  FROM auction 
                  JOIN stock ON auction.car_ID = stock.car_ID 
                  JOIN model ON stock.car_model_ID = model.car_model_ID 
                  JOIN maker ON model.maker_ID = maker.maker_ID
                  LEFT OUTER JOIN auction_bid ON auction.auction_ID = auction_bid.auction_ID
                  WHERE auction.start_time <= NOW() and NOW() <= auction.ending_time
                  GROUP BY auction.auction_id;`

// ログイン認証
app.use(passport.initialize());
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done){
    const values = [
      email,
      password
    ];
    connection.query(
      "SELECT * FROM user WHERE email = ? AND pass = ?;" , values , 
      (error, results) => {
        if (error) {
          console.log('error connecting: ' + error.stack);
          return;
        }
        const count = results.length;
        if (count == 0) {
          return done(null, false); //NG
        }else{
          return done(null, results[0]); //OK
        }
      }
    );
  }
));

var session = require('express-session');
const exp = require("constants");
app.use(session({
    secret: 'auction',
}));
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// ログインセッション管理
function isAuthenticated(req, res, next){
  if (req.isAuthenticated()) {  // 認証済
    return next();
  }
  else {  // 認証されていない
    connection.query(
      indexsql ,
      (error, results) => {
        console.log(results);
        if (error) {
          console.log('error connecting: ' + error.stack);
          res.status(400).send({ message: 'Error!!' });
          return;
        }
        res.render('U_index.ejs' , {
          now_auction: results,
          login: false
        });
      }
    ); // ログイン画面に遷移
  }
}

app.get('/', isAuthenticated, (req, res) => {
  connection.query(
    indexsql ,
    (error, results) => {
      console.log(results);
      if (error) {
        console.log('error connecting: ' + error.stack);
        res.status(400).send({ message: 'Error!!' });
        return;
      }
      res.render('U_index.ejs' , {
        now_auction: results,
        login: true,
        name: req.user.name
      });
    }
  );
});

// ログイン画面
app.get('/login', (req, res) => {
  res.render('U_login.ejs', {
    login: false
  });
});
// ログイン認証
app.post('/login', passport.authenticate('local', {
  session: true,
  successRedirect: '/',
  failureRedirect: '/login'
}));

// ログアウト処理
app.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// オークション画面
app.get('/auction', isAuthenticated, (req, res) => {
  connection.query(
    `SELECT auction.auction_ID, model.name, maker.maker_name, auction.start_time, stock.grade, auction.ending_time, auction.minimum_amount, MAX(auction_bid.amount) AS max_amount 
    FROM auction 
    JOIN stock ON auction.car_ID = stock.car_ID 
    JOIN model ON stock.car_model_ID = model.car_model_ID 
    JOIN maker ON model.maker_ID = maker.maker_ID
    LEFT OUTER JOIN auction_bid ON auction.auction_ID = auction_bid.auction_ID
    GROUP BY auction.auction_ID;` ,
    (error, results) => {
      console.log(results);
      if (error) {
        console.log('error connecting: ' + error.stack);
        res.status(400).send({ message: 'Error!!' });
        return;
      }
      res.render('U_auction.ejs', {
        login: true,
        auction: results,
        id: req.user.user_ID,
        name: req.user.name
      });
    });
});

app.get('/auction/:auction_ID', isAuthenticated, (req, res) => {
  connection.query(
    `SELECT *, auction.auction_ID, MAX(auction_bid.amount) as max_amount 
    FROM auction 
    INNER JOIN stock
    ON (auction.car_ID = stock.car_ID)
    INNER JOIN model
    ON (stock.car_model_ID = model.car_model_ID)
    INNER JOIN maker
    ON (model.maker_ID = maker.maker_ID)
    INNER JOIN auction_bid
    ON (auction.auction_ID = auction_bid.auction_ID)
    AND (auction.auction_ID = ` + req.params.auction_ID + `);`, 
    (error1, results) => {
      console.log(results);
      console.log(req.params);
      if (error1) {
        console.log('error connecting: ' + error1.stack);
        res.status(400).send({ message: 'Error!!' });
        return;
      }
      connection.query(
        `SELECT amount_time, auction_bid.user_ID, name, amount 
        FROM auction_bid 
        INNER JOIN user 
        ON (auction_bid.user_ID = user.user_ID) 
        WHERE auction_ID = ` + req.params.auction_ID + ` 
        ORDER BY amount_time ASC;`,
        (error2, results2) => {
          console.log(results2);
          if (error2) {
            console.log('error connecting: ' + error2.stack);
            res.status(400).send({ message: 'Error!!' });
            return;
          }
          // 入札金額
          var now_amount = results[0].max_amount;
          if(results[0].max_amount == null){
            now_amount = results[0].minimum_amount;
          }
          res.render('U_auction_room.ejs', {
            login: true,
            auction: results,
            auction_bid_history: results2,
            now_amount: now_amount,
            id: req.user.user_ID,
            name: req.user.name,
          });
        }
      );
    }
  );
});

app.post('/auction', isAuthenticated, (req, res) => {
  let values = [
    req.body.auctionid,
    req.body.id,
    req.body.amount,
  ];

  console.log(values);

  connection.query(
    "INSERT INTO auction_bid (auction_ID, user_ID, amount) VALUES (? , ? , ?);" ,
    values,
    (error, results , fields) => {
      if (error) {
        console.log('error connecting: ' + error.stack);
        res.status(400).send({ message: 'Error!!'});
        return;
      }
      res.write(JSON.stringify({ message: 'Success!!' }));
    }
  );
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

app.get('/Uform', isAuthenticated, (req, res)=> {
  let msg = "";
  // userID
  console.log(req.user.user_ID);
  if(req.query.msg){
    msg = "送信完了";
  }
  res.render('U_form.ejs', {id:req.user.user_ID, msg:msg});
});
app.post('/Uform', isAuthenticated, function(req, res){
  let today = new Date();
  today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const form = [
    req.body.user_ID,
    req.body.subject,
    req.body.content,
    today,
    1
  ];
console.log(form);
  connection.query(
      'INSERT INTO inquiry (user_ID, subject, content, date, inquiry_status_ID) VALUES (?,?,?,?,?)', form,
      (error, results) => {
          if(error) {
              console.log('error conenction: ' + error.stack);
              return; 
          }
          res.redirect('/Uform?msg=msg');
      }
  );
});


io_socket.on('connection', function(socket){
  console.log('connected');
  socket.on('c2s' , function(msg){
    io_socket.to(msg.auctionid).emit('s2c', msg);
  });
  socket.on('c2s-join', function(msg){
    console.log('c2s-join:' + msg.auctionid);
    socket.join(msg.auctionid);
  });
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

http_socket.listen(9000);