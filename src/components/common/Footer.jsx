import React from 'react'

const Footer = () => {
    const date = new Date();
    const year = date.getFullYear();
  return (
    <div className='text-zinc-500 text-center pb-7'>© {year} Dev Wellbeing</div>
  )
}

export default Footer