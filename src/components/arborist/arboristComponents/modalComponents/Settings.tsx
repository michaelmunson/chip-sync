import React, { useCallback, useState } from 'react';
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
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DB } from '../../../../utils/database';
import { Auth } from 'aws-amplify';

namespace Props {
    export interface Settings {
        userData:User
        theme:"light"|"dark"
        setTheme:React.Dispatch<React.SetStateAction<Settings["theme"]>>
        setUserData: React.Dispatch<React.SetStateAction<User|undefined>>
    }
}

const SettingsRow = ({children}:{children:JSX.Element|JSX.Element[]}) => (
    <div className='row v-center space-between m1'>
        {children}
    </div>
);
const SettingsLabel = ({text,icon}:{text:string,icon:JSX.Element}) => (
    <Typography className='row v-center'>
        {icon}
        <b>{text}</b>
    </Typography>
);
const SettingsAccordian = ({label,icon,children}:{label:string, icon:JSX.Element, children:JSX.Element|JSX.Element[]}) => (
    <Accordion style={{ width: "100%", boxShadow: "none" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon/>} style={{ padding: "0px" }}>
            <Typography className='row v-center'>
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
    <div className='row hv-center space-between m1'>
        <Typography className='row vert-center'>
            <b>Sign Out</b>
        </Typography>
        <IconButton onClick={() => Auth.signOut()}>
            <ExitToAppIcon style={{color:'#e90707'}}/>
        </IconButton>
    </div>
)

export default function Settings({
    userData,
    theme,
    setTheme,
    setUserData
}:Props.Settings){
    const [page, setPage] = useState<"members"|"markers">();
    
    const updateMapChoice = useCallback((mapChoice:User["mapChoice"]) => {
        DB.updateUser({mapChoice});
        setUserData(data => {
            if (!data) return ({} as User); 
            const dataMut = {...data};
            dataMut.mapChoice = mapChoice;
            return dataMut;
        })
    }, []); 

    const MemberSettings = useCallback(() => (<>
        <Divider className='w100 b m1'>General</Divider>
        <SettingsRow>
            <SettingsAccordian
                label='Mode'
                icon={theme === "dark" ? <NightsStayIcon/> : <LightModeIcon/>}>
                <div className='row hv-center'>
                    <Button variant={theme === "dark" ? "outlined" : "text"} style={{color: theme === "dark" ? "" : "gray"}} onClick={e => setTheme("dark")}>
                        {theme === "dark" ? <>
                            <NightsStayIcon style={{marginRight:"5px"}}/> Dark
                        </> : <>
                            <NightsStayOutlinedIcon style={{marginRight:"5px"}}/> Dark
                        </>}
                    </Button>
                    <Button variant={theme === "light" ? "outlined" : "text"} style={{color: theme === "light" ? "" : "gray"}} onClick={e => setTheme("light")}>
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
                <div className='row hv-center'>
                    <span style={{color:"gray", fontSize:".8em"}}>The app that address links will bring you to</span>
                    <div className='row align-center space-evenly' style={{marginTop:"10px"}}>
                        <Button variant={userData.mapChoice === "apple" ? "outlined" : "text"} style={{color: userData.mapChoice === "apple" ? "" : "gray"}} onClick={e => updateMapChoice('apple')}>
                            <AppleIcon style={{marginRight:"5px"}}/> Apple
                        </Button>
                        <Button variant={userData.mapChoice === "google" ? "outlined" : "text"} style={{color: userData.mapChoice === "google" ? "" : "gray"}} onClick={e => updateMapChoice('google')}>
                            <GoogleIcon style={{marginRight:"5px"}}/> Google
                        </Button> 
                    </div>
                </div>
            </SettingsAccordian>
        </SettingsRow>
    </>), [theme, userData]);

    const AdminSettings = useCallback(() => (<>
        <Divider className='w100 b m1'>Admin</Divider>
        <SettingsRow>
            <SettingsAccordian
                label='Manage Organization'
                icon={<ManageAccountsIcon/>}>
                <div className='col hv-center'>
                    <Button variant={"outlined"} 
                        onClick={e => setPage("members")}
                        startIcon={<SettingsIcon/>}>
                        Manage Members
                    </Button>
                    <Button variant={"outlined"} 
                        startIcon={<RoomIcon/>}
                        onClick={e => setPage("markers")}>
                        Manage Markers                        
                    </Button> 
                </div>
            </SettingsAccordian>
        </SettingsRow>
    </>), [userData]);

    const AdminManager = useCallback(() => {
        if (page==="members") return (
            <>members</>
        ); 
        else if (page==="markers") return (
            <>markers</>
        )
    }, [page, userData]);

    if (page) return (
        <div id="settings-modal">
            <IconButton 
                color="primary" 
                style={{padding:"0px"}}
                onClick={()=>setPage(undefined)}>
                <ArrowBackIcon/>
            </IconButton>
            <AdminManager/>
        </div>
    ); 

    if (userData.role === "member") return (
        <div id="settings-modal">
            <MemberSettings/>
            <SignOut/>
        </div>
    )

    return (
        <div id="settings-modal">
            <MemberSettings/>
            <Divider className='w100 b m1'>Admin</Divider>
            <AdminSettings/>
            <SignOut/>
        </div>
    )
}
