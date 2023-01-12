/**
 * システム名：HAL自動車オークションシステム
 * 
 * メーカー名選択時の車種自動絞り込みJavaScriptファイル
 * 
 * 作成者：小嶋美紀
 */
//メーカー車種選択
const makerSelect = document.getElementById('select-maker');
const modelOption = document.getElementsByClassName('model-option');
const modelSelect = document.getElementById('select-model');
const firstOption = document.getElementsByClassName('maker1');
for(let i=0; i< modelOption.length;i++){
  modelOption[i].style.display = "none";
}
for(let i=0; i< firstOption.length;i++){
  firstOption[i].style.display = "inline";
}
makerSelect.addEventListener('change', modelChange);
/**
 * 部署IDを選択した時にテキストボックスに変更前の部署名を表示する関数
 */
function modelChange() {
  modelSelect.options[0].selected = true; //初期選択に戻す
  // 全て非表示に戻す
  for(let i=0; i< modelOption.length;i++){
    modelOption[i].style.display = "none";
  }
  const idx = makerSelect.selectedIndex + 1;
  const activeOption = document.getElementsByClassName('maker' + idx);
  for(let i=0; i< activeOption.length;i++){
    activeOption[i].style.display = "inline";
  }
  console.log(idx);
}
