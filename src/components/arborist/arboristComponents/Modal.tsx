import React, { useEffect, useMemo } from 'react';
import { Dialog } from '@mui/material';
import { Coordinates, ModalConfig, ToggleModal } from '../../../types/generalTypes';
import { Marker, User } from '../../../types/dataTypes';
import MarkerList from './modalComponents/MarkerList';
import AddMarker from './modalComponents/AddMarker';
import Notifications from './modalComponents/Notifications';
import "../../../css/modal.css"
import MarkerDetails from './modalComponents/MarkerDetails';

interface ModalProps {
    open: boolean
    userData: User
    setUserData:React.Dispatch<React.SetStateAction<User | undefined>>
    modalConfig:ModalConfig
    toggleModal:ToggleModal
    currentLocation:Coordinates
}

export default function Modal({
    open,
    userData,
    modalConfig,
    toggleModal,
    setUserData,
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
            <>Settings</>
    }), [modalConfig]); 

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
