import React ,{ useState }from 'react';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {Home,Host,Listing,Listings,NotFound,User,Login,AppHeader} from "./sections";
import { Affix,Layout } from 'antd';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import "./styles/index.css"
import { Viewer } from "./lib/types"


const client = new ApolloClient({
  uri: "/api",
});

const initiaLViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false
}

const App = () => {
  const[viewer, setViewer] = useState<Viewer>(initiaLViewer)
  console.log(viewer)
  return (
    <Router>
      <Layout id="app">
        <Affix offsetTop={0} className="app__affix-header"> 
          <AppHeader />
        </Affix>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/host" component={Host}/>
          <Route exact path="/listing/:id" component={Listing}/>
          <Route exact path="/login" render ={props => <Login {...props} setViewer={setViewer}/>}/>
          <Route exact path="/listings/:location?" component={Listings}/>
          <Route exact path="/user/:id" component={User}/>
          <Route component={NotFound}/>
        </Switch>
      </Layout>
    </Router>
  )
}

ReactDOM.render(
  <ApolloProvider client = {client}>
    <App/>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
