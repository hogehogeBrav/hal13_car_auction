'use strict'
// express
const express = require('express');
const app = express();
// socket
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);

// ejs用
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/views", {index: false}));
app.use(express.static(__dirname + "/public", {index: false}));
// POSTの値を受け取るため
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//DB接続用オブジェクトの作成
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'auction13'
});

//DB接続
connection.connect((error) => {
    if(error) {
        console.log('error_connecting: ' + error.stack);
        return;
    }
    console.log('success');
});

/*
// passport使用
const passport = require('passport');
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
        console.log(values);
        connection.query(
            'SELECT * FROM t01_users WHERE email=? AND password=?', values,
            (error, results) => {
                if(error) {
                    console.log('error connecting: ' + error.stack);
                    return;
                }
                const count = results.length;
                if(count == 0) {
                    return done(null, false); //NG
                }else {
                    return done(null, results[0]); //OK
                }
            }
        );
}));
*/

// 初期表示
app.get('/', (req, res)=> {
    connection.query(
        'SELECT * FROM sales',
        (error, results) => {
            if(error) {
                console.log('error conenction: ' + error.stack);
                return;
            }
            res.render('A_sales_lists.ejs', {values:results});
        }
    );
});


// ポート番号
http_socket.listen(9000);
