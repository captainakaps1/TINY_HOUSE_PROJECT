import React, { useState } from "react"
import { RouteComponentProps } from "react-router-dom"
import { useQuery } from "react-apollo"
import { LISTING } from "../../lib/graphql/queries"
import { Listing as ListingData, ListingVariables } from "../../lib/graphql/queries/Listing/__generated__/Listing"
import {PageSkeleton, ErrorBanner} from "../../lib/components"
import {Col,Layout,Row} from "antd"
import { Moment } from "moment"
import {ListingBookings, ListingDetails, ListingCreateBooking,WrappedListingCreateBookingModal as ListingCreateBookingModel} from "./components"
import { Viewer } from "../../lib/types"


interface MatchParams{
    id: string
}

interface Props{
    viewer: Viewer
}


const { Content } = Layout

const PAGE_LIMIT = 3


export const Listing = ({ viewer, match }:Props & RouteComponentProps<MatchParams>) =>{
    const [bookingsPage, setBookingsPage] = useState(1)

    const [checkInDate, setCheckInDate] = useState<Moment | null>(null)

    const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null)

    const [modalVisible, setModalVisible] = useState(false)

    const {data, loading, error, refetch} = useQuery<ListingData, ListingVariables>(LISTING, {
        variables: {
            id:match.params.id,
            bookingsPage,
            limit: PAGE_LIMIT
        }
    })

    const clearBookingData = () => {
        setModalVisible(false)
        setCheckInDate(null)
        setCheckOutDate(null)
    }

    const handleListingRefetch = async () => {
        await refetch()
    }

    if(loading){
        return(
            <Content className="listings">
                <PageSkeleton/>
            </Content>
        )
    }

    if(error){
        return(
            <Content className="listings">
                <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!!"/>
                <PageSkeleton/>
            </Content>
        )
    }

    const listing = data ? data.listing : null

    const listingBookings = listing ? listing.bookings : null

    const ListingDetailsElement = listing ? <ListingDetails listing={listing}/> : null

    const listingBookingsElement = listingBookings? <ListingBookings listingBookings={listingBookings} bookingsPage={bookingsPage} limit={PAGE_LIMIT} setBookingsPage={setBookingsPage}/> : null

    const listingCreateBookingElement = listing ?<ListingCreateBooking price={listing.price} checkInDate={checkInDate} checkOutDate={checkOutDate} setCheckInDate={setCheckInDate} setCheckOutDate={setCheckOutDate} viewer={viewer} host={listing.host} bookingsIndex={listing.bookingsIndex} setModalVisible = {setModalVisible}/> : null

    const ListingCreateBookingModelElement = listing && checkInDate && checkOutDate ? (<ListingCreateBookingModel id={listing.id} price={listing.price} checkInDate={checkInDate} checkOutDate={checkOutDate} modalVisible ={modalVisible} setModalVisible={setModalVisible} clearBookingData={clearBookingData} handleListingRefetch={handleListingRefetch}/>): null


    return (
        <Content className="listing">
            <Row gutter={24} type="flex" justify="space-between">
                <Col xs={24} lg={14}>
                    {ListingDetailsElement}
                    {listingBookingsElement}
                </Col>
                <Col xs={24} lg={10}>
                    {listingCreateBookingElement}
                </Col>
            </Row>
            {ListingCreateBookingModelElement}
        </Content>
    )
}