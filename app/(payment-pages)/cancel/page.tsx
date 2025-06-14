'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/solid';

export default function CancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paket = searchParams.get('paket');
  const tutar = searchParams.get('tutar');
  const musteriNo = searchParams.get('musteriNo');
  const order = searchParams.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
          Ödeme İptal Edildi
        </h1>
        <p className="text-gray-600 mb-4">
          Ödeme işlemi iptal edildi. Lütfen tekrar deneyin veya destek ekibimizle iletişime geçin.
        </p>
        {paket && tutar && musteriNo && order && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left text-sm text-gray-700">
            <p><strong>Paket:</strong> {decodeURIComponent(paket)}</p>
            <p><strong>Tutar:</strong> {tutar} TRY</p>
            <p><strong>Müşteri No:</strong> {decodeURIComponent(musteriNo)}</p>
            <p><strong>Sipariş numarası:</strong> {decodeURIComponent(order)}</p>
          </div>
        )}
        <button
          onClick={() => router.push('/')}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Geri Dön
        </button>
      </div>
    </div>
  );
}