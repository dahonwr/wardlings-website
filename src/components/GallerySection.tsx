import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Maximize2, X, Sparkles, Filter } from 'lucide-react';
import { GalleryItem, RarityCategory } from '../types';
import { fetchGallery } from '../lib/storage';

export const GallerySection: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const data = await fetchGallery();
    setItems(data);
  };

  const categories = ['All', 'Hero', 'Legendary', 'Epic', 'Uncommon', 'Common'];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 bg-[#FFF9EF] relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] mb-3"
          >
            <Image className="w-4 h-4 text-[#7EBE69]" />
            <span className="font-patrick font-bold text-sm text-[#7C5B46]">
              SANCTUARY SNAPSHOTS & PORTRAITS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-dynapuff font-bold text-3xl sm:text-5xl text-[#2B2B2B]"
          >
            Keeper's Gallery
          </motion.h2>
          <p className="font-nunito font-semibold text-lg text-[#2B2B2B]/80 mt-2">
            Explore authentic field sketches, rare sightings, and community artwork.
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-baloo font-bold text-sm px-4 py-1.5 rounded-full border-2 border-[#2B2B2B] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F7BFD5] text-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B]'
                    : 'bg-[#FFF9EF] text-[#2B2B2B] hover:bg-[#DFF4FF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => setActiveLightboxItem(item)}
              className="break-inside-avoid cozy-card cozy-card-hover p-4 bg-[#FFF9EF] relative cursor-pointer group"
            >
              {/* Tape strip */}
              <div className="tape-strip absolute -top-2 left-6 w-16 h-4 rotate-2 z-10" />

              <div className="relative aspect-auto rounded-2xl overflow-hidden border-2 border-[#2B2B2B] bg-[#DFF4FF]">
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback placeholder
                    (e.target as HTMLImageElement).src = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Common.png';
                  }}
                />
                {/* Hover overlay button */}
                <div className="absolute inset-0 bg-[#2B2B2B]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] shadow-[2px_2px_0px_#2B2B2B] text-[#2B2B2B] font-baloo font-bold text-sm flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4" /> View Portrait
                  </span>
                </div>
              </div>

              {/* Item Info Footer */}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-dynapuff font-bold text-lg text-[#2B2B2B]">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="font-nunito text-xs text-[#2B2B2B]/75 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="font-patrick font-bold text-xs px-2.5 py-1 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B] text-[#2B2B2B]">
                  {item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {activeLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxItem(null)}
            className="fixed inset-0 z-50 bg-[#2B2B2B]/70 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="cozy-card max-w-2xl w-full p-6 bg-[#FFF9EF] relative overflow-hidden"
            >
              <button
                onClick={() => setActiveLightboxItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] hover:bg-[#F7BFD5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="rounded-2xl border-3 border-[#2B2B2B] bg-[#DFF4FF] p-4 flex items-center justify-center overflow-hidden mb-4">
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.title}
                  className="max-h-[60vh] w-auto object-contain rounded-xl drop-shadow-lg"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-dynapuff font-bold text-2xl text-[#2B2B2B]">
                  {activeLightboxItem.title}
                </h3>
                <span className="font-patrick font-bold text-sm px-3 py-1 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B] text-[#2B2B2B]">
                  {activeLightboxItem.category}
                </span>
              </div>

              {activeLightboxItem.description && (
                <p className="font-nunito font-semibold text-base text-[#2B2B2B]/90">
                  {activeLightboxItem.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
