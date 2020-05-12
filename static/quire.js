document.addEventListener('DOMContentLoaded', function() {
    //изменение фона кнопок каналов при наведении мышки
    document.querySelectorAll('.chanel_name').forEach(function(chanel_block) {
      chanel_block.onmouseover = function() {
        chanel_block.classList.remove('bg-light');
        chanel_block.classList.add('bg-dark');
      }
      chanel_block.onmouseout = function() {
        chanel_block.classList.remove('bg-dark');
        chanel_block.classList.add('bg-light');
      }
    })
});


function message_form_resize(){
  document.getElementById('send_message_form').style.width = document.querySelector('.message_block').clientWidth +'px';
  // надо добавить проверку не выше ли левый угол нижней границы последнего элемента сообщений
  document.getElementById('send_message_form').style.top = window.innerHeight - document.getElementById('send_message_form').clientHeight - document.getElementById('foo').clientHeight - 10 +'px';
}

window.addEventListener('resize', message_form_resize);
document.addEventListener('DOMContentLoaded', message_form_resize);


document.addEventListener('DOMContentLoaded',function(){
  if (!localStorage.getItem('username') && !localStorage.getItem('email')){
    $('#registration').modal({ backdrop: 'static', keyboard: false })//localStorage.setItem('counter', 0);
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('error_with_db_update').classList.add('d-none');
  }
  else {
    document.getElementById('user_label').innerHTML = 'Hi, ' + localStorage.getItem('username') + '!';
  } 
});