import { MongoClient } from "mongodb";
import { Database, User, Listing, Booking } from "../lib/types";



const url = `mongodb://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0-shard-00-00.lbnxs.mongodb.net:27017,cluster0-shard-00-01.lbnxs.mongodb.net:27017,cluster0-shard-00-02.lbnxs.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-gbiukk-shard-0&authSource=admin&retryWrites=true&w=majority`
// `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.lbnxs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`




export const connectDatabase = async (): Promise<Database> => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

    const db = client.db('main');

    return{
        bookings: db.collection<Booking>("booking"),
        listings: db.collection<Listing>('listings'),
        users: db.collection<User>("users")
    };
};

