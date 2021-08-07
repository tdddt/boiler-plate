const express = require('express') 
const app = express()
const port = 3000 
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://tdddt:rlarmswn1!@boiler-plate.ogokw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ //copy한 connection String
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false //에러 방지용
}).then(()=>console.log('MongoDB Connected...')) //잘 연결되었다면 MongoDB Connected 출력
  .catch(err=>console.log(err)) //연결에 실패했다면 error출력

app.get('/', (req, res) => { 
  res.send('Hello World!')
})

app.listen(port, () => { 
  console.log(`Example app listening at http://localhost:${port}`) 
})
