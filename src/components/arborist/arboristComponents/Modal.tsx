import React, { useEffect, useMemo } from 'react';
import { Dialog } from '@mui/material';
import { Coordinates, ModalConfig, ToggleModal } from '../../../types/generalTypes';
import { Marker, User } from '../../../types/dataTypes';
import MarkerList from './modalComponents/MarkerList';
import AddMarker from './modalComponents/AddMarker';
import Notifications from './modalComponents/Notifications';
import "../../../css/modal.css"
import MarkerDetails from './modalComponents/MarkerDetails';
import Settings from './modalComponents/Settings';

interface ModalProps {
    open: boolean
    userData: User
    theme:"light"|"dark"
    setUserData:React.Dispatch<React.SetStateAction<User|undefined>>
    setTheme:React.Dispatch<React.SetStateAction<"light"|"dark">>
    modalConfig:ModalConfig
    toggleModal:ToggleModal
    currentLocation:Coordinates
}

export default function Modal({
    open,
    userData,
    modalConfig,
    theme,
    toggleModal,
    setUserData,
    setTheme,
    currentLocation
} : ModalProps) {

    const {type, data, goBackLocation} = modalConfig; 

    const ModalMap = useMemo(() => ({
        "marker-list" : () => 
            <MarkerList
                userData={userData}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>,
                
        "add-marker"  : () =>
            <AddMarker
                data={data}
                userData={userData}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>,

        "notifications" : () =>
            <Notifications
                data={data}
                userData={userData}
                toggleModal={toggleModal}
                setUserData={setUserData}/>,

        "marker-details" : () => 
            <MarkerDetails  
                data={(data as Marker)}
                userData={userData}
                goBackLocation={goBackLocation}
                toggleModal={toggleModal}/>,

        "settings" : () => 
            <Settings
                theme={theme}
                userData={userData}
                setTheme={setTheme}
                setUserData={setUserData}/>

    }), [modalConfig, theme, userData, ]); 

    return (
        <Dialog
            id="modal"
            className={`${type}-modal`}
            open={open}
            onClose={()=>toggleModal(false)}>
            {ModalMap[type]()}
        </Dialog>
    )
}
