import React, { useEffect, useState } from 'react';
import { createTheme } from '@mui/material';
import { User } from '../../types/dataTypes';
import Map from './arboristComponents/Map';
import Controls from './arboristComponents/Controls';
import { DB } from '../../utils/database';
import { Coordinates } from '../../types/generalTypes';
import { Geo } from '../../utils/location';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});
const lightTheme = createTheme({
	palette: {
		mode: "light"
	}
});

interface ArboristAppProps {
    userData:User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

export default function ArboristApp({
    userData,
    setUserData
} : ArboristAppProps
){
    const [theme, setTheme] = useState<"light"|"dark">("light"); 
    const [currentLocation, setCurrentLocation] = useState<Coordinates>(); 
    /* USE EFFECTS */
    useEffect(updateCurrentLocation, []);
    /* Utility Functions */
    function updateCurrentLocation(){
        Geo.getCurrentLocation().then(coords => {
            setCurrentLocation(coords); 
        });
    }
    
    return <>
        <Map
            currentLocation={currentLocation}
            userData={userData}
            theme={theme}/>
        
        <Controls
            userData={userData}/>

        <button style={{zIndex:1000000, position:'relative'}} onClick={e => {
            setCurrentLocation({
                latitude: 0,
                longitude: 0
            });
        }}>HELLO</button>
    </>
}
