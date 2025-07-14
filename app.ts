import express from 'express';
import dotenv from "dotenv"
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors({ origin: true }));

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
