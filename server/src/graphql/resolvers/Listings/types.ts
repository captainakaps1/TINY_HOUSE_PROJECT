import { Booking, Listing } from "../../../lib/types";

export enum ListingsFilters{
    PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
    PRICE_HIGHT_TO_LOW = "PRICE_HIGH_TO_LOW"
}

export interface ListingArgs{
    id: string
}

export interface ListingBookingsArgs{
    limit: number
    page: number
}

export interface ListingBookingsData{
    total: number
    result: Booking[]
}

export interface ListingsArgs{
    filter: ListingsFilters
    limit: number
    page: number
}

export interface ListingsData{
    total: number
    result: Listing[]
}