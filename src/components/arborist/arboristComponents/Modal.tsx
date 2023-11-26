import React from 'react';
import { Dialog } from '@mui/material';
import { Coordinates, ModalConfig, ToggleModal } from '../../../types/generalTypes';
import { User } from '../../../types/dataTypes';
import MarkerList from './modalComponents/MarkerList';
import "../../../css/modal.css"
import AddMarker from './modalComponents/AddMarker';

interface ModalProps {
    open: boolean
    userData: User
    modalConfig:ModalConfig
    toggleModal: ToggleModal
    currentLocation:Coordinates
}

export default function Modal({
    open,
    userData,
    modalConfig,
    toggleModal,
    currentLocation
} : ModalProps) {

    const {type, data, goBack, goBackLocation} = modalConfig; 

    switch(type){
        case "marker-list": return (
            <Dialog 
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
                open={open}
                onClose={()=>toggleModal(false)}>
                <AddMarker
                    data={data}/>
            </Dialog>
        )
    }
    return (
        <Dialog 
            open={open}
            onClose={()=>toggleModal(false)}>
            {modalConfig.type}
        </Dialog>
    )
}
