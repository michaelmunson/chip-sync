import React from 'react'

export default function Container({
    children,
    fadeIn=false
}:{
    children:JSX.Element|JSX.Element[],
    fadeIn?:boolean
}) {

    const fadeClass = fadeIn ? "fade-in " : ""
    return (
        <div
            className={`col hv-center hw100 ${fadeClass}bg-grad`}>
            {children}
        </div>
    )
}
