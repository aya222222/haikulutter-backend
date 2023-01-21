import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dotenv from 'dotenv'
import corsOptions from './config/corsOptions.js';
const app = express();
dotenv.config();



app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors(corsOptions));

app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);

//mongo Atlas
const CONNECTION_URL = process.env.CONNECTION_URL
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => app.listen(PORT, () => console.log(`Serve running on port : ${PORT}`)))
.catch((error) => console.log(error))

