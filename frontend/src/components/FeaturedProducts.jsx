import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from './ProductCard';


function FeaturedProducts({ featuredProducts = [] }) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, [])

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, Math.max(0, featuredProducts.length - itemsPerPage)));
  }, [itemsPerPage, featuredProducts]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + itemsPerPage, featuredProducts.length - itemsPerPage));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;


  return (
    <div className='py-12'>
      <div className='container mx-auto px-4'>
        <h2 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4' >
          Featured
        </h2>
        <div className='relative'>
          <button
            onClick={prevSlide}
            disabled={isStartDisabled}
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors duration-300'
          >
            <ChevronLeft className='w-6 h-6' />
          </button>
          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors duration-300'
          >
            <ChevronRight className='w-6 h-6' />
          </button>
          <div className='overflow-hidden'>
            <div
              className='flex transition-transform duration-300 ease-in-out'
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
            >
              {featuredProducts?.map((product) => (
                <div key={product._id} className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2'>
                  <ProductCard product={product} />
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedProducts