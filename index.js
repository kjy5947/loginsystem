const express = require('express')
const app = express()
const port = 8080
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const config=require('./config/key');


const {User}=require("./models/User");


/*바로아래코드는 application/x-www-form-urlencoded 이렇게 되어있는 데이터를 분석해서
  가져올수있게 해준다.
 */
app.use(bodyParser.urlencoded({extended:true}));

/*
바로 아래코드는 application/json 타입으로된것을 분석해서 가져올수있게하는애다.
 */
app.use(bodyParser.json());
app.use(cookieParser());

//config.mongoURI
const mongoose=require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false
}).then(()=>console.log('MongoDB Connected...'))
  .catch(err=>console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World! 추석연휴 잘보내세유~~속았냐~!!?')
})


app.post('/register',(req,res)=>{
    //회원가입할때 필요한 정보들을 client에서 가져오면
    //그것들을 DB에 넣어준다.
    const user=new User(req.body)

    user.save((err,userInfo)=>{
        if(err) return res.json({success:false,err})
        return res.status(200).json({success:true})
    })
})



app.post('/login',(req,res)=>{
  //로그인입력함으로써 그 입력한 값으로 요청된 이메일내용이 DB에 있는지 찾는다.
  
    User.findOne({email:req.body.email},(err,userInfo)=>{
      if(!userInfo){
        return res.json({
          loginSuccess:false,
          message:"제공된 이메일에 해당하는 유저가 없습니다."
        })
      }//요청된 이메일이 맞으면 비밀번호도 맞는지 DB에서 확인.
      userInfo.comparePassword(req.body.password,(err,isMatch)=>{
        if(!isMatch)
        return res.json({loginSuccess:false,message:"비밀번호가 틀렸습니다."})

        //비밀번호까지 맞다면 토큰을 생성하기.
        user.generateToken((err,userInfo)=>{
          if(err) return res.status(400).send(err);

          // 토큰을 저장한다. 어디에?? 쿠키나 로컬스토리지 등등에 저장할수있다.
          res.cookies("x_auth",userInfo.token)
          .status(200).json({loginSuccess:true,userId:user._id})
        })//generateToken
      })
    })//findOne

  })//post


  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })




