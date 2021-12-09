import  merge from "lodash.merge";
import { userResolvers } from "./User";
import { viewerResolvers } from "./Viewer";
import { listingResolvers } from "./Listings"
import { bookingResolvers } from "./Bookings";

export const resolvers = merge(userResolvers, viewerResolvers, listingResolvers, bookingResolvers);