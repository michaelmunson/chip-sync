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
