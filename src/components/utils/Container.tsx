import React from 'react'

export default function Container({
    children
}:{
    children:JSX.Element|JSX.Element[]
}) {
    return (
        <div
            className='col hv-center hw100 fade-in bg-grad'>
            {children}
        </div>
    )
}
