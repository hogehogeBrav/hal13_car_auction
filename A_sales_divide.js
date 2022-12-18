exports.main = function(connection,req,res) { //main関数に全ての処理を入れてadmin.jsに送信しています
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
        results[i].bid_date = formatDate(results[i].bid_date);
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
}



exports.update = function(connection,req,res) { //main関数に全ての処理を入れてadmin.jsに送信しています
  // DB処理
  console.log(req.body);
  let loop = Object.keys(req.body.id);
  if(loop != []){
      for(let i=0; i<loop.length; i++){
          let values = [];
          values[i] = [
              req.body.state_id[i],
              req.body.id[i]
          ];
          connection.query(
              "UPDATE sales SET sales_status_ID=? WHERE sales_ID=?;", values[i],
              (error, results) => {
                  if(error) {
                      console.log('error connecting: ' + error.stack);
                      res.status(400).send({ message: 'Error!!' });
                      return;
                  }
              }
          );
      }
      res.redirect('/sales');
  }
  
}



function formatDate(dateStrings){
  let format = 'YYYY年MM月DD日 hh:mm:ss';

  format = format.replace(/YYYY/g, dateStrings.substr(0, 4));
  format = format.replace(/MM/g, (dateStrings.substr(5, 2)));
  format = format.replace(/DD/g, dateStrings.substr(8, 2));
  format = format.replace(/hh/g, dateStrings.substr(11, 2));
  format = format.replace(/mm/g, dateStrings.substr(14, 2));
  format = format.replace(/ss/g, dateStrings.substr(17, 2));
  
  return format;
}