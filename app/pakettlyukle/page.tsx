import React from 'react'
import Demo from './demo'
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: "Ttelekominikasyon",
    description: "GeneDrated by tiff",
  };

const Pakettlyukle = () => {
    return (
        <div>
            <Demo />
        </div>
    )
}

export default Pakettlyukle
