"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Operator = {
  id: number;
  name: string;
  aktiflik: number;
  idName: string;
  imageID: string; // Operatör resim ID'si
};

const OperatorEdit = () => {
  const [step, setStep] = useState<
    "select-action" | "select-operator" | "confirm"
  >("select-action");
  const [actionType, setActionType] = useState<
    "make-active" | "make-passive" | null
  >(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );

  // API'den operatörleri çekme fonksiyonu (yeniden kullanılabilir)
  const fetchOperators = () => {
    fetch("/api/table/operators")
      .then((res) => res.json())
      .then((data) => setOperators(data))
      .catch((err) => console.error("Operatör verisi alınamadı:", err));
  };

  // İlk yüklemede operatörleri çek
  useEffect(() => {
    fetchOperators();
  }, []);

  // Aktiflik durumunu güncelle
  const updateOperatorStatus = async () => {
    if (!selectedOperator || !actionType) return;

    const newStatus = actionType === "make-active" ? 1 : 0;

    const res = await fetch(`/api/table/operators/${selectedOperator.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktiflik: newStatus }),
    });

    if (res.ok) {
      alert("Operatör başarıyla güncellendi!");
      fetchOperators(); // Listeyi yenile
      setStep("select-action");
      setActionType(null);
      setSelectedOperator(null);
    } else {
      alert("Hata oluştu!");
    }
  };

  const filteredOperators =
    actionType === "make-active"
      ? operators.filter((op) => op.aktiflik === 0)
      : operators.filter((op) => op.aktiflik === 1);

  return (
    <div className="space-y-6">
      {step === "select-action" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Hangi işlemi yapmak istiyorsunuz?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-md hover:bg-green-700 hover:scale-105 transition-all duration-300"
              onClick={() => {
                setActionType("make-active");
                setStep("select-operator");
              }}
            >
              ✅ Pasifleri Aktif Yap
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-md hover:bg-red-800 hover:scale-105 transition-all duration-300"
              onClick={() => {
                setActionType("make-passive");
                setStep("select-operator");
              }}
            >
              ❌ Aktifleri Pasif Yap
            </button>
          </div>
        </div>
      )}

      {step === "select-operator" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Bir operatör seçin:</h2>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setStep("select-action")}
            >
              ← Geri Dön
            </button>
          </div>

          {filteredOperators.length === 0 ? (
            <p className="text-red-500">Operatör bulunamadı.</p>
          ) : (
            <ul className="flex flex-wrap gap-4">
              {filteredOperators.map((op) => (
                <li key={op.id}>
                  <button
                    onClick={() => {
                      setSelectedOperator(op);
                      setStep("confirm");
                    }}
                  >
                    <div
                      className={`relative group bg-[#e5e5e6] flex flex-row shadow-md w-fit p-10 rounded-xl items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`}
                      style={{ minHeight: "120px" }}
                    >
                      <div className="relative w-96 h-20 z-10">
                        <Image
                          src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${op.imageID}`}
                          fill
                          className="object-contain"
                          alt={`${op.idName}`}
                          priority
                        />
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "confirm" && selectedOperator && (
        <div className="space-y-4">
          <p>
            <strong>{selectedOperator.name}</strong> adlı operatörü{" "}
            {actionType === "make-active" ? "AKTİF" : "PASİF"} yapmak istiyor
            musunuz?
          </p>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={updateOperatorStatus}
            >
              Evet, Onaylıyorum
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => {
                setStep("select-action");
                setActionType(null);
                setSelectedOperator(null);
              }}
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorEdit;
