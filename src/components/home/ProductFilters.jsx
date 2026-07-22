import React from 'react';

export default function ProductFilters({
  openDropdown,
  setOpenDropdown,
  selectedFilters,
  setSelectedFilters,
  toggleFilter,
  selectedPriceRange,
  setSelectedPriceRange,
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-[#EAE5DB] bg-white relative z-40">
        <div className="flex items-center h-14 w-full md:w-auto">
          <div className="px-6 h-full flex items-center border-r border-[#EAE5DB] shrink-0">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2D2D2A]">
              Filters
            </span>
          </div>

          {/* Size Dropdown */}
          <div className="relative h-full flex">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "size" ? null : "size")
              }
              className={`px-6 h-full flex items-center gap-2 text-[13px] transition-colors border-r border-[#EAE5DB] shrink-0 ${openDropdown === "size" ? "bg-[#2D2D2A] text-white" : "text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
            >
              Size
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openDropdown === "size" ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "size" && (
              <div className="absolute top-full left-0 w-48 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2">
                {["L", "M", "M/L", "S", "XL", "XL/XXL", "XS", "XS/S"].map(
                  (size) => (
                    <label
                      key={size}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(size)}
                          onChange={() => toggleFilter(size)}
                          className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors"
                        />
                        <svg
                          className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-[13px] text-[#2D2D2A]">
                        {size}
                      </span>
                    </label>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative h-full flex">
            <button
              onClick={() =>
                setOpenDropdown(
                  openDropdown === "category" ? null : "category",
                )
              }
              className={`px-6 h-full flex items-center gap-2 text-[13px] transition-colors border-r border-[#EAE5DB] shrink-0 ${openDropdown === "category" ? "bg-[#2D2D2A] text-white" : "text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
            >
              Category
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "category" && (
              <div className="absolute top-full left-0 w-56 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2">
                {[
                  "T-Shirts",
                  "Shirts & Blouses",
                  "Sweaters & Knitwear",
                  "Jackets & Coats",
                  "Jeans",
                  "Trousers & Pants",
                  "Skirts",
                  "Dresses",
                  "Other",
                ].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(cat)}
                        onChange={() => toggleFilter(cat)}
                        className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-[13px] text-[#2D2D2A]">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Color Dropdown */}
          <div className="relative h-full flex">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "color" ? null : "color")
              }
              className={`px-6 h-full flex items-center gap-2 text-[13px] transition-colors border-r md:border-r-0 border-[#EAE5DB] shrink-0 ${openDropdown === "color" ? "bg-[#2D2D2A] text-white" : "text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
            >
              Color
              <svg
                className={`w-3.5 h-3.5 transition-transform ${openDropdown === "color" ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "color" && (
              <div className="absolute top-full left-0 w-48 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2">
                {[
                  { name: "Black", hex: "#1A1A1A" },
                  { name: "White", hex: "#FFFFFF" },
                  { name: "Gray", hex: "#808080" },
                  { name: "Red", hex: "#D93838" },
                  { name: "Blue", hex: "#2A5C91" },
                  { name: "Green", hex: "#3B7346" },
                  { name: "Yellow", hex: "#F0C94F" },
                  { name: "Orange", hex: "#E07A38" },
                  { name: "Purple", hex: "#6B4070" },
                  { name: "Brown", hex: "#7A5C43" },
                  { name: "Pink", hex: "#E8A0B3" },
                  { name: "Beige", hex: "#E0D8C8" },
                ].map((color) => (
                  <label
                    key={color.name}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(color.name)}
                        onChange={() => toggleFilter(color.name)}
                        className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full border border-[#D1D1D1] shrink-0"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <span className="text-[13px] text-[#2D2D2A]">
                      {color.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-14 flex items-center border-t md:border-t-0 md:border-l border-[#EAE5DB] shrink-0 w-full md:w-auto relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "price" ? null : "price")
            }
            className={`px-6 h-full w-full flex items-center justify-between md:justify-start gap-8 text-[13px] transition-colors ${openDropdown === "price" ? "bg-[#2D2D2A] text-white" : "text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
          >
            <span className="font-bold">Price</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${openDropdown === "price" ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openDropdown === "price" && (
            <div className="absolute top-full right-0 w-[400px] bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-6 px-8">
              <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                {[
                  "ทั้งหมด",
                  "ต่ำกว่า ฿499",
                  "฿500 - ฿999",
                  "฿1,000 - ฿1,999",
                  "฿2,000 - ฿2,999",
                  "฿3,000 - ฿3,999",
                  "฿4,000 - ฿4,999",
                  "฿5,000 ขึ้นไป",
                ].map((range) => (
                  <label
                    key={range}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === range}
                        onChange={() => setSelectedPriceRange(range)}
                        className="peer appearance-none w-4 h-4 rounded-full border border-[#D1D1D1] checked:border-[5px] checked:border-[#2D2D2A] cursor-pointer transition-all"
                      />
                    </div>
                    <span
                      className={`text-[13px] transition-colors ${selectedPriceRange === range ? "text-[#2D2D2A] font-bold" : "text-[#8B8B88] group-hover:text-[#5C5C5A]"}`}
                    >
                      {range}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Row */}
      {(selectedFilters.length > 0 || selectedPriceRange !== "ทั้งหมด") && (
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-[#EAE5DB] bg-[#F9F8F6]/50 px-6">
          <button
            onClick={() => {
              setSelectedFilters([]);
              setSelectedPriceRange("ทั้งหมด");
            }}
            className="border border-[#2D2D2A] bg-white px-3 py-1.5 text-[11px] font-bold text-[#2D2D2A] hover:bg-[#2D2D2A] hover:text-white transition-colors rounded-sm"
          >
            รีเซ็ต
          </button>

          {selectedPriceRange !== "ทั้งหมด" && (
            <button
              onClick={() => setSelectedPriceRange("ทั้งหมด")}
              className="flex items-center gap-2 border border-[#EAE5DB] bg-white px-3 py-1.5 text-[11px] text-[#5C5C5A] hover:border-[#2D2D2A] hover:text-[#2D2D2A] transition-colors rounded-sm tracking-wider"
            >
              {selectedPriceRange}
              <svg
                className="w-3 h-3 text-[#A0A09F] group-hover:text-[#2D2D2A] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {selectedFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className="flex items-center gap-2 border border-[#EAE5DB] bg-white px-3 py-1.5 text-[11px] text-[#5C5C5A] hover:border-[#2D2D2A] hover:text-[#2D2D2A] transition-colors rounded-sm uppercase tracking-wider"
            >
              {filter}
              <svg
                className="w-3 h-3 text-[#A0A09F] group-hover:text-[#2D2D2A] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
