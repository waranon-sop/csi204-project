import React from 'react';
import { Leaf } from 'lucide-react';

export default function CircularityQuote() {
  return (
    <section id="ethics" className="py-24 px-6 sm:px-8 bg-[#FAF8F5] border-t border-[#EAE5DB]">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <Leaf className="h-6 w-6 text-[#2D2D2A]" />
        </div>

        <h2 className="font-serif text-3xl md:text-5xl max-w-3xl mx-auto leading-tight text-[#2D2D2A]">
          "The most sustainable garment is the one that already exists."
        </h2>

        <p className="text-sm md:text-base text-[#2D2D2A]/80 max-w-2xl mx-auto leading-relaxed font-sans font-light">
          We believe in circularity. Every piece in our collection is meticulously inspected, cleaned, and restored to ensure it lives a second, even more beautiful life.
        </p>
      </div>
    </section>
  );
}
