import React from 'react'
import Demo from './demo'
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: `Yasal`,
  description: "GeneDrated by tiff",
};

const page = () => {
  
  return (
   <div>
    <Demo />
   </div>
  )
}

export default page
