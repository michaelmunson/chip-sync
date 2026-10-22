import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { MarkerKind, User } from '../../types/dataTypes';
import Map from './arboristComponents/Map';
import Controls from './arboristComponents/Controls';
import { DB } from '../../utils/database';
import { Coordinates, ModalConfig, NativeMessaging } from '../../types/generalTypes';
import { Geo } from '../../utils/location';
import Modal from './arboristComponents/Modal';
import Theme from '../../utils/theme';
import Native from '../../utils/native';
import { RequestsProvider } from '../requests/RequestsContext';
import { useNotificationSocket } from '../../utils/notificationFeed';
import PlacementPanel from '../gardner/PlacementPanel';
import { AddLocationOptions, JobFormDraft } from './arboristComponents/modalComponents/AddMarker';
import { MarkerFormDraft } from './arboristComponents/modalComponents/MarkerForm';

const MIN_UPDATE_DISTANCE = .2 // miles

interface Placement {
  position: Coordinates;
  lockedKind?: MarkerKind;
  jobDraft?: JobFormDraft;
  selectAs?: "facility" | "jobSite";
  /** Editing an existing marker's pin. */
  markerId?: string;
  draft?: MarkerFormDraft;
  /** Where to return if the user cancels a "Move pin" round trip. */
  origin?: { position: Coordinates; address: string };
}

interface ArboristAppProps {
    userData:User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

export default function ArboristApp({
    userData,
    setUserData
} : ArboristAppProps
){
    const [theme, setTheme] = useState<"light"|"dark">(Theme.decide()); 
    const [currentLocation, setCurrentLocation] = useState<Coordinates>(Geo.zipcodeToCoordinates(userData.organization.location));
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({type:"add-marker"});
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [placementAddress, setPlacementAddress] = useState("");
    const [resolving, setResolving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [focusKey, setFocusKey] = useState(0);
    const [jobsRefreshKey, setJobsRefreshKey] = useState(0);
    const geocodeSeq = useRef(0);

    /* USE EFFECTS */
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        return () => { delete document.documentElement.dataset.theme; };
    }, [theme]);
    useEffect(updateCurrentLocation, []);
    // Jobs may have been created/edited in the dialog; reload the map's Jobs layer once it closes.
    useEffect(() => {
        if (!modalOpen) setJobsRefreshKey(key => key + 1);
    }, [modalOpen]);
    // Jobs may have been created/edited in the dialog; reload the map's Jobs layer once it closes.
    useEffect(() => {
        if (!modalOpen) setJobsRefreshKey(key => key + 1);
    }, [modalOpen]);
    useNotificationSocket(setUserData);
    useEffect(() => {
        const listener = Native.listen(async message => {
            if (typeof message.data !== 'string') return;
            const messageData:NativeMessaging.Error|NativeMessaging.Payment = JSON.parse(message.data); 
            if (messageData.status === 200 && messageData.messageType === "payment"){
                const tier = messageData.data.tier;
                if (tier.cycle && tier.plan && tier.timestamp){
                    await DB.updateOrganization({organizationId:userData.organization.id, tier}); 
                    const newUserData = await DB.getUser();
                    if (newUserData) setUserData(newUserData)
                }
            } 
            else if (messageData.messageType === "error") {
                
            }
        });
        return listener; 
    }, []);
    

    /* Utility Functions */
    function toggleModal(isOpen:boolean, config?:ModalConfig){
        if (config) {
            setModalConfig(config); 
        }
        setModalOpen(isOpen); 
    }
    function updateCurrentLocation(){
        Geo.getCurrentLocation().then(newCoords => {
            setCurrentLocation(oldCoords => {
                const distance = Geo.distance(newCoords, oldCoords);
                if (distance < MIN_UPDATE_DISTANCE){
                    return oldCoords;
                } else {
                    return newCoords; 
                }
            });
            setTimeout(updateCurrentLocation, 1000);
        }).catch(() => {
            // Location permission denied/unavailable: keep the saved organization location.
        });
    }

    const resolveAddress = useCallback((position: Coordinates) => {
        const seq = ++geocodeSeq.current;
        setResolving(true);
        Geo.coordsToAddress(position)
            .then((address) => seq === geocodeSeq.current && setPlacementAddress(address))
            .catch(() => seq === geocodeSeq.current && setPlacementAddress(""))
            .finally(() => seq === geocodeSeq.current && setResolving(false));
    }, []);

    const movePlacement = useCallback(
        (position: Coordinates, knownAddress?: string) => {
            setPlacement((current) => (current ? { ...current, position } : current));
            if (knownAddress !== undefined) {
                geocodeSeq.current++;
                setResolving(false);
                setPlacementAddress(knownAddress);
            } else {
                resolveAddress(position);
            }
        },
        [resolveAddress],
    );

    const startAddLocation = useCallback((opts: AddLocationOptions = {}) => {
        const position = opts.origin?.position ?? currentLocation;
        const address = opts.origin?.address;
        setModalOpen(false);
        setPlacement({
            position,
            lockedKind: opts.lockedKind,
            jobDraft: opts.jobDraft,
            selectAs: opts.selectAs,
            markerId: opts.markerId,
            draft: opts.draft,
            origin: opts.origin,
        });
        setFocusKey((k) => k + 1);
        if (address !== undefined) setPlacementAddress(address);
        else resolveAddress(position);
    }, [currentLocation, resolveAddress]);

    function locateMe() {
        setLocating(true);
        Geo.getCurrentLocation()
            .then(({ latitude, longitude }) => {
                const position = { latitude, longitude };
                setCurrentLocation(position);
                movePlacement(position);
                setFocusKey((k) => k + 1);
            })
            .catch(() => {})
            .finally(() => setLocating(false));
    }

    function finishPlacement(cancelled: boolean) {
        if (!placement) return;
        const { markerId, draft, origin, lockedKind, jobDraft, selectAs } = placement;
        setPlacement(null);

        if (cancelled && !origin) {
            if (jobDraft) {
                toggleModal(true, {
                    type: "job-form",
                    data: { draft: jobDraft },
                    back: { type: "job-list" },
                });
            }
            return;
        }

        const target =
            cancelled && origin
                ? origin
                : { position: placement.position, address: placementAddress };

        if (markerId) {
            const marker = userData.organization.markers.find((m) => m.id === markerId);
            if (marker) {
                toggleModal(true, {
                    type: "edit-marker",
                    data: {
                        marker,
                        position: target.position,
                        address: target.address,
                        draft,
                    },
                });
                return;
            }
        }

        toggleModal(true, {
            type: "add-marker",
            data: {
                position: target.position,
                address: target.address,
                draft,
                lockedKind,
                jobDraft,
                selectAs,
            },
            back: jobDraft
                ? { type: "job-form", data: { draft: jobDraft }, back: { type: "job-list" } }
                : undefined,
        });
    }

    return (
        <ThemeProvider theme={Theme[theme]}>
            <CssBaseline/>
            <RequestsProvider role="organization" userData={userData} setUserData={setUserData}>
            <main className="workspace" aria-label="Drop site map">
            <Map
                theme={theme}
                userData={userData}
                currentLocation={currentLocation}
                toggleModal={toggleModal}
                placement={placement?.position ?? null}
                onPlacementChange={(position) => movePlacement(position)}
                focusKey={focusKey}
                jobsRefreshKey={jobsRefreshKey}
            />
            
            {placement ? (
                <PlacementPanel
                    position={placement.position}
                    address={placementAddress}
                    resolving={resolving}
                    editing={Boolean(placement.markerId || placement.origin)}
                    locating={locating}
                    title={
                        placement.markerId || placement.origin
                            ? "Move your pin"
                            : placement.lockedKind === "facility"
                              ? "Drop a pin for this facility"
                              : placement.lockedKind === "jobSite"
                                ? "Drop a pin for this job site"
                                : "Drop a pin for this location"
                    }
                    description="Tap the map or drag the pin to the exact spot — your drop site, facility, or job site."
                    onSearch={(position, address) => {
                        movePlacement(position, address);
                        setFocusKey((k) => k + 1);
                    }}
                    onUseMyLocation={locateMe}
                    onCancel={() => finishPlacement(true)}
                    onContinue={() => finishPlacement(false)}
                />
            ) : (
                <Controls
                    userData={userData}
                    toggleModal={toggleModal}
                    onAddLocation={() => startAddLocation()}
                />
            )}

            <Modal
                open={modalOpen}
                userData={userData}
                setUserData={setUserData}
                theme={theme}
                setTheme={setTheme}
                modalConfig={modalConfig}
                toggleModal={toggleModal}
                currentLocation={currentLocation}
                onAddLocation={startAddLocation}
            />
            </main>
            </RequestsProvider>
        </ThemeProvider>
    )
}
