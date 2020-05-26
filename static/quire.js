var email;
var user_id;
var user_name;
var channel_id;

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', function(){
  check_server_reset();
  channel_bg();
  message_form_resize();
  check_user_registration();
  submit_check();
  login_actions();
  add_channel();
  del_message();
  add_new_channel_modal();
  add_channel_link_to_messages();
  add_message();
  activate_last_channel();
});

function check_server_reset(){
  // если сервер только что перезапущен, то никаких каналов еще нет
  if (document.getElementById('server_reset').innerHTML == 'true'){
    localStorage.removeItem('channel_id');
    localStorage.removeItem('user_name');
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
    //alert('NO last channel');   
  }
}


function active_channel(channelid){
    document.querySelectorAll('.active').forEach(function(old_chnl){
      old_chnl = document.querySelector('.active');
      old_chnl.classList.remove('active');
      old_chnl.classList.remove('text-light');
      old_chnl.classList.remove('bg-secondary');
      old_chnl.classList.add('text-success');
      old_chnl.classList.add('bg-light');
      add_bg_change(old_chnl);
    })

    document.querySelectorAll('[data-channel_id = "' + channelid +'"]').forEach(function(chnl){
      chnl.classList.add('active');
      chnl.onmouseover ='';
      chnl.onmouseout ='';
      chnl.classList.remove('bg-light');
      chnl.classList.remove('text-success');
      chnl.classList.remove('bg-dark');
      chnl.classList.add('bg-secondary');
      chnl.classList.add('text-light');
    })
}


function channel_bg() {
  //изменение фона кнопок каналов при наведении мышки
  document.querySelectorAll('.chanel_name').forEach(function(channel_block) {
    add_bg_change(channel_block);
    add_bg_change(document.querySelector('.add_channel'));
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
    socket.on('connect', function() {
      btn.onclick = function(){
        if (document.getElementById('channel_name').value !='') {
        $('#new_channel').modal('hide');
        const channel_name = document.getElementById('channel_name').value;
        const channel_owner = user_id;
        socket.emit('add_channel', {'channel_name': encodeURI(channel_name), 'channel_owner': channel_owner});
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
      
      frame.setAttribute("class", "d-block chanel_name p-1 mb-1 border rounded bg-light text-success");
      frame.dataset.owner = data.channel_owner;
      frame.dataset.channel_id = data.channel_id;

      var bold = document.createElement('strong');
      var cnl_name = document.createTextNode(data.channel_name);
      bold.appendChild(cnl_name);
      frame.appendChild(bold);
      var badge = document.createElement("span");
      badge.setAttribute("class", "msg_count badge badge-primary badge-pill");
      var cnl_mess = document.createTextNode(data.total_messages);
      badge.appendChild(cnl_mess)
      frame.appendChild(badge);
      // клонируем созданный блок, если использовать его же два раза, получается лажа :/
      var frame_menu = frame.cloneNode(true)
      document.getElementById("channels_list").appendChild(frame);
      document.getElementById("dropdown_menu").appendChild(frame_menu);
      add_bg_change(frame);
      add_bg_change(frame_menu);
      // получаем сообщения для установления ячейки свойств активного канала
      frame.onclick = () => {
        get_messages(data.channel_id);
      };
      frame_menu.onclick = () => {
        get_messages(data.channel_id);
      };

      if (data.channel_owner == user_id) {
      // если канал пренадлежит текущему пользователю, то устанавливаем флаг, чтобы сделать канал активным
        localStorage.setItem('channel_id', data.channel_id);
        // разблокируем форму ввода сообщений
        document.querySelector('fieldset').removeAttribute('disabled');
        frame.classList.add('active');
        frame_menu.classList.add('active');
        get_messages(data.channel_id);
      }
    }
    if (data.success === false) {
      $('#duplicate').modal();
      document.getElementById('duplicatename').innerHTML = data.channel_name;
    }
  });
}

function add_new_channel_modal(){
  document.querySelectorAll('.add_channel').forEach(function(add_channel_btn){
    add_channel_btn.addEventListener("click", function(){
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
  });
}


/*
=========== MESSAGES BLOCK
*/


function del_message(){
    var del_btn = document.getElementById('delete_mgs');
    socket.on('connect', function() {
      delete_mgs.onclick = function(){
        $('#delete_msg').modal('hide');
        socket.emit('del_message', {'channel_id': document.getElementById('channel_id_for_del').value, 'message_id': document.getElementById('msg_id_for_del').value});
      }; 
    });

    socket.on('message_del', data => {
    if (data.success === true){
      var letshide = document.querySelector('[data-id = "' + data.message_id +'"]');//.closest("span")
      letshide.style.animationPlayState = 'running';
      letshide.addEventListener('animationend', () =>  {
        letshide.remove();
      });
      change_counter( data.channel_id, data.msgcount);
     }
    
    if (data.success === false) {
      alert('troubles with deleting! msgcount:' + data.msgcnt + ' message_id: '+ data.message_id + ' channel_id: ' + data.channel_id)
    }
  });
}



function add_message(){
    socket.on('connect', function() {
      document.getElementById("message_form").addEventListener("submit", function(event){
        event.preventDefault();
        if (document.getElementById('message_text').value !='') {
          var message_text = document.getElementById('message_text').value;
          document.getElementById('message_text').value = '';
          // timestamp назначаем на стороне сервера 
          socket.emit('add_message', {'channel_id': channel_id, 'message_text': encodeURI(message_text), "user_id": localStorage.getItem('user_id'), "user_name": localStorage.getItem('user_name') });
        }
      });
    });

    socket.on('new_message', data => {
    if (data.success != false){
      // если сообщение пренадлежит открытому каналу, то добавляем на экран
      if (channel_id == data.channel_id){
        draw_message_block(data.channel_id, data.owner_id, data.id, data.text, data.owner_name, data.timestamp);
      }
      if (data.redrow == true){
        // если больше 100 сообщений, то перерисовываем все, так как первое уже удалено
        get_messages(data.channel_id)
      }
      change_counter(data.channel_id, data.messages_counter);
    }
    else {
        //alert('NO nEW MESSAGE')
    }
  });
}


function change_counter(channelid, counter){
  document.querySelectorAll('[data-channel_id = "' + channelid +'"]').forEach(function(cnt_badge) {
    cnt_badge.querySelector('.msg_count').innerHTML = counter;

  })
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
        empty.setAttribute("class", "no_msg");
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
          draw_message_block(channelid, data[i]["owner_id"], data[i]["id"], data[i]["text"], data[i]["owner_name"], data[i]["timestamp"])
        }
      }
  })
}

function draw_message_block(channelid, owner_id, id, text, owner_name, timestamp){
  // если остался текст заглушка от пустого канала -удаляем
  if (document.querySelector('.no_msg')){
    document.querySelector('.no_msg').remove();
  }
  var message_span = document.createElement("span");
  message_span.setAttribute("class", "message_block p-1 mb-1 border rounded d-flex w-100 justify-content-between");
  message_span.setAttribute("data-id", id);
  message_span.setAttribute("data-owner_id", owner_id);
  var parag = document.createElement('p'); 
  var bold = document.createElement('strong');
  var owner_n = document.createTextNode(owner_name +':');                   
  var msg_txt = document.createTextNode(text);
  bold.appendChild(owner_n);
  parag.appendChild(bold);
  parag.appendChild(document.createElement('br'));
  parag.appendChild(msg_txt);
  message_span.appendChild(parag);
  sml = document.createElement("small");
  sml.setAttribute("class", "text-danger text-center");
  var timestamp = document.createTextNode(timestamp);
  sml.appendChild(timestamp);
  if (owner_id == user_id){
    var d_span = document.createElement("button");
    d_span.setAttribute("class", "m_del badge badge-secondary");
    d_span.setAttribute("title", "Delete your message");
    //d_span.setAttribute("data-id", id);
    d_span.setAttribute("data-channelid", channelid);    
    d_span.onclick = () => {
      var mod = $('#delete_msg').modal();
      mod.find('#msg_id_for_del').val(id)
      mod.find('#channel_id_for_del').val(channelid)
    }
    var deletion = document.createElement("IMG");
    deletion.setAttribute("src", "static/pic/delete.jpg");
    deletion.setAttribute("width", "15");
    deletion.setAttribute("height", "15");
    deletion.setAttribute("alt", "Delete your message");
    d_span.appendChild(deletion);
    sml.appendChild(document.createElement('br'));
    sml.appendChild(d_span);
  }
  
  message_span.appendChild(sml);
  messages_list.appendChild(message_span);
  message_span.scrollIntoView();
}

/*
=========== LOGIN BLOCK
*/

function login_actions() {
  // добавляем logout
  document.getElementById('logout').addEventListener("click", function(){
    localStorage.removeItem('user_name');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('channel_id')
  }); 
  
  // заходим со старым именем
  document.getElementById('log_with_old_btn').addEventListener("click", function(){
    login( email, user_name, user_id);
    }); 
  
  // заходим с новым именем, обновляя его в БД
  document.getElementById('log_with_new_btn').addEventListener("click", function(){
    $.get( "change_name", { email, username } )
      .done(function( data ) {
        if (data['success'] == false){
          $('#email_exists').modal('hide');
          $('#registration').modal('show');
          document.getElementById('error_with_db_update').classList.remove('d-none');
        }
        else {
          login( email, data['username'], data['userid']);            
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
    email = document.getElementById('email').value;
    if (check_name(document.getElementById('username').value)) {
      check_email(email, document.getElementById('username').value);    
    }
  });  
}


function check_user_registration() {
  if (!localStorage.getItem('user_name') || !localStorage.getItem('email') || !localStorage.getItem('user_id')){
    $('#registration').modal({ backdrop: 'static', keyboard: false })
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('error_with_db_update').classList.add('d-none');
  }
  else {
    document.getElementById('user_label').innerHTML = 'Hi, ' + localStorage.getItem('user_name') + '!';
    user_name = localStorage.getItem('user_name');
    user_id = localStorage.getItem('user_id');
  } 
}

function check_name(username){
    if (username === "") {
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


function check_email(email, username){
    var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    if (email != "" && pattern.test(email)){
        $.get( "check", { email } )
            .done(function( data ) {
                // если такой мыл есть
                if (data['success'] == false){
                    document.getElementById('email').classList.remove('is-invalid');
                    document.getElementById('email').classList.add('is-valid');
                    if (data['username'] == username) {
                        // если такая электропочта есть и имя совпадает с БД, входим
                        login(email, username, data['user_id']);               
                    }
                    else {
                        // если почта есть но имя другое - выводим запрос на дальнейшие действия
                        $('#registration').modal('hide');
                        $('#email_exists').modal({ backdrop: 'static', keyboard: false })
                        $('#email_exists').find('#email_block').text(email);
                        $('#email_exists').find('#name_block1').text(data['username']);
                        $('#email_exists').find('#name_block2').text(data['username']);
                        $('#email_exists').find('#new_name_block1').text(' \''+ username+'\'');
                        $('#email_exists').find('#new_name_block2').text(username);
                    }
                    return true;
                }
                // если такой комбинации имени и электропочты нет
                if (data['success'] == true){
                    document.getElementById('email').classList.remove('is-invalid');
                    document.getElementById('email').classList.add('is-valid');
                    add_new_user(email, username);
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


function add_new_user(email, username){
  $.get( "add_new_user", { email, username } )
    .done(function( data ) {
      login(data['email'], data['username'], data['userid']);
    });
}

function login(email, username, userid){
    $('#email_exists').modal('hide');
    $('#registration').modal('hide');
    localStorage.setItem('user_name', username);
    localStorage.setItem('email', email);
    localStorage.setItem('user_id', userid);
    user_name = username;
    user_id = userid;
    document.getElementById('user_label').innerHTML = 'Hi, ' + user_name + '!';
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


var last_known_scroll_position = 0;

function move(){
  document.getElementById('send_message_form').style.top = window.innerHeight - document.getElementById('send_message_form').clientHeight - document.getElementById('foo').clientHeight - 10 + last_known_scroll_position + 'px';
}

window.addEventListener('scroll', function () {
  last_known_scroll_position = window.scrollY;
  window.setTimeout(move, 100);
});*/

//=========================================================


function message_form_resize(){
  // - 10 потому что при появлении вертикальной прокрутки событие resize не вызывается, и появляется еще и горизонтальная полоса
  // а это событие  работает только в firefox
  //document.documentElement.addEventListener('overflow', function() {
  // console.log('scollbar is visible');
  //}); 


  document.getElementById('send_message_form').style.width = document.querySelector('#messages_list').clientWidth - 10 +'px';
  // надо добавить проверку не выше ли левый угол нижней границы последнего элемента сообщений
  //document.getElementById('send_message_form').style.top = window.innerHeight - document.getElementById('send_message_form').clientHeight - document.getElementById('foo').clientHeight - 10 +'px';
}
