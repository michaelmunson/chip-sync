import { ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import "../../../../css/modalComponents/notifications.css";
import { Notification, User } from '../../../../types/dataTypes';
import { ModalConfig, ToggleModal } from '../../../../types/generalTypes';
import { DB } from '../../../../utils/database';
import date from "date-and-time"


type NotificationObject = Notification.JoinReqNotification | Notification.MarkerNotification;

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
    const SummaryContent = useMemo(() => ({
        circle(){
            const clsname = `notification-circle ${notification.opened ? "" : "unopened"}`
			return <div className={clsname}></div>
        }
    }), [notification]);

    const ContentMap = useMemo(() => {
        switch(notification.type){
            case "new-org-marker": return {
                summary(){
                    return <>
                        {SummaryContent.circle()}
                        <div className='summary-text'>
                            New Marker Created
                        </div>
                    </>
                },
                details(){
                    return <></>
                }
            }
            case "new-gardner-marker": return {
                summary(){
                    return <></>
                },
                details(){
                    return <></>
                }
            }
            case "join-request": return {
                summary(){
                    return <></>
                },
                details(){
                    return <></>
                }
            }
        }
    }, [notification]);
    
    return (
        <Accordion expanded={activePanel === notification.id} onChange={() => handleChange(notification)}>
            <AccordionSummary expandIcon={<ExpandMore/>}>
                <div className='summary-container'>
                    {ContentMap.summary()}
                    <div className='timestamp'>
                        {date.format(new Date(notification.updatedAt), "MM/DD/YY")}
                    </div>
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
        setActivePanel(lastId => {
            if (lastId === notification.id) return undefined
            else return notification.id; 
        });
    }

    return (<>{
        userData.notifications.map((notification, index) => (
            <NotificationAccordian
                key={`notification-${index}`}
                notification={notification}
                handleChange={handleChange}
                activePanel={activePanel} />
        ))
    }</>)
}
