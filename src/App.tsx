import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {withAuthenticator} from "@aws-amplify/ui-react";
import Logo from './components/utils/Logo';
import { User } from './types/generalTypes';


type AppProps = {
    user?:User,
    signOut?:() => void
}

function App({user, signOut}:AppProps) {
    
    useEffect(() => {
        window.exports = {user,signOut}; 
        console.log(window.exports); 
    }, []); 

    return (<>
        Chip Sync
    </>);
}

export default withAuthenticator(App, {
	components : {
		Header(){
			return <div className='col center' style={{marginTop:"-100px", marginBottom:"50px"}}>
				<Logo size='large' /> 
			</div>
		} 
	}
});
