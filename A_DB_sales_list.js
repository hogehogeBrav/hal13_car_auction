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
app.get('/', (req, res)=> {
    connection.query(
        'SELECT * FROM sales as s INNER JOIN sales_status as ss ON s.sales_status_ID = ss.sales_status_ID ORDER BY sales_ID DESC',
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
                // format = format.replace(/ss/g, ('0' + results[i].bid_date.getSeconds()).slice(-2));

                results[i].bid_date = format;
                // results[i].bid_date = displayTimestamp(results[i].bid_date);
            }


            connection.query(
                'SELECT * FROM sales_status',
                (error, options) => {
                    if(error) {
                        console.log('error conenction: ' + error.stack);
                        return; 
                    }
                    
                    let json_result = JSON.stringify(results);
                    let json_option = JSON.stringify(options);
                    res.render('A_sales_lists.ejs', {values:results, options:options, json_result:json_result, json_option:json_option});
                }
            );
        }
    );
});

app.get('/:sales', (req, res)=>{

});

// 保存ボタン
// クライアントからの接続
io_socket.on('connection', function(socket){
    console.log('connected');

    // クライアント(ブラウザ)⇒サーバ(Node.js)へSocket受信
    socket.on('c-sales-save', function(data){
        console.log('c-sales-save: ' + data);

        // DB処理
        let values = [];
        for(let i=0; i<data.length; i++){
            values[i] = [
                data[i].sales_ID,
                data[i].sales_status_ID
            ];
        }

        io_socket.emit('s-sales-save', values);
        // connection.query(
        //     // "INSERT INTO t02_chatmessage (chatid, id, username, message) VALUES (?,?,?,?);", values,
        //     "INSERT INTO sales (sales_ID, sales_status_ID) VALUES (?,?);", values,
        //     (error, results, fields) => {
        //         if(error) {
        //             console.log('error connecting: ' + error.stack);
        //             res.status(400).send({ message: 'Error!!' });
        //             return;
        //         }
        //         console.log(results);
        //         // サーバ(Node.js)⇒クライアント(ブラウザ)へSocekt送信
        //         io_socket.to(data.chatid).emit('s-sales-save', data);
        //     }
        // );
    });
});


// ポート番号
http_socket.listen(9000);
