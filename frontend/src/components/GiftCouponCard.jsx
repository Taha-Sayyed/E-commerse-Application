import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion";
import { applyCoupon, getMyCoupon, removeCoupon } from "../features/cart/cartSlice.js"
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'


function GiftCouponCard() {

  const [userInputCode, setUserInputCode] = useState("");
  const coupon = useSelector(state => state.cart?.coupon)
  const isCouponApplied = useSelector(state => state.cart?.isCouponApplied)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coupon) {
      dispatch(getMyCoupon());
    }
  }, [dispatch, coupon]);

  useEffect(() => {
    if (coupon && !isCouponApplied) {
      setUserInputCode(coupon.code);
    }
  }, [coupon, isCouponApplied]);

  const handleApplyCoupon = async () => {
    if (!userInputCode || loading) return
    try {
      setLoading(true)
      await dispatch(applyCoupon(userInputCode)).unwrap();
      toast.success("Coupon applied");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || error?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    if (loading || !coupon) return
    setLoading(true);
    dispatch(removeCoupon())
    setUserInputCode("")
    toast.success("Coupon removed");
    setLoading(false);
  }


  return (
    <div>GiftCouponCard</div>
  )
}

export default GiftCouponCard