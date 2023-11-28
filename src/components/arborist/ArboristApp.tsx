import React, { useEffect, useState } from 'react';
import { createTheme } from '@mui/material';
import { User } from '../../types/dataTypes';
import Map from './arboristComponents/Map';
import Controls from './arboristComponents/Controls';
import { DB } from '../../utils/database';
import { Coordinates, ModalConfig } from '../../types/generalTypes';
import { Geo } from '../../utils/location';
import Modal from './arboristComponents/Modal';
import { S3 } from '../../utils/storage';
import { OrganizationGQLSocket } from '../../utils/websocket';

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
const decideTheme = () => {
    const date = new Date();
    return date.getHours() >= 18 ? "dark" : "light"; 
}

interface ArboristAppProps {
    userData:User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

export default function ArboristApp({
    userData,
    setUserData
} : ArboristAppProps
){
    const [socket, setSocket] = useState<any>(); 
    const [theme, setTheme] = useState<"light"|"dark">(decideTheme()); 
    const [currentLocation, setCurrentLocation] = useState<Coordinates>(Geo.zipcodeToCoordinates(userData.organization.location));
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({type:"add-marker"});
    /* USE EFFECTS */
    useEffect(updateCurrentLocation, []);
    useEffect(subscribe, [userData]);

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
    function subscribe(){
        const organizationId = userData.organization.id; 
        setSocket((sock:any) => {
            console.log("SOCK", sock);
            if (!sock) {
                const newSock = DB.subscribeToOrganization({
                    organizationId,
                    callback: (data) => {
                        console.log("SOCK DATA", data); 
                    }
                });
                return newSock
            } else {
                return sock; 
            }
        })
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
            toggleModal={toggleModal}
            currentLocation={currentLocation}/>

        <button style={{zIndex:1000000, position:'relative'}} onClick={e => {
            setCurrentLocation({
                latitude: 40.730610,
                longitude: -73.935242
            });
        }}>HELLO</button>
    </>
}
