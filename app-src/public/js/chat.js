
const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const PERSON_IMG = "https://www.svgrepo.com/show/222879/skull.svg";
const chatWith = get(".chatWith");
const typing = get(".typing");
const chatStatus = get(".chatStatus");
//const chatId = window.location.pathname.substr(6);
const chatId  = document.getElementById("chatId").value;
let authUser;
let typingTimer = false;

window.onload = function () {

/**
 * Obtenemos los datos del usuario
 */
  axios.get('/auth/user')
  .then( res => {

    authUser = res.data.authUser;

  })
  .then(() => {

    axios.get(`/chat/${chatId}/get_users`).then( res => {

      let results = res.data.users.filter( user => user.id != authUser.id);
      if(results.length > 0)
        chatWith.innerHTML = results[0].name;
    });

  })
  .then(() => {

    axios.get(`/chat/${chatId}/get_messages`).then(res => {
      //agregamos los mensajes
      appendMessages(res.data.messages);

    });

  })
  .then(() => {

    //Echo
    Echo.join(`chat.${chatId}`)
      .listen('MessageSent', (event) => {

        appendMessage(
          event.message.user.name,
          PERSON_IMG,
          'left',
          event.message.content,
          formatDate(new Date(event.message.created_at))
        );

      })
      //usuarios conectados en el canal
      .here(users => {
        //todos los usuarios menos el identificado
        let result = users.filter(user => user.id != authUser.id);

          //si hay resultado
          if(result.length > 0){
            //esta conectado entonces el cambiamos la clase
            chatStatus.className = 'chatStatus online';
          }

      })
      //cuando un usuario se une al canal
      .joining(user => {

        //si el que se esta uniendo es distinto al identificado
        if(user.id != authUser.id){
          //esta conectado entonces el cambiamos la clase
           chatStatus.className = 'chatStatus online';
        }

      })
      //cuando un usuario sale
      .leaving(user => {
        //si el que se esta saliendo es distinto al identificado
        if(user.id != authUser.id)
        //esta conectado entonces el cambiamos la clase
          chatStatus.className = 'chatStatus offline';
      })
      //escucha los susurros en este caso el de typing
      .listenForWhisper('typing', event => {

        //si es mayor a 0 muestra el mensaje de escribiendo
        if(event > 0){ 
           //cambiamos el style
          typing.style.display = '';
        }

        //si esta escribiendo
        if(typingTimer){
          //limpiamos el contador
          clearTimeout(typingTimer);
        }

        //pasado los 3 segundos
        typingTimer = setTimeout( () => {
          //cambiamos el style de escribiendo
          typing.style.display = 'none';
          //no esta escribiendo
          typingTimer = false;
        }, 3000);

      });

  });

}

/**
 * cuando el formulario se envia
 */
msgerForm.addEventListener("submit", event => {

  event.preventDefault();

  const msgText = msgerInput.value;

  if (!msgText) return;

  axios.post('/message/sent', {
    message: msgText,
    chat_id: chatId
  }).then( res => {

    let data = res.data;

    appendMessage(
      data.user.name,
      PERSON_IMG,
      'right',
      data.content,
      formatDate(new Date(data.created_at))
    );

  }).catch( error => {

    console.log('Ha ocurrido un error');
    console.log(error);

  });

  msgerInput.value = "";
});

/**
 * Agrega los mensajes de manera recursiva
 * @param {*} messages 
 */
function appendMessages(messages)
{
  let side = 'left';

  messages.forEach(message => {

    //Si el usuario autenticado es igual al usuario del mensaje mostramos a la derecha
    side = (message.user_id == authUser.id) ? 'right' : 'left';
    //Agregamos el mensaje
    appendMessage(
      message.user.name,
      PERSON_IMG,
      side,
      message.content,
      formatDate(new Date(message.created_at))
    );

  })
}

/**
 * Agrega los mensajes
 * 
 * @param {*} name 
 * @param {*} img 
 * @param {*} side 
 * @param {*} text 
 * @param {*} date 
 */
function appendMessage(name, img, side, text, date) {

  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${date}</div>
        </div>
        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);

  //scroll
  scrollToBottom();
}

/**
 * Se une al canal actual
 * 
 */
function sendTypingEvent()
{
  //esta escribiendo
  typingTimer = true;

  Echo.join(`chat.${chatId}`)
  //metodo susurro que se le pasa el nombre del evento y el criterio
    .whisper('typing', msgerInput.value.length);

}


// Utils
  function get(selector, root = document) {
    return root.querySelector(selector);
  }

  function formatDate(date) {

    const d = date.getDate();
    const mo = date.getMonth() + 1;
    const y = date.getFullYear();
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${d}/${mo}/${y} ${h.slice(-2)}:${m.slice(-2)}`;
    
  }

  /**
   * Scroll de la ventana
   */
  function scrollToBottom()
  {
    //hacemos que sea igual al tamaño de la ventana
    msgerChat.scrollTop = msgerChat.scrollHeight;
  }