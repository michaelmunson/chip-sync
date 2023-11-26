import React, { useEffect, useState } from 'react';
import { createTheme } from '@mui/material';
import { User } from '../../types/dataTypes';
import Map from './arboristComponents/Map';
import Controls from './arboristComponents/Controls';
import { DB } from '../../utils/database';
import { Coordinates, ModalConfig } from '../../types/generalTypes';
import { Geo } from '../../utils/location';
import Modal from './arboristComponents/Modal';

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
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({type:"add-marker"});
    /* USE EFFECTS */
    useEffect(updateCurrentLocation, []);
    /* Utility Functions */
    function toggleModal(isOpen:boolean, config?:ModalConfig){
        if (config) {
            setModalConfig(config); 
        }
        setModalOpen(isOpen); 
    }
    function updateCurrentLocation(){
        Geo.getCurrentLocation().then(coords => {
            setCurrentLocation(coords); 
        });
    }
    
    return <>
        <Map
            theme={theme}
            userData={userData}
            currentLocation={currentLocation}/>
        
        <Controls
            userData={userData}
            toggleModal={toggleModal}/>

        <Modal
            open={modalOpen}
            userData={userData}
            modalConfig={modalConfig}
            toggleModal={toggleModal}/>

        <button style={{zIndex:1000000, position:'relative'}} onClick={e => {
            setCurrentLocation({
                latitude: 40.730610,
                longitude: -73.935242
            });
        }}>HELLO</button>
    </>
}
