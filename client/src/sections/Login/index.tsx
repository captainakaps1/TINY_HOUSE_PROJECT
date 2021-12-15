import React, {useEffect,useRef} from "react"
import { Redirect } from "react-router-dom";
import { useApolloClient, useMutation } from "react-apollo";
import { Card, Layout, Spin , Typography } from "antd"
import googlelogo from "./assets/google_logo.jpg"
import { Viewer } from "../../lib/types";
import { LOG_IN } from "../../lib/graphql/mutation";
import { LogIn as LogInData, LogInVariables} from "../../lib/graphql/mutation/LogIn/__generated__/LogIn";
import { AUTH_URL } from "../../lib/graphql/queries";
import { AuthUrl as AuthUrlData } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import { ErrorBanner } from "../../lib/components"
import { displayErrorMessage, displaySuccessNotification } from "../../lib/components/utils";

const { Content } = Layout;
const { Text, Title } = Typography; 

interface Props{
    setViewer: (viewer:Viewer) => void
}

export const Login = ({ setViewer } : Props) =>{

    const client = useApolloClient();
    const [logIn, {data: logInData, loading: logInLoading, error: logInError}] = useMutation<LogInData,LogInVariables>(LOG_IN, {
        onCompleted: (data) => {
            if(data && data.logIn && data.logIn.token){
                setViewer(data.logIn)
                sessionStorage.setItem("token", data.logIn.token)
                displaySuccessNotification("You've successfully logged in!")
            }
        }
    })
    
    const logInRef = useRef(logIn)

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");

        if(code){
            logInRef.current({
                variables: {
                    input: {code}
                }
            })
        }
    },[])

    const handleRequest = async() => {
        try{
            const { data } = await client.query<AuthUrlData>({
                query: AUTH_URL
            })
            window.location.href = data.authUrl
        }catch{
            displayErrorMessage("Sorry! We aren't able to log you in. Please try again later")
        }
    }

    if(logInLoading){
        return (
            <Content className="log-in">
                <Spin size="large" tip="Logging you in..."/>
            </Content>
        )
    }

    if(logInData && logInData.logIn){
        const {id: viewerId} = logInData.logIn;
        return <Redirect to={`/user/${viewerId}`}/>
    }

    const logInErrorBannerElement = logInError? (<ErrorBanner description = "Sorry! We aren't able to log you in. Please try again later"/>): null

    return (<Content className="log-in">
        {logInErrorBannerElement}
        <Card className="log-in-card">
            <div className="log-in-card_intro">
                <Title level={3} className="log-in-card_into-title">
                    <span role="img" aria-label="wave">
                        👋
                    </span>
                </Title>
                <Title level={3} className="log-in-card_into-title">
                    Log in to TinyHouse!
                </Title>
                <Text>Sign in with Google to start booking available rentals!</Text>
            </div>
            <button className="log-in-card__google-button" onClick={handleRequest}>
                <img src={googlelogo} alt="Google logo" className="log-in-card__google-button-logo"/>
                <span className="log-in-card__google-button-text">Sign in with Google</span>
            </button>
            <Text type="secondary">Note: By signing in, you'll be redirected to the Google consent form to sin in with your Google account</Text>
        </Card>
    </Content>)
}