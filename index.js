const express=require('express')
const app=express()
const port=5000
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const config=require('./config/key');
const {auth}=require('./middleware/auth');
const {User}=require("./models/User");



app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose=require('mongoose')//install한 몽구스 기능을 불러오는거임
mongoose.connect(config.mongoURI,{
    useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true, useFindAndModify:false
}).then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err))



app.get('/',(req,res)=>res.send('Hello World~!!!!!!!!!'))

app.post('/api/users/register',(req,res)=>{
    /*회원가입할때 필요한 정보들을 client에서 서버쪽으로 post한것을 받아서 가져오면 그것들을 데이터베이스에 넣어준다.
    이걸 하려면 예전에 User모델만든걸(User.js)를 가져와야한다!!
    */
    const user=new User(req.body)

    user.save((err,userInfo)=>{
        if(err) return res.json({success:false,err})
        return res.status(200).json({
            success:true
        })
    })

})

app.post('/api/users/login',(req,res)=>{
    
    //요청된 이메일을 DB에서 있는지 찾는다.
    User.findOne({email:req.body.email},(err,user)=>{  //req.body.email은 로그인으로 입력한 이메일값을 의미한다.
        //(err,user)에서 내용을 찾으면 user=1이 되고 내용을 못찾으면 user=0이 된다.(err랑 별개의문제다.)
        if(!user){
            return res.json({
                loginSuccess:false,
                message:"제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

    //요청된 이메일이 DB에 있다면 그다음으로 비밀번호가 맞는 비밀번호인지 확인.(comparePassword는 User.js에서 내가 직접만들함수이름이다.)
        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch)//비밀번호틀렸을때.
                return res.json({loginsuccess:false, message:"비밀번호가 틀렸습니다."})
        
        /*비밀번호가 맞는지 어떻게 확인하냐면 isMatch를 이용해서내가 치는 입력데이터와 DB안에 그거와 맞는 비밀번호가 맞는지를 확인한다. */
            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);//send는 클라이언트창에 err뜨게 하는거임.

                //----------------------------------------------------------------------------
                //토큰을 저장한다. 어디에? 이 강사는 쿠키 저장하게 짠다고 한다!!(스토리지에 저장한다고 하면 다른식으로 저장하면 될것이다!!)
                res.cookie("x_auth",user.token)
                .status(200)
                .json({loginSuccess:true, userId:user._id})
                /*generateToken함수를 씀으로서 user.token에 생성된 jwt토큰이 담기는데 이걸 
                웹페이지의 검사하기 눌러서 'Application'부분에서 storage의 Cookie부분을 볼때 해당토큰값의 Name으로 볼것을 X_auth로 보게 하는거임.
                */

            })//비밀번호까지 맞다면 토큰을 생성하기.
        })//comparePassword
    })//findOne

})//로그인post끝
//////////////////////////////////////////////////////////////////////////////////////////////

app.get('/api/users/auth',auth,(req,res)=>{

    //여기까지 미들웨어를 통과해서 왔다는 얘기는 Authentication이 true라는 말이다!!


    //이 true했다는것을 client에다가 전달.
    res.status(200).json({
        _id:req.user._id,//이렇게 할수있는 이유가 auth.js내용에서 req에다가 id를 넣어줬기떄문임.
        isAdmin:req.user.role===0? false : true,
        isAuth:true,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role,
        image:req.user.image
    })
})//app.get(auth)

app.get('/api/users/logout',auth,(req,res)=>{

    User.findOneAndUpdate(
        {_id: req.user._id},
        {token:""},
        (err,user)=>{
                if(err) return res.json({
                    success:false,err
                });
                return res.status(200).send({
                    success:true
                })
         }


    )//findOneAndUpdate

})//logout


app.listen(port,()=>console.log(`Example app listening on port ${port}!`))
