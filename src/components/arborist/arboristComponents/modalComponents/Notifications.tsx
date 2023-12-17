import React, { useState } from 'react';
import { ModalConfig, ToggleModal } from '../../../../types/generalTypes';
import { User, Notification } from '../../../../types/dataTypes';
import { DB } from '../../../../utils/database';
import { 
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import "../../../../css/modalComponents/notifications.css";

type NotificationObject = Notification.AdminNotification | Notification.MarkerNotification;

namespace Props {
    export interface NotificationsProps {
        data?       : ModalConfig["data"]
        userData    : User
        setUserData : React.Dispatch<React.SetStateAction<User|undefined>>
        toggleModal : ToggleModal
    }
    export interface NotificationAccordianProps {
        notification: NotificationObject
        handleChange: (notification: NotificationObject) => void
        activePanel : string | undefined
    }
}

function NotificationAccordian({
    notification,
    handleChange,
    activePanel,
} : Props.NotificationAccordianProps
){
    

    return (
        <Accordion expanded={activePanel === notification.id} onChange={() => handleChange(notification)}>
            <AccordionSummary expandIcon={<ExpandMore/>}>
                <div className='summary-container'>

                </div>
            </AccordionSummary>
            <AccordionDetails>
                
            </AccordionDetails>
        </Accordion>
    )
}

export default function Notifications({
    data,
    userData,
    setUserData,
    toggleModal
}: Props.NotificationsProps
) {
    const [activePanel, setActivePanel] = useState<string>();

    async function updateNotification(notification: NotificationObject) {
        const notifications = [...userData.notifications];
        for (const i in notifications) {
            if (notifications[i].id === notification.id) {
                notifications[i].opened = true;
            }
        }

        setUserData((d: any) => {
            return {
                ...d,
                notifications,
            }
        });

        await DB.updateNotification({ id: notification.id });
    }

    function handleChange(notification: NotificationObject) {
        if (!notification.opened) updateNotification(notification);
        setActivePanel(notification.id);
    }

    return (
        userData.notifications.map(notification => (
            <NotificationAccordian
                notification={notification}
                handleChange={handleChange}
                activePanel={activePanel} />
        ))
    )
}
