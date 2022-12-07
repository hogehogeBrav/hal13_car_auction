/**
 * システム名：HAL自動車オークションシステム
 * ファイル名：A_stock.js
 * 画面名：在庫管理画面
 * 作成者：小嶋美紀
 */

// 車両一覧SQL
let sql = 'SELECT stock.* , maker.maker_name AS maker_name, model.name AS model_name, run_status.run_status AS run_status, color.color_name AS color_category, body_type.body_type_name AS body_type';
sql += ' FROM stock';
sql += ' INNER JOIN maker ON stock.maker_ID = maker.maker_ID';
sql += ' INNER JOIN model ON stock.car_model_ID = model.car_model_ID AND stock.maker_ID = model.maker_ID';
sql += ' INNER JOIN run_status ON stock.run_status_ID = run_status.run_status_ID';
sql += ' INNER JOIN color ON stock.color_ID = color.color_ID';
sql += ' INNER JOIN body_type ON stock.body_type_ID = body_type.body_type_ID';
sql += ';'

const maker_sql = 'SELECT * FROM maker;';
const model_sql = 'SELECT * FROM model;';
const run_status_sql = 'SELECT * FROM run_status;';
const color_sql = 'SELECT * FROM color;';
const body_sql = 'SELECT * FROM body_type;';
const drive_sql = 'SELECT * FROM drive;';
const fuel_sql = 'SELECT * FROM fuel';
const car_history_sql = 'SELECT * FROM car_history';

exports.main = async function(con,req,res) {
  let stock_list = await findAll(con,sql);
  let maker_list = await findAll(con,maker_sql);
  let model_list = await findAll(con,model_sql);
  let run_status_list = await findAll(con,run_status_sql);
  let color_list = await findAll(con,color_sql);
  let body_list = await findAll(con,body_sql);
  let drive_list = await findAll(con,drive_sql);
  let fuel_list = await findAll(con,fuel_sql);
  let car_history_list = await findAll(con,car_history_sql);

  res.render('A_stock.ejs', {
    stock_list: stock_list,            //在庫全件
    maker_list: maker_list,            //メーカー全件
    model_list: model_list,            //車種全件
    run_status_list: run_status_list,  //走行状態
    color_list: color_list,            //色系統
    body_list: body_list,              //ボディタイプ
    drive_list: drive_list,            //駆動方式
    fuel_list: fuel_list,              //燃料
    car_history_list: car_history_list //車歴
  });

  // con.query( sql,
  //   (error, results) => {
  //     console.log(results);
  //     if (error) {
  //       console.log('error connecting: ' + error.stack);
  //       res.status(400).send({ message: 'Error!!' });
  //       return;
  //     }
  //     res.render('A_stock.ejs', {
  //       stock_list: results
  //     });
  // });
}

// function findAll(con,req,res,sql) {
//   con.query( sql,
//     (error, results) => {
//       console.log(results);
//       if (error) {
//         console.log('error connecting: ' + error.stack);
//         res.status(400).send({ message: 'Error!!' });
//         return;
//       }
//       // res.render('A_stock.ejs', {
//       //   stock_list: results
//       // });
//     }
//   );
// }


async function findAll (con,sql) {
  const data = await new Promise((resolve, reject) => {
    con.query(sql,
      (error, results) => {
        resolve({
          error: error,
          results: results
        });
      });
    })
  return data.results;
}

