import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import rubroRouter from "./routes/rubroRoute.js"



//app config
const app = express()
const port = 4000

// middleware
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// app endpoint
app.use("/api/rubro",rubroRouter)
app.use("/images",express.static('uploads'))


app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

//mongodb+srv://proyectobookit:123qwe@cluster0.za8vg.mongodb.net/?