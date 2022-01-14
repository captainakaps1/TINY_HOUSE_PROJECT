import { Booking, Listing, ListingType } from "../../../lib/types";

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
    location: string | null
    filter: ListingsFilters
    limit: number
    page: number
}

export interface ListingsData{
    region: string | null
    total: number
    result: Listing[]
}

export interface ListingsQuery{
    country?: string
    admin ?: string
    city ?: string
}

export interface HostListingInput{
    title: string
    description: string
    image: string
    type: ListingType
    address: string
    price: number
    numOfGuests: number
}

export interface HostListingArgs{
    input: HostListingInput
}