import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface CarouselSlide {
  id: string;
  slide_order: number;
  title: string;
  title_mr?: string;
  subtitle?: string;
  subtitle_mr?: string;
  image_url: string;
  button_text?: string;
  button_text_mr?: string;
  button_link?: string;
  is_active: boolean;
}

interface HeroCarouselProps {
  language: Language;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

const HeroCarousel = ({ language, onNavigate }: HeroCarouselProps) => {
  const getCachedSlides = () => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = window.localStorage.getItem('gp-carousel-cache');
      if (cached) {
        const parsed = JSON.parse(cached) as CarouselSlide[];
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn('Failed to parse cached carousel slides:', error);
    }
    return [];
  };

  const cachedSlides = useMemo(() => getCachedSlides(), []);

  const [slides, setSlides] = useState<CarouselSlide[]>(cachedSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(cachedSlides.length === 0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_carousel')
        .select('*')
        .eq('is_active', true)
        .order('slide_order');

      if (error) {
        console.error('Error fetching carousel slides:', error);
      } else {
        const finalSlides = data || [];
        setSlides(finalSlides);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('gp-carousel-cache', JSON.stringify(finalSlides));
        }
        setCurrentSlide(0);
      }
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const t = (en: string, mr: string) => (language === 'mr' ? mr : en);

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[500px] bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            {t('Welcome to Digital Gram Panchayat', 'डिजिटल ग्रामपंचायतमध्ये आपले स्वागत')}
          </h2>
          <p className="text-xl opacity-90">
            {t('Transparent & Efficient Village Governance', 'पारदर्शक आणि कार्यक्षम ग्रामीण प्रशासन')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image_url})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                {language === 'mr' && slide.title_mr ? slide.title_mr : slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 drop-shadow-md">
                  {language === 'mr' && slide.subtitle_mr ? slide.subtitle_mr : slide.subtitle}
                </p>
              )}
              {slide.button_link && slide.button_text && (
                <button
                  onClick={() => {
                    if (onNavigate && slide.button_link) {
                      // Convert path to page name (e.g., '/about' -> 'about')
                      const page = slide.button_link.replace(/^\/$/, 'home').replace(/^\//, '');
                      onNavigate(page);
                    } else if (slide.button_link) {
                      // Fallback to href if onNavigate not available
                      window.location.href = slide.button_link;
                    }
                  }}
                  className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors shadow-lg cursor-pointer"
                >
                  {language === 'mr' && slide.button_text_mr ? slide.button_text_mr : slide.button_text}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 bg-black/30 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HeroCarousel;
