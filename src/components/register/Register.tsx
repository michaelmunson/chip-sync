import React, { useState } from 'react';
import { SetUserData } from '../../types/generalTypes';
import { GiGardeningShears } from "react-icons/gi";
import { GiChainsaw } from "react-icons/gi";
import "../../css/register.css"; 
import { Button } from '@mui/material';

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
        <div
            className='col hv-center hw100 fade-in bg-grad'>
            <Button 
                className='select-type-button'
                startIcon={<GiChainsaw/>}>
                Arborist
            </Button>
            <Button 
                className='select-type-button'
                startIcon={<GiGardeningShears/>}>
                Gardner
            </Button>
        </div>
    )

    return <></>
}
