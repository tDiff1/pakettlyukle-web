'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function DeclinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paket = searchParams.get('paket');
  const tutar = searchParams.get('tutar');
  const musteriNo = searchParams.get('musteriNo');
  const order = searchParams.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
        <ExclamationCircleIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
          Ödeme Reddedildi
        </h1>
        <p className="text-gray-600 mb-4">
          Ödemeniz reddedildi. Lütfen kart bilgilerinizi kontrol edin veya başka bir ödeme yöntemi deneyin.
        </p>
        {paket && tutar && musteriNo && order &&(
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left text-sm text-gray-700">
            <p><strong>Paket:</strong> {decodeURIComponent(paket)}</p>
            <p><strong>Tutar:</strong> {tutar} TL</p>
            <p><strong>Müşteri No:</strong> {decodeURIComponent(musteriNo)}</p>
            <p><strong>Sipariş numarası:</strong> {decodeURIComponent(order)}</p>
          </div>
        )}
        <button
          onClick={() => router.push('/')}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Geri Dön
        </button>
      </div>
    </div>
  );
}