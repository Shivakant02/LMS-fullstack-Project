import { set, connect } from 'mongoose';

set('strictQuery', false);

const connectToDB = async() => {
   try {
       const { connection } = await connect(
           process.env.MONGO_URL
       );

       if (connection) {
           console.log(`Connected to mongoDB: ${connection.host}`);
       }

   } catch (error) {
       console.log(error);
       process.exit(1);
   }
}

export default connectToDB;