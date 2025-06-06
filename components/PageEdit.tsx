'use client';
import React, { useEffect, useState } from "react";

type Home = {
  id: number;
  key: string;
  content: string;
};

const tableNames = ["header", "footer", "home", "siteinfo", "yasal"] as const;
type TableName = typeof tableNames[number];

const PageEdit = () => {
  const [data, setData] = useState<Record<TableName, Home[]>>({
    header: [],
    footer: [],
    home: [],
    siteinfo: [],
    yasal: [],
  });
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TableName | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Hamburger menü durumu

  useEffect(() => {
    Promise.all(
      tableNames.map((name) =>
        fetch(`/api/table/${name}`).then((res) => res.json())
      )
    )
      .then(([header, footer, home, siteinfo, yasal]) => {
        const newData = { header, footer, home, siteinfo, yasal };
        setData(newData);

        const initialEditingContent: Record<string, string> = {};
        tableNames.forEach((tableName) => {
          newData[tableName].forEach((item: Home) => {
            initialEditingContent[item.key] = item.content;
          });
        });
        setEditingContent(initialEditingContent);
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
      });
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setEditingContent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (tableName: TableName, id: number, key: string) => {
    const newContent = editingContent[key];
    if (!newContent) {
      console.error("İçerik bulunamadı:", key);
      return;
    }

    try {
      const res = await fetch(`/api/table/${tableName}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      setData((prevData) => ({
        ...prevData,
        [tableName]: prevData[tableName].map((item) =>
          item.id === id ? { ...item, content: newContent } : item
        ),
      }));

      setIsEditing((prev) => ({ ...prev, [key]: false }));
      setSavedMessage("Değişiklik kaydedildi");

      setTimeout(() => {
        setSavedMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  const toggleEdit = (key: string) => {
    setIsEditing((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      {/* Hamburger Menü Butonu (Mobil için) */}
      <div className="md:hidden flex items-center justify-between p-4 rounded-xl bg-gray-100">
        <h2 className="text-xl font-bold">Sayfalar</h2>
        <button onClick={toggleMenu} className="text-2xl">
          {isMenuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-gray-100 p-4 md:p-6 border-r md:sticky md:top-0 md:h-screen overflow-y-auto`}
      >
        <h2 className="hidden md:block text-xl font-bold mb-4">Sayfalar</h2>
        <div className="flex flex-col gap-2">
          {tableNames.map((tableName) => (
            <button
              key={tableName}
              onClick={() => {
                setActiveTab(tableName);
                setIsMenuOpen(false); // Mobil menüyü kapat
              }}
              className={`text-left px-4 py-2 rounded-md font-medium capitalize transition ${
                activeTab === tableName
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-200 text-gray-800"
              }`}
            >
              {tableName}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-screen">
        {activeTab ? (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold capitalize mb-6">
              {activeTab} İçeriği
            </h2>
            <div className="flex flex-col gap-4">
              {data[activeTab].map((item) => (
                <div key={item.id} className="w-full border-b pb-4 mb-2">
                  <button
                    onClick={() => toggleEdit(item.key)}
                    className="w-full text-left font-semibold text-base sm:text-lg text-blue-700 hover:underline flex justify-between items-center"
                  >
                    {item.key}
                    <span className="text-xs sm:text-sm text-gray-500">
                      {isEditing[item.key] ? "Kapat" : "Düzenle"}
                    </span>
                  </button>

                  {isEditing[item.key] && (
                    <div className="mt-3 bg-gray-50 p-4 rounded-md shadow-sm">
                      <textarea
                        value={editingContent[item.key] ?? item.content}
                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                      <button
                        onClick={() => handleSave(activeTab, item.id, item.key)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
                      >
                        Kaydet
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center">Bir tablo seçin</p>
        )}
      </main>
      {savedMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-all">
          {savedMessage}
        </div>
      )}
    </div>
  );
};

export default PageEdit;