import React,{useState} from "react"
import { RouteComponentProps } from "react-router-dom"
import { useQuery } from "react-apollo"
import { User as UserData, UserVariables } from "../../lib/graphql/queries/User/__generated__/User"
import { USER } from "../../lib/graphql/queries"
import { Viewer } from "../../lib/types"
import { ErrorBanner,PageSkeleton } from "../../lib/components"
import { Col, Layout, Row } from "antd"
import {UserProfile ,UserListings, UserBookings} from "./components"

interface Props{
    viewer: Viewer
    setViewer: (viewer: Viewer) => void
}

interface MatchParams{
    id: string
}

const { Content } = Layout;
const PAGE_LIMIT = 4

export const User = ({viewer,setViewer,match}: Props & RouteComponentProps<MatchParams>) =>{
    const [listingsPage, setListingsPage] = useState(1)
    const [bookingsPage, setBookingsPage] = useState(1)

    const { data, loading, error, refetch} = useQuery<UserData, UserVariables>(USER,{
        variables: {
            id: match.params.id,
            bookingsPage,
            listingsPage,
            limit: PAGE_LIMIT
        }
    })

    const handleUserRefetch = async() => {
        await refetch()
    }

    const stripeError = new URL(window.location.href).searchParams.get("stripe_error")

    const stripeErrorBanner = stripeError ? (
        <ErrorBanner description="We had an issue connecting with Stripe. Please try again later"/>
    ): null

    
    if(loading){
        return(
            <Content className="user">
                <PageSkeleton/>
            </Content>
        )
    }


    if(error){
        return(
            <Content className="user">
                <ErrorBanner description="This user may not exist or we've encountered an error. Please try again later!!"/>
                <PageSkeleton/>
            </Content>
        )
    }

    const user = data ? data.user : null
    const viewerIsUser = viewer.id === match.params.id

    const userListings = user ? user.listings : null
    const userBookings = user ? user.bookings : null

    const userProfileElement = user ? <UserProfile user ={user} viewerIsUser ={viewerIsUser} viewer={viewer} setViewer={setViewer} handleUserRefetch={handleUserRefetch}/>: null

    const userListingElement = userListings? <UserListings userListings={userListings} listingsPage={listingsPage} limit={PAGE_LIMIT} setListingsPage={setListingsPage}/> : null

    const userBookingElement = userBookings? <UserBookings userBookings={userBookings} bookingsPage={bookingsPage} limit={PAGE_LIMIT} setBookingsPage={setBookingsPage}/> : null


    return (
        <Content className="user">
            {stripeErrorBanner}
            <Row gutter={12} type="flex" justify="space-between">
                <Col xs={24}>{userProfileElement}</Col>
                <Col xs={24}>
                    {userListingElement}
                    {userBookingElement}
                </Col>
            </Row>
        </Content>
    )
}