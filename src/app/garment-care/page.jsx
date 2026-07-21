"use client";

import React from 'react';
import { Droplets, Wind, Scissors, Thermometer, ShieldAlert, Heart } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';

export default function GarmentCare() {
  const tips = [
    {
      icon: Thermometer,
      title: "Cold Wash Only",
      description: "Always wash your vintage pieces in cold water (30°C or below). Hot water can cause irreversible shrinking, fade original dyes, and damage delicate decades-old fibers.",
      color: "text-[#4A543C]"
    },
    {
      icon: Wind,
      title: "Air Dry Whenever Possible",
      description: "Avoid the tumble dryer at all costs. Heat destroys elastic, shrinks cotton, and weakens seams. Lay knits flat to dry to prevent stretching, and hang dry woven fabrics.",
      color: "text-[#5F6B4E]"
    },
    {
      icon: Droplets,
      title: "Gentle Detergents",
      description: "Use mild, eco-friendly detergents. Harsh chemicals and bleaches strip natural oils from wools and leathers, and can break down cotton fibers over time.",
      color: "text-[#C57B57]"
    },
    {
      icon: Scissors,
      title: "Repair, Don't Discard",
      description: "A small hole or a loose button is not the end of a garment. Learn basic mending or take it to a local tailor. Visible mending even adds character to vintage pieces!",
      color: "text-[#8B8B88]"
    },
    {
      icon: ShieldAlert,
      title: "Proper Storage",
      description: "Store vintage clothes in a cool, dry place. Avoid direct sunlight which fades colors. Use padded hangers for heavy items, and fold knits so they don't stretch out of shape.",
      color: "text-[#2D2D2A]"
    },
    {
      icon: Heart,
      title: "Wash Less Often",
      description: "Unless soiled, you don't need to wash clothes after every wear. Spot clean small stains and air out garments overnight. This saves water and preserves the fabric.",
      color: "text-red-700"
    }
  ];

  return (
    <AnimatedPage className="min-h-screen bg-[#FAF8F5] pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2D2D2A] mb-6">Garment Care Guide</h1>
          <p className="text-[#8B8B88] text-lg max-w-2xl mx-auto leading-relaxed">
            Vintage clothing was built to last, but it still requires love. Follow these essential care instructions to ensure your pieces survive for decades to come.
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-8 border border-[#EAE5DB] hover:border-[#5F6B4E] transition-colors group">
                <div className="mb-6 inline-block p-4 bg-[#FAF8F5] rounded-2xl group-hover:scale-110 transition-transform">
                  <Icon className={`w-8 h-8 ${tip.color}`} />
                </div>
                <h3 className="text-xl font-bold text-[#2D2D2A] mb-3">{tip.title}</h3>
                <p className="text-[#8B8B88] leading-relaxed text-sm">
                  {tip.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-20 bg-[#2D2D2A] text-white rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-serif mb-4">A Note on Perfection</h2>
          <p className="text-[#DFE4D9] max-w-3xl mx-auto leading-relaxed">
            Remember that vintage clothing has lived a life before reaching you. Fades, soft distressing, and minor imperfections are part of the story and charm of second-hand garments. Embrace the character of your clothes!
          </p>
        </div>

      </div>
    </AnimatedPage>
  );
}
