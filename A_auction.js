/**
 * システム名：HAL自動車オークションシステム
 * ファイル名：A_auction.js
 * 画面名：オークション管理画面
 * 作成者：小嶋美紀
 */

// 現在日時の取得
// const date = new Date();
// const currentTime = formattedDateTime(date);
// console.log(currentTime)
// SQL文
let stock_sql = 'SELECT stock.* , maker.maker_name AS maker_name, model.name AS model_name, run_status.run_status AS run_status, color.color_name AS color_category, body_type.body_type_name AS body_type';
stock_sql += ' FROM stock ';
stock_sql += ' INNER JOIN maker ON stock.maker_ID = maker.maker_ID';
stock_sql += ' INNER JOIN model ON stock.car_model_ID = model.car_model_ID AND stock.maker_ID = model.maker_ID';
stock_sql += ' INNER JOIN run_status ON stock.run_status_ID = run_status.run_status_ID';
stock_sql += ' INNER JOIN color ON stock.color_ID = color.color_ID';
stock_sql += ' INNER JOIN body_type ON stock.body_type_ID = body_type.body_type_ID';
stock_sql += ' WHERE car_ID NOT IN ( SELECT car_ID FROM auction )';
stock_sql += ';'
// 現在日時より後に開催されるオークションを検索するSQL文
let auction_sql = 'SELECT * FROM auction ';
auction_sql += 'WHERE CURRENT_DATE <= auction_date';
auction_sql += ';';

/**
 * GET送信時用のメソッド(共通処理)
 * @param {} con DBコネクション
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
exports.main = async function(con,req,res) {
  const stock_list = await findAll(con,stock_sql);
  const auction_list = await findAll(con,auction_sql);
  console.log(stock_list);
  res.render('A_auction.ejs', {
    stock_list: stock_list,
    auction_list: auction_list
  });
}


/**
 * POST実行時のメソッド(DB挿入処理)
 * @param {*} con DBコネクション
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
exports.insert = async function(con,req,res){
  
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

/**
 * 現在日時を返す関数
 * @param {*} date 
 * @returns 
 */
function formattedDateTime(date) {
  const y = date.getFullYear();
  const m = ('0' + (date.getMonth() + 1)).slice(-2);
  const d = ('0' + date.getDate()).slice(-2);
  // const h = ('0' + date.getHours()).slice(-2);
  // const mi = ('0' + date.getMinutes()).slice(-2);
  // const s = ('0' + date.getSeconds()).slice(-2);
  return y + "-" + m + "-" + d;
}