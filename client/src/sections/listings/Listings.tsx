import React from "react";
import { useQuery , useMutation} from "../../lib/api";
import { DeleteListingData,DeleteListingVariables,ListingData } from "./types"


const LISTINGS = `
query Listings{
    listings{
        id
        title
        image
        address
        price
        numOfBeds
        numOfBaths
        rating
    }
}
`

const DELETE_LISTING = `
   mutation DeleteListing($id: ID!){
       delete(id:$id){
           id
       }
   } 
`

interface Props{
    title:string
}


export const Listings = ({ title }:Props) =>{
    const { data ,loading,error, refetch} = useQuery<ListingData >(LISTINGS)
    
    const [
        deleteListing,{loading: deleteListingLoading,
        error: deleteListingError}] = useMutation<DeleteListingData,DeleteListingVariables>(DELETE_LISTING)

    const HandledeleteListing = async(id: string) =>{
        await deleteListing({ id })

        refetch()
    }

    const listings = data ? data.listings : null

    const listingsList = listings? (<ul>{listings.map((listing) => {
        return <li key={listing.id}>{listing.title}
        <button onClick = {() => HandledeleteListing(listing.id)}>Delete</button>
        </li>
    })}</ul>):null

    if (loading){
        return <h2>Loading...</h2>
    }
    

    if (error){
        return (<h2>Oh no! Something went wrong.</h2>)
    }

    const deleteListingLoadingMessage = deleteListingLoading? <h4>Deletion in progress...</h4>: null

    const deleteListingErrorMessage = deleteListingError? <h4>Uh oh! Something wnet wrong with deleting - please try again later :(</h4>: null

    return <div>
        <h2>{title}</h2>
        {listingsList}
        {deleteListingLoadingMessage}
        {deleteListingErrorMessage}
    </div>
};