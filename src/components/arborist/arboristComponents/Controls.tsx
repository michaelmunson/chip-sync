import AddLocationIcon from '@mui/icons-material/AddLocation';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import "../../../css/controls.css";
import { User } from '../../../types/dataTypes';
import { ToggleModal } from '../../../types/generalTypes';

interface ControlsProps {
    userData: User,
    toggleModal: ToggleModal
}

export default function Controls({
    userData,
    toggleModal
} : ControlsProps
){
    const [numNotific, setNumNotific] = useState(0);
    const openFns = {
        settings: () => toggleModal(true, {type:"settings", data:{}}),
        add: () => toggleModal(true, {type:"add-marker", data:{}}),
        list: () => toggleModal(true, {type:"marker-list", data:{}}),
        notif: () => toggleModal(true, {type:"notifications", data:{}})
    }
    useEffect(() => {
        const len = userData.notifications.filter(notif => !notif.opened).length;
        setNumNotific(len); 
    }, [userData]); 

    return (
        <div>
            <div className='ui-button-group-row ui-controls position-bottom'>
                <Button variant="contained" className='ui-button small' onClick={openFns.settings}> <SettingsIcon fontSize='large' /> </Button>

                <Button variant="contained" className='ui-button large darker' onClick={openFns.list}> <FormatListBulletedIcon fontSize='large' /> </Button>
                <Button variant="contained" className='ui-button large darker' onClick={openFns.add}> <AddLocationIcon fontSize='large' /> </Button>

                <Button variant="contained" className='ui-button small' onClick={openFns.notif}>
                    <NotificationsIcon fontSize='large' />
                    {numNotific ? (
                        <div className='num-notifications'>{numNotific}</div>
                    ) : (
                        <></>
                    )}
                </Button>
            </div>
        </div>
    )

}






/*

    const layoutRendersOld = {
        "top" : (
            <div>
                <div className='ui-button-group-row ui-controls'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                </div>
            </div>
        ),
        "bottom" : (
            <div>
                <div className='ui-button-group-row ui-controls position-bottom'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>
                </div>
            </div>
        ),
        "bottom-alt" : (
            <div>
                <div className='ui-button-group-row ui-controls position-bottom'>
                    <Button variant="contained" className='ui-button small' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                	
                    <Button variant="contained" className='ui-button large' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button large' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddLocationIcon fontSize='large'/> </Button>
                	
                    <Button variant="contained" className='ui-button small' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                </div>
            </div>
        ),
        "bottom-reverse" : (
            <div>
                <div className='ui-button-group-row ui-controls position-bottom'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                </div>
            </div>
        ),
        "left" : (
            <div>
                <div className='ui-button-group ui-controls'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                </div>
                <div className='ui-button-group ui-controls position-bottom'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>

                </div>
            </div>
        ),
        "left-reverse" : (
            <div>
                <div className='ui-button-group ui-controls'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>
                </div>
                <div className='ui-button-group ui-controls position-bottom'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                </div>
            </div>
        ),
        "right" : (
            <div>
                <div className='ui-button-group ui-controls right'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                </div>
                <div className='ui-button-group ui-controls position-bottom right'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>

                </div>
            </div>
        ),
        "right-reverse" : (
            <div>
                <div className='ui-button-group ui-controls right'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("addMarker",{})} disabled={!currentLocation}> <AddIcon fontSize='large'/> </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("markerList")} disabled={!currentLocation}> <ListIcon fontSize='large'/> </Button>
                </div>
                <div className='ui-button-group ui-controls position-bottom right'>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("notifications")}> 
                        <NotificationsIcon fontSize='large'/> 
                        {numNotific ? (
                            <div className='num-notifications'>{numNotific}</div>
                        ) : (
                            <></>
                        )}
                    </Button>
                    <Button variant="contained" className='ui-button' onClick={() => openModal("settings")}> <SettingsIcon fontSize='large'/> </Button>
                </div>
            </div>
        )
    }


*/