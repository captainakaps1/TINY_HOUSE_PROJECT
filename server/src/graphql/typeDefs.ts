import { gql } from "apollo-server-core";

export const typeDefs = gql`
type Listing{
    id: ID!
    title: String!
    image: String!
    address: String!
    price: Int!
    numOfGuests: Int!
    numOfBeds: Int!
    numOfBaths: Int!
    rating: Int!
}

type Query{
    listings: [Listing!]!
}

type Mutation{
    delete(id: ID!): Listing!
}
`;