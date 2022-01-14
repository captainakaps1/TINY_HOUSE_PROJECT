import { MongoClient } from "mongodb";
import { Database, User, Listing, Booking } from "../lib/types";



const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.lbnxs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`


export const connectDatabase = async (): Promise<Database> => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

    const db = client.db('main');

    return{
        bookings: db.collection<Booking>("booking"),
        listings: db.collection<Listing>('listings'),
        users: db.collection<User>("users")
    };
};

