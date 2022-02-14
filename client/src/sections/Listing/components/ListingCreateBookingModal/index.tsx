import React from "react";
import { useMutation } from "react-apollo";
import { CardElement, injectStripe, ReactStripeElements } from "react-stripe-elements";
import { Modal,Button, Divider,Icon, Typography } from "antd";
import moment, { Moment } from "moment";
import { CREATE_BOOKING } from "../../../../lib/graphql/mutation";
import {CreateBooking as CreateBookingData, CreateBookingVariables} from "../../../../lib/graphql/mutation/CreateBooking/__generated__/CreateBooking"
import { formatListingPrice, displayErrorMessage, displaySuccessNotification } from "../../../../lib/components";


interface Props{
    id: string
    price: number
    modalVisible: boolean
    checkInDate: Moment
    checkOutDate: Moment
    setModalVisible: (modalVisible: boolean) => void
    clearBookingData: () => void
    handleListingRefetch: () => Promise<void>
}

const {Text, Paragraph, Title } = Typography


export const ListingCreateBookingModel = ({price,checkInDate,checkOutDate,modalVisible, setModalVisible,stripe, id, clearBookingData, handleListingRefetch}:Props & ReactStripeElements.InjectedStripeProps) => {

    const [createBooking, { loading}] = useMutation<CreateBookingData, CreateBookingVariables>(CREATE_BOOKING, {
        onCompleted: () => {
            clearBookingData()
            displaySuccessNotification("You've successfully booked the listing!", "Booking history can always be found in your user page.")
            handleListingRefetch()
        },
        onError: () => {
            displayErrorMessage("Sorry! We weren't able to successfully booking the listing. Please try again later!")
        }
    })

    const daysBooked = checkOutDate.diff(checkInDate,"days") + 1

    const listingPrice = price * daysBooked
    // const tinyHouseFee = listingPrice * 0.05
    // const totalPrice = listingPrice + tinyHouseFee

    const handleCreateBooking = async () => {
        if (!stripe){
            return displayErrorMessage("Sorry We weren't ables to connect with Stripe.")
        }

        let { token: stripeToken, error } = await stripe.createToken()
        if(stripeToken){
            createBooking({
                variables:{
                    input: {
                        id:id,
                        source: stripeToken.id,
                        checkIn:moment(checkInDate).format("YYYY-MM-DD"),
                        checkOut:moment(checkOutDate).format("YYYY-MM-DD")
                    }
                }
            })
        }else{
            displayErrorMessage(error && error.message? error.message: "Sorry we weren't able to book the listing. Please try again later!!")
        }
    }

    return(
        <Modal 
        visible={modalVisible}
        centered
        footer={null}
        onCancel={() => setModalVisible(false)}>
            <div className="listing-booking-modal">
                <div className="listing-booking-modal__intro">
                    <Title className="listing-booking-modal__intro-title"><Icon type="key"></Icon></Title>
                    <Title level={3} className="listing-booking-modal__intro-title">Book your trip</Title>
                    <Paragraph>Enter your payment information to book the listing from the dates between{" "}<Text mark strong>{moment(checkInDate).format("MMMM Do YYYY")}</Text>{" "} and {" "} 
                    <Text mark strong>{moment(checkOutDate).format("MMMM DD YYYY")}</Text>, inclusive. 
                    </Paragraph>
                </div>
                <Divider/>

                <div className="listing-booking-modal__charge-summary">
                    <Paragraph>{formatListingPrice(price,false)} * {daysBooked} days = {" "}
                    <Text strong>{formatListingPrice(listingPrice,false)}</Text>
                    </Paragraph>

                    {/* <Paragraph>
                        TinyHouse Fee <sub>~ 5%</sub> = {" "} <Text strong>{formatListingPrice(tinyHouseFee)}</Text>
                    </Paragraph> */}

                    <Paragraph className="listing-booking-modal__charge-summary-total">
                        Total = <Text mark>{formatListingPrice(listingPrice,false)}</Text>
                    </Paragraph>
                </div>

                <Divider/>

                <div className="listing-booking-modal__stripe-card-section">
                    <CardElement hidePostalCode className="listing-booking-modal__stripe-card"/>
                    <Button size="large" type="primary" className="listing-booking-modal__cta" onClick={handleCreateBooking} loading={loading}>Book</Button>
                </div>
            </div>

        </Modal>
    )
}


export const WrappedListingCreateBookingModal = injectStripe(ListingCreateBookingModel)