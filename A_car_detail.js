/**
 * システム名：HAL自動車オークションシステム
 * ファイル名：A_car_detail.js
 * 画面名：車両詳細画面
 * 作成者：小嶋美紀
 */

// 車両情報SQL文
let sql = 'SELECT stock.* , maker.maker_name AS maker_name, model.name AS model_name, run_status.run_status AS run_status, color.color_name AS color_category, body_type.body_type_name AS body_type, car_detail.*, option.*';
sql += ' FROM stock';
sql += ' INNER JOIN maker ON stock.maker_ID = maker.maker_ID';// メーカー名
sql += ' INNER JOIN model ON stock.car_model_ID = model.car_model_ID AND stock.maker_ID = model.maker_ID';//車種
sql += ' INNER JOIN run_status ON stock.run_status_ID = run_status.run_status_ID';//走行状態
sql += ' INNER JOIN color ON stock.color_ID = color.color_ID';//色
sql += ' INNER JOIN body_type ON stock.body_type_ID = body_type.body_type_ID';//ボディタイプ
sql += ' INNER JOIN car_detail ON stock.car_ID = car_detail.car_ID';//車両詳細
sql += ' INNER JOIN option ON stock.car_ID = option.car_ID';//装備品
sql += ' WHERE stock.car_ID = ?';
sql += ';'

exports.main = async function(con,req,res) {
  let car_info = await selectCar(con,sql,req.params.car_ID);
  console.log(car_info);
  //車両詳細画面を呼出
  res.render('A_car_detail.ejs', {
    car_info: car_info
  });
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
