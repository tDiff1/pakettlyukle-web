"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

export default function FaviconUploader() {
  const [faviconPath, setFaviconPath] = useState("/favicon.ico");

  useEffect(() => {
    fetch("/api/favicon")
      .then((res) => res.json())
      .then((data) => {
        if (data?.url) {
          setFaviconPath(data.url + `?t=${Date.now()}`);
        }
      });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (file.type !== "image/x-icon" && !file.name.endsWith(".ico")) {
      alert("Lütfen yalnızca .ico uzantılı bir favicon dosyası yükleyin.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/favicon", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setFaviconPath(data.filePath + `?t=${Date.now()}`);
      alert("Favicon güncellendi! Sayfayı yenileyin.");
    } else {
      alert("Favicon yüklenirken hata oluştu.");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/x-icon": [".ico"] },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-[#e5e5e6] flex flex-col items-center w-full">
      <div className="mt-4 flex flex-col items-center">
        <h3 className="text-lg font-semibold">Güncel Favicon</h3>
        <Image
          src={faviconPath}
          alt="Güncel Favicon"
          width={64}
          height={64}
          className="rounded-lg mt-2 w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
      </div>
      <div
        {...getRootProps()}
        className="w-full p-8 sm:p-12 md:p-16 cursor-pointer border-2 border-dashed border-green-600 text-center mt-4"
      >
        <input {...getInputProps()} />
        <p className="text-sm sm:text-base">Yeni favicon.ico dosyanı buraya sürükle veya tıkla</p>
      </div>
    </div>
  );
}