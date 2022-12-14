/**
 * システム名：HAL自動車オークションシステム
 * ファイル名：A_car_detail.js
 * 画面名：車両詳細画面
 * 作成者：小嶋美紀
 */

// 車両情報SQL文
let sql = 'SELECT stock.* , maker.maker_name AS maker_name, model.name AS model_name, run_status.run_status AS run_status, color.color_name AS color_category, body_type.body_type_name AS body_type, car_detail.*, option.*, drive.drive AS drive, fuel.fuel AS fuel, car_history.car_history AS car_history';
sql += ' FROM stock';
sql += ' INNER JOIN maker ON stock.maker_ID = maker.maker_ID';// メーカー名
sql += ' INNER JOIN model ON stock.car_model_ID = model.car_model_ID AND stock.maker_ID = model.maker_ID';//車種
sql += ' INNER JOIN run_status ON stock.run_status_ID = run_status.run_status_ID';//走行状態
sql += ' INNER JOIN color ON stock.color_ID = color.color_ID';//色
sql += ' INNER JOIN body_type ON stock.body_type_ID = body_type.body_type_ID';//ボディタイプ
sql += ' INNER JOIN car_detail ON stock.car_ID = car_detail.car_ID';//車両詳細
sql += ' INNER JOIN option ON stock.car_ID = option.car_ID';//装備品
sql += ' INNER JOIN drive ON car_detail.drive_ID = drive.drive_ID';//駆動方式
sql += ' INNER JOIN fuel ON car_detail.fuel_ID = fuel.fuel_ID';//燃料
sql += ' INNER JOIN car_history ON car_detail.car_history_ID = car_history.car_history_ID';//車歴
sql += ' WHERE stock.car_ID = ?';
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
  // 編集モーダル用情報
  let stock_list = await findAll(con,sql);
  let maker_list = await findAll(con,maker_sql);
  let model_list = await findAll(con,model_sql);
  let run_status_list = await findAll(con,run_status_sql);
  let color_list = await findAll(con,color_sql);
  let body_list = await findAll(con,body_sql);
  let drive_list = await findAll(con,drive_sql);
  let fuel_list = await findAll(con,fuel_sql);
  let car_history_list = await findAll(con,car_history_sql);
  //車両詳細情報
  let car_info = await selectCar(con,sql,req.params.car_ID);
  console.log(car_info);
  //車両詳細画面を呼出
  res.render('A_car_detail.ejs', {
    stock_list: stock_list,             //在庫全件
    maker_list: maker_list,             //メーカー全件
    model_list: model_list,             //車種全件
    run_status_list: run_status_list,   //走行状態
    color_list: color_list,             //色系統
    body_list: body_list,               //ボディタイプ
    drive_list: drive_list,             //駆動方式
    fuel_list: fuel_list,               //燃料
    car_history_list: car_history_list, //車歴
    car_info: car_info                  //車両詳細
  });
}

/**
 * 全件取得用メソッド
 * @param {*} con DBコネクション
 * @param {*} sql SQL文
 * @returns 取得したデータ
 */
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

/**
 * 車両詳細情報取得用メソッド
 * @param {*} con DBコネクション
 * @param {*} sql SQL文
 * @returns 取得したデータ
 */
async function selectCar (con,sql,carId) {
  const data = await new Promise((resolve, reject) => {
    con.query(sql, carId,
      (error, results) => {
        resolve({
          error: error,
          results: results
        });
      }
    );
  })
  return data.results[0];
}
