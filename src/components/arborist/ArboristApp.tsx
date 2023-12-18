import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { User } from '../../types/dataTypes';
import Map from './arboristComponents/Map';
import Controls from './arboristComponents/Controls';
import { DB } from '../../utils/database';
import { Coordinates, ModalConfig } from '../../types/generalTypes';
import { Geo } from '../../utils/location';
import Modal from './arboristComponents/Modal';
import { S3 } from '../../utils/storage';
import Theme from '../../utils/theme';

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
    const [theme, setTheme] = useState<"light"|"dark">(Theme.decide()); 
    const [currentLocation, setCurrentLocation] = useState<Coordinates>(Geo.zipcodeToCoordinates(userData.organization.location));
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({type:"add-marker"});
    /* USE EFFECTS */
    useEffect(updateCurrentLocation, []);
    useEffect(subscribe, []); // removed userData dependency
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
        setTimeout(updateCurrentLocation, 10000); 
    }
    function subscribe(){
        console.log({userData}); 
        setSocket((sock:any) => {
            if (!sock) {
                const newSock = DB.subscribeToNotification((data) => {
                    console.log("SOCK DATA", data); 
                    DB.getUser().then(user => {
                        console.log("Updating User Data...", user); 
                        if (user) setUserData(user);
                    });
                });
                window.exports = {sock:newSock};
                return newSock
            } else {
                return sock; 
            }
        })
    }
    
    return (
        <ThemeProvider theme={Theme[theme]}>
            <CssBaseline/>
            <Map
                theme={theme}
                userData={userData}
                currentLocation={currentLocation}
                toggleModal={toggleModal}/>
            
            <Controls
                userData={userData}
                toggleModal={toggleModal}/>

            <Modal
                open={modalOpen}
                userData={userData}
                setUserData={setUserData}
                modalConfig={modalConfig}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>

            <button style={{zIndex:1000000, position:'relative'}} onClick={e => {
                setCurrentLocation({
                    latitude: 40.730610,
                    longitude: -73.935242
                });
            }}>HELLO</button>
        </ThemeProvider>
    )
}
