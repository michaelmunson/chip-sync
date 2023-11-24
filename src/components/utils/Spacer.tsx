import React from 'react'

export default function Spacer({height}:{height:number}) {
  return (
    <div style={{height:`${height}px`}}></div>
  )
}
