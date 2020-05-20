var email;
var db_user_name;
var new_user_name;
var user_id;
var user_name;
var channel_id;

document.addEventListener('DOMContentLoaded', function(){
  check_server_reset();
  channel_bg();
  message_form_resize();
  check_user_registration();
  submit_check();
  login_actions();
  add_channel();
  add_new_channel_modal();
  add_channel_link_to_messages();
  add_message();
  activate_last_channel();
});


function check_server_reset(){
  // если сервер только что перезапущен, то никаких каналов еще нет
  if (document.getElementById('server_reset').innerHTML == 'true'){
    localStorage.removeItem('channel_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    alert('The server has been restarted.')
  }
}

/*
=========== CHANNELS BLOCK
*/

function activate_last_channel(){
  if (localStorage.getItem('channel_id')){
    channel_id = localStorage.getItem('channel_id');
    get_messages(channel_id);
  }
  else {
    //у пользователя канал не сохранен    
  }
}


function active_channel(channelid){
    if (document.querySelector('.active')){
      old_chnl = document.querySelector('.active');
      old_chnl.classList.remove('active');
      old_chnl.classList.remove('text-light');
      old_chnl.classList.remove('bg-secondary');
      old_chnl.classList.add('text-success');
      old_chnl.classList.add('bg-light');
      add_bg_change(old_chnl);
    }

    chnl = document.querySelector('[data-channel_id = "' + channelid +'"]');
    chnl.classList.add('active');
    chnl.onmouseover ='';
    chnl.onmouseout ='';
    chnl.classList.remove('bg-light');
    chnl.classList.remove('text-success');
    chnl.classList.remove('bg-dark');
    chnl.classList.add('bg-secondary');
    chnl.classList.add('text-light');
}


function channel_bg() {
  //изменение фона кнопок каналов при наведении мышки
  document.querySelectorAll('.chanel_name').forEach(function(channel_block) {
    add_bg_change(channel_block);
  })
}

function add_bg_change(channel_block){
    channel_block.onmouseover = function() {
        channel_block.classList.remove('bg-light');
        channel_block.classList.add('bg-dark');
    }
    channel_block.onmouseout = function() {
        channel_block.classList.remove('bg-dark');
        channel_block.classList.add('bg-light');
    }
}

function add_channel_link_to_messages(){
  document.querySelectorAll('.chanel_name').forEach(channel_btn => {
    channel_btn.onclick = () => {
      get_messages(channel_btn.dataset.channel_id);
    };
  });
}

function add_channel(){
    btn = document.getElementById('create_chn_btn');
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', function() {
      btn.onclick = function(){
        if (document.getElementById('channel_name').value !='') {
        $('#new_channel').modal('hide');
        const channel_name = document.getElementById('channel_name').value;
        const channel_owner = user_id;
        socket.emit('add_channel', {'channel_name': channel_name, 'channel_owner': channel_owner});
        }
        else {
          document.getElementById('channel_name').classList.remove('is-valid');
          document.getElementById('channel_name').classList.add('is-invalid');
        }
      }; 
    });

    socket.on('new_channel', data => {
    if (data.success === true){
      var frame = document.createElement("span");
      // после добавления канала считаем его активным
      localStorage.setItem('channel_id', data.channel_id);

      frame.setAttribute("class", "active chanel_name p-1 mb-1 border rounded bg-light text-success");
      frame.setAttribute("data", "owner");
      frame.dataset.owner = data.channel_owner;
      frame.setAttribute("data", "channel_id"); 
      frame.dataset.channel_id = data.channel_id;
      // получаем сообщения для установления ячейки свойств активного канала
      frame.onclick = () => {
        get_messages(frame.dataset.channel_id);
      };


      var bold = document.createElement('strong');
      var cnl_name = document.createTextNode(data.channel_name);
      bold.appendChild(cnl_name);
      frame.appendChild(bold);
      var badge = document.createElement("span");
      badge.setAttribute("class", "msg_count badge badge-primary badge-pill");
      var cnl_mess = document.createTextNode(data.total_messages);
      badge.appendChild(cnl_mess)
      frame.appendChild(badge);
      document.getElementById("channels_list").appendChild(frame);
      add_bg_change(frame);
      // разблокируем форму ввода сообщений
      document.querySelector('fieldset').removeAttribute('disabled');
      get_messages(data.channel_id);
    }
    if (data.success === false) {
      $('#duplicate').modal();
      document.getElementById('duplicatename').innerHTML = data.channel_name;
    }
  });
}

function add_new_channel_modal(){
  document.getElementById('add_channel').addEventListener("click", function(){
    $('#new_channel').modal();
    $('#new_channel').on('shown.bs.modal', function () {
      $('#channel_name').trigger('focus')
    })
    document.getElementById('channel_name').value = '';
    document.getElementById('channel_name').addEventListener('keydown', function(){
      if (document.getElementById('channel_name').value != ''){
      document.getElementById('channel_name').classList.remove('is-invalid');
      document.getElementById('channel_name').classList.add('is-valid');
      }
      else {
        document.getElementById('channel_name').classList.remove('is-valid');
        document.getElementById('channel_name').classList.add('is-invalid');
      }
    });
  });
}


/*
=========== MESSAGES BLOCK
*/

function add_message(){
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', function() {
      document.getElementById("message_form").addEventListener("submit", function(event){
        event.preventDefault();
        if (document.getElementById('message_text').value !='') {
          var message_text = document.getElementById('message_text').value;
          document.getElementById('message_text').value = '';
          // timestamp назначаем на стороне сервера 
          socket.emit('add_message', {'channel_id': channel_id, 'message_text': message_text, "user_id": localStorage.getItem('user_id'), "user_name": localStorage.getItem('username') });
        }
      });
    });

    socket.on('new_message', data => {
    if (data.success != false){
      draw_message_block(data.owner_id, data.id, data.text, data.owner_name, data.timestamp)
      document.querySelector('[data-channel_id = "' + data.channel_id +'"]').querySelector('.msg_count').innerHTML = data.messages_counter;
      if (data.redrow == true){
        // если больше 100 сообщений, то перерисовываем все, так как первое уже удалено
        get_messages(data.channel_id)
      }
    }
    else {
        alert('NO nEW MESSAGE')
    }
  });
}

function get_messages(channelid){
  // разблокируем форму ввода сообщений
  document.querySelector('fieldset').removeAttribute('disabled');
  // при загрузке сообщений устанавливаем текущий активный канал в storage
  channel_id = channelid;
  localStorage.setItem('channel_id', channelid);
  document.querySelector('#channel_caption').innerHTML = 'CHANNEL "' + document.querySelector('[data-channel_id = "' + channelid +'"]').querySelector('strong').innerHTML +'" DETAILS';
  $.get( "get_messages", { channel_id } )
    .done(function( data ) {
      active_channel(channel_id);
      document.getElementById('messages_list').innerHTML = "";
      if (data['success'] == false){
        var empty = document.createElement("span");
        empty.classList.add('no_msg');
        var nomessage1 = document.createTextNode("Hello!");
        var nomessage2 = document.createTextNode("There is no message yet.");
        var br = document.createElement('br');
        empty.appendChild(nomessage1);
        empty.appendChild(br);
        empty.appendChild(nomessage2);
        document.getElementById('messages_list').appendChild(empty);
      }
      else {
        for (var i = 0; i < data.length; i++){
          draw_message_block(data[i]["owner_id"], data[i]["id"], data[i]["text"], data[i]["owner_name"], data[i]["timestamp"])
        }
      }
  })
}

function draw_message_block(owner_id, id, text, owner_name, timestamp){
  // если остался текст заглушка от пустого канала -удаляем
  if (document.querySelector('.no_msg')){
    document.querySelector('.no_msg').remove();
  }
  var message_span = document.createElement("span");
  message_span.setAttribute("class", "message_block p-1 mb-1 border rounded d-flex w-100 justify-content-between");
  message_span.setAttribute("data", "id");
  message_span.dataset.id = id;
  message_span.setAttribute("data", "owner_id");
  message_span.dataset.owner_id =  owner_id;
  var parag = document.createElement("p"); 
  var bold = document.createElement('strong');
  var owner_n = document.createTextNode(owner_name +':');                   
  var brr = document.createElement("br");
  var msg_txt = document.createTextNode(text);
  bold.appendChild(owner_n);
  parag.appendChild(bold);
  parag.appendChild(brr);
  parag.appendChild(msg_txt);
  message_span.appendChild(parag);
  sml = document.createElement("small");
  sml.setAttribute("class", "text-danger");
  var timestamp = document.createTextNode(timestamp);
  sml.appendChild(timestamp);
  message_span.appendChild(sml);
  messages_list.appendChild(message_span);
}

/*
=========== LOGIN BLOCK
*/

function login_actions() {
  // добавляем logout
  document.getElementById('logout').addEventListener("click", function(){
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('channel_id')
  }); 
  
  // заходим со старым именем
  document.getElementById('log_with_old_btn').addEventListener("click", function(){
    login( email, db_user_name, user_id);
    }); 
  
  // заходим с новым именем, обновляя его в БД
  document.getElementById('log_with_new_btn').addEventListener("click", function(){
    $.get( "change_name", { email, new_user_name } )
      .done(function( data ) {
        if (data['success'] == false){
          $('#email_exists').modal('hide');
          $('#registration').modal('show');
          document.getElementById('error_with_db_update').classList.remove('d-none');
        }
        else {
          login( email, new_user_name, user_id);            
        }
      })
    }); 
    
    // возвращаемся к первому окну
    document.getElementById('correct_btn').addEventListener("click", function(){
      $('#email_exists').modal('hide');
      $('#registration').modal('show');
    })
}


function submit_check(){
  document.getElementById('registration_form').addEventListener('submit', function(event){
    event.preventDefault();
    new_user_name = document.getElementById('username').value;
    email = document.getElementById('email').value;
    if (check_name(new_user_name)) {
      check_email(email, new_user_name);    
    }
  });  
}


function check_user_registration() {
  if (!localStorage.getItem('username') || !localStorage.getItem('email') || !localStorage.getItem('user_id')){
    $('#registration').modal({ backdrop: 'static', keyboard: false })
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('error_with_db_update').classList.add('d-none');
  }
  else {
    document.getElementById('user_label').innerHTML = 'Hi, ' + localStorage.getItem('username') + '!';
    db_user_name = localStorage.getItem('username');
    user_id = localStorage.getItem('user_id');
  } 
}

function check_name(new_user_name){
    if (new_user_name === "") {
        document.getElementById('username').classList.remove('is-valid');
        document.getElementById('username').classList.add('is-invalid');
        return false;
    }
    else {
        document.getElementById('username').classList.remove('is-invalid');
        document.getElementById('username').classList.add('is-valid');
        return true; 
    }
}


function check_email(email, new_user_name){
    var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    if (email != "" && pattern.test(email)){
        $.get( "check", { email } )
            .done(function( data ) {
                // если такой мыл есть
                if (data['success'] == false){
                    document.getElementById('email').classList.remove('is-invalid');
                    document.getElementById('email').classList.add('is-valid');
                    db_user_name = data['username'];
                    user_id = data['user_id'];
                    if (db_user_name == new_user_name) {
                        // если такая электропочта есть и имя совпадает с БД, входим
                        login(email, new_user_name, user_id);               
                    }
                    else {
                        // если почта есть но имя другое - выводим запрос на дальнейшие действия
                        $('#registration').modal('hide');
                        $('#email_exists').modal({ backdrop: 'static', keyboard: false })
                        $('#email_exists').find('#email_block').text(email);
                        $('#email_exists').find('#name_block1').text(db_user_name);
                        $('#email_exists').find('#name_block2').text(db_user_name);
                        $('#email_exists').find('#new_name_block1').text(' \''+new_user_name+'\'');
                        $('#email_exists').find('#new_name_block2').text(new_user_name);
                    }
                    return true;
                }
                // если такой комбинации имени и электропочты нет
                if (data['success'] == true){
                    document.getElementById('email').classList.remove('is-invalid');
                    document.getElementById('email').classList.add('is-valid');
                    add_new_user(email, new_user_name);
                    return true;
                }
        });
   }
   else {
        document.getElementById('email').classList.remove('is-valid');
        document.getElementById('email').classList.add('is-invalid');
        document.getElementById('email_error').innerHTML = 'Please enter an email.';
        return false;
   }
}


function add_new_user(email, new_user_name){
  $.get( "add_new_user", { email, new_user_name } )
    .done(function( data ) {
      login(data['email'], data['username'], data['user_id']);
    });
}

function login(email, user_name, user_id){
    $('#email_exists').modal('hide');
    $('#registration').modal('hide');
    localStorage.setItem('username', user_name);
    localStorage.setItem('email', email);
    localStorage.setItem('user_id', user_id);
    user_name = user_name;
    user_id = user_id;
    document.getElementById('user_label').innerHTML = 'Hi, ' + user_name + '!';
    // так и не понимаю, зачем я тут запускаю эту функцию...
    //add_channel();
    // если канал был сохранен, то загружаем его
    if (localStorage.getItem('channel_id')){
      channel_id =  localStorage.getItem('channel_id');
      get_messages(channel_id);
    }
    else{
      
      var span = document.createElement('span');
      var br = document.createElement('br');
      var h4 = document.createElement('h4');
      h4.classList.add('text-warning');
      var text1 = document.createTextNode('Hello!');
      var text2 = document.createTextNode('For beginning choose a channel at the left column, or create one if there is no channel yet.');
      h4.appendChild(text1);
      h4.appendChild(br);
      h4.appendChild(text2);
      span.appendChild(h4);
      var ml = document.getElementById('messages_list');
      ml.innerHTML = '';
      ml.appendChild(span);
    }
}

/*
========== PAGE FUNCTIONS
*/

window.addEventListener('resize', message_form_resize);
/*
тут целый эпос, так как напрямую нельзя использовать scroll 
пришлось городить временную фнкцию, запускаемую через задержку и т.п.
*/

var last_known_scroll_position = 0;

function move(){
  document.getElementById('send_message_form').style.top = window.innerHeight - document.getElementById('send_message_form').clientHeight - document.getElementById('foo').clientHeight - 10 + last_known_scroll_position + 'px';
}

window.addEventListener('scroll', function () {
  last_known_scroll_position = window.scrollY;
  window.setTimeout(move, 100);
});

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
