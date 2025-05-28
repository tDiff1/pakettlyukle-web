"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

export default function LogoUploader() {
  const [logoPath, setLogoPath] = useState("/logo/logo.png");

  useEffect(() => {
    fetch("/api/logo-path")
      .then((res) => res.json())
      .then((data) => {
        if (data.filePath) {
          setLogoPath(data.filePath + `?t=${Date.now()}`);
        }
      })
      .catch((err) => console.error("Logo yolu alınamadı:", err));
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (!file.type.startsWith("image/")) {
      alert("Lütfen geçerli bir resim dosyası yükleyin.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setLogoPath(data.filePath + `?t=${Date.now()}`);
      alert("Logo güncellendi!");
    } else {
      alert("Logo yüklenirken hata oluştu.");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-[#e5e5e6] flex flex-col items-center w-full">
      <div className="mt-4 flex flex-col items-center">
        <h3 className="text-lg font-semibold">Güncel Logo</h3>
        <Image
          src={logoPath}
          alt="Güncel Logo"
          width={128}
          height={128}
          className="rounded-lg mt-2 w-24 h-24 sm:w-32 sm:h-32 object-contain"
        />
      </div>
      <div
        {...getRootProps()}
        className="w-full p-8 sm:p-12 md:p-16 cursor-pointer border-2 border-dashed border-green-600 text-center mt-4"
      >
        <input {...getInputProps()} />
        <p className="text-sm sm:text-base">Yeni logo dosyanı buraya sürükle veya tıkla</p>
      </div>
    </div>
  );
}