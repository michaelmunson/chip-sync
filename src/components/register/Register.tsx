import React, { useState } from 'react';
import { SetUserData } from '../../types/generalTypes';
import { GiGardeningShears } from "react-icons/gi";
import { GiChainsaw } from "react-icons/gi";
import "../../css/register.css"; 
import { Button } from '@mui/material';
import Spacer from '../utils/Spacer';
import RegisterArborist from './RegisterArborist';
import Container from '../utils/Container';
import RegisterGardner from './RegisterGardner';

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

export default function Register({
    setUserData
}:{
    setUserData:SetUserData
}) {
    const [regType, setRegType] = useState<"gardner"|"arborist">();
    
    if (!regType) return (
        <Container>
            <h3 className='header-4'>
                Select your Account Type 
            </h3>
            <Button 
                className='select-type-button'
                onClick={e => setRegType('arborist')}
                startIcon={<GiChainsaw/>}>
                Arborist
            </Button>
            <Spacer height={50}/>
            <Button 
                onClick={e => setRegType('gardner')}
                className='select-type-button'
                startIcon={<GiGardeningShears/>}>
                Gardner
            </Button>
        </Container>
    );

    if (regType === "arborist")
        return <RegisterArborist setUserData={setUserData}/>
    
    if (regType === "gardner")
        return <RegisterGardner setUserData={setUserData}/>

    return <></>
}
