Pusher.logToConsole = true

let pusher = {}
let channel = {}

fetch('http://localhost:5000/pusher/key')
  .then(res => res.json())
  .then(data => {
    pusher = new Pusher(data.appKey, {
      cluster: 'ap1',
      authEndpoint: 'http://localhost:5000/pusher/auth'
    })
    channel = pusher.subscribe('private-message')
    channel.bind('client-chat', (data) => {
      if (hasUser() && data.user !== getUser()) {
        appendChat(data.message, 'them')
      } else {
        askForUsername()
      }
    })

    initialize()
  })

function appendChat (message, from) {
  const chatElem = document.querySelector('.imessage')
  const chatClasses = from === 'me' ? 'from-me' : 'from-them'
  chatElem.innerHTML += `<p class="${chatClasses}">${message}</p>`
}

function sendMessage (evt) {
  if (evt.keyCode === 13 && !evt.shiftKey) {
    const username = getUser()
    let message = document.querySelector('#chat-box')
    channel.trigger('client-chat', {
      user: username,
      message: message.value
    })
    appendChat(message.value, 'me')
    message.value = ''
  }
}

function hasUser () {
  return !!Cookies.get('username')
}

function getUser () {
  const user = Cookies.get('username')

  if (!user) {
    return ''
  }

  return user
}

function setUser (username) {
  Cookies.set('username', username)
}

function setNickname () {
  const nickname = document.querySelector('#username').value
  setUser(nickname)
  const modal = new bootstrap.Modal(document.querySelector('#username-modal'), {})
  modal.hide()
  console.log('set nickname')
}

function askForUsername () {
  if (!hasUser()) {
    const modal = new bootstrap.Modal(document.querySelector('#username-modal'), {})
    modal.show()
  }
}

function initialize () {
  const chatbox = document.querySelector('#chat-box')
  chatbox.addEventListener('keydown', sendMessage, true)
  const saveUsernameButton = document.querySelector('#save-username-btn')
  saveUsernameButton.addEventListener('click', setNickname, true)
  askForUsername()
}
