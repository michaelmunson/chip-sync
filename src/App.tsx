import React, { useEffect, useState } from 'react';
import {withAuthenticator} from "@aws-amplify/ui-react";
import Logo from './components/utils/Logo';
import { CognitoUser } from './types/generalTypes';
import { User } from './types/dataTypes';
import { DB } from './utils/database';
import Loader from './components/utils/Loader';
import Register from './components/register/Register';
import ArboristApp from './components/arborist/ArboristApp';

type AppProps = {
    user?:CognitoUser,
    signOut?:() => void
}

function App({user, signOut}:AppProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User>();
    
    useEffect(() => {
        DB.getUser().then(user => {
            console.log("User: ", user); 
            if (user) setUserData(user); 
            setLoading(false);
        });
    }, []);

    if (loading) return <Loader isFullScreen={true}/>

    if (!userData) return <Register setUserData={setUserData}/>

    if (userData.role === "admin" || userData.role === "member"){
        return <ArboristApp userData={userData} setUserData={setUserData}/>
    }

    return (
        <>User Has Account</>
    )
}

export default withAuthenticator(App, {
	components : {
		Header(){
			return <div className='col h-center' style={{marginTop:"-100px", marginBottom:"50px"}}>
				<Logo size='large' /> 
			</div>
		} 
	}
});
