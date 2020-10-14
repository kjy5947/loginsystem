const {User}=require('../models/User');

let auth=(req,res,next)=>{
    //인증처리를 하는곳.

    //client쿠키에서 토큰을 가져온다.
    let token=req.cookies.x_auth;

    //token을 복호화한후 유저를 서버에서 찾는다.
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false,error:true})

    //유저가 있으면 인증 ok
    req.token=token;
    req.user=user;/*req에다가 토큰과 유저를 넣어주는이유는!? index.js쪽의 auth부분에서 request를 받을때
     req.token, req.user를 함으로써 토큰과 유저의 값을 가질수있다.
    */
    next();//미들웨어에서 다음으로 갈수있게 한다. 이걸안하면 미들웨어에 계속 갇혀있게 된다!!
    })

    //유저가 없으면 인증 No

}

module.exports={auth};