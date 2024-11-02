const express = require("express")
const app = express()
const cors = require("cors")

const corsOptions={
    origin: "http://localhost:5173",
}

app.use(cors(corsOptions))

app.get("/api",(req,res)=>{
    res.json({testNumbers: ["1","2","3"]})
})

app.listen(8080,()=>{
    console.log("Server started on port: 8080")
})