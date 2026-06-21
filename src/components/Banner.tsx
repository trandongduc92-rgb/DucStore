/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "iPhone 15 Pro Max",
      subtitle: "Titanium. Siêu bền. Siêu nhẹ.",
      description: "Trang bị chip A17 Pro bứt phá, nút Tác vụ tiện lợi và hệ thống camera siêu phân giải 5x Zoom quang học đỉnh cao.",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
      color: "from-slate-900 via-neutral-900 to-zinc-800",
      action: "Khám phá ngay",
      badge: "Sản phẩm Hot"
    },
    {
      title: "iPad Pro M4",
      subtitle: "Mỏng nhẹ tột đỉnh. Sức mạnh vô song.",
      description: "Thế hệ màn hình Tandem OLED Ultra Retina XDR tiên tiến kết hợp bộ vi xử lý Apple M4 thách thức giới hạn sáng tạo.",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
      color: "from-slate-950 via-slate-900 to-indigo-950",
      action: "Ghé xem",
      badge: "Công nghệ mới"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950" id="ducstore-banner">
      {/* Slider Carousel */}
      <div className="relative h-[320px] sm:h-[400px] md:h-[480px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full gradient-bg transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background pattern mask */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-90 mix-blend-multiply z-10`} />
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-[6000ms]"
              referrerPolicy="no-referrer"
            />
            
            {/* Content Container */}
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-20">
              <div className="max-w-2xl text-left text-white space-y-4">
                
                {/* Badge */}
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.badge}</span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  {slide.title}
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg sm:text-xl font-medium text-slate-200">
                  {slide.subtitle}
                </p>
                
                {/* description */}
                <p className="text-sm sm:text-base text-slate-400 line-clamp-2 md:line-clamp-none max-w-lg">
                  {slide.description}
                </p>
                
                {/* Action button */}
                <div className="pt-2">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all">
                    {slide.action}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-slate-700/50 text-white hover:bg-black/60 focus:outline-none transition-all z-30"
        aria-label="Previous slide"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-slate-700/50 text-white hover:bg-black/60 focus:outline-none transition-all z-30"
        aria-label="Next slide"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-blue-500 w-8' : 'bg-slate-600/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
