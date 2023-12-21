import React, { useMemo } from 'react'
import { ModalConfig } from '../../../../../types/generalTypes';
import {
    Notifications as NotificationIcon,
    EditLocationAlt as EditLocationIcon
} from "@mui/icons-material"

export default function ModalIcon({ type }: { type: ModalConfig["type"] }) {
    const iconMap = useMemo(() => ({
        "notifications" : <NotificationIcon/>,
        "add-marker"    : <></>,
        "marker-list"   : <></>,
        "settings"      : <></>,
        "marker-details": <></>,
        "edit-marker"   : <EditLocationIcon/>
    }), []);

    return (
        <div className='modal-icon-container'>
            {iconMap[type]}
        </div>
    )
}
