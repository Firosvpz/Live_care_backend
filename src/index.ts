import connectDB from "./infrastructure/config/mongodb"
import express from 'express'

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
})