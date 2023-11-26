import React from 'react';
import { Dialog } from '@mui/material';
import { ModalConfig, ToggleModal } from '../../../types/generalTypes';
import { User } from '../../../types/dataTypes';

interface ModalProps {
    open: boolean,
    userData: User,
    modalConfig:ModalConfig,
    toggleModal: ToggleModal
}

export default function Modal({
    open,
    userData,
    modalConfig,
    toggleModal
} : ModalProps) {

    return (
        <Dialog 
            open={open}
            onClose={()=>toggleModal(false)}>
            {modalConfig.type}
        </Dialog>
    )
}
