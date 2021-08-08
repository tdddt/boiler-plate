const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({ //mongoose를 이용해 schema생성
    name: {
        type: String,
        maxlength:50
    },
    email: {
        type: String,
        trim: true, //space를 없애주는 역할
        unique: 1 //똑같은 이메일을 쓰지 못하도록 설정
    },
    password: {
        type:String,
        minlength:5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0 
    }, 
    image: String,
    token: { 
        type: String
    },
    tokenExp: { 
        type: Number
    }
})

userSchema.pre('save', function( next ){ //User model에 정보를 저장하기 전에 할 일을 function으로 구현
    //비밀번호를 암호화 시킨다.
    var user = this; //userSchema를 가리키는 것

    if(user.isModified('password')){ //password가 변화될 때만 암호화 해주도록 설정
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
    
            bcrypt.hash(user.password, salt, function(err, hash){ //user.password는 암호화X인 순수한 비밀번호, hash는 암호화된 비밀번호
                if(err) return next(err)
                user.password = hash
                next()
            }) 
        })
    } else { //비밀번호가 아닌 다른 것을 바꿀 때
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword 1234567, 암호화된 비밀번호 $2b$10$1PbQ.Cct.MmPfSgu26mT8udLAiOx7pxP/Zw.zwc2tOswxezFNHwBq
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb){

    var user = this;

    //jsonwebtoken을 이용해서 token을 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken') 
    //'secretToken' 을 넣으면 user._id가 나오도록, 그래서 token을 가지고 이 사람이 누구인지를 알 수 있음

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user) //token이 저장된 user정보가 index의 generateToken의 user인자로 들어 감
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //토큰을 decode
    //'secretToken'은 user._id+'secretToken'=token에서 중간에 있는 값
    jwt.verify(token, 'secretToken', function(err,decoded) { //decoded는 user._id
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({ "_id":decoded, "token":token}, function(err, user){
            if(err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User',userSchema) 
module.exports = {User} 

