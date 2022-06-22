const fs = require('fs');
const express = require('express');
const mysql = require('mysql');
const multer =  require('multer');
// const Connection = require('mysql/lib/Connection');
const app = express();
const port = process.env.PORT || 4000; //포트 설정

// const upload = multer({dest:'./client/public/upload'});
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'client/public/upload/')
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage:storage});

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use('/upload', express.static('./client/public/upload'));

const data = fs.readFileSync('./database/db.json');
const conf = JSON.parse(data); //불러온 json을 parsing해서(객체 타입이 된다) conf에 담음
const connection = mysql.createConnection({
    host:conf.host,
    user:conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
});
connection.connect();


app.get('/api', (req, res)=>{
    let offset = 0;
    let limits = 10;
    let dbquery = `SELECT * FROM restaurant_ggy ORDER BY id desc limit ${offset}, ${limits}`;
    connection.query(dbquery, (err,rows,fields) => {
        if(err){ console.log('db 접속 중에 에러가 발생했습니다. : ' + err)}
        res.send(rows);
    })
});

app.get('/api/edit/:id', (req,res)=>{ //:id를 서버에서는 파라미터 변수값이라고 인식한다.
    let dbquery = `select * from restaurant_ggy where id=${req.params.id}`;
    // console.log(dbquery);
    connection.query(dbquery, (err,rows,fields) => {
        if(err){console.log('db 접속 중에 에러가 발생했습니다. : ' + err)}
        res.send(rows);
    });
    
});

app.post('/api/update/:id', upload.single('files', (req,res)=>{
    //업데이트 파일 업로드
}));

app.post('/api/write', upload.single('files', (req,res)=>{
    console.log('/api/write를 통해 업로드 호출');
    const sigun = req.body.sigun;
    const title = req.body.title;
    const tel = req.body.tel;
    const title_food = req.body.title_food;
    const zip = req.body.zip;
    const address = req.body.address;
    const address_old = req.body.address_old;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const radius = req.body.radius;
    const files = 'upload/' + req.file.filename;
    const params = [sigun, title, tel, title_food, zip, address, address_old, latitude, longitude, radius, files]; //위 변수 이름들
    //위 데이터들을 데이터베이스에 담기
    let sql = 'INSERT INTO restaurant_ggy VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, params, (err,rows,fields) => {
        if(err){ console.log('db 접속 중에 에러가 발생했습니다. : ' + err)}
        res.send(rows);
    })
}));

app.listen(port, () => console.log(`Listening on port ${port}`));