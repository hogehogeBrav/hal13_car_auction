/**
 * システム名：HAL自動車オークションシステム
 * ファイル名：A_stock.js
 * 画面名：在庫管理画面
 * 作成者：小嶋美紀
 */

// 車両一覧SQL文
let sql = 'SELECT stock.* , maker.maker_name AS maker_name, model.name AS model_name, run_status.run_status AS run_status, color.color_name AS color_category, body_type.body_type_name AS body_type';
sql += ' FROM stock';
sql += ' INNER JOIN maker ON stock.maker_ID = maker.maker_ID';
sql += ' INNER JOIN model ON stock.car_model_ID = model.car_model_ID AND stock.maker_ID = model.maker_ID';
sql += ' INNER JOIN run_status ON stock.run_status_ID = run_status.run_status_ID';
sql += ' INNER JOIN color ON stock.color_ID = color.color_ID';
sql += ' INNER JOIN body_type ON stock.body_type_ID = body_type.body_type_ID';
sql += ' ORDER BY stock.car_ID ASC';
sql += ';'
const maker_sql = 'SELECT * FROM maker;';
const model_sql = 'SELECT * FROM model;';
const run_status_sql = 'SELECT * FROM run_status;';
const color_sql = 'SELECT * FROM color;';
const body_sql = 'SELECT * FROM body_type;';
const drive_sql = 'SELECT * FROM drive;';
const fuel_sql = 'SELECT * FROM fuel';
const car_history_sql = 'SELECT * FROM car_history';
// INSERT用SQL文
const stock_sql ="INSERT INTO stock (maker_ID, car_model_ID, grade, displacement, model_year, import_model_year, mileage, run_status_ID, color_ID, color_name, insurance_deadline, mt_at, body_type_ID, car_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
const detail_sql ="INSERT INTO car_detail (car_ID, door, ride_member, drive_ID, fuel_ID, checking_memory, repair_history, car_number, recycling_deposit, import_route, handle, car_history_ID, owner_history, delivery_condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
const option_sql ="INSERT INTO option SET ?;";
const ai_sql = "SELECT AUTO_INCREMENT FROM information_schema.tables WHERE  TABLE_SCHEMA = 'auction13' AND TABLE_NAME = 'stock';"
// const option_sql ="INSERT INTO option (car_ID, air_conditioner, smart_key, sun_roof, low_down, power_steering, cd, leather_seat, non_smoking, power_window, md, aero_parts, pet, central_door_lock, dvd, genuine_alminium_wheel, limited_edition, abs, tv, skid_prevention, test_drive, airbag, navi, traction_control, manual, etc, back_cam, cold_climate, warranty, key_less, electric_door, welfare_vechicles, spare_tire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

/**
 * GET送信時用のメソッド(共通処理)
 * @param {} con DBコネクション
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
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
  let ai = await findAll(con,ai_sql);

  console.log(stock_list);
  //在庫管理画面を呼出
  res.render('A_stock.ejs', {
    stock_list: stock_list,            //在庫全件
    maker_list: maker_list,            //メーカー全件
    model_list: model_list,            //車種全件
    run_status_list: run_status_list,  //走行状態
    color_list: color_list,            //色系統
    body_list: body_list,              //ボディタイプ
    drive_list: drive_list,            //駆動方式
    fuel_list: fuel_list,              //燃料
    ai: ai,                            //AUTO_INCREMENT
    car_history_list: car_history_list //車歴
  });
}


/**
 * POST実行時のメソッド(DB挿入処理)
 * @param {*} con DBコネクション
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
exports.insert = async function(con,req,res){
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
    req.body.car_type //text
  ];
  let detail_values = [
    0,                            //car_ID
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
    req.body.delivery_condition   //引き渡し条件
  ];
  let option_values = {
    car_ID: 0,//1
    air_conditioner: 0,//2
    smart_key: 0,//3
    sun_roof:0 ,//4
    low_down: 0,//5
    power_steering: 0,//6
    cd: 0,//7
    leather_seat: 0,//8
    non_smoking: 0,//9
    power_window: 0,//10
    md: 0,//11
    aero_parts: 0, //12
    pet: 0,//13
    central_door_lock: 0,//14
    dvd: 0,//15
    genuine_alminium_wheel: 0,//16
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
  // チェックボックスの選択を配列に変換
  for(var key in option_values) {
    if(Array.isArray(req.body.parts)){
      for(var i=0; i<req.body.parts.length; i++){
        if(key == req.body.parts[i]){
          option_values[key] = 1;
        }
      }
    } else if(key == req.body.parts){
      option_values[key] = 1;
    }
  }
  // 在庫テーブル(stock)に登録
  let insertId = await insertStock(con,stock_sql,stock_values);
  // 車両IDを取得し車両詳細テーブル(car_detail)、装備品テーブル(option)に登録
  detail_values[0] = insertId;
  option_values['car_ID'] = insertId;
  await insertStock(con,detail_sql,detail_values);
  await insertStock(con,option_sql,option_values);
}

/**
 * 在庫一覧取得用メソッド
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
 * 在庫登録用のDB接続メソッド
 * @param {*} con DBコネクション
 * @param {*} sql SQL文
 * @param {*} values 登録情報
 * @returns 追加したカラムの主キー
 */
async function insertStock (con,sql,values){
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
        console.log('在庫登録完了');
      }
    );
  })
  return data.results.insertId;
}
