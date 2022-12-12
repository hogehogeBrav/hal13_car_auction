const socketio = io();
const form = document.getElementById('bid_form');
const amount_form = document.getElementById('amount_form');
const bid = document.getElementById('bid'); // 入札モーダルボタン
const bid_button = document.getElementById('bid_button'); // 入札モーダル内 入札ボタン
const bid_history = document.getElementById('bid_history'); // 入札履歴ボタン
const bid_history_modal = document.getElementById('bid_history_modal'); // 入札履歴モーダル
const numberWithComma = new Intl.NumberFormat(); // 3桁カンマ区切り

const time_container = document.getElementById('time-container'); // 残り時間表示
const hour = document.getElementById("diff_hour");
const min = document.getElementById("diff_min");
const sec = document.getElementById("diff_sec");

// 残り時間カウントダウン
function countdown() {
  const now = new Date();
  const diff = ending_time - now.getTime();

  // ミリ秒から単位を修正
  const calcHour = Math.floor(diff / 1000 / 60 / 60);
  const calcMin = Math.floor(diff / 1000 / 60) % 60;
  const calcSec = Math.floor(diff / 1000) % 60;

  // 取得した時間を表示（2桁表示）
  hour.innerHTML = calcHour < 10 ? '0' + calcHour : calcHour;
  min.innerHTML = calcMin < 10 ? '0' + calcMin : calcMin;
  sec.innerHTML = calcSec < 10 ? '0' + calcSec : calcSec;

  // 残り時間によって、カウントダウンの色を変更
  // 残り1時間未満でオレンジ
  if(diff <= 3600000) {
    time_container.style.borderColor = 'orange';
    time_container.style.color = 'orange';
    document.getElementsByClassName('status')[0].innerText = '残り1時間未満';
    document.getElementsByClassName('status')[0].style.backgroundColor = 'orange';
    // オークション終了時、カウントストップ
    if(diff <= 0) {
      clearInterval(timer);
      hour.innerHTML = '00';
      min.innerHTML = '00';
      sec.innerHTML = '00';

      amount_form.disabled = true;
      bid_button.disabled = true;
      bid_button.value = '終了しました';
      bid.disabled = true;
      bid.innerText = '終了しました';
      bid.style.backgroundColor = '#ccc';

      time_container.style.borderColor = 'red';
      time_container.style.color = 'red';
      // document.getElementsByClassName('diff_time')[0].innerText = 'このオークションは終了しました。';
      document.getElementsByClassName('status')[0].innerText = '終了しました';
      document.getElementsByClassName('status')[0].style.backgroundColor = 'red';
      toastr.error('このオークションは終了しました。');
    }
  }
}
countdown();
var timer = setInterval(countdown,100);

//ドキュメントロード時に、toastr のオプションを設定する
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "10000",
  "extendedTimeOut": "2000",
  "showEasing": "swing",
  "hideEasing": "linear",
}

// 日付フォーマット
function dateFormatter(date, format) {
  format = format.replace(/YYYY/, date.getFullYear());
  format = format.replace(/MM/, date.getMonth() + 1);
  format = format.replace(/DD/, date.getDate());
  format = format.replace(/hh/, date.getHours());
  format = format.replace(/mm/, date.getMinutes());
  format = format.replace(/ss/, date.getSeconds());
  return format;
}

function bidSuccessModal(){
  $('#bid_success_alert').iziModal('open');
}

// 入札金額チェック
function amountCheck(amount, now_amount){
  switch(true){
    // 入札金額が数値以外
    case isNaN(amount):
      swal("入札金額は数値で入力してください。");
      return false;
    // 入札金額が空の場合
    case amount == "":
      swal("入札金額を入力してください。");
      return false;
    // 入札金額が現在の入札金額より小さい場合
    case amount <= now_amount:
      swal("現在の入札金額より大きい金額を入力してください。");
      return false;
    default:
      return true;
  }
}

// 入札履歴モーダル
$(document).on('click', '#bid_history', function(event) {
  event.preventDefault();
  $('#bid_history_modal').iziModal('open');
});
$('#bid_history_modal').iziModal({
  title: '入札履歴',
  subtitle: '入札履歴を表示します',
});

// 入札モーダル
$(document).on('click', '#bid', function(event) {
  event.preventDefault();
  $('#bid_modal').iziModal('open');
});
$('#bid_modal').iziModal({
  title: '入札',
  subtitle: '入札金額を入力してください',
});

//入札モーダル 金額追加ボタン
$(document).on('click', '#add10000', function(event) {
  event.preventDefault();
  document.getElementById("amount_form").value = Number(document.getElementById('amount_form').value) + 10000;
});
$(document).on('click', '#add5000', function(event) {
  event.preventDefault();
  document.getElementById("amount_form").value = Number(document.getElementById('amount_form').value) + 5000;
});
$(document).on('click', '#add1000', function(event) {
  event.preventDefault();
  document.getElementById("amount_form").value = Number(document.getElementById('amount_form').value) + 1000;
});

// 入札モーダル閉じる
$(document).on('click', '#bid_button', function(event) {
  event.preventDefault();
  $('#bid_modal').iziModal('close');

  // 入札金額チェック
  if(amountCheck(document.getElementById('amount_form').value, now_amount)){
    const sendData = {
      auctionid: auctionid,
      id: userid,
      name: username,
      amount: document.getElementById("amount_form").value,
    }
  
    $.ajax({
      type: "POST",
      url: "/auction",
      data: sendData,
    }).done(function(results){
    }).fail(function(xhr, textStatus, errorThrown){
      console.log("ajax通信に失敗しました。");
    }).always(function(xhr){
    });

    // トースト通知
    toastr["success"]("10秒後に非表示になります", document.getElementById('amount_form').value + "円で入札しました");

    socketio.emit('c2s' , sendData);
  }
});

// ソケット通信
socketio.on('s2c' , function(msg){
  console.log('ソケットs2c: ' + msg);
  document.getElementById('now_amount').innerHTML = numberWithComma.format(msg.amount) + "円";
  document.getElementById('amount_form').value = msg.amount + 1000;
  now_amount = msg.amount;

  // トースト通知
  toastr["info"](new Date().toLocaleString(), msg.name + "さんが" + msg.amount + "円で入札しました")

  // 入札履歴モーダルのリストに追加
  var div = document.createElement('div');
  div.innerHTML = "<li>" + new Date().toLocaleString() + "</li><li>入札者: " + msg.name + "</li><li>入札金額: " + numberWithComma.format(msg.amount) + "</li>";
  // divにID追加
  div.id = "history_container";
  // 履歴モーダルの先頭に追加
  let parentnode = document.getElementById('bid_history_modal_lists');
  parentnode.insertBefore(div, parentnode.firstChild);
});

const sendData = {
  auctionid: auctionid,
}
socketio.emit('c2s-join' , sendData);