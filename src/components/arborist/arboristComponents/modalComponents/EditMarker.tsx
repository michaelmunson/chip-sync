import React, {useEffect, useState} from 'react'
import { AnyObject, Coordinates, ModalConfig, ToggleModal } from '../../../../types/generalTypes'
import { Divider, Button, TextField, Autocomplete, styled } from '@mui/material'
import { CheckCircle, CloudUpload, AddCircle, AddBox, AddCircleOutline, AddBoxRounded, Add, AutoAwesome as PublishIcon } from '@mui/icons-material';
import "../../../../css/modalComponents/add-marker.css"; 
import Spacer from '../../../utils/Spacer';
import { Geo } from '../../../../utils/location';
import { PropagateLoader, PulseLoader } from 'react-spinners';
import { DB } from '../../../../utils/database';
import { Marker, User } from '../../../../types/dataTypes';

let predictorFn:((input:string)=>Promise<string[]>) = (input:string) => new Promise((resolve,reject) => resolve([]));

interface EditMarkerProps {
    data: Marker
    userData:User
    toggleModal:ToggleModal
    setUserData:React.Dispatch<React.SetStateAction<User|undefined>>,
    currentLocation: Coordinates
}

function Description({
    description,
    setDescription 
}: {
    description:string
    setDescription:React.Dispatch<React.SetStateAction<string>>
}){
    const [isAddDescription, setIsAddDescription] = useState<boolean>(!!description); 

    if (isAddDescription) return (
        <TextField 
                multiline
                maxRows={3}
                className='add-marker-text-field'
                label='Description'
                value={description}
                onChange={e=>setDescription(e.target.value)}/>
    )
    
    else return <div className='w100'>
        <Button
            startIcon={<AddCircle className='add-marker-start-icon'/>}
            onClick={()=>setIsAddDescription(true)}>
            Add Description
        </Button>
    </div>
}

function ContactDetails({
    contactName,
    contactPhone,
    setContactPhone, 
    setContactName
}: {
    contactName:string
    contactPhone:string
    setContactPhone:React.Dispatch<React.SetStateAction<string>>
    setContactName:React.Dispatch<React.SetStateAction<string>>
}){
    const [isAddContact, setIsAddContact] = useState<boolean>(!!contactName || !!contactPhone); 

    if (isAddContact) return <>
        <Divider className='w100 b m1'>Contact Info.</Divider>
        <div className='col h-center w100 m2 mb3'>
            <TextField 
                className='add-marker-text-field'
                label='Contact Name'
                value={contactName}
                onChange={e=>setContactName(e.target.value)}/>
            <Spacer height={10}/>
            <TextField
                className='add-marker-text-field'
                type="number"
                label='Contact Phone #'
                value={contactPhone}
                onChange={e=>setContactPhone(e.target.value)}/>
        </div>
    </>
    
    else return <div className='w100'>
        <Divider className='mb2'/>
        <Button
            startIcon={<AddCircle className='add-marker-start-icon'/>}
            onClick={()=>setIsAddContact(true)}>
            Add Contact Info
        </Button>
    </div>
}

function MediaUpload({
    markerImages,
    setMarkerImages
}:{
    markerImages:File[]
    setMarkerImages:React.Dispatch<React.SetStateAction<File[]>>
}){
    const [isAddMedia, setIsAddMedia] = useState<boolean>(false);
       
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    if (isAddMedia) return <>
        <Divider className='w100 b m1'>Images</Divider>
        <div className='col h-center w100 m2'>
            <Button className='b' component="label" variant="outlined" startIcon={<CloudUpload/>}>
                {markerImages.length > 0 ? (
                    `${markerImages.length} Image${markerImages.length>1?"s":""} Uploaded`
                ) : (
                    `Upload Images`
                )}
                <VisuallyHiddenInput multiple accept="image/*" type="file" onChange={e => {
                    if (e.target.files?.length) setMarkerImages([...e.target.files]);
                }} />
            </Button>
        </div>
    </>

    else return <div className='w100'>
        <Button
            startIcon={<AddCircle className='add-marker-start-icon'/>}
            onClick={()=>setIsAddMedia(true)}>
            Add Images
        </Button>
    </div>
}

function SubmitButton({
    isDisabled,
    updateMarker
}:{
    isDisabled:boolean,
    updateMarker:()=>void
}){ 
    return (
        <div className='create-marker-button b'>
            <Button
                size='large'
                color="success"
                variant="contained"
                disabled={isDisabled}
                onClick={updateMarker}
                startIcon={<PublishIcon/>}>
                Update Marker
            </Button>
        </div>
    )
}

export default function EditMarker({
    data,
    userData,
    setUserData,
    toggleModal,
    currentLocation
} : EditMarkerProps
){
    const [markerType, setMarkerType] = useState<Set<"wood"|"chips">>(
        data?.type ? new Set(({
            "chips" : ["chips"],
            "wood"  : ["wood"],
            "both"  : ["chips","wood"]
        } as AnyObject)[data.type]) : new Set()
    );
    const [markerName, setMarkerName] = useState<string>(data?.name || "");
    const [markerAddress, setMarkerAddress] = useState<string>(data?.address || "");
    const [addressOptions, setAddressOptions] = useState<string[]>([]);
    const [markerDescription, setMarkerDescription] = useState<string>(data?.description || "");  
    const [contactName, setContactName] = useState<string>(data?.contact.name || "");
    const [contactPhone, setContactPhone] = useState<string>(data?.contact.phone || "");
    const [markerImages, setMarkerImages] = useState<File[]>([]);
    const [isCreating, setIsCreating] = useState<boolean>(false); 
    
    useEffect(() => {
        Geo.getPredictionFunction(currentLocation).then(fn => {
            predictorFn = fn
            window.exports = {predictorFn}
        }); 
    }, []); 

    function changeMarkerType(type:"chips"|"wood"){
        setMarkerType(mt => {
            if (mt.has(type)) mt.delete(type);
            else mt.add(type);
            return new Set([...mt]);  
        }); 
    }

    async function updateMarker(){
        if (!data) return; 
        setIsCreating(true);
        const type = markerType.size > 1 ? "both" : [...markerType][0]; 
        const markerData = await DB.updateMarker({
            id: data.id,
            type,
            name: markerName,
            address: markerAddress,
            description: markerDescription,
            contact:{
                name:contactName,
                phone:contactPhone
            }
        }); 
        const newUserData = await DB.getUser();
        if (newUserData) setUserData(newUserData); 
        toggleModal(false); 
        setIsCreating(false);
        toggleModal(true, {
            type:"marker-details",
            data: markerData
        }); 
    }

    if (isCreating) return (
        <div className='col h-center' style={{height:"0px", marginLeft:'-8px'}}>
            <PropagateLoader color='var(--theme-color-green)'/>
        </div>
    )

    return (
        <div className='col h-center p2'>
            <Divider className='w100 b m1'>Marker Type</Divider>
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
            <Divider className='w100 b m1'>Basic Details</Divider>
            <div className='col h-center w100 m2'>
                <TextField 
                    className='add-marker-text-field'
                    label='Marker Name'
                    value={markerName}
                    onChange={e => setMarkerName(e.target.value)}/>
                <Spacer height={10}/>
                <Autocomplete
					disablePortal
					freeSolo={true}
					id="address-auotocomplete"
                    className='add-marker-text-field'
                    value={markerAddress}
					options={addressOptions}
					onChange={(e, value) => {
                        if (value) setMarkerAddress(value);
                        else setMarkerAddress(""); 
					}}
					renderInput={(params) => (
						<TextField 
							{...params}
							label="Address" 
							variant="outlined" 
							className='add-marker-text-field mb0'
							onChange={e => {
								setMarkerAddress(e.target.value);
								predictorFn(e.target.value).then(preds => setAddressOptions(preds)); 
							}}/>
					)}
				/>
                <Spacer height={10}/>
                <Description
                    description={markerDescription}
                    setDescription={setMarkerDescription}/>
            </div>
            <ContactDetails
                contactName={contactName}
                contactPhone={contactPhone}
                setContactName={setContactName}
                setContactPhone={setContactPhone}/>
            <MediaUpload
                markerImages={markerImages}
                setMarkerImages={setMarkerImages}/>
            <SubmitButton
                isDisabled={markerType.size < 1 || !markerName || !markerAddress}
                // isDisabled={false}
                updateMarker={updateMarker}/>
        </div>
    )
}
