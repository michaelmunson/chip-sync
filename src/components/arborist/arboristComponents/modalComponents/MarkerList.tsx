/* eslint-disable react-hooks/exhaustive-deps */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListIcon from "@mui/icons-material/List";
import RoomIcon from '@mui/icons-material/Room';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Marker, User } from '../../../../types/dataTypes';
import { Coordinates, ModalConfig, ToggleModal } from '../../../../types/generalTypes';
import { Geo } from "../../../../utils/location";
import "../../../../css/modalComponents/marker-list.css"; 
import { AddressLink } from '../../../utils/AddressLink';
import ModalContent from './modalUtils/ModalContent';

interface MarkerListProps {
    userData: User,
    toggleModal: ToggleModal
    currentLocation: Coordinates,
}

interface MarkerAccordianProps {
    tab: "all"|"wood"|"chips"|"both",
    userData: User,
    toggleModal: ToggleModal
    currentLocation:Coordinates
}

interface MarkerTabsProps {
    tab:"all"|"wood"|"chips"|"both"
    setTab: React.Dispatch<React.SetStateAction<"wood"|"chips"|"both"|"all">>
}

function MarkerTabs({tab,setTab}:MarkerTabsProps) {
	const handleChange = (event:any, newValue:any) => {
		setTab(newValue);
	}

	return (
		//maxWidth: { xs: 320, sm: 480 },
		<Box sx={{ display: "flex", justifyContent: "center" }}>
			<Tabs
				value={tab}
				onChange={handleChange}
				variant="scrollable"
				scrollButtons="auto"
				aria-label="scrollable auto tabs example"
			>
				<Tab label="All" value={"all"} />
				<Tab label="Chips" value={"chips"} />
				<Tab label="Wood" value={"wood"} />
				<Tab label="Both" value={"both"} />
			</Tabs>
		</Box>
	)
}

function MarkerAccordian({ tab, userData, toggleModal, currentLocation }:MarkerAccordianProps) {
	const [markerArray, setMarkerArray] = useState(sortMarkers([...userData.organization.markers]));
    const [expanded, setExpanded] = useState<string>(); 
	
    const markerFilterMap = {
		chips: () => [...userData.organization.markers].filter(marker => marker.type === "chips"),
		wood: () => [...userData.organization.markers].filter(marker => marker.type === "wood"),
		both: () => [...userData.organization.markers].filter(marker => marker.type === "both"),
		all: () => [...userData.organization.markers]
	}

    useEffect(()=>{
        setMarkerArray(
            sortMarkers(markerFilterMap[tab]())
        )
    }, [tab]);
	
    const formatMarkerName = (name:string, cutoffIndex=15) => name.length > cutoffIndex ? name.slice(0,cutoffIndex) + "..." : name;
	
    function sortMarkers(markers:Marker[]){
		const markersMut = [...markers];

		markersMut.forEach(marker => {
			const { latitude, longitude } = marker;
			// marker.distance = distance(cLat, cLng, mLat, mLng);
            marker.distance = Geo.distance({latitude, longitude}, currentLocation); 
        });

		return markersMut.sort((a, b) => {
            if (a.distance && b.distance)
			    return a.distance - b.distance
            else return 0; 
		})
	}

	return (
		<div>
			{markerArray.length > 0 ? markerArray.map((marker, index) => (
				<Accordion 
                    expanded={marker.id === expanded}
                    onChange={() => {
                        setExpanded(marker.id)
                    }}
                    key={`accordian#${index}`} 
                    style={{ padding: "10px" }}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel2a-content"
						id="panel2a-header"
					>
						<div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
							<b style={{textAlign:"left"}}>{formatMarkerName(marker.name)}</b> <span>{marker?.distance?.toFixed(2)} miles</span>
						</div>
					</AccordionSummary>
					<AccordionDetails>
						<div style={{ display: "flex", width: "100%", alignItems: "center", flexDirection: "column" }}>
							<AddressLink
                                mapChoice={userData.mapChoice}
                                address={marker.address}/>
							<Button 
                                variant="outlined" 
                                style={{ marginTop: "15px" }} 
                                onClick={() => {
                                    const config:ModalConfig = {
                                        type: "marker-details",
                                        data: marker,
                                        goBackLocation: "marker-list"
                                    }
                                    toggleModal(true, config); 
						        }}>
                                Expand
                            </Button>
						</div>
					</AccordionDetails>
				</Accordion>
			)) : (
				<Typography style={{ margin: "20px", textAlign:'center' }}>
					No Markers Currently Set
				</Typography>
			)}
		</div>
	);
}

export default function MarkerList({userData, toggleModal, currentLocation}:MarkerListProps) {
	const [tab, setTab] = useState<"all"|"wood"|"chips"|"both">("all");

    return (<>
        <MarkerTabs 
            tab={tab}
            setTab={setTab}/>
        <ModalContent>
            <MarkerAccordian
                tab={tab}
                userData={userData}
                toggleModal={toggleModal}
                currentLocation={currentLocation}/>
        </ModalContent>
    </>)
	/* return (
		<>
			<div className='row'>
				<ListIcon className="modal-icon" />
				<RoomIcon className="modal-icon" />
			</div>
			<Card className="modal" style={{ padding: "0px" }}>
				<MarkerTabs 
                    tab={tab}
                    setTab={setTab}/>
				<MarkerAccordian
					tab={tab}
					userData={userData}
                    toggleModal={toggleModal}
                    currentLocation={currentLocation}/>
			</Card>
			<div className='modal-button-group'>
				<Button variant='contained' color='error' size='large' onClick={()=>toggleModal(false)}>Close</Button>
			</div>
		</>
	); */
}