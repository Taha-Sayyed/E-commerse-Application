import React, { useState } from 'react'
import toast from "react-hot-toast";
import { ShoppingCart, Eye } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux'
import { addToCart } from "../features/cart/cartSlice.js"
import ProductDetailModal from './ProductDetailModal';

function ProductCard({ product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth?.user)

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add products to cart");
      return;
    }

    try {
      await dispatch(addToCart(product)).unwrap();
      toast.success("Item added to Cart successfully");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };


  return (
    <div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg bg-gray-800 transition-transform duration-300 hover:scale-[1.02]'>
      <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl group'>
        <img className='object-cover w-full transition-transform duration-500 group-hover:scale-110' src={product.image} alt='product image' />
        <div className='absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-40' />
      </div>

      <div className='mt-4 px-5 pb-5 flex flex-col flex-grow'>
        <h5 className='text-xl font-semibold tracking-tight text-white mb-2 line-clamp-1'>{product.name}</h5>

        <div className='mt-auto flex items-center justify-between mb-5'>
          <p>
            <span className='text-3xl font-bold text-emerald-400'>${product.price}</span>
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            className='flex-1 flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-colors'
            onClick={handleAddToCart}
          >
            <ShoppingCart size={20} className='mr-2' />
            Add to cart
          </button>

          <button
            className='flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-sm font-medium
					 text-emerald-400 hover:bg-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-colors'
            onClick={() => setIsModalOpen(true)}
          >
            <Eye size={20} className='mr-2' />
            Detail
          </button>
        </div>
      </div>

      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

    </div>
  )
}

export default ProductCard