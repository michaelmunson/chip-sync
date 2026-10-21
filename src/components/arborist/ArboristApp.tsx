import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { User } from '../../types/dataTypes';
import Map from './arboristComponents/Map';
import Controls from './arboristComponents/Controls';
import { DB } from '../../utils/database';
import { Coordinates, ModalConfig, NativeMessaging } from '../../types/generalTypes';
import { Geo } from '../../utils/location';
import Modal from './arboristComponents/Modal';
import { S3 } from '../../utils/storage';
import Theme from '../../utils/theme';
import Native from '../../utils/native';
import payment from '../../utils/payment';
import PricingPage from './arboristComponents/Pricing';
import TrialStart from './arboristComponents/TrialStart';
import { RequestsProvider } from '../requests/RequestsContext';
import { useNotificationSocket } from '../../utils/notificationFeed';

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
    const [theme, setTheme] = useState<"light"|"dark">(Theme.decide()); 
    const [currentLocation, setCurrentLocation] = useState<Coordinates>(Geo.zipcodeToCoordinates(userData.organization.location));
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({type:"add-marker"});
    /* USE EFFECTS */
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        return () => { delete document.documentElement.dataset.theme; };
    }, [theme]);
    useEffect(updateCurrentLocation, []);
    useNotificationSocket(setUserData);
    useEffect(() => {
        const listener = Native.listen(async message => {
            if (typeof message.data !== 'string') return;
            const messageData:NativeMessaging.Error|NativeMessaging.Payment = JSON.parse(message.data); 
            if (messageData.status === 200 && messageData.messageType === "payment"){
                const tier = messageData.data.tier;
                if (tier.cycle && tier.plan && tier.timestamp){
                    const updateOrgRes:any = await DB.updateOrganization({organizationId:userData.organization.id, tier}); 
                    const newUserData = await DB.getUser();
                    if (newUserData) setUserData(newUserData)
                }
            } 
            else if (messageData.messageType === "error") {
                
            }
        });
        return listener; 
    }, []);
    

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
                    return newCoords; 
                }
            });
            setTimeout(updateCurrentLocation, 1000);
        }).catch(() => {
            // Location permission denied/unavailable: keep the saved organization location.
        });
    }

    // if (payment.isRequirePayment(userData.organization.tier.plan)) return (
    //     <PricingPage
    //         userData={userData}
    //         setUserData={setUserData}/>
    // )

    if (userData.organization.tier.plan === "") return (
        <TrialStart userData={userData} setUserData={setUserData}/>
    )
    
    return (
        <ThemeProvider theme={Theme[theme]}>
            <CssBaseline/>
            <RequestsProvider role="organization" userData={userData} setUserData={setUserData}>
            <main className="workspace" aria-label="Drop site map">
            <Map
                theme={theme}
                userData={userData}
                currentLocation={currentLocation}
                toggleModal={toggleModal}/>
            
            <Controls
                userData={userData}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>

            <Modal
                open={modalOpen}
                userData={userData}
                setUserData={setUserData}
                theme={theme}
                setTheme={setTheme}
                modalConfig={modalConfig}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>
            </main>
            </RequestsProvider>
        </ThemeProvider>
    )
}
