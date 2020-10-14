const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const saltRounds=10
const jwt=require('jsonwebtoken');

const userSchema=mongoose.Schema({
    name:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        minlength:50
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type:Number,
        default:0
    },
    image: String,
    token:{
        type: String
    },
    tokenExp:{
        type:Number  
    }
})

userSchema.pre('save',function(next){
    var user=this; //이 this는 위의 userSchema내용을 가르킨다.
    //비밀번호를 암호화시킨다.

    if(user.isModified('password')){

        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err) //에러가 발생하면 save의 pre단계에서 save함수로 진행하면서 err가 발생했다고 알려준다.
    
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err) //hash된 비밀번호를 바꾸는데에 에러가 발생했을때.
                user.password=hash /* hash과정이 성공하면 user.password가 hash되어서 들어가있는 비밀번호인 
                function의 2번째 매개변수에 들어있는 hash로 초기화 해준다.
                */
               next()
    
            })
        })


    }//if끝
    else{
        next()//비밀번호말고 다른거 변경할때 바로 save로 진행되게!
    }
})

userSchema.methods.comparePassword=function(plainPassword,cb){
/*내가 방금입력한 비밀번호(ⓐplainPassword)와  암호화되서 DB에 들어가있는 비밀번호(userSchema에 들어있는)를 비교해서 체크하게 짤것이다.
근데 비교되는 대상은 hash된 비밀번호이므로 ⓐplain도 hash와 시키기위해 bcrpyt함수를 사용한다.
*/
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);//null=> 에러가 없다. isMatch=> true인지 false인지를 의미
    })
}
//첫번째매개변수(내가방금입력한비번을 해쉬화시킨것)값과 2번째매개변수(DB에 들어있는 비밀번호)의값들을 비교한다.

userSchema.methods.generateToken=function(cb){
    //jsonwebtoken을 이용해서 token을 생성하기
    var user=this;
    
	var token =jwt.sign(user._id.toHexString(),'secretToken') 
    /*여기서 user_id+'scretToken'=token 이렇게해서 token을 만드는데 secretToken은 알고있으므로
    나중에 user._id를 찾을때 secretToken을 이용해서 유도하게 된다. 그래서 secreToken을 기억하게 만들어놔야한다!!
    여기서 나중에 userSchema에 있는 token필드에 넣어주게 만든다.
    (참고> 나중에 token expression도 만들면 좋은데 토큰만 일단 만드는중이다.)
    */
    user.token=token//user.token은 userSchema안에 있는 토큰필드를 가리킨다.
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })
	
}

userSchema.statics.findByToken=function(token,cb){
    var user=this;

    //토큰을 decode한다.(이게 verify다.)
    jwt.verify(token,'secretToken',function(err,decoded){
        //user_id를 이용해서 DB에서 유저를 찾은다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인.
        user.findOne({"_id":decoded,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user)
        })
        //참고 : findOne는 몽고db에 있는 함수임
    })
}

const User=mongoose.model('User',userSchema)

module.exports={User}


