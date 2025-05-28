"use client";

import React, { useState } from "react";
import OperatorsList from "./operatoreditfolder/OperatorsList";
import OperatorAddRemove from "./operatoreditfolder/OperatorAddRemove";
import OperatorEdit from "./operatoreditfolder/OperatorEdit";
import OperatorDelete from "./operatoreditfolder/OperatorDelete";

const OperatorsEdit = () => {
  const [activeTab, setActiveTab] = useState("operators");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Hamburger menü durumu

  const renderContent = () => {
    switch (activeTab) {
      case "operators":
        return <OperatorsList />;
      case "edit":
        return <OperatorEdit />;
      case "add-remove":
        return <OperatorAddRemove />;
      case "delete":
        return <OperatorDelete />;
      default:
        return null;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      {/* Hamburger Menü Butonu (Mobil için) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-100">
        <h2 className="text-xl font-bold">Operatör</h2>
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
        <h2 className="hidden md:block text-xl font-bold mb-6">Operatör</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setActiveTab("operators");
              setIsMenuOpen(false);
            }}
            className={`px-4 py-2 rounded transition ${
              activeTab === "operators"
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Operatörler
          </button>
          <button
            onClick={() => {
              setActiveTab("edit");
              setIsMenuOpen(false);
            }}
            className={`px-4 py-2 rounded transition ${
              activeTab === "edit"
                ? "bg-yellow-600 text-white"
                : "bg-yellow-500 text-white hover:bg-yellow-700"
            }`}
          >
            Operatör Düzenle
          </button>
          <button
            onClick={() => {
              setActiveTab("add-remove");
              setIsMenuOpen(false);
            }}
            className={`px-4 py-2 rounded transition ${
              activeTab === "add-remove"
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Operatör Ekle/Çıkar
          </button>
          <button
            onClick={() => {
              setActiveTab("delete");
              setIsMenuOpen(false);
            }}
            className={`px-4 py-2 rounded transition ${
              activeTab === "delete"
                ? "bg-red-700 text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Operatör Sil
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">{renderContent()}</main>
    </div>
  );
};

export default OperatorsEdit;