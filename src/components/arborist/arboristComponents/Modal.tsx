import React, { useMemo } from 'react';
import { Dialog } from '@mui/material';
import { Coordinates, ModalConfig, ToggleModal } from '../../../types/generalTypes';
import { User } from '../../../types/dataTypes';
import MarkerList from './modalComponents/MarkerList';
import AddMarker from './modalComponents/AddMarker';
import Notifications from './modalComponents/Notifications';
import "../../../css/modal.css"

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
    
    const ClassMap = useMemo(() => ({
        "marker-list" : "",
        "add-marker"  : "add-marker-modal",
        "notifications" : "",
        "marker-details" : "",
        "settings" : ""
    }), [])

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
            <>Marker Details</>,

        "settings" : () => 
            <>Settings</>
    }), []); 

    /* switch(type){
        case "marker-list": return (
            <Dialog
                id="modal"
                open={open}
                onClose={()=>toggleModal(false)}>
                <MarkerList
                    userData={userData}
                    toggleModal={toggleModal}
                    currentLocation={currentLocation}/>
            </Dialog>
        )
        case "add-marker": return (
            <Dialog
                id="modal"
                className='add-marker-modal' 
                open={open}
                onClose={()=>toggleModal(false)}>
                <AddMarker
                    data={data}
                    userData={userData}
                    toggleModal={toggleModal}
                    currentLocation={currentLocation}/>
            </Dialog>
        )
        case "notifications": return (
            <Dialog
                id="modal"
                className='add-marker-modal' 
                open={open}
                onClose={()=>toggleModal(false)}>
                <Notifications
                    data={data}
                    userData={userData}
                    toggleModal={toggleModal}
                    setUserData={setUserData}/>
            </Dialog>
        )
    } */
    return (
        <Dialog 
            id="modal"
            className={ClassMap[type]}
            open={open}
            onClose={()=>toggleModal(false)}>
            {ModalMap[type]()}
        </Dialog>
    )
}
