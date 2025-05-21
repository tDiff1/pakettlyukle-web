import React from 'react'
import Demo from './demo'




export const metadata = {
    title: "Pakettlyukle",
    description:
      "Pakettlyukle yasal metinleri, iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi detayları.",
    openGraph: {
      title: "Pakettlyukle",
      description:
        "Pakettlyukle yasal metinleri, iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi detayları.",
      url: "https://pakettlyukle.com/pakettlyukle",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "article",
    },
    robots: "index, follow",
    alternates: {
      canonical: "/pakettlyukle",
    },
  };



const Pakettlyukle = () => {
    return (
        <div>
            <Demo />
        </div>
    )
}

export default Pakettlyukle
