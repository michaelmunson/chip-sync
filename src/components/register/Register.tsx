import React, { useState, useRef, useEffect } from 'react';
import { SetUserData } from '../../types/generalTypes';
import { GiGardeningShears } from "react-icons/gi";
import { GiChainsaw } from "react-icons/gi";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Button,
    Divider
} from '@mui/material';
import "../../css/register.css"; 
import Container from '../utils/Container';


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
            style={{
                borderRadius: "20px",
                margin: "15px",
                width:'90%',
                maxWidth:'500px',
                opacity: (isDone.has(panelId) && expanded !== panelId) ? ".8" : ""
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
            <AccordionDetails className='col center'>
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
    const [regType, setRegType] = useState<"gardner"|"arborist">();
    const [canExpand, setCanExpand] = useState(new Set(['panel1']))
    const [isDone, setIsDone] = useState(new Set<string>())
    const [expanded, setExpanded] = useState<string>("panel1");
    const [canSubmit, setCanSubmit] = useState<boolean>(false); 
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
    /* COMPONENTS */
    function AccountTypeSelection(){
        return <div className='row w-100'>
            <Button startIcon={<GiChainsaw />}>
                Arborist
            </Button>
            <Button startIcon={<GiGardeningShears />}>
                Gardner
            </Button>
        </div>
    }
    function OrgJoinCreateSelection(){
        if (regType === "arborist") return <>
            <Divider>CENTER</Divider>
            <div className='row center'>
                <Button>
                    Join Organization
                </Button>
                <Button>
                    Create Organization
                </Button>
            </div>
        </>; else return <></>
    }

    function NextButton({ isDisabled, panel, callback }: { isDisabled: boolean, panel: string, callback?:()=>any }){
        return <Button
            variant='outlined'
            onClick={() => {
                toNext(panel);
                if (callback){
                    callback(); 
                }
            }}
            disabled={isDisabled}
            style={{ color: "var(--theme-primary-color-fg)", borderColor: "var(--theme-primary-color-fg)" }}
        >Next</Button>
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
                <OrgJoinCreateSelection/>
                <NextButton isDisabled={false} panel='panel1'/>
            </InputAccordian>
            <InputAccordian
                summary='Account Details'
                expanded={expanded}
                panelId='panel2'
                canExpand={canExpand}
                isDone={isDone}
                handleChange={handleChange}>
                <NextButton isDisabled={false} panel='panel1'/>
            </InputAccordian>
        </Container>
    )
}
