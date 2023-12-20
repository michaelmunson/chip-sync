import React from 'react'

export default function ModalButtons({children}:{children:JSX.Element|JSX.Element[]}) {
    return (
        <div className='modal-buttons-container'>
            {children}
        </div>
    )
}
