import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Divider, IconButton } from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import { Geo } from '../../../../utils/location';
import { PulseLoader } from 'react-spinners';
import {
    Cancel as CancelIcon, 
    KeyboardReturn as ArrowBackIcon,
    Edit as EditIcon
} from "@mui/icons-material"
import { AnyObject, ModalConfig, ToggleModal } from '../../../../types/generalTypes';
import { Marker, User } from '../../../../types/dataTypes';
import { S3 } from '../../../../utils/storage';
import "../../../../css/modalComponents/marker-details.css" 
import { AddressLink } from '../../../utils/AddressLink';

namespace Props {
    export interface ImageExpander {
        src: string|undefined
        open: boolean
        setOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
    export interface MarkerDetails {
        data: Marker,
        userData: User,
        toggleModal: ToggleModal,
        goBackLocation: ModalConfig["goBackLocation"]
    }
    export interface Images {
        images: any
        setImageSrc: React.Dispatch<React.SetStateAction<string | undefined>>
        setImageOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
}

function Images({images, setImageSrc, setImageOpen}:Props.Images){

    if (typeof images === "number" && images > 0) return (
        <>
            <Divider className='w100 b m1'>Images</Divider>
            <PulseLoader color='green'/>
        </>
    )

    else if (Array.isArray(images)) return (
        <>
            <Divider className='w100 b m1'>Images</Divider>
            {images.map((image, index) => (
                <img 
                    alt={`Chip Location`}
                    key={`details-image-${index}`} 
                    src={image} 
                    className='modal-image' 
                    onClick={() => {
                        setImageSrc(image);
                        setImageOpen(true);
                    }}
                />
            ))}
        </>
    )

    else return (
        <></>
    );
}

function ImageExpander({src, open, setOpen}:Props.ImageExpander) {
    const [lastClicked, setLastClicked] = useState<{id:string}>();

    const className = `image-expander ${open ? "open" : ""}`;

    useEffect(() => {
        if (lastClicked && lastClicked.id === 'external-image-div'){
            setLastClicked(undefined);
            setOpen(false);
        }
    }, [lastClicked]);

    const handleClick = (e:any) => {
        setLastClicked(e.target);
    }
    
    return (
        <div id='external-image-div' className={className} onClick={handleClick}>
            <div id='internal-image-div'>
                <a id="close-image-expander-btn" onClick={() => setOpen(false)}>
                    <CancelIcon style={{color:"red", fontSize:"1.7em", background:"black", borderRadius:"50%"}}/>
                </a>
                <img src={src} onClick={handleClick}/>
            </div>
        </div>
    )
}

function Header({data,goBackLocation,toggleModal}:{data:Marker, goBackLocation:ModalConfig["goBackLocation"], toggleModal:ToggleModal}){
    if (goBackLocation) return (
        <div className='row w100 v-center'>
            <IconButton 
                color="primary" 
                style={{padding:"0px"}}
                onClick={()=>toggleModal(true, {type:goBackLocation})}>
                <ArrowBackIcon/>
            </IconButton>
            <h1 className='go-back-header'>{data.name}</h1>
            <IconButton 
                color="primary" 
                style={{padding:"0px"}}
                onClick={()=>toggleModal(true, {
                    type:"edit-marker",
                    data,
                })}>
                <ArrowBackIcon/>
            </IconButton>
        </div>
    )
    else return (
        <div className='row w100 v-center'>
            <h1 className='regular-header'>{data.name}</h1>
            <IconButton 
                color="primary" 
                style={{padding:"0px"}}
                onClick={()=>toggleModal(true, {
                    type:"edit-marker",
                    data
                })}>
                <EditIcon/>
            </IconButton>
        </div>
    )
}

function Description({description}:{description:string}){
    if (description) return <>
        <Divider className='w100 b m1'>Description</Divider>
        <p>{description}</p>
    </>
    else return <></>
}

function Contact({contact}:{contact:Marker["contact"]}){
	const formatPhoneNumber = useCallback((phoneNumber:string) => {
        const phoneNumberArr = phoneNumber.split("")
        phoneNumberArr[2] = phoneNumberArr[2] + "-";
        phoneNumberArr[5] = phoneNumberArr[5] + "-"
        return phoneNumberArr.join("")
    }, []); 

    if (contact.name && contact.phone) return (<>
        <Divider className='w100 b m1'>Contact</Divider>
        <p>{contact.name}</p>
		<p><a href={`tel:${contact.phone}`}>{formatPhoneNumber(contact.phone)}</a></p>
    </>)

    else return <></>
}

export default function MarkerDetails({
    data, 
    userData, 
    toggleModal,
    goBackLocation
} : Props.MarkerDetails) {
	const [images, setImages] = useState<any>(data.images.length);
	const [imageSrc, setImageSrc] = useState<string>();
	const [imageOpen, setImageOpen] = useState(false);

	useEffect(() => {
        console.log("Marker Data: ", data); 
		if (data.images.length > 0){
			S3.getImages({images:data.images}).then(srcArr => {
				setImages(srcArr); 
			});
		}
	}, [data]);
	
	const markerTypeMap = {
		"chips" : "Chips Only",
		"wood" : "Wood Only",
		"both" : "Chips and Wood"
	}

    return (
        <div id="marker-details">
            <Header
                data={data}
                goBackLocation={goBackLocation}
                toggleModal={toggleModal}/>
            <span className='marker-type'>{markerTypeMap[data.type]}</span>
            <Divider className='w100 b m1'>Address</Divider>
            <AddressLink mapChoice={userData.mapChoice} address={data.address}/>
            <Contact
                contact={data.contact}/>
            <Description description={data.description}/>
            <Images 
                images={images}
                setImageOpen={setImageOpen}
                setImageSrc={setImageSrc}
            />
            <ImageExpander 
				src={imageSrc}
				open={imageOpen}
				setOpen={setImageOpen}
			/>
        </div>
    )
}