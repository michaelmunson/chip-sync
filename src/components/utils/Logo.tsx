import logo from "../../images/logo.png";
import logoRound from "../../images/logo-variants/logo-round.png"; 
import React from 'react'
import "../../css/logo.css"

interface LogoProps {
    style?: React.CSSProperties
    size?: string
    className?: string
    type?:"normal"|"round"
}

export default function Logo({
    style, 
    size="small",
    className="",
    type="normal",
} : LogoProps) 
{
    const logoMap = {
        normal: logo,
        round : logoRound
    }

    return <img 
        className={`logo ${className} ${size}`}
        src={logoMap[type]} 
        alt="Logo"
        style={{
            ...style
    }}/>
}