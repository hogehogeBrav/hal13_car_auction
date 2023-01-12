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

// 編集用SQL
const update_stock_sql = "UPDATE stock SET maker_ID = ?, car_model_ID = ?, grade = ?, displacement = ?, model_year = ?, import_model_year = ?, mileage = ?, run_status_ID = ?, color_ID = ?, color_name = ?, insurance_deadline = ?, mt_at = ?, body_type_ID = ?, car_type = ? WHERE car_ID = ?;";
const update_detail_sql ="UPDATE car_detail SET door = ?, ride_member = ?, drive_ID = ?, fuel_ID = ?, checking_memory = ?, repair_history = ?, car_number = ?, recycling_deposit = ?, import_route = ?, handle = ?, car_history_ID = ?, owner_history = ?, delivery_condition = ? WHERE car_ID = ?;";//先頭のcar_IDを削除
const update_option_sql ="UPDATE option SET air_conditioner = ?, smart_key = ?, sun_roof = ?, low_down = ?, power_steering = ?, cd = ?, leather_seat = ?, non_smoking = ?, power_window = ?, md = ?, aero_parts = ?, pet = ?, central_door_lock = ?, dvd = ?, genuine_alminium_wheel = ?, limited_edition = ?, abs = ?, tv = ?, skid_prevention = ? ,test_drive = ?, airbag = ?, navi = ?, traction_control = ?, manual = ?, etc = ? ,back_cam = ?, cold_climate = ?, warranty = ?, key_less = ?, electric_door = ?, welfare_vechicles = ?, spare_tire = ? WHERE car_ID = ?;";
// const update_option_sql ="UPDATE option SET ? WHERE car_ID = ?;";


exports.main = async function(con,req,res) {
  // 編集モーダル用情報
  console.log(req.params.car_ID);
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
    car_ID: req.params.car_ID,          //車両ID
    car_info: car_info                  //車両詳細
  });
}

// 編集されたときの処理
exports.update = async function(con,req,res){
  // 車両基本情報
  let stock_values = [
    req.body.maker_id, //select
    req.body.model_id, //select
    req.body.grade, //text
    req.body.displacement, //text
    req.body.model_year, //text
    req.body.import_model_year, //text
    req.body.mileage, //text
    req.body.runstatus_id, //select
    req.body.color_type, //select
    req.body.color_name, //text
    req.body.insurance_deadline, //text
    req.body.AT_MT, //select
    req.body.body_type_id, //select
    req.body.car_type, //text
    req.params.car_ID //get
  ];
  // 車両詳細情報
  let detail_values = [
    req.body.door,                //ドア数
    req.body.ride_member,         //乗車人数
    req.body.drive_id,            //駆動方式ID
    req.body.fuel_id,             //燃料ID
    req.body.check_memo,          //点検記録簿
    req.body.repair,              //修復歴
    req.body.car_number,          //車台番号
    req.body.recycle,             //リサイクル預託金
    req.body.route,               //輸入経路
    req.body.handle,              //ハンドル
    req.body.car_history_id,      //車歴ID
    req.body.owner_history,       //所有車歴
    req.body.delivery_condition,   //引き渡し条件
    req.params.car_ID
  ];
  // 車両装備品情報
  let option_values = [
    0,//air_conditioner //0
    0,// smart_key //1
    0,// sun_roof //2
    0,// low_down //3
    0,// power_steering //4
    0,// cd //5
    0,// leather_seat //6
    0,// non_smoking //7
    0,// power_window //8
    0,// md //9
    0,// aero_parts //10
    0,// pet //11
    0,// central_door_lock //12
    0,// dvd //13
    0,// genuine_alminium_wheel //14
    0,// limited_edition //15
    0,// abs //16
    0,// tv //17
    0,// skid_prevention //18
    0,// test_drive //19
    0,// airbag //20
    0,// navi //21
    0,// traction_control //22
    0,// manual //23
    0,// etc //24
    0,// back_cam //25
    0,// cold_climate //26 
    0,// warranty //27
    0,// key_less //28
    0,// electric_door //29
    0,// welfare_vechicles //30
    0,// spare_tire //31
    req.params.car_ID //32
  ];
  // チェックボックスの選択を配列に変換
  for(var key in option_values) {
    if(Array.isArray(req.body.parts)){
      for(var i=0; i<req.body.parts.length; i++){
        // console.log("key:" + key + "req:" + req.body.parts[i]);
        if(key == req.body.parts[i]){
          option_values[key] = 1;
        }
      }
    } else if(key == req.body.parts){
      option_values[req.body.parts] = 1;
    }
  }
  console.log(option_values);
  // DB更新
  await updateCar(con,update_stock_sql,stock_values);
  await updateCar(con,update_detail_sql,detail_values);
  await updateCar(con,update_option_sql,option_values,req.params.car_ID);
}

/**
 * 全件取得用メソッド
 * @param {*} con DBコネクション
 * @param {String} sql SQL文
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
 * @param {String} sql SQL文
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

/**
 * 車両情報編集用メソッド
 * @param {*} con DBコネクション
 * @param {String} sql SQL文
 * @param {Array} values 
 * @returns 取得したデータ
 */
async function updateCar(con,sql,values) {
  const data = await new Promise((resolve, reject) => {
    con.query(sql, values,
      (error, results) => {
        resolve({
          error: error,
          results: results
        });
        if (error) {
          console.log('error connecting: ' + error.stack);
          res.status(400).send({ message: 'Error!!' });
          return;
        }
        console.log('在庫更新完了');
      }
    );
  })
  return data.results.insertId;
}

// 削除機能追加予定
