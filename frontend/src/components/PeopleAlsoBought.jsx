import React, { useEffect, useState } from 'react'
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { fetchRecommendationsService } from "../service/cart.service.js"

function PeopleAlsoBought() {

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetchRecommendationsService();
        setRecommendations(res)
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "An error occurred while fetching recommendations"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, [])

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {/* {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))} */}
        {recommendations.length === 0 ? (
          <p className='text-gray-400'>No recommendations available</p>
        ) : (
          recommendations.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}

export default PeopleAlsoBought;