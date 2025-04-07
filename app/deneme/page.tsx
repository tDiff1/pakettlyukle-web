"use client";

import { useEffect, useState } from "react";

type Operators = {
  id: number;
  key: string;
  name: string;
  idName: string;
  imageID: string;
  hover: string;
};

export default function Home() {
  const [data, setData] = useState<Operators[]>([]);

  useEffect(() => {
    fetch("/api/table/operators")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Veri alınamadı:", err));
  }, []);


  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <h1>{item.name}</h1>
          <img src={item.imageID} alt={item.name} />
          <p>{item.hover}</p>
        </div>
      ))}
    </div>
  );
}
