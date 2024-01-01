import React from 'react'
import { JsxElement } from 'typescript'

export default function ModalContent({children}:{children:JSX.Element|JSX.Element[]}) {
    return (
        <div style={{
            height:"100%",
            overflowY:"auto"
        }}>
            {children}
        </div>
    )
}
