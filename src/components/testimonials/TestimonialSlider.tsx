import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Testimonial } from "../../types";

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  testimonials,
  autoPlay = true,
  interval = 5000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, testimonials.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-white rounded-lg shadow-md p-6 md:p-8"
        >
          <div className="flex items-center mb-4">
            {testimonials[currentIndex].imageUrl ? (
              <img 
                src={testimonials[currentIndex].imageUrl} 
                alt={testimonials[currentIndex].name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-500 text-xl font-semibold">
                  {testimonials[currentIndex].name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{testimonials[currentIndex].name}</h3>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < testimonials[currentIndex].rating ? "text-yellow-500" : "text-gray-300"}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  pentru {testimonials[currentIndex].service}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{testimonials[currentIndex].date}</p>
            </div>
          </div>
          
          <blockquote className="italic text-gray-700 border-l-4 border-blue-100 pl-4 py-2 my-4">
            "{testimonials[currentIndex].text}"
          </blockquote>
          
          <div className="absolute top-1/2 transform -translate-y-1/2 left-2">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-blue-500 focus:outline-none"
              aria-label="Testimonial anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div className="absolute top-1/2 transform -translate-y-1/2 right-2">
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-blue-500 focus:outline-none"
              aria-label="Testimonial următor"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-center mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 w-2 mx-1 rounded-full focus:outline-none ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
            aria-label={`Goto testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
