import express from 'express'
import cors from 'cors'
const app = express()
let router = express.Router()
let port = process.env.PORT || 8080

const corsOptions={
    whiteList: "http://localhost:5173",
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

app.get("/api",(req,res)=>{
    res.send({"nice":[1,2,3]})
})

app.listen(port,()=>{
    console.log("Server started on port: 8080")
})