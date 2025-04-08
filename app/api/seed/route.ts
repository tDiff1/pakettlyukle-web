import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    await prisma.yasal.createMany({
      data: [
        { key: "yasal_title", content: "Yasal Bilgiler" },
        { key: "iptal_title", content: "İptal ve İade Koşulları" },
        { key: "iptal_description", content: "Ttelekominikasyon olarak, müşteri memnuniyetini ön planda tutuyoruz. Hizmetlerimizden herhangi biriyle ilgili iptal veya iade talebiniz olduğunda, aşağıdaki koşullar geçerlidir:<br />" },
        { key: "iptal_description_two", content: "- Abonelik tabanlı hizmetlerde, iptal talepleri belirlenen fatura dönemleri içerisinde yapılmalıdır.<br />- Dijital ürünlerde iade yapılamaz. Ancak, eğer ürün henüz yüklenmemiş ise iade edilebilir.<br />- Fiziksel ürünlerde, cayma hakkı 14 gün içerisinde kullanılabilir ve iade prosedürlerimize uygun olarak işlem yapılmalıdır." },
        { key: "kvkk_title", content: "KVKK(Kişisel Verileri Koruma Kanunu)" },
        { key: "kvkk_description", content: "Ttelekominikasyon, Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, müşterilerinin kişisel verilerini hukuka uygun bir şekilde işlemektedir. Verilerinizin toplanma amaçları, saklanma süreleri ve üçüncü taraflarla paylaşım ilkelerimiz aşağıdaki gibidir:<br />" },
        { key: "kvkk_description_two", content: "- Verileriniz yalnızca ilgili hizmetlerin sunulması amacıyla işlenmektedir.<br />- Verilerinizi izniniz olmadan üçüncü kişilerle paylaşmayız.<br />- KVK kanununa uygun olarak, verilerinize erişim, düzenleme ve silme hakkına sahipsiniz." },
        { key: "gizlilik_title", content: "Gizlilik Politikası" },
        { key: "gizlilik_description", content: "Ttelekominikasyon olarak, müşterilerimizin gizliliğine büyük önem veriyoruz. Gizlilik politikamız aşağıdaki ilkeler çerçevesinde belirlenmiştir:<br />" },
        { key: "gizlilik_description_two", content: "- Toplanan veriler yalnızca belirlenen hizmetler için kullanılır.<br />- Verileriniz güvenli sunucularımızda saklanmakta ve yetkisiz erişimlere karşı korunmaktadır.<br />- Kredi kartı ve ödeme bilgileri gibi hassas verileriniz şifreleme ile korunmaktadır." },
        { key: "kulsoz_title", content: "Kullanıcı Sözleşmesi" },
        { key: "kulsoz_description", content: "Ttelekominikasyon hizmetlerini kullanan herkes, aşağıdaki kuralları kabul etmiş sayılır:<br />" },
        { key: "kulsoz_description_two", content: "- Kullanıcılar, hizmetleri yasal ve etik kurallar dahilinde kullanmalıdır.<br />- Hizmetlerin ödeme ve abonelik detayları, işbu sözleşme kapsamında belirtilmiştir.<br />- Hizmetlerin ticari kullanımı, özel izne tabidir ve aksi durumlarda hukuki yaptırımlar uygulanabilir.</p>" },
        { key: "ucli_title", content: "Ücretler ve limitler" },
        { key: "ucli_description", content: "Ttelekominikasyon hizmetlerinin fiyatlandırması ve kullanım limitleri aşağıdaki gibidir:<br />" },
        { key: "ucli_description_two", content: "- Abonelik paketleri ve hizmet ücretleri, dönemsel olarak güncellenebilir.<br />- Kullanım limitleri, seçilen paketlere ve hizmet türüne bağlı olarak değişebilir.<br />- Ekstra kullanım durumlarında aşım ücretleri uygulanabilir ve bunlar abonelik planlarında belirtilir." },
        { key: "bilgilendirme", content: "Bu politikalarla ilgili detaylı bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz." },
      ]
    });

    return NextResponse.json({ message: "Veriler eklendi!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veri eklenemedi", details: error }, { status: 500 });
  }
}