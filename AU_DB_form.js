'use strict'
const { json } = require('express');
// express
const express = require('express');
const app = express();
// socket
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);

// ejs用
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/views", {index: false}));
app.use(express.static(__dirname + "/js", {index: false}));
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

// 初期表示
app.get('/Uform', (req, res)=> {
    window.sessionStorage.setItem(['user_ID'], ['1']);
    // connection.query(
    //     'SELECT s.sales_ID, s.bid_price, s.bid_date, s.sales_status_ID, ss.state, u.name as user_name, m.name as model_name FROM sales as s INNER JOIN sales_status as ss ON s.sales_status_ID = ss.sales_status_ID INNER JOIN user as u ON s.user_ID = u.user_ID INNER JOIN stock as st ON s.car_ID = st.car_ID INNER JOIN model as m ON st.car_model_ID = m.car_model_ID ORDER BY sales_ID DESC',
    //     (error, results) => {
    //         if(error) {
    //             console.log('error conenction: ' + error.stack);
    //             return;
    //         }

    //         connection.query(
    //             'SELECT * FROM sales_status',
    //             (error, options) => {
    //                 if(error) {
    //                     console.log('error conenction: ' + error.stack);
    //                     return; 
    //                 }
                    
    //                 let json_result = JSON.stringify(results);
    //                 let json_option = JSON.stringify(options);
    //                 res.render('A_sales_lists.ejs', {values:results, options:options, json_result:json_result, json_option:json_option});
    //             }
    //         );
    //     }
    // );
    // userID
    let user_ID = window.sessionStorage.getItem(['user_ID']);
    let msg = "";
    res.render('U_form.ejs', {user_ID:user_ID, msg:msg});
});

// 送信ボタン
app.post('/Uform', (res, req)=>{
    const form = [
        window.sessionStorage.getItem(['user_ID']),
        req.body.title,
        req.body.form_data
    ];

    // connection.query(
    //     'SELECT s.sales_ID, s.bid_price, s.bid_date, s.sales_status_ID, ss.state, u.name as user_name, m.name as model_name FROM sales as s INNER JOIN sales_status as ss ON s.sales_status_ID = ss.sales_status_ID INNER JOIN user as u ON s.user_ID = u.user_ID INNER JOIN stock as st ON s.car_ID = st.car_ID INNER JOIN model as m ON st.car_model_ID = m.car_model_ID ORDER BY sales_ID DESC',
    //     (error, results) => {
    //         if(error) {
    //             console.log('error conenction: ' + error.stack);
    //             return;
    //         }

    //         connection.query(
    //             'SELECT * FROM sales_status',
    //             (error, options) => {
    //                 if(error) {
    //                     console.log('error conenction: ' + error.stack);
    //                     return; 
    //                 }
                    
    //                 let json_result = JSON.stringify(results);
    //                 let json_option = JSON.stringify(options);
    //                 res.render('A_sales_lists.ejs', {values:results, options:options, json_result:json_result, json_option:json_option});
    //             }
    //         );
    //     }
    // );
    // connection.query(
    //     'INSERT-SQL', form,
    //     (error, results) => {
    //         if(error) {
    //             console.log('error conenction: ' + error.stack);
    //             return; 
    //         }

    //         // userID
    //         let user_ID = window.sessionStorage.getItem(['user_ID']);
    //         let msg = "送信完了";
    //         res.render('U_form.ejs', {user_ID:user_ID, msg:msg});
    //     }
    // );
    let user_ID = window.sessionStorage.getItem(['user_ID']);
            let msg = "送信完了";
            res.render('U_form.ejs', {user_ID:user_ID, msg:msg});
});

// お問い合わせ一覧画面
app.get('/Aform', (res, req)=>{
    // connection.query(
    //     'SELECT-SQL',
    //     (error, results) => {
    //         if(error) {
    //             console.log('error conenction: ' + error.stack);
    //             return;
    //         }

    //         connection.query(
    //             'SELECT * FROM sales_status',
    //             (error, options) => {
    //                 if(error) {
    //                     console.log('error conenction: ' + error.stack);
    //                     return; 
    //                 }
                    
    //                 let json_result = JSON.stringify(results);
    //                 let json_option = JSON.stringify(options);
    //                 res.render('A_sales_lists.ejs', {values:results, options:options, json_result:json_result, json_option:json_option});
    //             }
    //         );
    //     }
    // );
});

// 保存ボタン
// クライアントからの接続
// io_socket.on('connection', function(socket){
//     console.log('connected');

//     // クライアント(ブラウザ)⇒サーバ(Node.js)へSocket受信
//     socket.on('c-sales-save', function(data){
//         console.log('c-sales-save: ' + data);

//         // DB処理
//         let loop = Object.keys(data);
//         if(loop != []){
//             for(let i=0; i<loop.length; i++){
//                 let values = [];
//                 values[i] = [
//                     data[i].sales_state_ID,
//                     data[i].sales_ID
//                 ];
//                 connection.query(
//                     "UPDATE sales SET sales_status_ID=? WHERE sales_ID=?;", values[i],
//                     (error, results, fields) => {
//                         if(error) {
//                             console.log('error connecting: ' + error.stack);
//                             res.status(400).send({ message: 'Error!!' });
//                             return;
//                         }
//                         console.log(results);
//                     }
//                 );
//             }
//         }
//         io_socket.emit('s-sales-save');
//     });
// });


// ポート番号
http_socket.listen(9000);


