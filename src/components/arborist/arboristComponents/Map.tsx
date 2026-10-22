import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import { CircularProgress } from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import "../../../css/map.css";
import { Marker, ServiceRequest, User } from '../../../types/dataTypes';
import { Coordinates, ToggleModal } from '../../../types/generalTypes';
import { Geo } from '../../../utils/location';
import { activeInfoWindow, buildMarkerHtml, clearHold, darkStyle, getMapOptions, holdingArrowAnimation, icons, lightStyle, mapHoldData } from '../../../utils/map';
import { getGoogleMapsApiKey } from '../../../utils/secrets';
import { useRequests } from '../../requests/RequestsContext';
import { buildRequestInfo, buildRequestPin, PinTone } from '../../../utils/requestPins';
import { requestSummary } from '../../../utils/requestFormat';

const toLatLng = ({ latitude, longitude }: Coordinates) => ({ lat: latitude, lng: longitude });

interface MapLayers {
    sites: boolean
    requests: boolean
}

const LAYERS_KEY = "chipsync.mapLayers";

function loadLayers(): MapLayers {
    try {
        const saved = JSON.parse(localStorage.getItem(LAYERS_KEY) ?? "null");
        if (saved && typeof saved.sites === "boolean" && typeof saved.requests === "boolean") return saved;
    } catch { /* fall through to defaults */ }
    return { sites: true, requests: true };
}

/** Open requests plus jobs booked with this crew; requests booked with other crews drop off. */
function visibleRequests(requests: ServiceRequest[], organizationId: string) {
    return requests.filter(request =>
        request.status === "open" ||
        (request.status === "accepted" && request.acceptedOrganizationId === organizationId));
}

interface MapProps {
    userData: User
    theme: "light"|"dark"
    currentLocation: Coordinates
    toggleModal: ToggleModal
    /** Pin being placed for a new/edited location; null when not placing. */
    placement?: Coordinates | null
    onPlacementChange?: (position: Coordinates) => void
    /** Bumped whenever the map should pan to `placement` (e.g. after an address search). */
    focusKey?: number
}

export default function Map({
    userData,
    theme,
    currentLocation,
    toggleModal,
    placement = null,
    onPlacementChange,
    focusKey = 0,
} : MapProps
){
    const [loadError, setLoadError] = useState(false);
    const [loader, setLoader] = useState<Loader>();
    const [map, setMap] = useState<any>(); 
    const [locationMarker, setLocationMarker] = useState<any>();
    const [mapMarkers, setMapMarkers] = useState<any[]>([]); 
    const [requestMarkers, setRequestMarkers] = useState<any[]>([]);
    const [layers, setLayers] = useState<MapLayers>(loadLayers);
    const draftMarker = useRef<any>();
    const placing = useRef(false);
    const onPlace = useRef(onPlacementChange);
    placing.current = placement !== null;
    onPlace.current = onPlacementChange;
    const store = useRequests();
    const getLoader = () => {
        try {
            setLoader(new Loader({ apiKey: getGoogleMapsApiKey(), version: "weekly" }));
        } catch {
            setLoadError(true);
        }
    };
    /* USE EFFECTS */
    useEffect(getLoader, []);
    useEffect(() => {
        try { localStorage.setItem(LAYERS_KEY, JSON.stringify(layers)); } catch { /* private mode */ }
    }, [layers]);
    useEffect(() => {
        mapMarkers.forEach(marker => { marker.map = layers.sites && !placing.current ? map : null; });
    }, [layers.sites, mapMarkers, map, placement]);
    useEffect(() => {
        if (map) addRequestMarkers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, store.requests, store.offers, layers.requests, placement]);
    useEffect(()=>{changeMapTheme()}, [theme]);
    useEffect(()=>{
        if (loader && !map){
            loadMap().catch(() => setLoadError(true));
        }
        else if (map && !placement) {
            addLocationMarker(); 
        }
    }, [loader, currentLocation, map, placement]);
    useEffect(()=>{
        if (map) {
            addMarkers(); 
        }
    }, [userData, map])

    // Draft pin while placing; draggable, and moves wherever the map is tapped.
    useEffect(() => {
        if (!loader || !map) return;
        if (!placement) {
            if (draftMarker.current) draftMarker.current.map = null;
            draftMarker.current = undefined;
            map.setOptions({ draggableCursor: null });
            return;
        }
        map.setOptions({ draggableCursor: "crosshair" });
        loader.importLibrary("marker").then(({ AdvancedMarkerElement }) => {
            if (!draftMarker.current) {
                const marker = new AdvancedMarkerElement({
                    map,
                    position: toLatLng(placement),
                    gmpDraggable: true,
                    title: "Drag to the exact spot",
                    content: buildRequestPin({ services: ["other"], tone: "draft", label: "New location" }),
                    zIndex: 100,
                });
                marker.addListener("dragend", () => {
                    const position = marker.position;
                    const lat = typeof position.lat === "function" ? position.lat() : position.lat;
                    const lng = typeof position.lng === "function" ? position.lng() : position.lng;
                    onPlace.current?.({ latitude: lat, longitude: lng });
                });
                draftMarker.current = marker;
            } else {
                draftMarker.current.position = toLatLng(placement);
            }
        });
    }, [loader, map, placement]);

    useEffect(() => {
        if (!map || !placement) return;
        map.panTo(toLatLng(placement));
        if (map.getZoom() < 16) map.setZoom(17);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, focusKey]);

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
        MAP.addListener("click", (event: any) => {
            if (!placing.current || !event.latLng) return;
            onPlace.current?.({
                latitude: event.latLng.lat(),
                longitude: event.latLng.lng(),
            });
        });
        MAP.addListener('mousedown', (e:any) => {
            if (placing.current) return;
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
            const kind = markerData.kind ?? "dropSite";
            const pin = new PinElement(
                kind === "dropSite"
                    ? {
                        get glyph() {
                            const glyphImage: any = document.createElement("img");
                            glyphImage.style = "height:65px;";
                            glyphImage.src = icons[markerData.type];
                            return glyphImage;
                        },
                        background: "transparent",
                        borderColor: "transparent",
                    }
                    : {
                        glyph: kind === "facility" ? "F" : "J",
                        background: kind === "facility" ? "#5c6b7a" : "#c45c26",
                        borderColor: "#ffffff",
                        glyphColor: "#ffffff",
                    },
            );

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
    async function addRequestMarkers(){
        if (!loader) return;
        const { InfoWindow } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");
        const markers = (!layers.requests || placing.current) ? [] : visibleRequests(store.requests, userData.organization.id).map(request => {
            const myOffer = store.offersFor(request.id)[0];
            const tone: PinTone =
                request.acceptedOrganizationId === userData.organization.id ? "booked"
                : myOffer?.status === "pending" ? "offered"
                : "open";
            const marker = new AdvancedMarkerElement({
                position: { lat: request.latitude, lng: request.longitude },
                map,
                title: requestSummary(request),
                content: buildRequestPin({ services: request.services, tone }),
                zIndex: tone === "booked" ? 30 : 20,
            });
            const infoWindow = new InfoWindow();
            marker.addListener("click", () => {
                activeInfoWindow.close();
                activeInfoWindow.put(infoWindow);
                infoWindow.setContent(buildRequestInfo({
                    request,
                    viewer: userData,
                    myOffer,
                    onOpen: () => {
                        infoWindow.close();
                        toggleModal(true, { type: "request-details", data: { requestId: request.id } });
                    },
                }));
                infoWindow.open(marker.map, marker);
            });
            return marker;
        });
        setRequestMarkers(previous => {
            previous.forEach(marker => { marker.map = null; });
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

    const requestCount = visibleRequests(store.requests, userData.organization.id).length;
    const toggleLayer = (layer: keyof MapLayers) => setLayers(current => ({ ...current, [layer]: !current[layer] }));

    const isPlacing = placement !== null;

    return (
        <>
        {map && !isPlacing && (
            <div className="map-layers" role="group" aria-label="Show on map">
                <button
                    type="button"
                    className="map-layer map-layer--sites"
                    aria-pressed={layers.sites}
                    onClick={() => toggleLayer("sites")}
                >
                    <span className="map-layer-dot" aria-hidden="true" />
                    Drop sites
                    <span className="map-layer-count">{userData.organization.markers.length}</span>
                </button>
                <button
                    type="button"
                    className="map-layer map-layer--requests"
                    aria-pressed={layers.requests}
                    onClick={() => toggleLayer("requests")}
                >
                    <span className="map-layer-dot" aria-hidden="true" />
                    Requests
                    <span className="map-layer-count">{requestCount}</span>
                </button>
            </div>
        )}
        <div
            id="map" 
            className='map'
            onTouchMove={clearHold} onTouchEnd={clearHold} onMouseMove={clearHold} onDoubleClick={clearHold} onTouchStart={e => {if (e.touches.length > 1) clearHold()}}>
            <div className="map-spinner-container">
                {loadError ? (
                    <div className="map-status" role="alert">
                        <span className="tile tile--brand" aria-hidden="true"><MapOutlinedIcon /></span>
                        <h2>Map unavailable</h2>
                        <p>Check your connection and reload to try again. You can still manage sites with the tools below.</p>
                    </div>
                ) : (
                    <div className="map-status" role="status">
                        <CircularProgress size={30} thickness={4} />
                        <p>Loading your map…</p>
                    </div>
                )}
            </div>
        </div>
        </>
    )
}
