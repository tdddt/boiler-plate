const {User} = require("../models/User");

//인증 처리를 하는 곳
let auth = (req,res,next)=>{
    //클라이언트 쿠키에서 토큰 가져오기(login route에서 쿠키에 저장할 때 이름이 x_auth였음)
    let token = req.cookies.x_auth;

    //토큰을 복호화 한 후 유저를 찾는다.(User model에서 메소드를 만들어서 진행->const {User}필요)
    User.findByToken(token, (err,user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:true}) //user가 없다면

        //user가 있다면
        req.token = token; //index.js의 auth route에서 req.token을 사용할 수 있음
        req.user = user; //index.js의 auth route에서 req.user를 사용할 수 있음
        next(); //auth가 middleware이므로 다음으로 넘어갈 수 있도록 해줘야 함
    })
}

module.exports = {auth};

