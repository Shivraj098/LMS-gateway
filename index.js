import dotenv from "dotenv";
dotenv.config()
import express from "express"
import morgan from "morgan"

const app = express()

const PORT = process.env.PORT || 8000
app.use(morgan('dev'))

app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({
    extended:true,
    limit:"10kb"
}))



app.listen(PORT,()=>{console.log(`Server is running on the Port ${PORT}`)})