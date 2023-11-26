import React from 'react'
import { ModalConfig } from '../../../../types/generalTypes'
import { Divider, Button } from '@mui/material'
import "../../../../css/modalComponents/add-marker.css"; 

interface AddMarkerProps {
    data?: ModalConfig["data"]
}

export default function AddMarker({
    data
} : AddMarkerProps
){
    return (
        <div className='col h-center' style={{padding:"10px"}}>
            <Divider className='w100'>Marker Type</Divider>
            <div className='marker-type-row'>
                <Button>Chips</Button>
                <Button>Wood</Button>
            </div>
        </div>
    )
}
