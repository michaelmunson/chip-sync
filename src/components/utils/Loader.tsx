import React, { MutableRefObject, useEffect, useRef } from 'react';
import logo from "../../images/logo-variants/logo-round.png"; 
import { delay } from '../../utils/general';

interface LoaderProps {
    isFullScreen:boolean
}

export default function Loader({isFullScreen}:LoaderProps) {

    const Spinner = () => (
        <img 
            className="logo xxlarge breath"
            src={logo} 
            alt="Logo"/>
    )

    if (isFullScreen) return (
        <div 
            className='row hv-center'
            style={{
                height:'100%',
                width:'100%'
            }}>
            <Spinner/>
        </div>
    )
    
    return <Spinner/>
}
