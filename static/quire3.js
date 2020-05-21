document.addEventListener('DOMContentLoaded', function(){
  //message_form_resize();
});



//window.addEventListener('resize', message_form_resize);
/*
тут целый эпос, так как напрямую нельзя использовать scroll 
пришлось городить временную фнкцию, запускаемую через задержку и т.п.
*/

var last_known_scroll_position = 0;

function move(){
  document.getElementById('send_message_form').style.top = window.innerHeight - document.getElementById('send_message_form').clientHeight - document.getElementById('foo').clientHeight - 10 + last_known_scroll_position + 'px';
}

//window.addEventListener('scroll', function () {
//  last_known_scroll_position = window.scrollY;
//  window.setTimeout(move, 100);
//});

//=========================================================


function message_form_resize(){
  // - 10 потому что при появлении вертикальной прокрутки событие resize не вызывается, и появляется еще и горизонтальная полоса
  // а это событие  работает только в firefox
  //document.documentElement.addEventListener('overflow', function() {
  // console.log('scollbar is visible');
  //}); 


  document.getElementById('send_message_form').style.width = document.querySelector('#messages_list').clientWidth - 10 +'px';
  // надо добавить проверку не выше ли левый угол нижней границы последнего элемента сообщений
  document.getElementById('send_message_form').style.top = window.innerHeight - document.getElementById('send_message_form').clientHeight - document.getElementById('foo').clientHeight - 10 +'px';
}
