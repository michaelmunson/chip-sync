import React from 'react'

export default function Spacer({
    height=1,
    width=1
}:{
    height?:number,
    width?:number
}){
  return (
    <div style={{height:`${height}px`, width:`${width}px`}}></div>
  )
}
