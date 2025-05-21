"use client";

import React, { useState } from "react";
import OperatorsList from "./operatoreditfolder/OperatorsList";
import OperatorAddRemove from "./operatoreditfolder/OperatorAddRemove";
import OperatorEdit from "./operatoreditfolder/OperatorEdit";
import OperatorDelete from "./operatoreditfolder/OperatorDelete";

const OperatorsEdit = () => {
  const [activeTab, setActiveTab] = useState("operators");

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

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 border-r sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Operatör</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setActiveTab("operators")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "operators"
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Operatörler
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "edit"
                ? "bg-yellow-600 text-white"
                : "bg-yellow-500 text-white hover:bg-yellow-700"
            }`}
          >
            Operatör Düzenle
          </button>
          <button
            onClick={() => setActiveTab("add-remove")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "add-remove"
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Operatör Ekle/Çıkar
          </button>
          <button
            onClick={() => setActiveTab("delete")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "add-remove"
                ? "bg-red-700 text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Operatör Sil
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
};

export default OperatorsEdit;
