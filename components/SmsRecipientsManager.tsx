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

  // Numara listesini getir
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

  // Sayfa yüklendiğinde listeyi çek
  useEffect(() => {
    fetchRecipients();
  }, []);

  // Yeni numara ekle
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

  // Numara sil
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
    <div className="max-w-md mx-auto p-4 bg-[#e5e5e6] rounded-3xl shadow">
      <h2 className="text-xl font-semibold mb-4">Hedef Numara Yönetimi</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Numara girin (örn: 8503xxxxxxx)"
          className="flex-grow border border-gray-300 rounded px-3 py-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Ekle
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

      {loading && <div className="mb-4">Yükleniyor...</div>}

      <ul className="divide-y divide-gray-200">
        {recipients.map((r) => (
          <li key={r.id} className="flex justify-between items-center py-2">
            <span>{r.phone}</span>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-red-600 hover:underline"
              disabled={loading}
            >
              Sil
            </button>
          </li>
        ))}
        {recipients.length === 0 && !loading && (
          <li key="empty" className="text-gray-500 text-center py-4">
            Kayıtlı numara yok.
          </li>
        )}
      </ul>
    </div>
  );
}
