const checkboxs = document.getElementsByClassName("sales_list_check");
const state_values = document.getElementsByClassName("state_values");
const socket_io = io();

/**
 * 検索ソート
*/

/**
 * 状態変更ボタン
*/
const btn_state = document.getElementById("state_btn");
const state_lists = document.getElementsByClassName("state_lists");

let update_state = [];

// results = results.replace(/&#34;/g, "\"");
options = options.replace(/&#34;/g, "\"");

console.log(JSON.parse(options));
let options_list = JSON.parse(options);

btn_state.addEventListener('click', (e)=>{
    // checkbox：チェック済み
    let on_checkboxs= [];
    for(let i=0; i < checkboxs.length; i++){
        if(checkboxs[i].checked){
            on_checkboxs.push([i, checkboxs[i].value]);
            
        }
    }
    // status変更
    for(let i=0; i < on_checkboxs.length; i++){
        let work = on_checkboxs[i][0];

        // state_ID変更
        state_values[work].value++;
        if(options_list[state_values[work].value - 1] == null){
            state_values[work].value = 1;
        }

        state_lists[on_checkboxs[i][0]].textContent = options_list[state_values[work].value - 1].state;
    }
});

/**
 * 帳票出力ボタン
*/


/**
 * 保存ボタン
*/
const btn_save = document.getElementById("save_btn");


btn_save.addEventListener('click', (e) => {
    // 更新データ
    const sendData = {};
    for(let i=0; i < state_values.length; i++){
        // checkboxs[i].value: sales_ID
        // state_values[i].value: state_ID
        sendData[i] = {
            sales_ID:checkboxs[i].value,
            sales_state_ID:state_values[i].value
        }
    }
console.log(sendData);
let json_option = JSON.stringify(sendData);
    // クライアント(ブラウザ)⇒サーバ(Node.js)へSocket送信
    socket_io.emit("c-sales-save", sendData);
});


// サーバ(Node.js)⇒クライアント(ブラウザ)へSocket受信
socket_io.on('s-sales-save', function(msg){
    
    alert('保存完了');
});