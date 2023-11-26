import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { User } from '../../../types/dataTypes';
import "../../../css/controls.css"; 

interface ControlsProps {
    userData: User
}

export default function Controls({
    userData,
} : ControlsProps
){
    const [numNotific, setNumNotific] = useState(0);

    return (
        <div>
            <div className='ui-button-group-row ui-controls position-bottom'>
                <Button variant="contained" className='ui-button small' onClick={() => {}}> <SettingsIcon fontSize='large' /> </Button>

                <Button variant="contained" className='ui-button large darker' onClick={() => {}}> <FormatListBulletedIcon fontSize='large' /> </Button>
                <Button variant="contained" className='ui-button large darker' onClick={() => {}}> <AddLocationIcon fontSize='large' /> </Button>

                <Button variant="contained" className='ui-button small' onClick={() => {}}>
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