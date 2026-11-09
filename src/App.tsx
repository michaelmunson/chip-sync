import React, { useEffect, useState } from 'react';
import {withAuthenticator} from "@aws-amplify/ui-react";
import Logo from './components/utils/Logo';
import { CognitoUser } from './types/generalTypes';
import { User } from './types/dataTypes';
import { DB } from './utils/database';
import Loader from './components/utils/Loader';
import Register from './components/register/Register';
import ArboristApp from './components/arborist/ArboristApp';
import GardnerApp from './components/gardner/GardnerApp';
import { Alert, Button } from '@mui/material';

type AppProps = {
    user?:CognitoUser,
    signOut?:() => void
}

function App({user, signOut}:AppProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User>();
    const [loadError, setLoadError] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);
    
    useEffect(() => {
        let active = true;
        setLoading(true);
        setLoadError(false);
        DB.getUser()
            .then(user => {
                if (active && user) setUserData(user);
            })
            .catch(error => {
                console.error("Could not load workspace", error);
                if (active) setLoadError(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [loadAttempt]);

    if (loading) return <Loader isFullScreen={true}/>

    if (loadError) return (
        <main className="app-loader">
            <Alert severity="error">We couldn’t load your workspace. Please try again.</Alert>
            <Button variant="contained" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Try again</Button>
            {signOut && <Button onClick={signOut}>Sign out</Button>}
        </main>
    );

    if (!userData) return <Register setUserData={setUserData}/>

    if (userData.role === "admin" || userData.role === "member"){
        return <ArboristApp userData={userData} setUserData={setUserData}/>
    }

    return <GardnerApp userData={userData} setUserData={setUserData}/>;
}

export default withAuthenticator(App, {
	components : {
		Header(){
			return (
                <div className="auth-brand">
                    <Logo size="small" />
                    <h1>Chip Sync</h1>
                    <p>Your crew. Your sites. One connected workspace.</p>
                </div>
            );
		} 
	}
});
