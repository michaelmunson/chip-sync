import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListIcon from "@mui/icons-material/List";
import RoomIcon from '@mui/icons-material/Room';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Geo } from "../../../../utils/location";
import { Marker, User } from '../../../../types/dataTypes';
import { Coordinates, ModalConfig, ToggleModal } from '../../../../types/generalTypes';

interface MarkerListProps {
    userData: User,
    toggleModal: ToggleModal
    currentLocation: Coordinates,
}

interface MarkerAccordianProps {
    tab: "all"|"wood"|"chips"|"both",
    userData: User,
    toggleModal: ToggleModal
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

function MarkerAccordian({ tab, userData, toggleModal }:MarkerAccordianProps) {
	const [markerArray, setMarkerArray] = useState([...userData.organization.markers]);

	const markerFilterMap = {
		chips: () => {
			const markersMut = [...markerArray];
			return markersMut.filter(marker => marker.type === "chips")
		},
		wood: () => {
			const markersMut = [...markerArray];
			return markersMut.filter(marker => marker.type === "wood")
		},
		both: () => {
			const markersMut = [...markerArray];
			return markersMut.filter(marker => marker.type === "both")
		},
		all: () => {
			return [...markerArray]
		}
	}

	useEffect(() => {
		setMarkerArray(
			markerFilterMap[tab]()
		)
	}, [tab]);

	const formatMarkerName = (name:string, cutoffIndex=15) => name.length > cutoffIndex ? name.slice(0,cutoffIndex) + "..." : name;

	return (
		<div>

			{markerArray.length > 0 ? markerArray.map((marker, index) => (
				<Accordion key={`accordian#${index}`} style={{ padding: "10px" }}>
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
							<a href={Geo.getAddressURL({mapChoice:userData.mapChoice, address:marker.address})} target="_blank" rel="noreferrer">{marker.address}</a>
							<Button 
                                variant="outlined" 
                                style={{ marginTop: "15px" }} 
                                onClick={() => {
                                    const config:ModalConfig = {
                                        type: "marker-details",
                                        data: marker,
                                        goBack: true,
                                        goBackLocation: "list-markers"
                                    }
                                    toggleModal(true, config); 
						        }}>
                                Expand
                            </Button>
						</div>
					</AccordionDetails>
				</Accordion>
			)) : (
				<Typography style={{ margin: "20px" }}>
					No Markers Currently Set
				</Typography>
			)}
		</div>
	);
}

export default function MarkerList({userData, toggleModal, currentLocation}:MarkerListProps) {
	const [tab, setTab] = useState<"all"|"wood"|"chips"|"both">("all");

	const sortMarkers = (markers:Marker[]) => {
		const { latitude: cLat, longitude: cLng } = currentLocation;
		const markersMut = [...markers];
		// courtesy of https://stackoverflow.com/users/1594823/saikat
		function distance(lat1:number, lon1:number, lat2:number, lon2:number, unit?:any) {
			if ((lat1 === lat2) && (lon1 === lon2)) {
				return 0;
			}
			else {
				let radlat1 = Math.PI * lat1 / 180;
				let radlat2 = Math.PI * lat2 / 180;
				let theta = lon1 - lon2;
				let radtheta = Math.PI * theta / 180;
				let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
				if (dist > 1) {
					dist = 1;
				}
				dist = Math.acos(dist);
				dist = dist * 180 / Math.PI;
				dist = dist * 60 * 1.1515;
				if (unit === "K") { dist = dist * 1.609344 }
				if (unit === "N") { dist = dist * 0.8684 }
				return dist;
			}
		}

		markersMut.forEach(marker => {
			const { latitude: mLat, longitude: mLng } = marker;
			marker.distance = distance(cLat, cLng, mLat, mLng);
		});

		return markersMut.sort((a, b) => {
            if (a.distance && b.distance)
			    return a.distance - b.distance
            else return 0; 
		})
	}

	return (
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
                    toggleModal={toggleModal}/>
			</Card>
			<div className='modal-button-group'>
				<Button variant='contained' color='error' size='large' onClick={()=>toggleModal(false)}>Close</Button>
			</div>
		</>
	);
}