import connectToDB from './config/dbConnection.js';
import app from './app.js';
import { config } from 'dotenv';
config();

const PORT = process.env.PORT || 5011;
app.listen(PORT, async() => {
    await connectToDB();

    console.log(`App is running at http://localhost:${PORT}`);
})

