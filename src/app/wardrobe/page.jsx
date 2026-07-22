"use client";

import React from 'react';
import Image from 'next/image';
import Sidebar from '../../components/Sidebar';
import { Heart, Leaf, Trash2 } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

export default function MyWardrobe() {
  const { favorites: savedItems, removeFavorite } = useFavorites();

  const removeItem = (id) => {
    removeFavorite(id);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>

        {/* Content Right */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="border-b border-earth-100 pb-5 mb-6">
              <h1 className="text-2xl font-bold text-earth-900">My Wardrobe & Favorites</h1>
              <p className="text-xs text-earth-500 mt-1">Manage the items you've saved for shopping later</p>
            </div>

            {/* Saved Items Header */}
            <div className="flex items-center gap-2 mb-6 text-earth-800 font-bold">
              <Heart className="h-5 w-5 text-sage-600 fill-current" />
              <h3>Saved Favorites ({savedItems.length})</h3>
            </div>

            {/* List */}
            {savedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-earth-200 rounded-2xl bg-earth-50/20">
                    <div className="relative w-20 h-20 bg-earth-100 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-semibold text-sm text-earth-800 truncate">{item.title}</h3>
                        <span className="inline-block text-[10px] text-clay-600 bg-clay-50 border border-clay-100 px-2 py-0.5 rounded mt-1">
                          {item.condition || 'Good condition'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-earth-100">
                        <span className="text-sm font-bold text-earth-900">฿{item.price}</span>
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-sage-700">
                          <Leaf className="h-3 w-3" />
                          {item.carbonSaved || '1.5 kg CO₂e'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-earth-400 hover:text-clay-600 rounded-full hover:bg-clay-50/50 transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="bg-sage-600 hover:bg-sage-700 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors">
                        Shop Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-400">
                  <Heart className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-earth-800 text-lg">No saved items</h3>
                  <p className="text-sm text-earth-500 mt-1">When you see an item you like, click the heart icon to save it here.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
