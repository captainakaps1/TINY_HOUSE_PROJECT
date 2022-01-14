import React, {useEffect, useRef, useState} from "react"
import { Link, RouteComponentProps } from "react-router-dom"
import { useQuery } from "react-apollo"
import { Affix ,Layout, List, Typography} from "antd"
import { ErrorBanner, ListingCard } from "../../lib/components"
import { LISTINGS } from "../../lib/graphql/queries"
import { Listings as ListingsData, ListingsVariables } from "../../lib/graphql/queries/Listings/__generated__/Listings"
import { ListingsFilter } from "../../lib/graphql/globalTypes"
import { ListingsFilters, ListingsPagination, ListingsSkeleton } from "./components"

interface MatchParams {
    location: string
}


const { Content } = Layout
const { Title, Paragraph, Text } = Typography
const PAGE_LIMIT = 4


export const Listings = ({ match} : RouteComponentProps<MatchParams>) =>{
    const locationRef = useRef(match.params.location)
    const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH)
    const [page, setPage] = useState(1)


    const { data, loading, error } = useQuery<ListingsData, ListingsVariables>(LISTINGS,{
        skip: locationRef.current !== match.params.location && page !== 1,
        variables: {
            location: match.params.location, 
            filter,
            limit: PAGE_LIMIT,
            page
        }
    })

    useEffect(() => {
        setPage(1)
        locationRef.current = match.params.location
    }, [match.params.location])

    if(loading){
        return(
            <Content className="listings">
                <ListingsSkeleton/>
            </Content>
        )
    } 

    if(error){
        return(
            <Content className="listings">
                <ErrorBanner description="We either couldn't find anything matching you search or have encounted an error. If you're searching for a unique location, try searching again with more common keywords."/>
                <ListingsSkeleton/>
            </Content>
        )
    }
    const listings = data ? data.listings : null

    const listingsRegion = listings ? listings.region : null

    const ListingsSectionElement = listings && listings.result.length? (
        <div>
            <Affix offsetTop={64}>
                <ListingsPagination page={page} total={listings.total} limit={PAGE_LIMIT} setPage={setPage}/>
                <ListingsFilters filter={filter} setFilter={setFilter}/>
            </Affix>
            <List 
            grid={{
                gutter: 8,
                xs: 1,
                sm: 2,
                lg: 4
            }}
            dataSource={listings.result}
            renderItem={listing => (
                <List.Item>
                    <ListingCard listing={listing}/>
                </List.Item>
            )}/>
        </div>
    ) : (<div>
        <Paragraph>It appears that no listings have yet been created for{" "}
            <Text mark>"{listingsRegion}"</Text> 
        </Paragraph>

        <Paragraph>Be the first person to create a <Link to="/host">listing in this area!</Link>
        </Paragraph>
    </div>)

    const ListingsRegionElement = listingsRegion ? (
        <Title level={3} className="listings__title">Results for "{listingsRegion}"</Title>
    ): null

    return <Content className="listings">
        {ListingsRegionElement}
        {ListingsSectionElement}</Content>
}