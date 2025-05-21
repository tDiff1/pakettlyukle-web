import React, { useEffect, useState } from "react";

type Operator = {
  id: number;
  name: string;
  idName: string;
};

type Packet = {
  id: number;
  key: string;
  packet_title: string;
  packet_content: string;
  heryone_dk: number;
  heryone_sms: number;
  heryone_int: number;
  price: number;
};

const OperatorsPackets = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [formData, setFormData] = useState<Partial<Packet>>({
    heryone_dk: 0,
    heryone_sms: 0,
    heryone_int: 0,
  });
  const [isAddingNewPacket, setIsAddingNewPacket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTlPackage, setIsTlPackage] = useState(false);
  // Operatörleri getir
  useEffect(() => {
    const fetchOperators = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/table/operators");
        if (!res.ok) throw new Error("Operatörler alınamadı");
        const data = await res.json();
        setOperators(data);
      } catch {
        setError("Operatörler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  // Seçilen operatörün paketlerini getir
  useEffect(() => {
    if (!selectedOperator) {
      setPackets([]);
      return;
    }

    const fetchPackets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/table/packets?key=${selectedOperator}`);
        if (!res.ok) throw new Error("Paketler alınamadı");
        const data = await res.json();
        const filtered = data.filter(
          (packet: Packet) => packet.key === selectedOperator
        );
        setPackets(filtered);
      } catch {
        setError("Paketler yüklenemedi");
        setPackets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackets();
  }, [selectedOperator]);

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperator(e.target.value);
    setError(null);
    setPackets([]);
    setSelectedPacket(null);
    setIsAddingNewPacket(false);
  };

  const handlePacketClick = (packet: Packet) => {
    setSelectedPacket(packet);
    setFormData(packet);
    setIsAddingNewPacket(false);
  };

  const handleNewPacketClick = () => {
    setSelectedPacket(null);
    setFormData({ key: selectedOperator });
    setIsAddingNewPacket(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeletePacket = async () => {
    if (!selectedPacket) {
      setError("Silinecek paket seçilmedi.");
      return;
    }

    if (
      !confirm(
        `"${
          selectedPacket.packet_title || selectedPacket.id
        }" paketi silinecek. Emin misiniz?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/table/packets/${selectedPacket.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = {
            error: `Sunucu yanıtı geçersiz: ${res.status} ${res.statusText}`,
          };
        }
        console.error(
          "Sunucu hata yanıtı:",
          JSON.stringify(errorData, null, 2)
        );
        throw new Error(
          errorData.error ||
            errorData.message ||
            `Silme başarısız: ${res.status}`
        );
      }

      console.log(`Paket silindi: ${selectedPacket.id}`);
      setPackets((prevPackets) =>
        prevPackets.filter((packet) => packet.id !== selectedPacket.id)
      );
      setSelectedPacket(null);
      setFormData({});
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Paket silinemedi:", error);
        setError(error.message || "Paket silinemedi.");
      } else {
        console.error("Paket silinemedi:", error);
        setError("Bilinmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsTlPackage(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        dk: 0,
        sms: 0,
        internet: 0,
      }));
    }
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingNewPacket) {
      // Yeni paket ekleme
      if (!selectedOperator) {
        setError("Lütfen bir operatör seçin.");
        return;
      }

      const formattedData: Partial<Packet> = {
        key: selectedOperator,
        packet_title: formData.packet_title || "",
        packet_content: formData.packet_content || "",
        heryone_dk: Math.floor(Number(formData.heryone_dk) || 0),
        heryone_sms: Math.floor(Number(formData.heryone_sms) || 0),
        heryone_int: Math.floor(Number(formData.heryone_int) || 0),
        price: Math.floor(Number(formData.price) || 0),
      };

      try {
        const res = await fetch(`/api/table/packets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            errorData = {
              error: `Sunucu yanıtı geçersiz: ${res.status} ${res.statusText}`,
            };
          }
          console.error(
            "Sunucu hata yanıtı:",
            JSON.stringify(errorData, null, 2)
          );
          throw new Error(
            errorData.error ||
              errorData.message ||
              `Ekleme başarısız: ${res.status}`
          );
        }

        const newPacket = await res.json();
        console.log("Eklenen paket:", newPacket);

        setPackets((prevPackets) => [...prevPackets, newPacket]);
        setIsAddingNewPacket(false);
        setFormData({});
        setError(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Paket eklenemedi:", error);
          setError(error.message || "Paket eklenemedi.");
        } else {
          console.error("Paket eklenemedi:", error);
          setError("Bilinmeyen bir hata oluştu.");
        }
      }
    } else if (selectedPacket) {
      // Mevcut paketi düzenleme
      const formattedData: Partial<Packet> = {};
      if (formData.key !== selectedPacket.key)
        formattedData.key = selectedOperator;
      if (formData.packet_title !== selectedPacket.packet_title)
        formattedData.packet_title = formData.packet_title || "";
      if (formData.packet_content !== selectedPacket.packet_content)
        formattedData.packet_content = formData.packet_content || "";
      if (Number(formData.heryone_dk) !== selectedPacket.heryone_dk)
        formattedData.heryone_dk = Math.floor(Number(formData.heryone_dk) || 0);
      if (Number(formData.heryone_sms) !== selectedPacket.heryone_sms)
        formattedData.heryone_sms = Math.floor(
          Number(formData.heryone_sms) || 0
        );
      if (Number(formData.heryone_int) !== selectedPacket.heryone_int)
        formattedData.heryone_int = Math.floor(
          Number(formData.heryone_int) || 0
        );
      if (Number(formData.price) !== selectedPacket.price)
        formattedData.price = Math.floor(Number(formData.price) || 0);

      if (Object.keys(formattedData).length === 0) {
        setError("Hiçbir alan değiştirilmedi.");
        return;
      }

      console.log("Güncellenen veri:", JSON.stringify(formattedData, null, 2));

      try {
        const res = await fetch(`/api/table/packets/${selectedPacket.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            errorData = {
              error: `Sunucu yanıtı geçersiz: ${res.status} ${res.statusText}`,
            };
          }
          console.error(
            "Sunucu hata yanıtı:",
            JSON.stringify(errorData, null, 2)
          );
          throw new Error(
            errorData.error ||
              errorData.message ||
              `Güncelleme başarısız: ${res.status}`
          );
        }

        const updatedPacket = await res.json();
        console.log("Güncellenmiş paket:", updatedPacket);

        setPackets((prevPackets) =>
          prevPackets.map((packet) =>
            packet.id === updatedPacket.id ? updatedPacket : packet
          )
        );

        setSelectedPacket(null);
        setFormData({});
        setError(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Paket güncellenemedi:", error);
          setError(error.message || "Paket güncellenemedi.");
        } else {
          console.error("Paket güncellenemedi:", error);
          setError("Bilinmeyen bir hata oluştu.");
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-gray-50 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800">Operatör Paketleri</h2>

      {/* Operatör Seçimi */}
      <div>
        <label
          htmlFor="operator"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Operatör Seç
        </label>
        <select
          id="operator"
          value={selectedOperator}
          onChange={handleOperatorChange}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
        >
          <option value="">Bir operatör seçin</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.idName}>
              {operator.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">Hata: {error}</p>}

      {loading && !error && (
        <div className="flex items-center gap-2 text-indigo-600 text-sm">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Yükleniyor...
        </div>
      )}

      {/* Yeni Paket Ekle Butonu */}
      {selectedOperator && !selectedPacket && !isAddingNewPacket && (
        <div className="mt-4">
          <button
            onClick={handleNewPacketClick}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Yeni Paket Ekle
          </button>
        </div>
      )}

      {/* Paket Güncelleme veya Ekleme Formu */}
      {(selectedPacket || isAddingNewPacket) && (
        <form
          onSubmit={handleFormSubmit}
          className="space-y-4 bg-white p-6 rounded-2xl shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h3 className="text-xl font-bold text-gray-800">
              {isAddingNewPacket ? "Yeni Paket Ekle" : "Paketi Güncelle"}
            </h3>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isTlPackage}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span>TL Paketi</span>
            </label>
          </div>
          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Paket Başlığı
            </label>
            <input
              type="text"
              name="packet_title"
              value={formData.packet_title || ""}
              onChange={handleFormChange}
              placeholder="Örn: Süper 10GB"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Paket İçeriği
            </label>
            <textarea
              name="packet_content"
              value={formData.packet_content || ""}
              onChange={handleFormChange}
              placeholder="Örn: 18 GB +1000 DK (hızlı)"
              className="w-full p-2 border rounded resize-y min-h-[100px]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Heryöne Dakika
            </label>
            <input
              type="number"
              name="heryone_dk"
              value={isTlPackage ? 0 : formData.heryone_dk ?? 0}
              onChange={handleFormChange}
              disabled={isTlPackage}
              className="w-full p-2 border rounded bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Heryöne SMS
            </label>
            <input
              type="number"
              name="heryone_sms"
              value={isTlPackage ? 0 : formData.heryone_sms ?? 0}
              onChange={handleFormChange}
              disabled={isTlPackage}
              placeholder="SMS sayısı"
              className="w-full p-2 border rounded bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Heryöne İnternet (GB)
            </label>
            <input
              type="number"
              name="heryone_int"
              value={isTlPackage ? 0 : formData.heryone_int ?? 0}
              onChange={handleFormChange}
              disabled={isTlPackage}
              placeholder="GB cinsinden"
              className="w-full p-2 border rounded bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Fiyat (TL)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price ?? ""}
              onChange={handleFormChange}
              placeholder="Örn: 89"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {isAddingNewPacket ? "Ekle" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPacket(null);
                setIsAddingNewPacket(false);
                setFormData({});
              }}
              className="bg-gray-400 text-white px-4지지 py-2 rounded hover:bg-gray-500"
            >
              İptal
            </button>
            {selectedPacket && (
              <button
                type="button"
                onClick={handleDeletePacket}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sil
              </button>
            )}
          </div>
        </form>
      )}

      {/* Paket Listesi */}
      {!loading &&
        selectedOperator &&
        packets.length > 0 &&
        !selectedPacket &&
        !isAddingNewPacket && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {packets.map((packet) => (
              <li
                key={packet.id}
                onClick={() => handlePacketClick(packet)}
                className="p-4 bg-[#e5e5e6] rounded-3xl shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer flex flex-col justify-between"
              >
                <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-center text-gray-800">
                  {packet.packet_title}
                </h3>
                <div className="text-center mt-2">
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                    {packet.packet_content}
                  </p>
                </div>
                <div className="text-center mt-2">
                  {(packet.heryone_dk !== 0 ||
                    packet.heryone_sms !== 0 ||
                    packet.heryone_int !== 0) && (
                    <div>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                        Heryöne {packet.heryone_dk} Dakika
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                        Heryöne {packet.heryone_sms} SMS
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                        Heryöne {packet.heryone_int} GB İnternet
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center items-center text-xl w-full">
                  <button className="w-full max-w-[150px] p-3 bg-[#fefeff] hover:bg-[#e5e5e6] text-gray-600 font-bold text-center rounded-3xl">
                    {packet.price} TL
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      {/* Paket bulunamadı */}
      {!loading &&
        selectedOperator &&
        packets.length === 0 &&
        !error &&
        !isAddingNewPacket && (
          <p className="text-gray-500 text-sm">
            Bu operatöre ait paket bulunamadı.
          </p>
        )}
    </div>
  );
};

export default OperatorsPackets;
