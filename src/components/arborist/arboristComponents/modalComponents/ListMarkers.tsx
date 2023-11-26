import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListIcon from "@mui/icons-material/List";
import RoomIcon from '@mui/icons-material/Room';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getAddressURL } from "../../utils/location";

function MarkerTabs({ tab, setTab }) {
	const handleChange = (event, newValue) => {
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

function MarkerAccordian({ markers, tab, currentLocation, openModal, mapChoice }) {
	const [markerArray, setMarkerArray] = useState([...markers]);

	const markerFilterMap = {
		chips: () => {
			const markersMut = [...markers];
			return markersMut.filter(marker => marker.type === "chips")
		},
		wood: () => {
			const markersMut = [...markers];
			return markersMut.filter(marker => marker.type === "wood")
		},
		both: () => {
			const markersMut = [...markers];
			return markersMut.filter(marker => marker.type === "both")
		},
		all: () => {
			return [...markers]
		}
	}

	useEffect(() => {
		setMarkerArray(
			markerFilterMap[tab]()
		)
	}, [tab]);

	const formatMarkerName = (name, cutoffIndex=15) => name.length > cutoffIndex ? name.slice(0,cutoffIndex) + "..." : name;

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
							<b style={{textAlign:"left"}}>{formatMarkerName(marker.name)}</b> <span>{marker.distance.toFixed(2)} miles</span>
						</div>
					</AccordionSummary>
					<AccordionDetails>
						<div style={{ display: "flex", width: "100%", alignItems: "center", flexDirection: "column" }}>
							<a href={getAddressURL({mapPreference:mapChoice, address:marker.address})} target="_blank" rel="noreferrer">{marker.address}</a>
							<Button variant="outlined" style={{ marginTop: "15px" }} onClick={() => {
								const markerMut = { ...marker }
								markerMut.goback = true;
								markerMut.gobackLoc = "markerList";
								openModal("details", markerMut)
							}}>Expand</Button>
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

export default function MarkerList({ setModalOpen, markers, currentLocation, openModal, mapChoice }) {
	const [tab, setTab] = useState("all");

	const sortMarkers = markers => {
		const { latitude: cLat, longitude: cLng } = currentLocation;
		const markersMut = [...markers];
		// courtesy of https://stackoverflow.com/users/1594823/saikat
		function distance(lat1, lon1, lat2, lon2, unit) {
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
			const { lat: mLat, lng: mLng } = marker.position;
			marker.distance = distance(cLat, cLng, mLat, mLng);
		});

		return markersMut.sort((a, b) => {
			return a.distance - b.distance
		})
	}

	return (
		<>
			<div className='row'>
				<ListIcon className="modal-icon" />
				<RoomIcon className="modal-icon" />
			</div>
			<Card className="modal" style={{ padding: "0px" }}>
				<MarkerTabs setTab={setTab} tab={tab} />
				<MarkerAccordian
					tab={tab}
					markers={sortMarkers(markers)}
					currentLocation={currentLocation}
					openModal={openModal}
					mapChoice={mapChoice}
				/>
			</Card>
			<div className='modal-button-group'>
				<Button variant='contained' color='error' size='large' onClick={() => setModalOpen(false)}>Close</Button>
			</div>
		</>
	);
}