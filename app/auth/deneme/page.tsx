'use client';

import { useState } from 'react';

export default function OperatorSorgulaPage() {
  const [phone, setPhone] = useState('');
  interface Result {
    success: boolean;
    data?: unknown;
    error?: string;
  }

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {

      console.log(phone)

      const response = await fetch('/api/operator_sorgu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Hata:', error);
      setResult({ success: false, error: 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-xl font-bold mb-4">Operator Sorgulama</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+90 ile başlayan telefon numarası"
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Sorgulanıyor...' : 'Sorgula'}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          {result.success && result.data ? (
            <p className="text-green-700">{String(Object.values(result.data)[0])}</p>
          ) : (
            <p className="text-red-600">Hata: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
