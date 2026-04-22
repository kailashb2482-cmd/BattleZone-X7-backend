
const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors()); app.use(express.json());
let db={users:{},ads:{enabled:true,items:[]},logs:[]};

function auth(req,res,next){
 const uid=req.headers['x-user-id'];
 if(!uid) return res.status(401).json({error:'auth required'});
 if(!db.users[uid]) db.users[uid]={uid,rewardCoins:0,spin:0,scratch:0,watch:0,last:new Date().toISOString().slice(0,10),ref:'BZX'+Math.floor(Math.random()*99999)};
 req.user=db.users[uid];
 const t=new Date().toISOString().slice(0,10);
 if(req.user.last!==t){req.user.spin=0;req.user.scratch=0;req.user.watch=0;req.user.last=t;}
 next();
}
app.get('/',(q,s)=>s.json({ok:true,pro:true}));

app.post('/api/rewards/spin',auth,(req,res)=>{
 if(req.user.spin>=3) return res.status(400).json({error:'limit'});
 req.user.spin++;
 let pool=[0,0,10,10,20,30,40,50,100]; let r=pool[Math.floor(Math.random()*pool.length)];
 req.user.rewardCoins+=r; db.logs.push({u:req.user.uid,t:'spin',r});
 res.json({reward:r,remaining:3-req.user.spin,coins:req.user.rewardCoins});
});

app.post('/api/rewards/scratch',auth,(req,res)=>{
 if(req.user.scratch>=3) return res.status(400).json({error:'limit'});
 req.user.scratch++;
 let r=Math.random()<0.03?100:Math.floor(Math.random()*25)+1;
 req.user.rewardCoins+=r; db.logs.push({u:req.user.uid,t:'scratch',r});
 res.json({reward:r,remaining:3-req.user.scratch,coins:req.user.rewardCoins});
});

app.post('/api/rewards/watch-complete',auth,(req,res)=>{
 if(req.user.watch>=5) return res.status(400).json({error:'limit'});
 req.user.watch++;
 let r=5+Math.floor(Math.random()*6);
 req.user.rewardCoins+=r; db.logs.push({u:req.user.uid,t:'watch',r});
 res.json({reward:r,remaining:5-req.user.watch,coins:req.user.rewardCoins});
});

app.post('/api/rewards/exchange',auth,(req,res)=>{
 let c=Number(req.body.coinsToConvert||0);
 if(c<200||c%200!==0) return res.status(400).json({error:'invalid'});
 if(req.user.rewardCoins<c) return res.status(400).json({error:'low balance'});
 let rs=c/200; req.user.rewardCoins-=c; req.user.wallet=(req.user.wallet||0)+rs;
 res.json({coinsUsed:c,rupeesAdded:rs,wallet:req.user.wallet,rewardCoins:req.user.rewardCoins});
});

app.get('/api/referral/share-message',auth,(req,res)=>{
res.json({message:`Use Code - ${req.user.ref} Download https://battlezone-x7.onrender.com`});
});

app.get('/api/ads/config',(q,s)=>s.json(db.ads));

app.post('/api/admin/ads/create',(q,s)=>{db.ads.items.push(q.body);s.json({ok:true})});
app.get('/api/admin/ads/list',(q,s)=>s.json(db.ads.items));
app.patch('/api/admin/ads/toggle',(q,s)=>{db.ads.enabled=!!q.body.adsEnabled;s.json(db.ads)});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('running '+PORT));
