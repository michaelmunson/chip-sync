import React, { useEffect, useState } from 'react';
import {BounceLoader} from "react-spinners"; 
import "../../../css/map.css"; 
import { Marker, User } from '../../../types/dataTypes';
import { getGoogleMapsApiKey } from '../../../utils/secrets';
import { Geo } from '../../../utils/location';
import { Loader } from '@googlemaps/js-api-loader';
import { darkStyle, getMapOptions, lightStyle, clearHold, mapHoldData, holdingArrowAnimation, icons, activeInfoWindow } from '../../../utils/map';
import { Coordinates } from '../../../types/generalTypes';

interface MapProps {
    userData: User
    theme: "light"|"dark",
    currentLocation: Coordinates|undefined
}

export default function Map({
    userData,
    theme,
    currentLocation
} : MapProps
){
    const [loader, setLoader] = useState<Loader>();
    const [map, setMap] = useState<any>(); 
    const [locationMarker, setLocationMarker] = useState<any>();
    const [mapMarkers, setMapMarkers] = useState<any[]>([]); 
    const getLoader = () => {getGoogleMapsApiKey().then(apiKey => {setLoader(new Loader({apiKey, version:"weekly"})); console.log('set loader')})}
    /* USE EFFECTS */
    useEffect(getLoader, []);
    useEffect(()=>{changeMapTheme()}, [theme]);
    useEffect(()=>{
        if (loader && !map){
            loadMap();
        }
        else if (map) {
            addLocationMarker(); 
        }
    }, [loader, currentLocation, map]);
    useEffect(()=>{
        if (map) {
            addMarkers(); 
        }
    }, [userData, map])

    /* Utility Functions */
    async function loadMap(){
        if (!loader || map || !userData) return;
        // console.log("%cLoading Map", "color:blue;background:white;");
        const { Map, StyledMapType } = await loader.importLibrary('maps');
        const styledMapType = new StyledMapType(theme==="dark"?darkStyle:lightStyle);
        const {latitude, longitude} = Geo.zipcodeToCoordinates(userData.organization.location); 
        const mapOptions = getMapOptions({
            latitude, 
            longitude
        }); 
        const MAP = new Map(document.getElementById("map"), mapOptions);
        MAP.mapTypes.set("styled_map", styledMapType);
		MAP.setMapTypeId("styled_map");
        MAP.addListener('mousedown', (e:any) => {
			const {x,y} = e.pixel;
			
			if (e.domEvent.touches) {
				if (e.domEvent.touches.length === 1){
					mapHoldData.interval = setInterval(() => {
						if (mapHoldData.timer >= 50){
							holdingArrowAnimation.create({x,y}); 
						}
						mapHoldData.timer += 50;
						if (mapHoldData.timer > mapHoldData.timerThreshold) {
							// openModal('addMarker',{
							// 	position : {
							// 		...e.latLng.toJSON()
							// 	}
							// })
							clearInterval(mapHoldData.interval);
							mapHoldData.interval = null;
							holdingArrowAnimation.destroy();
						}
					}, 50);
				}
			}
			else {
				mapHoldData.interval = setInterval(() => {
					if (mapHoldData.timer >= 50){
						holdingArrowAnimation.create({x,y}); 
					}

					mapHoldData.timer += 50;
	
					if (mapHoldData.timer > mapHoldData.timerThreshold) {
						// openModal('addMarker',{
						// 	position : {
						// 		...e.latLng.toJSON()
						// 	}
						// })
						clearInterval(mapHoldData.interval);
						holdingArrowAnimation.destroy(); 
						mapHoldData.interval = null;
					}
				}, 50);
			}
		});
		MAP.addListener('mouseup', clearHold);
        setMap(MAP); 
    }
    async function changeMapTheme(){
        if (loader && map){
            const { StyledMapType } = await loader.importLibrary('maps');
            const styledMapType = new StyledMapType(
                theme==="dark" ? darkStyle : lightStyle
            );
            map.mapTypes.set("styled_map", styledMapType);
            map.setMapTypeId("styled_map");
        }
	}
    async function addMarkers(){
        console.log("%cAdd Markers!","color:red;");
        if (!loader) return; 
        const { InfoWindow } = await loader.importLibrary("maps");
		const { AdvancedMarkerElement, PinElement } = await loader.importLibrary("marker");
        const markers = userData.organization.markers.map((markerData:Marker) => {
            const infoWindow = new InfoWindow();
            const markerConfig = (type:Marker["type"]) => {
                const markerStyle = "height:65px;"
                return {
                    get glyph(){
                        const glyphImage:any = document.createElement("img");
                        glyphImage.style = markerStyle;
                        glyphImage.src = icons[type];
                        return glyphImage;
                    },
                    background: "transparent",
                    borderColor: "transparent"
                }
            }
            const pin = new PinElement(markerConfig(markerData.type));

            const marker = new AdvancedMarkerElement({
                position: {
                    lat: markerData.latitude,
                    lng: markerData.longitude
                },
                map,
                title: markerData.id,
                content: pin.element,
            });

            // Add a click listener for each marker, and set up the info window.
            marker.addListener("click", ({ domEvent, latLng }:{[key:string]:any}) => {
                const { target } = domEvent;
                            
                activeInfoWindow.close(); 
                activeInfoWindow.put(infoWindow);

                infoWindow.close();
                infoWindow.setContent(
                    buildMarkerHtml(markerData)
                );
                infoWindow.open(marker.map, marker);
                setTimeout(() => {
                    const detbtn = document.querySelector(".details-button");
                    detbtn.onclick = function () {
                        openModal("details", markerData);
                    }
                }, 100);
            });

            marker.id = markerData.id;

            mapMarkers.push(marker);
        })
    }
    async function addLocationMarker(){
        console.log("%cADDING CURRENT LOCATION!","color:blue;background:white"); 
        if (!loader || !currentLocation) return; 
        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary("marker");
		const glyphImage:any = document.createElement("img");
		glyphImage.style = "height:50px;";
		glyphImage.src = "https://cdn2.iconfinder.com/data/icons/social-media-8/512/pointer.png"
		
		const pin = new PinElement({
			glyph: glyphImage,
			background: "transparent",
			borderColor: "transparent"
		});

		const marker = new AdvancedMarkerElement({
			position: {
				lat: currentLocation.latitude,
				lng: currentLocation.longitude
			},
			map,
			title: "Your Location",
			content: pin.element
		});
        
        map.panTo({
            lat: currentLocation.latitude,
            lng: currentLocation.longitude
        }); 

        setLocationMarker((m:any) => {
            if (m) m.setMap(null);
            return marker; 
        })
    }

    return (
        <div
            id="map" 
            className='map'
            onTouchMove={clearHold} onTouchEnd={clearHold} onMouseMove={clearHold} onDoubleClick={clearHold} onTouchStart={e => {if (e.touches.length > 1) clearHold()}}>
            <div className={`map-spinner-container ${theme}`}>
				<BounceLoader
					color="green"
					size={70}
				/>
			</div>
        </div>
    )
}
