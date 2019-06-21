const express = require('express');
const path = require('path');
const http = require('http');
const app = new express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const socketio = require('socket.io');
const connectFlash = require('connect-flash');

const indexrouter = require('./routes/index');
const userrouter = require('./routes/user');
const projectrouter = require('./routes/project');
const issuerouter = require('./routes/issue');
const sprintrouter = require('./routes/sprint');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000;

//databases
const mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin123@ds113495.mlab.com:13495/scrum',()=>{
    console.log('conn');
});
//mongoose.connect('mongodb://localhost:27017/scrum', {useNewUrlParser: true});
//mongoose.set('useCreateIndex', true)

app.use(connectFlash());

const mongoStore = connectMongo(expressSession);

app.use(expressSession({
	secret: 'secret key',
	store: new mongoStore({
		mongooseConnection: mongoose.connection
	}),
	cookie: { secure: false }
}));

app.use(function(req, res, next){		//to make session data availabe in templates
        res.locals.session = req.session;
        next();
});

app.use(fileUpload());

app.set('view engine', 'ejs');//view engine

//statc assests
const publicDirPath = path.join(__dirname, '/public');
//const partialsPath = path.join(__dirname, '/views/partials');
//app.set('views', path.join(__dirname, '../views'));

app.use(express.static(publicDirPath));
//ejs.registerPartials(partialsPath);

//bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routing

app.use('/',indexrouter);
app.use('/user',userrouter);
app.use('/project',projectrouter);
app.use('/issue',issuerouter);
app.use('/sprint',sprintrouter);

app.get('*',(req, res)=>{
	res.send('404 Page');
});


/////
const server = http.createServer(app);

const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port,()=>{
	console.log('connected');
});