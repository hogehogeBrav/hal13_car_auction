// document.querySelector('.img__btn').addEventListener('click', function() {
//   document.querySelector('.cont').classList.toggle('s--signup');
// });

//ドキュメントロード時に、toastr のオプションを設定する
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "1000000000",
  "extendedTimeOut": "1000000000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "tapToDismiss": false
}

// アカウント登録完了トースト
if(signup == 1){
    // トースト通知
    toastr["success"]("アカウント登録が完了しました。ログインしてください。")
}