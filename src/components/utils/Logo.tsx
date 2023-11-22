import logo from "../images/logo-rounded-200.png";
import React from 'react'
import "../../css/logo.css"

interface LogoProps {
    style: React.CSSProperties
    size : string
    className: string
}

export default function Logo({
    style, 
    size="small",
    className=""
} : LogoProps) 
{
    
    return (
        <img 
            id="logo"
            className={className}
            src={logo} 
            alt="Logo"
            style={{
                ...style
            }}
        />
    )
}