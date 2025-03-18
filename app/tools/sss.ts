export interface Question {
    question: string;
    answer: string;
}

export const questions: Question[] = [
    { 
        question: "Kontör & tl paket yükleme işlemi ne kadar sürede tamamlanır?", 
        answer: "TL & Paket Kontör yükleme işlemi genellikle birkaç dakika içinde tamamlanır. Ancak, operatör yoğunluğu veya teknik sorunlar nedeniyle gecikmeler yaşanabilir." 
    },
    { 
        question: "Ödeme yöntemleri nelerdir?", 
        answer: "Kredi kartı, banka kartı Ve Havale eft seçenekleriyle Turkcell, Vodafone, Turk Telekom, Bimcell, Pttcell kontör TL paketi yükleyebilirsiniz." 
    },
    { 
        question: "Yanlış numaraya TL yükledim, ne yapabilirim?", 
        answer: "Yanlış numaraya yükleme yaptıysanız, İADE SÖZKONUSU DEĞİL NUMARANIZI DOĞRU GİRDİĞİNDEN EMİN OLUN. Operatörünüzün müşteri hizmetleriyle iletişime geçerek durumu bildirebilirsiniz. Geri alma işlemi operatör politikasına bağlıdır." 
    },
    { 
        question: "İşlem başarısız oldu, ne yapmalıyım?", 
        answer: "Banka veya operatör kaynaklı sorunlar nedeniyle işlem başarısız olabilir. Kart bilgilerinizi ve bakiyenizi kontrol ettikten sonra tekrar deneyin veya destek hattına başvurun." 
    }
];
