"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactPhone: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    contactPhone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [hasCooldown, setHasCooldown] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const lastSubmit = localStorage.getItem("contactFormSubmittedAt");
    if (lastSubmit) {
      const elapsed = Date.now() - Number(lastSubmit);
      const twelveHours = 1 * 60 * 60 * 1000;

      if (elapsed < twelveHours) {
        setHasCooldown(true);
      } else {
        setHasCooldown(false);
        localStorage.removeItem("contactFormSubmittedAt");
      }
    } else {
      setHasCooldown(false);
    }
  }, [isOpen]);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", contactPhone: "", message: "" };

    if (formData.name.trim().length < 3) {
      newErrors.name = "En az 3 karakter girin.";
      valid = false;
    }

    if (!/^\d{10}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "10 haneli geçerli bir numara girin.";
      valid = false;
    }

    if (formData.message.trim().length < 3) {
      newErrors.message = "En az 3 karakter girin.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "contactPhone") {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        localStorage.setItem("contactFormSubmittedAt", Date.now().toString());
        setSubmitted(true);
        setFormData({ name: "", contactPhone: "", message: "" });
      } else {
        const data = await res.json();
        console.error("Gönderim hatası:", data.error);
        alert("Mesaj gönderilirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("İstek hatası:", err);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 mb-3 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg text-gray-800">İletişim Formu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {hasCooldown ? (
            <p className="text-gray-700 text-sm text-center font-medium">
              Formunuz iletildi. En kısa sürede dönüş yapılacaktır.
            </p>
          ) : submitted ? (
            <p className="text-green-600 text-sm text-center font-medium">
              Mesajınız gönderildi. Geri dönüş sağlanacaktır!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="İsim Soyisim"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  placeholder="İletişim Telefonu (5XXXXXXXXX)"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                {errors.contactPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                )}
              </div>

              <div>
                <textarea
                  name="message"
                  required
                  placeholder="Açıklama"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg"
              >
                Gönder
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSubmitted(false);
          setErrors({ name: "", contactPhone: "", message: "" });
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105"
        aria-label="Destek Formu Aç"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}