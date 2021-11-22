
import { IResolvers } from "apollo-server-express";
import { Database,Listing } from "../../../lib/types";
import { ObjectId } from "mongodb";

export const listingResolvers: IResolvers = {
    Query: {
        listings: async (_root: undefined, _args: {}, {db}: {db: Database}):Promise<Listing[]> =>{
            
            return await db.listings.find({}).toArray();
        }
    },

    Mutation: {
        delete: async (_root: undefined, {id}: {id: string}, {db}: {db: Database}): Promise<Listing> =>{
            // throw new Error("Failed to Delete Listing");
            const deleteResult = await db.listings.findOneAndDelete({
                _id: new ObjectId(id)
            });

            if(!deleteResult.value){
                throw new Error("Failed to Delete Listing");
            }
            return deleteResult.value;
        }
    },

    Listing: {
        id: (listing: Listing): string => listing._id.toString()
    }
}