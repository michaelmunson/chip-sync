import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import "../../../../css/modalComponents/notifications.css";
import { Notification, User } from '../../../../types/dataTypes';
import { ModalConfig, ToggleModal } from '../../../../types/generalTypes';
import { DB } from '../../../../utils/database';
import date from "date-and-time";
import { AddressLink } from '../../../utils/AddressLink';
import ModalIcon from './modalUtils/ModalIcon';
import ModalButtons from './modalUtils/ModalButtons';
import ModalContent from './modalUtils/ModalContent';


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
        toggleModal : ToggleModal
    }
}

function NotificationAccordian({
    notification,
    handleChange,
    activePanel,
    toggleModal
} : Props.NotificationAccordianProps
){
    const SubContentMap = useMemo(() => ({
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
                        {SubContentMap.circle()}
                        <div className='summary-text'>
                            New Marker Created
                        </div>
                    </>
                },
                details(){
                    return <>
                        <Button
                            style={{
                                marginTop:"-10px"
                                // transform:"translateY(-10px)"
                            }}
                            onClick={() => {
                                toggleModal(true, {
                                    type: "marker-details",
                                    data: notification.data,
                                    goBackLocation: "notifications"
                                }); 
                            }}>
                            View Marker
                        </Button>
                    </>
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
                    const {firstName, lastName} = notification.data; 
                    return <>
                        {SubContentMap.circle()}
                        <div className='summary-text'>
                            <b>{firstName} {lastName}</b> has joined your organization
                        </div>
                    </>
                },
                details(){
                    return <>
                        <Button
                            style={{
                                marginTop:"-10px"
                                // transform:"translateY(-10px)"
                            }}
                            onClick={() => {
                                toggleModal(true, {
                                    type: "settings"
                                }); 
                            }}>
                            Manage Members
                        </Button>
                    </>
                }
            }
        }
    }, [notification]);
    
    return (
        <Accordion expanded={activePanel === notification.id} onChange={() => handleChange(notification)}>
            <AccordionSummary>
                <div className='notification-summary-container'>
                    {ContentMap.summary()}
                    <div className='timestamp'>
						{date.format(new Date(notification.createdAt), "MM/DD/YY")}
					</div>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div className='notification-details-container'>
                    {ContentMap.details()}
                </div>
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

    async function clearNotifications() {
        userData.notifications.forEach(notification => DB.deleteNotification({id:notification.id}));
        setUserData(data => {
            if (data) {
                const dataMut = {...data};
                dataMut.notifications = [];
                return dataMut; 
            }
        }); 
    }

    function handleChange(notification: NotificationObject) {
        if (!notification.opened) updateNotification(notification);
        setActivePanel(lastId => {
            if (lastId === notification.id) return undefined
            else return notification.id; 
        });
    }

    if (userData.notifications.length === 0) return <>
        <ModalIcon type="notifications"/>
        <p style={{textAlign:"center"}}>No New Notifications</p>
    </>

    return (<>
        {/* <ModalIcon type="notifications"/> */}
        <ModalContent>
            {userData.notifications.map((notification, index) => (
                <NotificationAccordian
                    key={`notification-${index}`}
                    notification={notification}
                    handleChange={handleChange}
                    activePanel={activePanel}
                    toggleModal={toggleModal}/>
            ))}
        </ModalContent>
        <ModalButtons>
            <Button color="error" variant='contained' style={{padding:"15px"}} onClick={clearNotifications}>
                Clear
            </Button>
        </ModalButtons>
    </>)
}
