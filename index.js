const express = require('express')
const app = express()
const port = 8080
const bodyParser=require('body-parser');

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

const mongoose=require('mongoose');
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

