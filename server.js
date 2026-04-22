
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const app=express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(rateLimit({windowMs:60*1000,max:120}));
let users={};
app.get('/',(req,res)=>res.json({ok:true,name:'BattleZone Backend'}));
app.post('/api/auth/register',(req,res)=>{
 const {uid,name}=req.body||{};
 if(!uid) return res.status(400).json({error:'uid required'});
 users[uid]={uid,name:name||'User',wallet:0,rewardCoins:0};
 res.json({success:true,user:users[uid]});
});
app.post('/api/rewards/spin',(req,res)=>{
 const reward=[0,10,20,30,40][Math.floor(Math.random()*5)];
 res.json({success:true,reward});
});
app.get('/api/ads/config',(req,res)=>res.json({adsEnabled:true,ads:[]}));
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('running '+PORT));
