import React from 'react'
import Demo from './demo'


export const metadata = {
    title: "Yasal Bilgilendirme",
    description:
      "Pakettlyukle yasal metinleri, iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi detayları.",
    openGraph: {
      title: "Yasal Bilgilendirme",
      description:
        "Pakettlyukle yasal metinleri, iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi detayları.",
      url: "https://pakettlyukle.com/yasal",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "article",
    },
    robots: "index, follow",
    alternates: {
      canonical: "/yasal",
    },
  };

const page = () => {
  
  return (
   <div>
    <Demo />
   </div>
  )
}

export default page
