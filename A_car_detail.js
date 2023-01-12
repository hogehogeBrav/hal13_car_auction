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

// 編集機能追加予定
const update_stock_sql = "UPDATE stock SET maker_ID = ?, car_model_ID = ?, grade = ?, displacement = ?, model_year = ?, import_model_year = ?, mileage = ?, run_status_ID = ?, color_ID = ?, color_name = ?, insurance_deadline = ?, mt_at = ?, body_type_ID = ?, car_type = ? WHERE car_ID = ?;";
const update_detail_sql ="UPDATE car_detail SET door = ?, ride_member = ?, drive_ID = ?, fuel_ID = ?, checking_memory = ?, repair_history = ?, car_number = ?, recycling_deposit = ?, import_route = ?, handle = ?, car_history_ID = ?, owner_history = ?, delivery_condition = ? WHERE car_ID = ?;";//先頭のcar_IDを削除
const update_option_sql ="UPDATE option SET air_conditioner = ?, smart_key = ?, sun_roof = ?, low_down = ?, power_steering = ?, cd = ?, leather_seat = ?, non_smoking = ?, power_window = ?, md = ?, aero_parts = ?, pet = ?, central_door_lock = ?, dvd = ?, genuine_alminium_wheel = ?, limited_edition = ?, abs = ?, tv = ?, skid_prevention = ? ,test_drive = ?, airbag = ?, navi = ?, traction_control = ?, manual = ?, etc = ? ,back_cam = ?, cold_climate = ?, warranty = ?, key_less = ?, electric_door = ?, welfare_vechicles = ?, spare_tire = ? WHERE car_ID = ? ;";
function updateCar(con,sql,carId) {

}

let option_values = {
  // air_conditioner: 0,//2
  // smart_key: 0,//3
  // sun_roof:0 ,//4
  // low_down: 0,//5
  // power_steering: 0,//6
  // cd: 0,//7
  // leather_seat: 0,//8
  // non_smoking: 0,//9
  // power_window: 0,//10
  // md: 0,//11
  // aero_parts: 0, //12
  // pet: 0,//13
  // central_door_lock: 0,//14
  // dvd: 0,//15
  // genuine_alminium_wheel: 0,//16
limited_edition: 0,//17
abs: 0,//18
tv: 0,//19
skid_prevention: 0,//20
test_drive: 0,//21
airbag: 0,//22
navi: 0,//23
traction_control: 0,//24
manual: 0,//25
etc: 0,//26
back_cam: 0,//27
cold_climate: 0,//28 
warranty: 0,//29
key_less: 0,//30
electric_door: 0,//31
welfare_vechicles: 0,//32
spare_tire: 0//33
                                                                                                                              };

// 削除機能追加予定
