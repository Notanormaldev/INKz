import 'dotenv/config'
import app from "./src/app.js";
import { connectdb } from './src/config/db.js';

const PORT = process.env.PORT || 3000

connectdb()
app.listen(PORT, () => {
    console.log(`Sandbox Server is running on port ${PORT}`)
})