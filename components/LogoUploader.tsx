"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

export default function LogoUploader() {
  const [logoPath, setLogoPath] = useState("/logo/logo.png");

  // En güncel logo URL'sini sunucudan al
  useEffect(() => {
    fetch("/api/logo-path")
      .then((res) => res.json())
      .then((data) => {
        if (data.filePath) {
          // Cache bust için zaman damgası ekle
          setLogoPath(data.filePath + `?t=${Date.now()}`);
        }
      })
      .catch((err) => console.error("Logo yolu alınamadı:", err));
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Yalnızca resim dosyalarına izin ver
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
      // Yeni logo URL'sini ayarla, cache bust
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
    <div className="p-4 rounded-xl items-center gap-10 bg-[#e5e5e6]">
      <div className="mt-4 justify-center flex flex-col items-center">
        <h3 className="text-lg font-semibold">Güncel Logo</h3>
        <Image
          src={logoPath}
          alt="Güncel Logo"
          width={128}
          height={128}
          className="rounded-lg mt-2"
        />
      </div>
      <div
        {...getRootProps()}
        className="p-16 cursor-pointer border border-dashed border-green-600"
      >
        <input {...getInputProps()} />
        <p>Yeni logo dosyanı buraya sürükle veya tıkla</p>
      </div>
    </div>
  );
}
