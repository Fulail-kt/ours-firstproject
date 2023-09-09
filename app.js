
const express = require('express');
const app = express();
const passport = require('passport'); // Add this line
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const nocache = require('nocache');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const mongoose = require('mongoose');



mongoose.connect("mongodb://127.0.0.1:27017/Ours").then(()=>{
    console.log("Mongodb connected")
}).catch((error)=>{
 console.log(error.message)
})



module.exports=mongoose.connection;










// Initialize Passport and session



app.use(session({
  secret: 'Ours',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))




app.use(passport.initialize());
app.use(passport.session());





app.use(nocache())
app.use(flash())
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

app.use('/', userRouter)
app.use('/admin', adminRouter)
app.use((req, res, next) => {
  res.status(404).render('user/404');
});





app.listen(8888, () => {
  console.log('server connected')
})