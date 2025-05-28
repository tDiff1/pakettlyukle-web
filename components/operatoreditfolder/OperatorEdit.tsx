"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Operator = {
  id: number;
  name: string;
  aktiflik: number;
  idName: string;
  imageID: string;
};

const OperatorEdit = () => {
  const [step, setStep] = useState<"select-action" | "select-operator" | "confirm">("select-action");
  const [actionType, setActionType] = useState<"make-active" | "make-passive" | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

  const fetchOperators = () => {
    fetch("/api/table/operators")
      .then((res) => res.json())
      .then((data) => setOperators(data))
      .catch((err) => console.error("Operatör verisi alınamadı:", err));
  };

  useEffect(() => {
    fetchOperators();
  }, []);

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
      fetchOperators();
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
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {step === "select-action" && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Hangi işlemi yapmak istiyorsunuz?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-md hover:bg-green-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              onClick={() => {
                setActionType("make-active");
                setStep("select-operator");
              }}
            >
              ✅ Pasifleri Aktif Yap
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-md hover:bg-red-800 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
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
            <h2 className="text-lg sm:text-xl font-semibold">Bir operatör seçin:</h2>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setStep("select-action")}
            >
              ← Geri Dön
            </button>
          </div>

          {filteredOperators.length === 0 ? (
            <p className="text-red-500 text-center">Operatör bulunamadı.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredOperators.map((op) => (
                <li key={op.id}>
                  <button
                    onClick={() => {
                      setSelectedOperator(op);
                      setStep("confirm");
                    }}
                  >
                    <div
                      className={`relative group bg-[#e5e5e6] shadow-md w-full p-6 sm:p-8 rounded-xl items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`}
                      style={{ minHeight: "100px" }}
                    >
                      <div className="relative w-full h-16 sm:h-20">
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
          <p className="text-center">
            <strong>{selectedOperator.name}</strong> adlı operatörü{" "}
            {actionType === "make-active" ? "AKTİF" : "PASİF"} yapmak istiyor musunuz?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
              onClick={updateOperatorStatus}
            >
              Evet, Onaylıyorum
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 w-full sm:w-auto"
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