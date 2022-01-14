import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { authorize } from "../../../lib/utils"
import { Google } from "../../../lib/api";
import { Database, Listing, User } from "../../../lib/types"
import { ListingArgs, ListingBookingsArgs, ListingBookingsData, ListingsArgs, ListingsData, ListingsFilters, ListingsQuery } from "./types"


export const listingResolvers: IResolvers = {
    Query: {
        listing: async (_root: undefined, { id }: ListingArgs, { db, req }: { db: Database; req: Request }): Promise<Listing> => {
            try {
              const listing = await db.listings.findOne({ _id: new ObjectId(id) });
              if (!listing) {
                throw new Error("listing can't be found");
              }
      
              const viewer = await authorize(db, req);
              if (viewer && viewer._id === listing.host) {
                listing.authorized = true;
              }
      
              return listing;
            } catch (error) {
              throw new Error(`Failed to query listing: ${error}`);
            }
        },
        listings: async(_root: undefined, {location, filter, limit, page}:ListingsArgs, {db}: {db:Database}): Promise<ListingsData> => {
            try{
                const query: ListingsQuery = {}

                const data: ListingsData = {
                    region: null,
                    total: 0,
                    result : []
                }
                

                if(location){
                    const {country, city, admin} = await Google.geocode(location)

                    if(city) query.city = city

                    if(admin) query.admin = admin

                    if(country){
                        query.country = country
                    }else{ 
                        throw new Error("Country not found")
                    }


                    const cityText = city ? `${city}, ` : ""
                    const adminText = admin ? `${admin}, `: ""
                    data.region = `${cityText}${adminText}${country}`
                }

                
                let cursor = await db.listings.find(query)

                if(filter && filter === ListingsFilters.PRICE_LOW_TO_HIGH){
                    cursor = cursor.sort({ price: 1})
                }

                if(filter && filter === ListingsFilters.PRICE_HIGHT_TO_LOW){
                    cursor = cursor.sort({price: -1})
                }


                cursor = cursor.skip(page > 0 ? (page - 1) * limit: 0)
                cursor = cursor.limit(limit)
 
                data.total = await cursor.count()
                data.result = await cursor.toArray()
 
                return data
             }catch(error){
                 throw new Error(`Failed to query listings: ${error}`)
             }
        }
    },
    Listing: {
        id: (listing: Listing): string => {
            return listing._id.toString();
        },

        host: async(listing:Listing, _args:{}, { db }:{ db:Database }):Promise<User> => {
            const host = await db.users.findOne({_id: listing.host })
            
            if(!host){
                throw new Error("host can' be found")
            }
            return host
        },

        bookingsIndex: (listing:Listing):string => {
            return JSON.stringify(listing.bookingsIndex)
        },

        bookings: async (listing: Listing, {limit, page}: ListingBookingsArgs, {db}: {db: Database}):Promise<ListingBookingsData | null> =>{
            try{
               if(!listing.authorized){
                   return null 
               }

               const data: ListingBookingsData = {
                   total: 0,
                   result : []
               }

               let cursor = await db.bookings.find({
                   _id: {$in: listing.bookings}
               })

               cursor = cursor.skip(page > 0 ? (page - 1) * limit: 0)
               cursor = cursor.limit(limit)

               data.total = await cursor.count()
               data.result = await cursor.toArray()

               return data
            }catch(error){
                throw new Error(`Failed to query listing bookings: ${error}`)
            }
        },
    }
}