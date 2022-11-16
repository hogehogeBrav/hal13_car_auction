/**
 * システム名：HAL自動車オークションシステム
 * 
 * モーダル処理について記述したJavaScriptファイル
 * 
 * 作成者：小嶋美紀
 */
const buttonOpen = document.getElementById('entry-btn');
const modal = document.getElementById('entryModal');
const buttonClose = document.getElementsByClassName('modalClose')[0];
// body要素を取得
const body = document.getElementsByTagName('body')[0];
console.log(body);

// ボタンがクリックされた時
buttonOpen.addEventListener('click', modalOpen);
function modalOpen() {
  modal.style.display = 'block';
  body.classList.add('open');
}

// バツ印がクリックされた時
buttonClose.addEventListener('click', modalClose);
function modalClose() {
  modal.style.display = 'none';
  body.classList.remove('open');
}

// モーダルコンテンツ以外がクリックされた時
addEventListener('click', outsideClose);
function outsideClose(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
  body.classList.remove('open');
}

