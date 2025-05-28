import React, { useEffect, useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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
  sort_order: number;
};

const OperatorsPackets = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [originalPackets, setOriginalPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [formData, setFormData] = useState<Partial<Packet>>({
    heryone_dk: 0,
    heryone_sms: 0,
    heryone_int: 0,
  });
  const [isAddingNewPacket, setIsAddingNewPacket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTlPackage, setIsTlPackage] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);

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

  useEffect(() => {
    if (!selectedOperator) {
      setPackets([]);
      setOriginalPackets([]);
      return;
    }

    const fetchPackets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/table/packets?key=${selectedOperator}`);
        if (!res.ok) throw new Error("Paketler alınamadı");
        const data = await res.json();
        const filtered = data
          .filter((packet: Packet) => packet.key === selectedOperator)
          .sort((a: Packet, b: Packet) => a.sort_order - b.sort_order);
        setPackets(filtered);
        setOriginalPackets(filtered);
        setHasOrderChanged(false);
      } catch {
        setError("Paketler yüklenemedi");
        setPackets([]);
        setOriginalPackets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackets();
  }, [selectedOperator]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedPackets = Array.from(packets);
    const [movedPacket] = reorderedPackets.splice(result.source.index, 1);
    reorderedPackets.splice(result.destination.index, 0, movedPacket);

    setPackets(reorderedPackets);
    const orderChanged = reorderedPackets.some(
      (packet, index) => packet.id !== originalPackets[index]?.id
    );
    setHasOrderChanged(orderChanged);
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedOrders = packets.map((packet, index) => ({
        id: packet.id,
        sort_order: index,
      }));

      const res = await fetch("/api/table/packets/reorder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packets: updatedOrders }),
      });

      if (!res.ok) throw new Error("Sıralama güncellenemedi");
      setOriginalPackets(packets);
      setHasOrderChanged(false);
      setSuccessMessage("Sıralama başarıyla güncellendi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Sıralama güncellenemedi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperator(e.target.value);
    setError(null);
    setSuccessMessage(null);
    setPackets([]);
    setOriginalPackets([]);
    setSelectedPacket(null);
    setIsAddingNewPacket(false);
    setIsListView(false);
    setHasOrderChanged(false);
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

  const handleListViewToggle = () => {
    setIsListView((prev) => !prev);
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
        `${
          selectedPacket.packet_title || selectedPacket.id
        } paketi silinecek. Emin misiniz?`
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

      if (!res.ok) throw new Error("Silme başarısız");
      const updatedPackets = packets.filter(
        (packet) => packet.id !== selectedPacket.id
      );
      setPackets(updatedPackets);
      setOriginalPackets(updatedPackets);
      setSelectedPacket(null);
      setFormData({});
      setError(null);
      setSuccessMessage("Paket başarıyla silindi");
      setTimeout(() => setSuccessMessage(null), 3000);
      setHasOrderChanged(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu"
      );
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
        heryone_dk: 0,
        heryone_sms: 0,
        heryone_int: 0,
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingNewPacket) {
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
        sort_order: packets.length,
      };

      try {
        const res = await fetch(`/api/table/packets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!res.ok) throw new Error("Ekleme başarısız");
        const newPacket = await res.json();
        setPackets((prevPackets) => [...prevPackets, newPacket]);
        setOriginalPackets((prevPackets) => [...prevPackets, newPacket]);
        setIsAddingNewPacket(false);
        setFormData({});
        setError(null);
        setSuccessMessage("Paket başarıyla eklendi");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu"
        );
      }
    } else if (selectedPacket) {
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

      try {
        const res = await fetch(`/api/table/packets/${selectedPacket.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!res.ok) throw new Error("Güncelleme başarısız");
        const updatedPacket = await res.json();
        const updatedPackets = packets.map((packet) =>
          packet.id === updatedPacket.id ? updatedPacket : packet
        );
        setPackets(updatedPackets);
        setOriginalPackets(updatedPackets);
        setSelectedPacket(null);
        setFormData({});
        setError(null);
        setSuccessMessage("Paket başarıyla güncellendi");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu"
        );
      }
    }
  };

  const memoizedPackets = useMemo(() => packets, [packets]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-700">Operatör Paketleri</h2>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label
          htmlFor="operator"
          className="block mb-1 sm:mb-0 text-sm font-medium text-gray-700"
        >
          Operatör Seç
        </label>
        <select
          id="operator"
          value={selectedOperator}
          onChange={handleOperatorChange}
          className="block w-full sm:w-auto p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        >
          <option value="">Bir operatör seçin</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.idName}>
              {operator.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      {successMessage && (
        <p className="text-green-600 text-sm text-center">{successMessage}</p>
      )}

      {loading && !error && (
        <div className="flex items-center gap-2 text-blue-600 text-sm justify-center">
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

      {selectedOperator && !selectedPacket && !isAddingNewPacket && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={handleNewPacketClick}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            Yeni Paket Ekle
          </button>
          <button
            onClick={handleListViewToggle}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            {isListView ? "Grid Görünüm" : "Listele"}
          </button>
          {isListView && hasOrderChanged && (
            <button
              onClick={handleSaveOrder}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-full sm:w-auto"
            >
              Kaydet
            </button>
          )}
        </div>
      )}

      {(selectedPacket || isAddingNewPacket) && (
        <form
          onSubmit={handleFormSubmit}
          className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {isAddingNewPacket ? "Yeni Paket Ekle" : "Paketi Güncelle"}
            </h3>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isTlPackage}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span>TL Paketi</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Paket Başlığı
              </label>
              <input
                type="text"
                name="packet_title"
                value={formData.packet_title || ""}
                onChange={handleFormChange}
                placeholder="Örn: Süper 10GB"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Fiyat (TL)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price ?? ""}
                onChange={handleFormChange}
                placeholder="Örn: 89"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Paket İçeriği
            </label>
            <textarea
              name="packet_content"
              value={formData.packet_content || ""}
              onChange={handleFormChange}
              placeholder="Örn: 18 GB +1000 DK (hızlı)"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px] sm:min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Heryöne Dakika
              </label>
              <input
                type="number"
                name="heryone_dk"
                value={isTlPackage ? 0 : formData.heryone_dk ?? 0}
                onChange={handleFormChange}
                disabled={isTlPackage}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Heryöne SMS
              </label>
              <input
                type="number"
                name="heryone_sms"
                value={isTlPackage ? 0 : formData.heryone_sms ?? 0}
                onChange={handleFormChange}
                disabled={isTlPackage}
                placeholder="SMS sayısı"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Heryöne İnternet (GB)
              </label>
              <input
                type="number"
                name="heryone_int"
                value={isTlPackage ? 0 : formData.heryone_int ?? 0}
                onChange={handleFormChange}
                disabled={isTlPackage}
                placeholder="GB cinsinden"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
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
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 w-full sm:w-auto"
            >
              İptal
            </button>
            {selectedPacket && (
              <button
                type="button"
                onClick={handleDeletePacket}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full sm:w-auto"
              >
                Sil
              </button>
            )}
          </div>
        </form>
      )}

      {!loading &&
        selectedOperator &&
        memoizedPackets.length > 0 &&
        !selectedPacket &&
        !isAddingNewPacket && (
          <>
            {isListView ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="packets" direction="vertical">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="overflow-y-auto max-h-[600px] w-full"
                      style={{
                        background: snapshot.isDraggingOver
                          ? "#f0f0ff"
                          : "transparent",
                        padding: "0 8px",
                      }}
                    >
                      {memoizedPackets.map((packet, index) => (
                        <Draggable
                          key={packet.id}
                          draggableId={packet.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-[#e5e5e6] rounded-xl shadow-sm hover:bg-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-200 mb-4 ${
                                snapshot.isDragging
                                  ? "border-2 border-blue-500 opacity-90 shadow-xl z-50"
                                  : "border-2 border-transparent"
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                cursor: snapshot.isDragging ? "grabbing" : "grab",
                                zIndex: snapshot.isDragging ? 1000 : "auto",
                              }}
                            >
                              <span className="text-base sm:text-lg font-bold text-gray-800 w-8">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                                  {packet.packet_title}
                                </h3>
                                <div className="mt-2 text-gray-600 text-xs sm:text-sm">
                                  {packet.packet_content}
                                </div>
                                <div className="mt-2 text-gray-600 text-xs sm:text-sm">
                                  {(packet.heryone_dk !== 0 ||
                                    packet.heryone_sms !== 0 ||
                                    packet.heryone_int !== 0) && (
                                    <div>
                                      <p>Heryöne {packet.heryone_dk} DK</p>
                                      <p>Heryöne {packet.heryone_sms} SMS</p>
                                      <p>Heryöne {packet.heryone_int} GB</p>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4">
                                  <button className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-100 text-gray-600 font-bold rounded-xl">
                                    {packet.price} TL
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {memoizedPackets.map((packet) => (
                  <li
                    key={packet.id}
                    onClick={() => handlePacketClick(packet)}
                    className="p-4 bg-[#e5e5e6] rounded-xl shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col justify-between"
                  >
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 text-center">
                      {packet.packet_title}
                    </h3>
                    <div className="text-center mt-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {packet.packet_content}
                      </p>
                    </div>
                    <div className="text-center mt-2">
                      {(packet.heryone_dk !== 0 ||
                        packet.heryone_sms !== 0 ||
                        packet.heryone_int !== 0) && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Heryöne {packet.heryone_dk} Dakika
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Heryöne {packet.heryone_sms} SMS
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Heryöne {packet.heryone_int} GB İnternet
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button className="w-full max-w-[120px] sm:max-w-[150px] p-2 sm:p-3 bg-white hover:bg-gray-100 text-gray-600 font-bold text-sm sm:text-base rounded-xl">
                        {packet.price} TL
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

      {!loading &&
        selectedOperator &&
        memoizedPackets.length === 0 &&
        !error &&
        !isAddingNewPacket && (
          <p className="text-gray-500 text-sm text-center">
            Bu operatöre ait paket bulunamadı.
          </p>
        )}
    </div>
  );
};

export default OperatorsPackets;