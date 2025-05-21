"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Carousel from "react-multi-carousel";
import "./arrow.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CustomLeftArrow = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button onClick={onClick} className="custom-arrow custom-arrow-left">
      <ChevronLeft size={40} />
    </button>
  );
};

const CustomRightArrow = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button onClick={onClick} className="custom-arrow custom-arrow-right">
      <ChevronRight size={40} />
    </button>
  );
};

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
    slidesToSlide: 2,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

type Operators = {
  id: number;
  key: string;
  name: string;
  idName: string;
  imageID: string;
  hover: string;
  CompanyCode: number;
  aktiflik: number;
};

export default function MyCarousel() {
  const [data, setOperators] = useState<Operators[]>([]);

  useEffect(() => {
    fetch("/api/table/operators")
      .then((res) => res.json())
      .then((data) =>
        setOperators(data.filter((op: Operators) => op.aktiflik === 1))
      )
      .catch((err) => console.error("Veri alınamadı:", err));
  }, []);
  return (
    <div className="relative">
      <Carousel
        swipeable={true}
        draggable={false}
        showDots={false}
        responsive={responsive}
        ssr={true}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        // transitionDuration={500}
        keyBoardControl={true}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        removeArrowOnDeviceType={["tablet", "mobile"]}
        customTransition="transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)"
        containerClass="carousel-container"
        dotListClass="custom-dot-list-style"
        itemClass="px-2"
      >
        {data.map((operator) => (
          <div
            key={operator.id}
            className={`bg-[#e5e5e6] ${operator.hover}  shadow-md text-white p-10 rounded-xl mx-1 h-full flex items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`}
            style={{ minHeight: "120px" }} // Minimum yükseklik
          >
            <Link
              href={`/kontor-yukleme/${operator.idName}`}
              className="flex flex-col items-center justify-center w-full h-full gap-2"
            >
              <div className="relative w-96 h-20">
                {" "}
                {/* Sabit resim boyutu */}
                <Image
                  src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                  fill
                  className="object-contain"
                  alt={`${operator.idName}`}
                  priority
                />
              </div>
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
