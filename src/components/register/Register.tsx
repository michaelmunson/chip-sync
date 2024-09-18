import React, { useState, useRef, useEffect } from 'react';
import { SetUserData } from '../../types/generalTypes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Button,
    Divider,
    TextField,
    Checkbox
} from '@mui/material';
import "../../css/register.css"; 
import Container from '../utils/Container';
import Spacer from '../utils/Spacer';
import { DB } from '../../utils/database';
import { BeatLoader } from 'react-spinners';
/* 
Select Arborist or Gardner
- Arborist:
    - Create or Join Organization:
        - Create:
            * first name
            * last name
            * org name
            * location (zip code)
        - Join:
            * first name
            * last name
            * access code
- Gardner
    * first name
    * last name
    * contact info
*/

interface InputAccordianProps {
    summary: string
    children: JSX.Element | JSX.Element[]
    expanded: string | boolean
    panelId: string
    canExpand: Set<string>
    isDone: Set<string>
    handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
};

function InputAccordian({ summary, children, expanded, handleChange, panelId, canExpand, isDone }: InputAccordianProps) {
    const accref = useRef<any>(null);
    
    useEffect(() => {
        if (expanded === panelId){
            setTimeout(()=>accref?.current?.scrollIntoView(),250); 
        }
    }, [expanded, panelId]);
    
    return (
        <Accordion
            ref={accref}
            expanded={expanded === panelId}
            onChange={handleChange(panelId)}
            disabled={!canExpand.has(panelId)}
            className='bg-white'
            style={{
                borderRadius: "20px",
                margin: "15px",
                width:'90%',
                maxWidth:'500px',
                background:"white",
                backgroundColor:"white",
                opacity: (isDone.has(panelId) && expanded !== panelId) ? ".7" : ""
            }}>
            <AccordionSummary
                // onClick={(e:any) => setTimeout(()=>e.target.scrollIntoView(),200)}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
            >
                <Typography sx={{ width: '100%', flexShrink: 0, fontSize: "1.3em", display: "flex", alignItems: "center" }}>
                    {isDone.has(panelId) ? (
                        <CheckBoxIcon style={{ margin: "0px 5px 1.5px 0px", color: "green" }} />
                    ) : (
                        <CheckBoxOutlineBlankIcon style={{ margin: "0px 5px 1.5px 0px" }} />
                    )}{summary}
                </Typography>
                {/* <Typography sx={{ color: 'text.secondary' }}>I am an accordion</Typography> */}
            </AccordionSummary>
            <AccordionDetails className='col h-center'>
                {children}
            </AccordionDetails>
        </Accordion>
    )
}

export default function Register({
    setUserData
}:{
    setUserData:SetUserData
}) {
    // DATA STATE
    const [regType, setRegType] = useState<"gardner"|"arborist">();
    const [arboristType, setArboristType] = useState<"join"|"create">("join"); 
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [orgAccessCode, setOrgAccessCode] = useState<string>(""); 
    const [orgName, setOrgName] = useState<string>(""); 
    const [orgLocation, setOrgLocation] = useState<string>(""); 
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [incorrectAccessCode, setIncorrectAccessCode] = useState<boolean>(false);  
    // ACCORDIAN STATE
    const [canExpand, setCanExpand] = useState(new Set(['panel1']))
    const [isDone, setIsDone] = useState(new Set<string>())
    const [expanded, setExpanded] = useState<string>("panel1");
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false); 
    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : "");
    }
    const toNext = (panel: string) => {
        const nextPanel = "panel" + (parseInt(panel.replace("panel", "")) + 1);
        setCanExpand(new Set([...canExpand, nextPanel]));
        setIsDone(new Set([...isDone, panel]));
        const [x, y]: Array<any> = [1, 2];
        handleChange(nextPanel)(x, y);
        if (panel === "panel5") {
            setCanSubmit(true); 
        }
    }
    /* ACCOUNT HANDLERS */
    async function createAccount(){
        setLoading(true);
        if (regType === "arborist"){
            if (arboristType === "create") {
                const createOrgRes = await DB.createOrganization({
                    name: orgName,
                    location: orgLocation,
                    tier: JSON.stringify({
                        plan: "",
                        type: "monthly",
                        timestamp: Date.now()
                    })
                });
                const organizationId = createOrgRes.id; 
                const createAdminRes = await DB.createAdmin({
                    firstName,
                    lastName,
                    organizationId
                });
                setUserData(createAdminRes); 
            } 
            else if (arboristType === "join") {
                setIncorrectAccessCode(false); 
                const createUserRes = await DB.createMember({
                    firstName, 
                    lastName,
                    accessCode: orgAccessCode
                });
                if (createUserRes) {
                    setUserData(createUserRes);
                } else {
                    setIncorrectAccessCode(true);
                    toNext('panel1')
                }
            }
        } 
        setLoading(false); 
    }
    /* COMPONENTS */
    function AccountTypeSelection(){
        return <div className='row w100 space-evenly'>
            <Button
                variant={regType==="arborist"?"contained":"outlined"}
                color="success"
                className='select-type-button'
                onClick={()=>{
                    setRegType('arborist');
                    toNext('panel1')
                }}>
                Arborist
            </Button>
            <Button
                disabled={true}
                color="success"
                variant={regType==="gardner"?"contained":"outlined"}
                className='select-type-button'
                onClick={()=>{
                    setRegType('gardner');
                    toNext('panel1')
                }}>
                Gardner
            </Button>
        </div>
    }

    function accountDetails(){
        function orgDetails(){
            if (arboristType==="join") return (
                <TextField
                    style={{
                        maxWidth:'390px', 
                        width:'100%'
                    }}
                    sx={{
                        input: {
                            textTransform:"uppercase",
                            letterSpacing:"4px",
                            textAlign:"center"
                        }
                    }}
                    onChange={(e) => setOrgAccessCode(e.target.value.toUpperCase())}
                    label="Organization Access Code"
                    error={incorrectAccessCode}
                    helperText={incorrectAccessCode ? "Invalid Access Code" : "Request this code from your employer. It will be located in their settings panel."}
                    autoComplete="new-password"
                    inputProps={{maxLength:10}}/>
            );
            else if (arboristType === "create") return (<>
                <TextField
                    style={{maxWidth:'390px', width:'100%'}}
                    onChange={(e) => setOrgName(e.target.value)}
                    label="Organization Name"/>
                <Spacer height={15}/>
                <TextField
                    style={{maxWidth:'390px', width:'100%'}}
                    type='number'
                    onChange={(e) => setOrgLocation(e.target.value)}
                    label="Organization Location (Zip Code)"/>
            </>);

            else return <></>
        }

        if (regType === "arborist") return <>
            <div className='row w100 h-center'>
                <TextField
                    onChange={e => setFirstName(e.target.value)} 
                    label="First Name"/>
                <TextField 
                    onChange={e => setLastName(e.target.value)}
                    label="Last Name"/>
            </div>

            <Divider
                style={{margin:'20px 0px', width:'100%'}}>
                    Join or Create Organization
            </Divider>
            <div className='row w100 space-evenly'>
                <Button 
                    color="success"
                    variant={arboristType==="join"?"contained":"outlined"}
                    className='select-type-button'
                    onClick={()=>{
                        setArboristType('join');
                        setOrgName("");
                    }}>
                    Join
                </Button>
                <Button
                    color="success"
                    variant={arboristType==="create"?"contained":"outlined"}
                    className='select-type-button'
                    onClick={()=>{
                        setArboristType('create');
                        setOrgAccessCode("");
                        setOrgLocation(""); 
                    }}>
                    Create
                </Button>
            </div>
            <Divider
                style={{width:'100%', margin:'25px 0px'}}>
                    Organization Details
            </Divider>
            {orgDetails()}
        </>;

        else return <>
        
        </>
    }

    function NextButton({ isDisabled, panel, callback }: { isDisabled: boolean, panel: string, callback?:()=>any }){
        return <Button
            variant={isDisabled?"text":"contained"}
            onClick={() => {
                toNext(panel);
                if (callback){
                    callback(); 
                }
            }}
            disabled={isDisabled}
            style={{ 
                marginTop:"30px",
                width:'100%'
            }}>
                Next
            </Button>
    }

    return (
        <Container fadeIn>
            <InputAccordian
                summary='Account Type'
                expanded={expanded}
                panelId='panel1'
                canExpand={canExpand}
                isDone={isDone}
                handleChange={handleChange}>
                <AccountTypeSelection/>
                <Spacer height={30}/>
            </InputAccordian>
            <InputAccordian
                summary='Account Details'
                expanded={expanded}
                panelId='panel2'
                canExpand={canExpand}
                isDone={isDone}
                handleChange={handleChange}>
                {accountDetails()}
                <NextButton isDisabled={
                    !firstName || !lastName || (!orgAccessCode && arboristType==="join") || (arboristType==="create" && (!orgName || !orgLocation))
                } panel='panel2'/>
            </InputAccordian>
            <InputAccordian
                summary='Agreements'
                expanded={expanded}
                panelId='panel3'
                canExpand={canExpand}
                isDone={isDone}
                handleChange={handleChange}>
                <div className='row v-center'>
                    <Checkbox onChange={e => {
                        setIsAgreed(e.target.checked);
                        if (e.target.checked){
                            toNext('panel3'); 
                        }
                    }}/>
                    <label>
                        I agree to the <a target="_blank" href="https://www.getchipsync.com/terms-and-conditions">Terms and Conditions</a>
                    </label>
                </div>
                <Spacer height={15}/>
            </InputAccordian>
            <Button 
                variant='contained' 
                disabled={isDone.size !== 3 || loading} 
                style={{marginTop:'20px'}}
                onClick={() => createAccount()}>
                {loading ? (
                    <BeatLoader color="green"/>
                ) : (
                    <>Create Account</>
                )}
            </Button>
        </Container>
    )
}
