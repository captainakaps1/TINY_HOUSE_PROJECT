import React, { useEffect, useRef} from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { useMutation } from "react-apollo";
import { Layout, Spin } from "antd";
import { CONNECT_STRIPE } from "../../lib/graphql/mutation";
import { ConnectStripe as ConnectStripeData, ConnectStripeVariables } from "../../lib/graphql/mutation/ConnectStripe/__generated__/ConnectStripe"
import { Viewer } from "../../lib/types";
import { displaySuccessNotification } from "../../lib/components";

interface Props{
    viewer: Viewer
    setViewer: (viewer: Viewer) => void
}
const { Content } = Layout

export const Stripe = ({ viewer, setViewer, history}: Props & RouteComponentProps) => {
    const [connectStripe, {data , loading, error}] = useMutation<ConnectStripeData, ConnectStripeVariables>(CONNECT_STRIPE,{
        onCompleted: data => {
            if(data && data.connectStripe){
                setViewer({...viewer, hasWallet: data.connectStripe.hasWallet})
                displaySuccessNotification("You've successfully connected your Stripe Account!!","You can now begin to create listings in the Host page")
            }
        }
    })

    const connectStripeRef = useRef(connectStripe)
    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code")

        if(code){
            connectStripeRef.current({
               variables: {
                   input: {code}
               }
           }) 
        }else{
            history.replace("/login")
        }
    }, [history])

    if(loading){
        return (
            <Content className="stripe">
                <Spin size="large" tip="Connecting your Stripe account..."/>
            </Content>
        )
    }

    if(error){
        return <Redirect to={`/user/${viewer.id}?stripe_error=true`}/>
    }

    if(data && data.connectStripe){
        return <Redirect to={`/user/${viewer.id}`}/>
    }

    return null
}