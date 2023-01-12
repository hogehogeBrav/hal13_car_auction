/**
 * システム名：HAL自動車オークションシステム
 * ファイル名：A_user.js
 * 画面名：ユーザー管理画面
 * 作成者：小嶋美紀
 */

/**
 * GET送信時用のメソッド(共通処理)
 * @param {} con DBコネクション
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
exports.main = async function(con,req,res) {
  //ユーザー管理画面を呼出
  res.render('A_user.ejs', {
    
  });
}


/**
 * POST実行時のメソッド(DB挿入処理)
 * @param {*} con DBコネクション
 * @param {*} req リクエスト
 * @param {*} res レスポンス
 */
exports.post = async function(con,req,res){
  
}

/**
 * ユーザー一覧取得用メソッド
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
