import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useState } from 'react';
import { BounceLoader } from "react-spinners";
import "../../../css/map.css";
import { Marker, User } from '../../../types/dataTypes';
import { Coordinates, ToggleModal } from '../../../types/generalTypes';
import { Geo } from '../../../utils/location';
import { activeInfoWindow, buildMarkerHtml, clearHold, darkStyle, getMapOptions, holdingArrowAnimation, icons, lightStyle, mapHoldData } from '../../../utils/map';
import { getGoogleMapsApiKey } from '../../../utils/secrets';

interface MapProps {
    userData: User
    theme: "light"|"dark"
    currentLocation: Coordinates
    toggleModal: ToggleModal
}

export default function Map({
    userData,
    theme,
    currentLocation,
    toggleModal
} : MapProps
){
    const [loader, setLoader] = useState<Loader>();
    const [map, setMap] = useState<any>(); 
    const [locationMarker, setLocationMarker] = useState<any>();
    const [mapMarkers, setMapMarkers] = useState<any[]>([]); 
    const getLoader = () => {getGoogleMapsApiKey().then(apiKey => setLoader(new Loader({apiKey, version:"weekly"})))}
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
        addLocationMarker(MAP); 
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
                    buildMarkerHtml({
                        ...markerData,
                        mapChoice:userData.mapChoice
                    })
                );
                infoWindow.open(marker.map, marker);
                setTimeout(() => {
                    const detailsBtn:any = document.querySelector(".details-button");
                    detailsBtn.onclick = function () {
                        toggleModal(true, {
                            type: "marker-details",
                            data: markerData
                        }); 
                    }
                }, 100);
            });

            marker.id = markerData.id;

            return marker; 
        });
        setMapMarkers((mrkrs:any[]) => {
            mrkrs.forEach(mrkr => {
                mrkr.setMap(null); 
            });
            return markers; 
        });
    }
    async function addLocationMarker(mapElement?:any){
        if (!loader || !currentLocation) return; 
        const MAP = mapElement || map;
        // console.log("%cADDING CURRENT LOCATION!","color:blue;background:white"); 
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
			map:MAP,
			title: "Your Location",
			content: pin.element
		});
        
        MAP.panTo({
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
