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

const MIN_UPDATE_DISTANCE = .2 // miles

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
        Geo.getCurrentLocation().then(newCoords => {
            setCurrentLocation(oldCoords => {
                const distance = Geo.distance(newCoords, oldCoords);
                if (distance < MIN_UPDATE_DISTANCE){
                    return oldCoords;
                } else {
                    console.log("∆ Dist. =",distance,"miles");
                    return newCoords; 
                }
            });
            setTimeout(updateCurrentLocation, 1000);
        }); 
    }
    function subscribe(){ 
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
                theme={theme}
                setTheme={setTheme}
                modalConfig={modalConfig}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>
        </ThemeProvider>
    )
}
