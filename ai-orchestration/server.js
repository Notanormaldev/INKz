import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js";

const PORT=process.env.PORT||3000

app.listen(PORT,()=>{
    console.log(`AI server orchestration is running on port  ${PORT}`)
})