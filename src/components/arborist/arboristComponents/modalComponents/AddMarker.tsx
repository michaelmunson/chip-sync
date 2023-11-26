import React, {useState} from 'react'
import { ModalConfig } from '../../../../types/generalTypes'
import { Divider, Button, TextField } from '@mui/material'
import { Check } from '@mui/icons-material';
import "../../../../css/modalComponents/add-marker.css"; 
import Spacer from '../../../utils/Spacer';

interface AddMarkerProps {
    data?: ModalConfig["data"]
}

export default function AddMarker({
    data
} : AddMarkerProps
){
    const [markerType, setMarkerType] = useState<Set<string>>(new Set());

    function changeMarkerType(type:"chips"|"wood"){
        setMarkerType(mt => {
            if (mt.has(type)) mt.delete(type);
            else mt.add(type);
            return new Set([...mt]);  
        }); 
    }

    return (
        <div className='col h-center' style={{padding:"10px"}}>
            <Divider className='w100 b'>Marker Type</Divider>
            <div className='row h-center w100 marker-type-row m2'>
                <Button
                    color={markerType.has('chips')?"success":"inherit"}
                    variant={markerType.has('chips')?"contained":"outlined"}
                    startIcon={markerType.has('chips')?<Check/>:<></>}
                    onClick={()=>changeMarkerType('chips')}>
                    Chips
                </Button>
                <Spacer width={20}/>
                <Button
                    color={markerType.has('wood')?"success":"inherit"}
                    variant={markerType.has('wood')?"contained":"outlined"}
                    startIcon={markerType.has('wood')?<Check/>:<></>}
                    onClick={()=>changeMarkerType('wood')}>
                    Wood
                </Button>
            </div>
            <Divider className='w100 b'>Basic Details</Divider>
            <div className='col h-center w100 m2'>
                <TextField 
                    className='add-marker-text-field'
                    label='Marker Name'/>
                <Spacer height={15}/>
                <TextField 
                    className='add-marker-text-field'
                    label='Address'/>
            </div>
        </div>
    )
}
