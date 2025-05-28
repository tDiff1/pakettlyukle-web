"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

type Operator = {
  id: number;
  name: string;
  aktiflik: number;
  idName: string;
  imageID: string;
  key: string;
  CompanyCode: number;
};

const OperatorAddRemove = () => {
  const [step, setStep] = useState<
    | "select-action"
    | "select-remove"
    | "select-add"
    | "add-new"
    | "create-new"
    | "confirm"
  >("select-action");
  const [actionType, setActionType] = useState<"remove" | "add-from-removed" | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [name, setName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0].type === "image/png") {
      setImageFile(acceptedFiles[0]);
    } else {
      alert("Lütfen sadece PNG formatında bir resim yükleyin!");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"] },
    multiple: false,
  });

  useEffect(() => {
    fetch("/api/table/operatorsadd")
      .then((res) => res.json())
      .then((data) => setOperators(data))
      .catch((err) => console.error("Operatör verisi alınamadı:", err));
  }, []);

  const updateOperatorStatus = async (newStatus: number) => {
    if (!selectedOperator) return;

    const res = await fetch(`/api/table/operators/${selectedOperator.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktiflik: newStatus }),
    });

    if (res.ok) {
      alert("Operatör başarıyla güncellendi!");
      const updated = await fetch("/api/table/operatorsadd").then((r) => r.json());
      setOperators(updated);
      setStep("select-action");
      setActionType(null);
      setSelectedOperator(null);
    } else {
      alert("Hata oluştu!");
    }
  };

  const handleCreateOperator = async () => {
    if (!name || !companyCode || !imageFile) return alert("Tüm alanlar zorunludur.");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("companyCode", companyCode);
    formData.append("image", imageFile);

    try {
      const res = await fetch("/api/table/operatorsadd", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Yeni operatör başarıyla eklendi!");
        const updated = await fetch("/api/table/operatorsadd").then((r) => r.json());
        setOperators(updated);
        setStep("select-action");
        setName("");
        setCompanyCode("");
        setImageFile(null);
      } else {
        const error = await res.json();
        alert(`Operatör eklenemedi: ${error.message || "Bilinmeyen hata"}`);
      }
    } catch (err) {
      console.error("Operatör ekleme hatası:", err);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  const removedOperators = operators.filter((op) => op.aktiflik === 2);
  const availableOperators = operators.filter((op) => op.aktiflik === 1);

  const blobBaseUrl =
    "https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/";

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {step === "select-action" && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Ne yapmak istiyorsunuz?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-md hover:bg-red-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              onClick={() => {
                setActionType("remove");
                setStep("select-remove");
              }}
            >
              ❌ Operatör Çıkar
            </button>
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-md hover:bg-green-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              onClick={() => setStep("add-new")}
            >
              ➕ Operatör Ekle
            </button>
          </div>
        </div>
      )}

      {step === "add-new" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">Nasıl eklemek istersiniz?</h2>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setStep("select-action")}
            >
              ← Geri Dön
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              onClick={() => setStep("select-add")}
            >
              📦 Çıkarılmış Operatörlerden Ekle
            </button>
            <button
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold shadow-md hover:bg-gray-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              onClick={() => setStep("create-new")}
            >
              ✏️ Yeni Operatör Oluştur
            </button>
          </div>
        </div>
      )}

      {step === "create-new" && (
        <div className="space-y-6 max-w-lg mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Yeni Operatör Oluştur</h2>
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              onClick={() => setStep("add-new")}
            >
              ← Geri Dön
            </button>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors duration-300"
                placeholder=" "
                required
              />
              <label
                htmlFor="name"
                className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500 peer-valid:-top-6 peer-valid:text-sm"
              >
                Operatör İsmi
              </label>
              <p className="text-xs text-gray-400 mt-1">Örnek: Vodafone, Türk Telekom</p>
            </div>

            <div className="relative">
              <input
                type="text"
                id="companyCode"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors duration-300"
                placeholder=" "
                required
              />
              <label
                htmlFor="companyCode"
                className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500 peer-valid:-top-6 peer-valid:text-sm"
              >
                Şirket Kodu
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operatör Resmi (PNG)</label>
              <div
                {...getRootProps()}
                className={`relative p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
                  isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                {imageFile ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        fill
                        priority
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-600">{imageFile.name}</p>
                    <button
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                      onClick={() => setImageFile(null)}
                    >
                      Resmi Kaldır
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V12m0 0V8m0 4H3m4 0h14m-4-4v8m0 0v4m0-4H11m4 0h6"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">PNG resmini sürükleyin veya tıklayın</p>
                    <p className="text-xs text-gray-400">Yalnızca PNG formatı desteklenir</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Önerilen boyut: 1000px genişlik x 360px yükseklik</p>
            </div>

            <button
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
              onClick={handleCreateOperator}
              disabled={!name || !companyCode || !imageFile}
            >
              Operatörü Ekle
            </button>
          </div>
        </div>
      )}

      {step === "select-add" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">Çıkarılmış operatörler:</h2>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setStep("add-new")}
            >
              ← Geri Dön
            </button>
          </div>

          {removedOperators.length === 0 ? (
            <p className="text-red-500 text-center">Çıkarılmış operatör bulunamadı.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {removedOperators.map((op) => (
                <li key={op.id}>
                  <button
                    onClick={() => {
                      setSelectedOperator(op);
                      setActionType("add-from-removed");
                      setStep("confirm");
                    }}
                  >
                    <div className="relative group bg-[#e5e5e6] shadow-md w-full p-6 sm:p-8 rounded-xl items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out">
                      <div className="relative w-full h-16 sm:h-20">
                        <Image
                          src={`${blobBaseUrl}${op.imageID}`}
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

      {step === "select-remove" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">Çıkarmak için bir operatör seçin:</h2>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setStep("select-action")}
            >
              ← Geri Dön
            </button>
          </div>

          {availableOperators.length === 0 ? (
            <p className="text-red-500 text-center">Operatör bulunamadı.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableOperators.map((op) => (
                <li key={op.id}>
                  <button
                    onClick={() => {
                      setSelectedOperator(op);
                      setActionType("remove");
                      setStep("confirm");
                    }}
                  >
                    <div className="relative group bg-[#e5e5e6] shadow-md w-full p-6 sm:p-8 rounded-xl items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out">
                      <div className="relative w-full h-16 sm:h-20">
                        <Image
                          src={`${blobBaseUrl}${op.imageID}`}
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
            {actionType === "remove" ? "ÇIKARMAK" : "SİSTEME GERİ EKLEMEK"} istiyor musunuz?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold w-full sm:w-auto"
              onClick={() => {
                updateOperatorStatus(actionType === "remove" ? 2 : 1);
              }}
            >
              Evet
            </button>
            <button
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold w-full sm:w-auto"
              onClick={() => setStep("select-action")}
            >
              Hayır
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorAddRemove;