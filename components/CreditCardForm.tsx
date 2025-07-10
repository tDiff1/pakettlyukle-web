import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Packet = {
  id: number;
  key: string;
  packet_title: string;
  packet_content: string;
  heryone_dk: number;
  heryone_sms: number;
  heryone_int: number;
  price: number;
};

export default function CreditCardForm({
  phone,
  selectedPacket,
}: {
  phone: string;
  selectedPacket: Packet;
}) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  const isValidLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\s/g, "").split("").map(Number);
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateCardNumber = (value: string): string => {
    const cleanedValue = value.replace(/\s/g, "");
    if (!cleanedValue) {
      return "Kart numarası gerekli";
    }
    if (!/^\d{16}$/.test(cleanedValue)) {
      return "Geçerli bir kart numarası girin (16 rakam)";
    }
    if (!isValidLuhn(cleanedValue)) {
      return "Geçersiz kart numarası";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "expiry") {
      const cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.length === 0) {
        formattedValue = "";
      } else {
        const month = cleanedValue.slice(0, 2);
        const year = cleanedValue.slice(2, 4);
        formattedValue = month;
        if (month.length === 2 && year.length > 0) {
          formattedValue += "/" + year;
        }
        formattedValue = formattedValue.slice(0, 5);
      }
    }

    setFormData({ ...formData, [name]: formattedValue });

    let errorMsg = "";
    if (name === "cardNumber") {
      errorMsg = validateCardNumber(value);
    } else if (
      name === "cardHolder" &&
      value.length > 0 &&
      !/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]*$/.test(value)
    ) {
      errorMsg = "Geçerli bir isim girin";
    } else if (
      name === "expiry" &&
      value.length > 0 &&
      !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(value)
    ) {
      errorMsg = "Geçerli bir tarih girin (MM/YY)";
    } else if (
      name === "cvv" &&
      value.length > 0 &&
      !/^\d{3,4}$/.test(value)
    ) {
      errorMsg = "Geçerli bir CVV girin (3-4 rakam)";
    }

    setErrors({ ...errors, [name]: errorMsg });
  };

  const handleCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
    setFormData({ ...formData, cardNumber: value });

    const errorMsg = validateCardNumber(value);
    setErrors({ ...errors, cardNumber: errorMsg });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      cardNumber: validateCardNumber(formData.cardNumber),
      cardHolder:
        formData.cardHolder.length === 0 ? "Kart sahibi adı gerekli" : "",
      expiry: !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(formData.expiry)
        ? "Geçerli bir tarih girin (MM/YY)"
        : "",
      cvv: !/^\d{3,4}$/.test(formData.cvv) ? "Geçerli bir CVV girin" : "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === "")) {
      const now = new Date();
      const payload = {
        musteriNumber: formData.cardHolder || null,
        musteriNo: phone,
        operator: selectedPacket.key,
        paket: selectedPacket.packet_title,
        paketid: selectedPacket.id,
        tutar: selectedPacket.price,
        saat: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        tarih: now.toISOString().split("T")[0],
        cardNumber: formData.cardNumber,
        cardHolder: formData.cardHolder,
        expiry: formData.expiry,
        cvv: formData.cvv,
      };

      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responseData = await res.json();

        if (res.ok && responseData.success && responseData.data.url3ds) {
          window.location.href = responseData.data.url3ds;
        } else {
          console.error(
            `Ödeme başlatılamadı! Status: ${res.status}, Mesaj: ${
              responseData.data?.message || responseData.error || "Bilinmeyen hata"
            }`
          );
          alert(
            responseData.data?.message ||
              responseData.error ||
              "Ödeme işlemi başlatılamadı."
          );
        }
      } catch (err) {
        console.error("Gönderim hatası:", err);
        alert("İletişim hatası. Lütfen tekrar deneyin.");
      }
    } else {
      console.log("Form doğrulama hatası:", newErrors);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Kredi Kartı Bilgileri
      </h1>
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl mb-6 text-white shadow-md">
        <div className="text-lg font-mono tracking-wider">
          {formData.cardNumber || "**** **** **** ****"}
        </div>
        <div className="flex justify-between mt-4">
          <div>
            <div className="text-sm opacity-80">Kart Sahibi</div>
            <div className="font-medium">
              {formData.cardHolder || "Ad Soyad"}
            </div>
          </div>
          <div>
            <div className="text-sm opacity-80">Son Kullanım</div>
            <div className="font-medium">{formData.expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kart Numarası
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleCardNumberInput}
            maxLength={19}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
            placeholder="1234 5678 9012 3456"
          />
          <AnimatePresence>
            {errors.cardNumber && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.cardNumber}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div>
          <label
            htmlFor="cardHolder"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kart Sahibi
          </label>
          <input
            type="text"
            id="cardHolder"
            name="cardHolder"
            value={formData.cardHolder}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
            placeholder="Ad Soyad"
          />
          <AnimatePresence>
            {errors.cardHolder && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.cardHolder}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label
              htmlFor="expiry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Son Kullanım Tarihi
            </label>
            <input
              type="text"
              id="expiry"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              maxLength={5}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
              placeholder="MM/YY"
            />
            <AnimatePresence>
              {errors.expiry && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.expiry}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1">
            <label
              htmlFor="cvv"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              maxLength={4}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
              placeholder="123"
            />
            <AnimatePresence>
              {errors.cvv && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.cvv}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg transition-all font-semibold shadow-md"
        >
          Ödemeyi Tamamla
        </motion.button>
      </form>
    </motion.div>
  );
}