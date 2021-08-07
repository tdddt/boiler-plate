const mongoose = require('mongoose'); //mongoose module가져오기

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
        maxlength:5
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
    token: { //나중에 token을 이용해서 유저창같은 것을 관리할 수 있음
        type: String
    },
    tokenExp: { //token을 사용할 수 있는 유효기간
        type: Number
    }
})

const User = mongoose.model('User',userSchema) //model의 이름과 Schema의 이름을 적어 줌
module.exports = {User} //model을 다른 곳에서도 쓸 수 있게 export

