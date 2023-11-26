import React, {useEffect, useState} from 'react'
import { Coordinates, ModalConfig } from '../../../../types/generalTypes'
import { Divider, Button, TextField, Autocomplete } from '@mui/material'
import { CheckCircle } from '@mui/icons-material';
import "../../../../css/modalComponents/add-marker.css"; 
import Spacer from '../../../utils/Spacer';
import { Geo } from '../../../../utils/location';

let predictorFn:((input:string)=>Promise<string[]>) = (input:string) => new Promise((resolve,reject) => resolve([]));

interface AddMarkerProps {
    data?: ModalConfig["data"]
    currentLocation: Coordinates
}

export default function AddMarker({
    data,
    currentLocation
} : AddMarkerProps
){
    const [markerType, setMarkerType] = useState<Set<string>>(new Set());
    const [markerName, setMarkerName] = useState<string>("");
    const [markerAddress, setMarkerAddress] = useState<string>("");
    const [addressOptions, setAddressOptions] = useState<string[]>([]); 

    function changeMarkerType(type:"chips"|"wood"){
        setMarkerType(mt => {
            if (mt.has(type)) mt.delete(type);
            else mt.add(type);
            return new Set([...mt]);  
        }); 
    }

    useEffect(() => {
        Geo.getPredictionFunction(currentLocation).then(fn => {
            predictorFn = fn
            window.exports = {predictorFn}
        }); 
    }, []); 

    return (
        <div className='col h-center p2'>
            <Divider className='w100 b'>Marker Type</Divider>
            <div className='row h-center w100 marker-type-row m2'>
                <Button
                    color={markerType.has('chips')?"success":"inherit"}
                    variant={markerType.has('chips')?"contained":"outlined"}
                    startIcon={markerType.has('chips')?<CheckCircle/>:<></>}
                    onClick={()=>changeMarkerType('chips')}>
                    Chips
                </Button>
                <Spacer width={20}/>
                <Button
                    color={markerType.has('wood')?"success":"inherit"}
                    variant={markerType.has('wood')?"contained":"outlined"}
                    startIcon={markerType.has('wood')?<CheckCircle/>:<></>}
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
                <Autocomplete
					disablePortal
					freeSolo={true}
					id="address-auotocomplete"
                    className='add-marker-text-field'
					options={addressOptions}
					onChange={(e, value) => {
                        if (value) setMarkerAddress(value);
                        else setMarkerAddress(""); 
					}}
					renderInput={(params) => (
						<TextField 
							{...params}
							required={true} 
							label="Address" 
							variant="outlined" 
							className='add-marker-text-field'
							onChange={e => {
								setMarkerAddress(e.target.value);
								predictorFn(e.target.value).then(preds => setAddressOptions(preds)); 
							}}/>
					)}
				/>
            </div>
        </div>
    )
}
