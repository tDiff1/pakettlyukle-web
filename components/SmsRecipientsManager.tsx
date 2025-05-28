"use client";

import React, { useEffect, useState } from "react";

type Recipient = {
  id: number;
  phone: string;
  createdAt: string;
};

export default function SmsRecipientsManager() {
  const [phone, setPhone] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRecipients() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sms-recipients");
      if (!res.ok) throw new Error("Liste alınamadı");
      const data = await res.json();
      setRecipients(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecipients();
  }, []);

  async function handleAdd() {
    if (!phone.trim()) {
      setError("Lütfen numara girin");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sms-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (res.status === 409) {
        setError("Numara zaten kayıtlı");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Ekleme başarısız");
        setLoading(false);
        return;
      }

      setPhone("");
      await fetchRecipients();
    } catch {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu numarayı silmek istediğinize emin misiniz?")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sms-recipients/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Silme başarısız");
        setLoading(false);
        return;
      }

      await fetchRecipients();
    } catch {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-[#e5e5e6] rounded-3xl shadow">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Hedef Numara Yönetimi</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Numara girin (örn: 8503xxxxxxx)"
          className="flex-grow border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
        >
          Ekle
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 font-medium text-center">{error}</div>}

      {loading && <div className="mb-4 text-center">Yükleniyor...</div>}

      <ul className="divide-y divide-gray-200">
        {recipients.map((r) => (
          <li key={r.id} className="flex justify-between items-center py-2 px-2">
            <span className="text-sm sm:text-base">{r.phone}</span>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-red-600 hover:underline text-sm sm:text-base"
              disabled={loading}
            >
              Sil
            </button>
          </li>
        ))}
        {recipients.length === 0 && !loading && (
          <li className="text-gray-500 text-center py-4 text-sm sm:text-base">
            Kayıtlı numara yok.
          </li>
        )}
      </ul>
    </div>
  );
}