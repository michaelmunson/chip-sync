import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '../../../../types/dataTypes';
import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, IconButton, Switch, Typography } from '@mui/material';
import { 
    NightsStay as NightsStayIcon,
    NightsStayOutlined as NightsStayOutlinedIcon,
    LightMode as LightModeIcon,
    LightModeOutlined as LightModeOutlinedIcon,
    Map as MapIcon,
    Room as RoomIcon,
    Person as PersonIcon,
    DeleteForever as DeleteForeverIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    ExitToApp as ExitToAppIcon,
    Apple as AppleIcon,
    Google as GoogleIcon,
    Settings as SettingsIcon,
    ExpandMore as ExpandMoreIcon,
    ManageAccounts as ManageAccountsIcon,
    ArrowBack as ArrowBackIcon,
    Key as KeyIcon,
    ContentCopy as ContentCopyIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    LockOpen as LockOpenIcon,
    Check as CheckIcon,
    CheckBoxOutlined as CheckBoxOutlinedIcon
} from '@mui/icons-material';
import { DB } from '../../../../utils/database';
import { Auth } from 'aws-amplify';
import "../../../../css/modalComponents/settings.css"; 
import Spacer from '../../../utils/Spacer';

namespace Props {
    export interface Settings {
        userData:User
        theme:"light"|"dark"
        setTheme:React.Dispatch<React.SetStateAction<Settings["theme"]>>
        setUserData: React.Dispatch<React.SetStateAction<User|undefined>>
    }
    export interface AdminSettings extends Settings {
        setPage: React.Dispatch<React.SetStateAction<"members" | "markers" | undefined>>
    }
    export interface AdminManager {
        page: "members"|"markers"
        userData:User
        setUserData: React.Dispatch<React.SetStateAction<User|undefined>>
        setPage: React.Dispatch<React.SetStateAction<"members" | "markers" | undefined>>
    }
}

const SettingsRow = ({children}:{children:JSX.Element|JSX.Element[]}) => (
    <div className='row v-center space-between mt3 mb3'>
        {children}
    </div>
);

const SettingsLabel = ({icon, text}:{icon:JSX.Element, text:string}) => (
    <Typography className='row v-center'>
        <span style={{marginRight:"10px", marginTop:"6px"}}>{icon}</span>
        <b>{text}</b>
    </Typography>
)

const SettingsAccordian = ({label,icon,children}:{label:string, icon:JSX.Element, children:JSX.Element|JSX.Element[]}) => (
    <Accordion style={{ width: "100%", boxShadow: "none" }}>
        <AccordionSummary className='settings-accordian' expandIcon={<ExpandMoreIcon/>} style={{ padding: "0px" }}>
            <Typography className='row v-center svg-right-10'>
                {icon}
                <b>{label}</b>
            </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: "0px" }}>
            {children}
        </AccordionDetails>
    </Accordion>
);

const SignOut = () => (
    <div className='row hv-center m1'>
        <Typography className='row vert-center'>
            <b>Sign Out</b>
        </Typography>
        <IconButton onClick={() => Auth.signOut()}>
            <ExitToAppIcon style={{color:'#e90707'}}/>
        </IconButton>
    </div>
);

function MemberSettings({
    userData,
    theme,
    setTheme,
    setUserData
} : Props.Settings
){
    const updateMapChoice = useCallback((mapChoice:User["mapChoice"]) => {
        DB.updateUser({mapChoice});
        setUserData(data => {
            if (!data) return ({} as User); 
            const dataMut = {...data};
            dataMut.mapChoice = mapChoice;
            return dataMut;
        })
    }, []); 

    return <>
        {/* <Divider className='w100 b mt2'>General</Divider> */}
        <SettingsRow>
            <SettingsAccordian
                label='Mode'
                icon={theme === "dark" ? <NightsStayIcon/> : <LightModeIcon/>}>
                <div className='row hv-center'>
                    <Button variant={theme === "dark" ? "outlined" : "text"} style={{color: theme === "dark" ? "" : "gray", width:"110px"}} onClick={e => setTheme("dark")}>
                        {theme === "dark" ? <>
                            <NightsStayIcon style={{marginRight:"5px"}}/> Dark
                        </> : <>
                            <NightsStayOutlinedIcon style={{marginRight:"5px"}}/> Dark
                        </>}
                    </Button>
                    <Spacer width={20}/>
                    <Button variant={theme === "light" ? "outlined" : "text"} style={{color: theme === "light" ? "" : "gray", width:"110px"}} onClick={e => setTheme("light")}>
                        {theme === "light" ? <>
                            <LightModeIcon style={{marginRight:"5px"}}/> Light
                        </> : <>
                            <LightModeOutlinedIcon style={{marginRight:"5px"}}/> Light
                        </>}
                    </Button> 
                </div>
            </SettingsAccordian>
        </SettingsRow>
        <SettingsRow>
            <SettingsAccordian
                label='Map Preference'
                icon={<MapIcon/>}>
                <div className='col v-center'>
                    <span style={{color:"gray", fontSize:".8em", textAlign:"center"}}>The app that address links will bring you to</span>
                    <div className='row hv-center' style={{marginTop:"10px"}}>
                        <Button variant={userData.mapChoice === "apple" ? "outlined" : "text"} style={{color: userData.mapChoice === "apple" ? "" : "gray", width:"110px"}} onClick={e => updateMapChoice('apple')}>
                            <AppleIcon style={{marginRight:"5px"}}/> Apple
                        </Button>
                        <Spacer width={20}/>
                        <Button variant={userData.mapChoice === "google" ? "outlined" : "text"} style={{color: userData.mapChoice === "google" ? "" : "gray", width:"110px"}} onClick={e => updateMapChoice('google')}>
                            <GoogleIcon style={{marginRight:"5px"}}/> Google
                        </Button> 
                    </div>
                </div>
            </SettingsAccordian>
        </SettingsRow>
    </>
}
function AdminSettings({
    userData,
    theme,
    setTheme,
    setUserData,
    setPage
} : Props.AdminSettings){
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const copyAccessCode = () => {
        navigator.clipboard.writeText(userData.organization.accessCode);
        setIsCopied(someBool => !someBool);
    }

    return <>
        {/* <Divider className='w100 b mt2'>Admin</Divider> */}
        <SettingsRow>
            <SettingsAccordian
                label='Manage Organization'
                icon={<SettingsIcon/>}>
                <div className='col hv-center'>
                    <Button variant={"outlined"} 
                        onClick={e => setPage("members")}
                        startIcon={<ManageAccountsIcon/>}>
                        Manage Members
                    </Button>
                    <Spacer height={10}/>
                    <Button variant={"outlined"} 
                        startIcon={<RoomIcon/>}
                        onClick={e => setPage("markers")}>
                        Manage Markers                        
                    </Button> 
                </div>
            </SettingsAccordian>
        </SettingsRow>
        <SettingsRow>
            <SettingsAccordian
                label='Access Code'
                icon={<LockOpenIcon/>}>
                <div className='row hv-center'>
                    <span style={{background:"rgb(136,135,135,.4)", padding:"5px 10px 3px 12px", borderRadius:"10px", marginRight:"7px", fontSize:"1.2rem", letterSpacing:"3px"}}>{userData.organization.accessCode}</span>
                    {!isCopied ? (
                        <ContentCopyIcon onClick={copyAccessCode}/>
                    ) : (
                        <CheckIcon onClick={copyAccessCode}/>
                    )}
                </div>
            </SettingsAccordian>
            {/* <SettingsLabel text="Access Code" icon={<KeyIcon/>}/>
            <div className='row v-center'>
                <span style={{background:"#676767", padding:"3px 10px", borderRadius:"10px", marginRight:"5px"}}>{userData.organization.accessCode}</span>
                {!isCopied ? (
                    <ContentCopyIcon onClick={e => setIsCopied(true)}/>
                ) : (
                    <CheckIcon style={{color:"green"}}/>
                )}
            </div> */}
        </SettingsRow>
    </>
}
function AdminManager({
    page,
    userData,
    setPage,
    setUserData
} : Props.AdminManager
){
    if (page === "markers") return <>
        markers
    </>
    else if (page === "members") return <>
        members
    </>
    else return <></>
}   

export default function Settings({
    userData,
    theme,
    setTheme,
    setUserData
}:Props.Settings){
    const [page, setPage] = useState<"members"|"markers">();

    if (page) return (
        <div id="settings-modal">
            <IconButton 
                color="primary" 
                style={{padding:"0px", justifyContent:"left"}}
                onClick={()=>setPage(undefined)}>
                <ArrowBackIcon/>
            </IconButton>
            <AdminManager
                page={page}
                userData={userData}
                setPage={setPage}
                setUserData={setUserData}/>
        </div>
    ); 

    if (userData.role === "member") return (
        <div id="settings-modal">
            <MemberSettings
                theme={theme}
                setTheme={setTheme}
                userData={userData}
                setUserData={setUserData}/>
            <SignOut/>
        </div>
    )

    return (
        <div id="settings-modal">
            <MemberSettings
                theme={theme}
                setTheme={setTheme}
                userData={userData}
                setUserData={setUserData}/>
            <AdminSettings
                theme={theme}
                setTheme={setTheme}
                userData={userData}
                setUserData={setUserData}
                setPage={setPage}/>
            <SignOut/>
        </div>
    )
}
