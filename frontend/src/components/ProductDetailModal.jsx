import React from 'react';
import ReactDOM from 'react-dom';
import { X, ShoppingCart, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
	// Use Portal to render the modal at the root level, avoiding clipping issues from parent transforms
	return ReactDOM.createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='absolute inset-0 bg-black/80 backdrop-blur-md'
					/>

					{/* Modal Content */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", damping: 30, stiffness: 400 }}
						className='bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative border border-gray-700 z-[10000]'
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							onClick={onClose}
							className='absolute top-4 right-4 p-2 rounded-full bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-[10001]'
						>
							<X size={24} />
						</button>

						<div className='flex flex-col md:flex-row h-full overflow-y-auto'>
							{/* Image Section */}
							<div className='md:w-1/2 h-72 md:h-auto relative'>
								<img
									src={product.image}
									alt={product.name}
									className='w-full h-full object-cover'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent' />
							</div>

							{/* Info Section */}
							<div className='md:w-1/2 p-6 md:p-10 flex flex-col'>
								<div className='flex-grow'>
									<div className='flex items-center gap-2 mb-3'>
										<span className='bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest'>
											{product.category}
										</span>
									</div>
									
									<h2 className='text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight'>
										{product.name}
									</h2>

									<div className='flex items-center gap-2 text-emerald-400 mb-8'>
										<span className='text-4xl font-black'>${product.price}</span>
									</div>

									<div className='space-y-6 mb-10'>
										<div className='flex items-start gap-4'>
											<div className='p-2 rounded-lg bg-emerald-500/10'>
												<Info size={20} className='text-emerald-400' />
											</div>
											<div>
												<h4 className='text-xs font-bold text-gray-500 uppercase tracking-widest mb-2'>Product Details</h4>
												<p className='text-gray-300 leading-relaxed text-lg'>
													{product.description || "Indulge in the premium quality of our carefully selected products, designed to provide the best experience."}
												</p>
											</div>
										</div>
										
										<div className='flex items-start gap-4'>
											<div className='p-2 rounded-lg bg-emerald-500/10'>
												<Tag size={20} className='text-emerald-400' />
											</div>
											<div>
												<h4 className='text-xs font-bold text-gray-500 uppercase tracking-widest mb-2'>Category</h4>
												<p className='text-gray-300 text-lg capitalize'>{product.category}</p>
											</div>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className='pt-8 border-t border-gray-700/50 mt-auto'>
									<button
										onClick={(e) => {
											e.stopPropagation();
											onAddToCart();
										}}
										className='w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-900/30 active:scale-95 group'
									>
										<ShoppingCart size={24} className='group-hover:translate-x-1 transition-transform' />
										ADD TO CART
									</button>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
};

export default ProductDetailModal;
