# hal13_car_auction

## 要確認

- 定期的に [npm install] 行ってパッケージを更新してください

``` sh
npm install
```

- データベース設定は /settings/db_example.jsを参考にして db.js にリネームして各自の環境に合わせて使ってください

``` js
// データベース設定
exports.dbHost = 'localhost';
exports.dbUser = 'root';
exports.dbPassword = '';
exports.dbPort = 1000;
exports.dbDatabase = 'auction13';
```

## node起動

- ユーザ側 index.js

``` sh
nodemon index.js
```

- 管理者側

``` sh
nodemon admin.js
```