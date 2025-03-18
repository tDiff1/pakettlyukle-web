"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { operatorler } from "@/app/tools/operatorler";
import Link from "next/link";
import Image from "next/image";
import "@/app/tools/op-carusel/arrow.css";

const CustomLeftArrow = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="custom-arrow custom-arrow-left"
        >
            <ChevronLeft size={40} />
        </button>
    );
};

const CustomRightArrow = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="custom-arrow custom-arrow-right"
        >
            <ChevronRight size={40} />
        </button>
    );
};

const responsive = {
    superLargeDesktop: {
        breakpoint: { max: 4000, min: 3000 },
        items: 4,
        slidesToSlide: 2
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 3,
        slidesToSlide: 1
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
        slidesToSlide: 1
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1
    }
};

const MyCarousel = () => {
    return (
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
            itemClass="px-2" // Daha tutarlı boşluk için
        >
            {operatorler.map((operator) => (
                <div 
                    key={operator.id} 
                    className= {`bg-[#e5e5e6] ${operator.hover} shadow-md text-white p-10 rounded-xl mx-1 h-full flex items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`} 
                    style={{ minHeight: '120px' }} // Minimum yükseklik
                >
                    <Link 
                        href={`/kontor-yukleme/${operator.idName}`} 
                        className="flex flex-col items-center justify-center w-full h-full gap-2"
                    >
                        <div className="relative w-96 h-20"> {/* Sabit resim boyutu */}
                            <Image 
                                src={`/operatorler/${operator.imageID}`} 
                                fill
                                className="object-contain"
                                alt={`${operator.idName}`}
                                priority={true}
                            />
                        </div>
                    </Link>
                </div>

            ))}
        </Carousel>
    );
};

export default MyCarousel;