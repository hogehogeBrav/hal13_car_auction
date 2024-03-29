"use strict"
const db = require("./settings/db");
const express = require('express');
const app = express();
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);
const passport = require('passport');
const mysql = require('mysql2');
const flash = require('connect-flash');
const cron = require('node-cron');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/views" , {index: false}));
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
  database: db.dbDatabase
});

// オークション情報取得SQL(TOP画面)
const indexsql = `SELECT auction.auction_ID, auction.car_ID, model.name, maker.maker_name, stock.grade, auction.start_time, auction.ending_time, auction.minimum_amount, MAX(auction_bid.amount) AS max_amount
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
          return done(null, false, {message: "メールアドレスまたはパスワードが正しくありません。"}); //NG
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
  console.log(req);
  res.render('U_login.ejs', {
    login: false,
    email: "",
    password: "",
    error: req.flash('error'),
    signup: 0,
  });
});
// ログイン認証
app.post('/login', passport.authenticate('local', {
  session: true,
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// ログアウト処理
app.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// サインアップ画面(アカウント登録)
app.post('/signup', (req, res) => {
  res.render('U_signup.ejs',{
    login: false,
    user: req.body.user,
    email: req.body.email,
    password: req.body.password,
    postcode: null,
    region: null,
    address: null,
    tel: null,
    error: req.flash('error')
  });
});
// サインアップ処理
app.post('/signup/confirm', (req, res) => {
  // 入力値フラグ
  let flag = true;
  // 入力値エラーメッセージ
  let error = "";
  if(req.body.user == "" || req.body.email == "" || req.body.password == "" || req.body.password_re == "" || req.body.postcode == "" || req.body.region == "" || req.body.address == "" || req.body.tel == ""){
    error = "入力されていない項目があります。すべての項目を入力してください。";
    flag = false;
  }
  if(req.body.password != req.body.password_re){
    error = "パスワードが一致しません。";
    flag = false;
  }
  if(!flag){
    res.render('U_signup.ejs',{
      login: false,
      user: req.body.user,
      email: req.body.email,
      password: req.body.password,
      password_re: "",
      postcode: req.body.postcode,
      region: req.body.region,
      address: req.body.address,
      tel: req.body.tel,
      error: error
    });
  }
  else{
    const values = [
      req.body.user,
      req.body.email,
      req.body.password,
      req.body.postcode,
      req.body.region + req.body.address,
      req.body.tel
    ];
    connection.query(
      "SELECT * FROM user WHERE email = ?;" , req.body.email ,
      (error, results) => {
        if (error) {
          console.log('error connecting: ' + error.stack);
          res.status(400).send({ message: 'Error!!' });
          return;
        }
        const count = results.length;
        if (count == 0) {
          connection.query(
            "INSERT INTO user (name, email, pass, postcode, address, tel) VALUES (? , ? , ? , ? , ? , ?);" , values ,
            (error, results) => {
              if (error) {
                console.log('error connecting: ' + error.stack);
                res.status(400).send({ message: 'Error!!' });
                return;
              }
              res.render('U_login.ejs',{
                login: false,
                email: req.body.email,
                password: req.body.password,
                error: "",
                signup: 1
              });
            });
        }else{
          res.render('U_signup.ejs',{
            login: false,
            user: req.body.user,
            email: req.body.email,
            password: req.body.password,
            postcode: req.body.postcode,
            region: req.body.region,
            address: req.body.address,
            tel: req.body.tel,
            error: "このメールアドレスは既に登録されています。"
          });
        }
      }
    );
  }
});

app.get('/notification', isAuthenticated, (req, res) => {
  connection.query(
    `SELECT * FROM notification 
    WHERE user_ID =` + req.user.user_ID + `
    ORDER BY notification_date DESC;`
    ,
    (error, results) => {
      console.log(results);
      if (error) {
        console.log('error connecting: ' + error.stack);
        res.status(400).send({ message: 'Error!!' });
        return;
      }
      res.render('U_notification.ejs' , {
        notification: results,
        login: true,
        name: req.user.name
      });
    }
  );
});

// オークション画面
app.get('/auction', isAuthenticated, (req, res) => {
  connection.query(
    `SELECT auction.auction_ID, auction.car_ID, model.name, maker.maker_name, auction.start_time, stock.grade, auction.ending_time, auction.minimum_amount, MAX(auction_bid.amount) AS max_amount 
    FROM auction 
    JOIN stock ON auction.car_ID = stock.car_ID 
    JOIN model ON stock.car_model_ID = model.car_model_ID 
    JOIN maker ON model.maker_ID = maker.maker_ID
    LEFT OUTER JOIN auction_bid ON auction.auction_ID = auction_bid.auction_ID
    GROUP BY auction.auction_ID
    ORDER BY auction.start_time DESC;` ,
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
    `SELECT *, auction.car_ID, auction.auction_ID, MAX(auction_bid.amount) as max_amount
    FROM auction 
    INNER JOIN stock
    ON (auction.car_ID = stock.car_ID)
    INNER JOIN option
    ON (auction.car_ID = option.car_ID)
    INNER JOIN model
    ON (stock.car_model_ID = model.car_model_ID)
    INNER JOIN maker
    ON (model.maker_ID = maker.maker_ID)
    LEFT OUTER JOIN auction_bid
    ON (auction.auction_ID = auction_bid.auction_ID)
    INNER JOIN color
    ON (stock.color_ID = color.color_ID)
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
        ORDER BY amount_time DESC;`,
        (error2, results2) => {
          if (error2) {
            console.log('error connecting: ' + error2.stack);
            res.status(400).send({ message: 'Error!!' });
            return;
          }
          if (results2.length == 0) {
            results2 = [{
              amount_time: 0,
              user_ID: null,
              name: null,
              amount: 0,
            }];
          }
          console.log(results2);
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

io_socket.on('connection', function(socket){
  console.log('connected');
  socket.on('c2s' , function(msg){
    io_socket.to(msg.auctionid).emit('s2c', msg);
  });
  socket.on('c2s-join', function(msg){
    console.log('c2s-join:' + msg.auctionid);
    socket.join(msg.auctionid);
  });
});

cron.schedule('* * * * *', () => {
  console.log('cron')
  // salesテーブル 情報追加
  connection.query(
    `INSERT INTO sales(auction_id, car_ID, user_ID, bid_price, bid_date, pay_deadline, sales_status_ID)
    SELECT auction.auction_ID, auction.car_ID, auction_bid.user_ID, MAX(auction_bid.amount), NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1
    FROM auction
    INNER JOIN auction_bid
    ON (auction.auction_ID = auction_bid.auction_ID)
    WHERE auction.ending_time < NOW() and auction.bid_status_ID = 0
    GROUP BY auction.auction_ID;
    `
  );
  // notificationテーブル 情報追加
  connection.query(
    `INSERT INTO notification(user_ID, title, message, already_read, notification_date)
    SELECT auction_bid.user_ID, CONCAT('落札金額支払いのお知らせ （', maker.maker_name, model.name, '）') , CONCAT(maker.maker_name, model.name, 'をあなたが落札しました！ 支払いリンクから一週間以内に代金をお支払いください。<br>落札期限 : ', DATE_ADD(NOW(), INTERVAL 7 DAY)), 0, NOW()
    FROM auction
    INNER JOIN auction_bid
    ON (auction.auction_ID = auction_bid.auction_ID)
    INNER JOIN stock
    ON (auction.car_ID = stock.car_ID)
    INNER JOIN model
    ON (stock.car_model_ID = model.car_model_ID)
    INNER JOIN maker
    ON (model.maker_ID = maker.maker_ID)
    WHERE auction.ending_time < NOW() and auction.bid_status_ID = 0
    GROUP BY auction.auction_ID;
    ` 
  );
  // auctionテーブル bid_status_ID更新
  connection.query(
    `UPDATE auction  
    SET bid_status_ID = 1
    WHERE auction.ending_time < NOW() and auction.bid_status_ID = 0;`,
  );
});

http_socket.listen(9000);