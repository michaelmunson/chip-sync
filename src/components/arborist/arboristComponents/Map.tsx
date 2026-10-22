import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CircularProgress, Divider, ListItemText, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
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
import { JobsAPI, jobMarkerIds, MapJob } from '../../../utils/jobs';
import { JOB_STATUS } from '../../jobs/JobStatusPill';
import { buildJobInfo, buildJobPin } from '../../../utils/jobPins';

const toLatLng = ({ latitude, longitude }: Coordinates) => ({ lat: latitude, lng: longitude });

interface MapLayers {
    sites: boolean
    requests: boolean
    jobs: boolean
}

const LAYERS_KEY = "chipsync.mapLayers";

function loadLayers(): MapLayers {
    try {
        const saved = JSON.parse(localStorage.getItem(LAYERS_KEY) ?? "null");
        if (saved && typeof saved.sites === "boolean" && typeof saved.requests === "boolean") {
            return { sites: saved.sites, requests: saved.requests, jobs: saved.jobs !== false };
        }
    } catch { /* fall through to defaults */ }
    return { sites: true, requests: true, jobs: true };
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
    /** Bumped whenever jobs may have changed (e.g. the job dialog closed) so the Jobs layer reloads. */
    jobsRefreshKey?: number
}

export default function Map({
    userData,
    theme,
    currentLocation,
    toggleModal,
    placement = null,
    onPlacementChange,
    focusKey = 0,
    jobsRefreshKey = 0,
} : MapProps
){
    const [loadError, setLoadError] = useState(false);
    const [loader, setLoader] = useState<Loader>();
    const [map, setMap] = useState<any>(); 
    const [locationMarker, setLocationMarker] = useState<any>();
    const [mapMarkers, setMapMarkers] = useState<any[]>([]); 
    const [requestMarkers, setRequestMarkers] = useState<any[]>([]);
    const [mapJobs, setMapJobs] = useState<MapJob[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobsAnchor, setJobsAnchor] = useState<HTMLElement | null>(null);
    const [jobMarkers, setJobMarkers] = useState<any[]>([]);
    const [layers, setLayers] = useState<MapLayers>(loadLayers);
    const draftMarker = useRef<any>();
    const placing = useRef(false);
    const onPlace = useRef(onPlacementChange);
    placing.current = placement !== null;
    onPlace.current = onPlacementChange;
    const store = useRequests();
    const selectedJob = mapJobs.find(({ job }) => job.id === selectedJobId);
    const focus = useMemo(() => (selectedJob ? jobMarkerIds(selectedJob) : null), [selectedJob]);
    const jobPins = useMemo(() => {
        const sitesById = new globalThis.Map(userData.organization.markers.map(marker => [marker.id, marker]));
        return (selectedJob ? [selectedJob] : mapJobs).flatMap(({ job, locations, routingPlans }) =>
            Array.from(jobMarkerIds({ locations, routingPlans }).jobSites)
                .map(id => sitesById.get(id))
                .filter((site): site is Marker => Boolean(site))
                .map(site => ({ job, marker: site })));
    }, [mapJobs, selectedJob, userData.organization.markers]);
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
        mapMarkers.forEach(marker => {
            // Focusing a job narrows the pins to its facilities and relevant drop sites (job sites get their own pin).
            const show = focus
                ? focus.facilities.has(marker.id) || focus.dropSites.has(marker.id)
                : layers.sites;
            marker.map = show && !placing.current ? map : null;
        });
    }, [layers.sites, mapMarkers, map, placement, focus]);
    useEffect(() => {
        if (map) addRequestMarkers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, store.requests, store.offers, layers.requests, placement, selectedJobId]);
    useEffect(() => {
        let cancelled = false;
        JobsAPI.listMapJobs(userData.organization.id)
            .then(jobs => { if (!cancelled) setMapJobs(jobs); })
            .catch(() => { /* the Jobs layer just stays empty */ });
        return () => { cancelled = true; };
    }, [userData.organization.id, jobsRefreshKey]);
    useEffect(() => {
        if (selectedJobId && !mapJobs.some(({ job }) => job.id === selectedJobId)) setSelectedJobId(null);
    }, [mapJobs, selectedJobId]);
    useEffect(() => {
        if (!map || !loader || !focus || placing.current) return;
        const points = userData.organization.markers
            .filter(marker => focus.jobSites.has(marker.id) || focus.facilities.has(marker.id) || focus.dropSites.has(marker.id))
            .map(toLatLng);
        if (points.length === 0) return;
        loader.importLibrary("core").then(({ LatLngBounds }) => {
            const bounds = new LatLngBounds();
            points.forEach(point => bounds.extend(point));
            map.fitBounds(bounds, 80);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJobId, map, loader]);
    useEffect(() => {
        if (map) addJobMarkers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, jobPins, layers.jobs, placement]);
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
        const markers = (!layers.requests || selectedJobId || placing.current) ? [] : visibleRequests(store.requests, userData.organization.id).map(request => {
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
    async function addJobMarkers(){
        if (!loader) return;
        const { InfoWindow } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");
        const markers = (!layers.jobs || placing.current) ? [] : jobPins.map(({ job, marker: site }) => {
            const marker = new AdvancedMarkerElement({
                position: { lat: site.latitude, lng: site.longitude },
                map,
                title: job.name,
                content: buildJobPin(),
                zIndex: 40,
            });
            const infoWindow = new InfoWindow();
            marker.addListener("click", () => {
                activeInfoWindow.close();
                activeInfoWindow.put(infoWindow);
                infoWindow.setContent(buildJobInfo({
                    job,
                    site,
                    onOpen: () => {
                        infoWindow.close();
                        toggleModal(true, { type: "job-details", data: { jobId: job.id } });
                    },
                }));
                infoWindow.open(marker.map, marker);
            });
            return marker;
        });
        setJobMarkers(previous => {
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
    const jobsOpen = Boolean(jobsAnchor);
    const chooseJob = (id: string | null, visible = true) => {
        setSelectedJobId(id);
        setLayers(current => ({ ...current, jobs: visible }));
        setJobsAnchor(null);
    };
    const toggleLayer = (layer: keyof MapLayers) => setLayers(current => ({ ...current, [layer]: !current[layer] }));

    const isPlacing = placement !== null;

    return (
        <>
        {map && !isPlacing && (
            <div className="map-layers" role="group" aria-label="Show on map">
                <button
                    type="button"
                    className="map-layer map-layer--sites"
                    aria-pressed={focus ? true : layers.sites}
                    disabled={Boolean(focus)}
                    onClick={() => toggleLayer("sites")}
                >
                    <span className="map-layer-dot" aria-hidden="true" />
                    Drop sites
                    <span className="map-layer-count">{focus ? focus.dropSites.size : userData.organization.markers.length}</span>
                </button>
                <button
                    type="button"
                    className="map-layer map-layer--requests"
                    aria-pressed={focus ? false : layers.requests}
                    disabled={Boolean(focus)}
                    onClick={() => toggleLayer("requests")}
                >
                    <span className="map-layer-dot" aria-hidden="true" />
                    Requests
                    <span className="map-layer-count">{requestCount}</span>
                </button>
                <button
                    type="button"
                    className="map-layer map-layer--jobs"
                    aria-pressed={layers.jobs}
                    aria-haspopup="menu"
                    aria-expanded={jobsOpen}
                    onClick={event => setJobsAnchor(event.currentTarget)}
                >
                    <span className="map-layer-dot" aria-hidden="true" />
                    <span className="map-layer-name">{selectedJob ? selectedJob.job.name : "Jobs"}</span>
                    {!selectedJob && <span className="map-layer-count">{mapJobs.length}</span>}
                    <KeyboardArrowDownRounded className="map-layer-caret" fontSize="small" />
                </button>
                <Menu
                    anchorEl={jobsAnchor}
                    open={jobsOpen}
                    onClose={() => setJobsAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{ paper: { sx: { mt: 1, minWidth: 220, maxWidth: 320 } } }}
                >
                    <MenuItem selected={layers.jobs && !selectedJobId} onClick={() => chooseJob(null)}>
                        <ListItemText primary="All jobs" secondary="Show every job site" />
                    </MenuItem>
                    {mapJobs.map(({ job }) => (
                        <MenuItem key={job.id} selected={job.id === selectedJobId} onClick={() => chooseJob(job.id)}>
                            <ListItemText
                                primary={job.name}
                                secondary={JOB_STATUS[job.status].label}
                                primaryTypographyProps={{ noWrap: true }}
                            />
                        </MenuItem>
                    ))}
                    {mapJobs.length === 0 && (
                        <MenuItem disabled>
                            <ListItemText primary="No planned or active jobs" />
                        </MenuItem>
                    )}
                    <Divider />
                    <MenuItem selected={!layers.jobs} onClick={() => chooseJob(null, false)}>
                        <ListItemText primary="Hide jobs" />
                    </MenuItem>
                </Menu>
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
