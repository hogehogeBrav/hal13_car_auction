/**
 * システム名：HAL自動車オークションシステム
 * 
 * モーダル処理について記述したJavaScriptファイル
 * 
 * 作成者：小嶋美紀
 */
// 登録ボタン
const buttonOpen = document.getElementById('entry-btn');
const modal = document.getElementById('entryModal');
const buttonClose = document.getElementsByClassName('modalClose');
// body要素を取得
const body = document.getElementsByTagName('body')[0];
console.log(body);
// テーブルを取得
const stockTable = document.getElementById('stock-table');

// ボタンがクリックされた時
buttonOpen.addEventListener('click', modalOpen);
function modalOpen() {
  modal.style.display = 'block';
  body.classList.add('open');
}

// バツ印がクリックされた時
for(let i=0; i< buttonClose.length;i++){
  console.log(buttonClose[i]);
  buttonClose[i].addEventListener('click',(e)=>{
    modal.style.display = 'none';
    updateModal.style.display = 'none';
    body.classList.remove('open');
  },false);
}

// モーダルコンテンツ以外がクリックされた時
addEventListener('click', outsideClose);
function outsideClose(e) {
  if (e.target == modal || e.target == updateModal) {
    modal.style.display = 'none';
    updateModal.style.display = 'none';
  }
  body.classList.remove('open');
}

const updateOpen = document.getElementsByClassName('update-btn');
const updateModal = document.getElementById('updateModal');

for(let i=0; i< updateOpen.length;i++){
  updateOpen[i].addEventListener('click',(e)=>{
    updateModal.style.display = 'block';
    body.classList.add('open');  
  },false);
}
