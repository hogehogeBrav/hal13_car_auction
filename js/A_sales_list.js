const checkboxs = document.getElementsByClassName("sales_list_check");
const state_values = document.getElementsByClassName("state_values");
const save_state = document.getElementById("save_state");

/**
 * 状態変更ボタン
*/
const btn_state = document.getElementById("state_btn");
const state_lists = document.getElementsByClassName("state_lists");
const tr_checkbox = document.getElementsByClassName("sales-list-tr");

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
        let class_name = "stock-row bg-" + state_values[work].value;
        tr_checkbox[on_checkboxs[i][0]].setAttribute('class' , "stock-row bg-" + state_values[work].value + " sales-list-tr");
        save_state.textContent = "未保存データ有り";
        console.log(save_state);
    }
});

/**
 * 帳票出力ボタン
*/


/**
 * 検索ボタン：モーダル
*/

