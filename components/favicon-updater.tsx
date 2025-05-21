"use client";
import { useEffect } from "react";

export function FaviconUpdater() {
  useEffect(() => {
    fetch("/api/favicon")
      .then((res) => res.json())
      .then((data) => {
        const url = data?.url;
        if (!url) return;

        // Eski favicon'u sil
        const existingIcons = document.querySelectorAll("link[rel='icon']");
        existingIcons.forEach((el) => el.parentNode?.removeChild(el));

        // Yeni favicon'u oluştur
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = url;
        document.head.appendChild(link);
      });
  }, []);

  return null; // Görsel çıktı yok
}
