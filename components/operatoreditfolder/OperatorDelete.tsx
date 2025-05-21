import React, { useEffect, useState } from "react";
import Image from "next/image";

type Operator = {
  id: number;
  name: string;
  idName: string;
  imageID: string;
  aktiflik: number;
};

const OperatorDelete = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch("/api/table/operators");
        if (!res.ok) throw new Error("Operatörler alınamadı");
        const data = await res.json();
        setOperators(data);
      } catch (err: unknown) {
        setError("Operatörler yüklenemedi");
        console.error("Operatörleri alma hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  const deleteOperator = async (id: number) => {
    const operator = operators.find((op) => op.id === id);
    if (!operator) {
      alert("Operatör bulunamadı");
      return;
    }

    if (
      !confirm(
        "Bu operatörü ve ona ait tüm paketleri kalıcı olarak silmek istediğinize emin misiniz?"
      )
    )
      return;

    try {
      // 1. Paketleri sil
      const deletePacketsRes = await fetch(
        `/api/table/packets?key=${operator.idName}`,
        {
          method: "DELETE",
        }
      );
      if (!deletePacketsRes.ok) {
        const errData = await deletePacketsRes.json();
        throw new Error(errData.error || "Paketler silinemedi");
      }

      // 2. Operatörü sil
      const res = await fetch(`/api/table/operators/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operatör silinemedi");
      }

      setOperators((prev) => prev.filter((op) => op.id !== id));
      alert("Operatör ve ilgili paketler başarıyla silindi!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Silme işlemi sırasında bir hata oluştu";
      alert(`Hata: ${message}`);
      console.error("Silme hatası:", err);
    }
  };

  const getStatusText = (aktiflik: number) => {
    switch (aktiflik) {
      case 1:
        return "Aktif";
      case 0:
        return "Pasif";
      case 2:
        return "Çıkarılmış";
      default:
        return "Bilinmeyen";
    }
  };

  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">Operatörleri Yönet</h2>
      {operators.length === 0 ? (
        <p className="text-gray-500">Operatör bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {operators.map((operator) => (
            <li
              key={operator.id}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-12">
                  <Image
                    src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                    fill
                    className="object-contain"
                    alt={operator.name}
                    priority
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">{operator.name}</p>
                  <p className="text-sm text-gray-500">
                    Durum: {getStatusText(operator.aktiflik)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => deleteOperator(operator.id)}
                >
                  Kalıcı Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OperatorDelete;
