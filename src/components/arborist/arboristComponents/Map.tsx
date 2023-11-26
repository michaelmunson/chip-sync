import React, { useEffect, useState } from 'react';
import {BounceLoader} from "react-spinners"; 
import "../../../css/map.css"; 
import { User } from '../../../types/dataTypes';
import { getGoogleMapsApiKey } from '../../../utils/secrets';
import { Geo } from '../../../utils/location';
import { Loader } from '@googlemaps/js-api-loader';
import { darkStyle, getMapOptions, lightStyle, clearHold, mapHoldData, holdingArrowAnimation } from '../../../utils/map';
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
    const getLoader = () => {getGoogleMapsApiKey().then(apiKey => setLoader(new Loader({apiKey, version:"weekly"})))}
    /* USE EFFECTS */
    useEffect(getLoader, []);
    useEffect(()=>{changeMapTheme()}, [theme]);
    useEffect(()=>{
        if (loader && currentLocation && !map){
            loadMap();
        }
        else if (map) {
            addLocationMarker(); 
        }
    }, [currentLocation, loader]);
    useEffect(()=>{
        if (map) {
            addMarkers(); 
        }
    }, [userData, map])

    /* Utility Functions */
    async function loadMap(){
        if (!loader || !currentLocation || map || !userData) return;
        console.log("%cLoading Map", "color:blue;background:white;"); 
        const { Map, StyledMapType } = await loader.importLibrary('maps');
        const styledMapType = new StyledMapType(theme==="dark"?darkStyle:lightStyle);
        const mapOptions = getMapOptions({latitude:currentLocation.latitude, longitude:currentLocation.longitude})
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
        console.log("%cAdd Markers!","color:red;")
    }
    async function addLocationMarker(){
        console.log("%cAdd Location Marker!","color:red;")
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
