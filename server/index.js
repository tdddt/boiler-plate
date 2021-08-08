const express = require('express') 
const app = express()
const port = 3000 
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./server/config/key');

const {auth} = require("./middleware/auth");
const {User} = require("./models/User"); 

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(config.mongoURI,{ 
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false 
}).then(()=>console.log('MongoDB Connected...')) 
  .catch(err=>console.log(err)) 

app.get('/', (req, res) => { 
  res.send('Hello World!~~~')
})


app.post('/api/users/register', (req, res) => {
    //회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.
    const user = new User(req.body) 

    //save하기 전에 비밀번호 암호화 필요
    user.save((err, userInfo) => { 
        if (err) return res.json({success:false, err}) 
        return res.status(200).json({
            success:true
        })
    }) 
})

app.post('/api/users/login',(req, res) => {
    //요청된 이메일을 데이터베이스에 있는지 찾기
    User.findOne({email:req.body.email}, (err, user) => {
        if(!user) { //해당 이메일을 가진 user가 없다면
            return res.json({
                loginSuccess:false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        } 
    
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) //비밀번호가 같지 않다면
                return res.json({loginSuccess:false, message:"비밀번호가 틀렸습니다."})

            //비밀번호까지 맞다면 토큰을 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err); //400은 err가 있다는 뜻
            
                //쿠키에 토큰 저장
                res.cookie("x_auth", user.token)
                .status(200) //200은 성공했다는 의미
                .json({loginSuccess: true, userId : user._id})
            })
        })
    })
})

app.get('/api/users/auth', auth, (req,res) =>{
    //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 Ture라는 뜻
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role ===0 ? false : true, //0이면 false, 1이면 admin이라 true
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role : req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req,res)=>{
    //로그아웃하려는 user를 찾아서 데이터를 update시켜주는 것
    User.findOneAndUpdate({_id: req.user._id}, {token:""}, (err,user)=>{//auth에서 가져와서 찾는 것, token지워주기
        if(err) return res.json({success:false, err});
        return res.status(200).send({
            success:true
        })
    }) 
})

app.listen(port, () => { 
  console.log(`Example app listening at http://localhost:${port}`) 
})
