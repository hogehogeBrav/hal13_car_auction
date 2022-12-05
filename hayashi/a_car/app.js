const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const mysql = require('mysql');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'auction13' 
});

// con.connect(function(err) {
// 	if (err) throw err;
// 	console.log('Connected');
// });

app.get('/', (req, res) => {
	const sql = "select * from auction";
	con.query(sql, function (err, result, fields) {  
	if (err) throw err;
	res.render('index',{auctions : result});
	});
});

app.post('/', (req, res) => {
	const sql = "INSERT INTO user SET ?"
	con.query(sql,req.body,function(err, result, fields){
		if (err) throw err;
		console.log(result);
		res.redirect('/');
	});
});

app.get('/create', (req, res) => 
	res.sendFile(path.join(__dirname, 'html/form.html')))

app.get('/edit/:id',(req,res)=>{
	const sql = "SELECT * FROM user WHERE user_ID = ?";
	con.query(sql,[req.params.id],function (err, result, fields) {  
		if (err) throw err;
		res.render('edit',{user : result});
		});
});

app.post('/update/:id',(req,res)=>{
	const sql = "UPDATE user SET ? WHERE user_ID = " + req.params.id;
	con.query(sql,req.body,function (err, result, fields) {  
		if (err) throw err;
		console.log(result);
		res.redirect('/');
		});
});

app.get('/delete/:id',(req,res)=>{
	const sql = "DELETE FROM user WHERE user_ID = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect('/');
	})
});

app.get('/detail/:id' ,(req,res)=>{
	const sql = "SELECT * FROM user WHERE user_ID = ?";
	con.query(sql,[req.params.id],function (err, result, fields) {  
		if (err) throw err;
		res.render('detail',{user : result});
		});
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`));