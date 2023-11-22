import React from 'react';
import logo from './logo.svg';
import './App.css';
import {withAuthenticator} from "@aws-amplify/ui-react";

function App() {
    return (<>
        Chip Sync
    </>);
}

export default withAuthenticator(App, {
	components : {
		Header(){
			return <div className='col center' style={{marginTop:"-100px", marginBottom:"50px"}}>
				<Logo size="large" shadow={true}/> 
			</div>
		} 
	}
});
