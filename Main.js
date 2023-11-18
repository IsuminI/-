const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const SocketIO = require('socket.io');

var authRouter = require('./auth');
var authCheck = require('./authCheck.js');
var template = require('./template.js');

const app = express()
const port = 3000
const server = app.listen(port, function() {
  console.log('Listening on ' + port);
});
const io = SocketIO(server, {path: '/socket.io'});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore(),
}))

app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  }
})

// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  }
  var html = template.HTML('Welcome',
    `<hr>
        <h2>메인 페이지에 오신 것을 환영합니다</h2>
        <p>로그인에 성공하셨습니다.</p>
        <button type="button" id="chat" onclick="location.href='http://localhost:3000/chat'">채팅창</button>
        `,
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


// 채팅 구현

io.on('connection', function (socket) {
    console.log(socket.id, ' connected...!!!');
    
    // broadcasting a entering message to everyone who is in the chatroom
    io.emit('msg', `${socket.id} has entered the chatroom.`);

  	// message receives
    socket.on('msg', function (data) {
        console.log(socket.id,': ', data);
        // broadcasting a message to everyone except for the sender
        socket.broadcast.emit('msg', `${socket.id}: ${data}`);
    });

    // user connection lost
    socket.on('disconnect', function (data) {
        io.emit('msg', `${socket.id} has left the chatroom.`);
    });
});

app.get('/chat', function(req, res) {
    res.sendFile(__dirname + '/chat.html');
});