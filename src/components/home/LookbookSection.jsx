import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getLookbooks } from '../../utils/localStorageHelper';

export default function LookbookSection({ products }) {
  const [rawLookbooks, setRawLookbooks] = useState([]);
  const [activeLookSelections, setActiveLookSelections] = useState({});
  const [isLookSelecting, setIsLookSelecting] = useState({});
  const [isLookAdding, setIsLookAdding] = useState({});
  
  const { currentUser, openAuthModal } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    const fetchLookbooks = async () => {
      const loaded = await getLookbooks();
      if (isMounted && loaded) {
        setRawLookbooks(loaded);
        const initialSelections = {};
        loaded.forEach(lb => {
          initialSelections[lb.id] = lb.items.map(i => i.id);
        });
        setActiveLookSelections(initialSelections);
      }
    };
    fetchLookbooks();

    const handleLookbookUpdate = async () => {
      const updated = await getLookbooks();
      if (isMounted && updated) {
        setRawLookbooks(updated);
        const newSelections = {};
        updated.forEach(lb => {
          newSelections[lb.id] = lb.items.map(i => i.id);
        });
        setActiveLookSelections(newSelections);
      }
    };
    
    window.addEventListener('lookbooksUpdated', handleLookbookUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('lookbooksUpdated', handleLookbookUpdate);
    };
  }, []);

  const lookbooks = useMemo(() => {
    return rawLookbooks.map(lb => ({
      ...lb,
      items: lb.items.map(item => {
        const fresh = products.find(p => p.id === item.id);
        return fresh || item;
      })
    }));
  }, [rawLookbooks, products]);

  const toggleLookItem = (lookId, itemId) => {
    setActiveLookSelections(prev => {
      const current = prev[lookId] || [];
      const updated = current.includes(itemId) 
        ? current.filter(i => i !== itemId) 
        : [...current, itemId];
      return { ...prev, [lookId]: updated };
    });
  };

  const handleShopLookClick = (lookId) => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }
    if (currentUser.role !== "customer") return;
    setIsLookSelecting(prev => ({ ...prev, [lookId]: true }));
  };

  const handleAddLookToCart = async (lookbook) => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }
    if (currentUser.role !== "customer") return;

    setIsLookAdding(prev => ({ ...prev, [lookbook.id]: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const selectedIds = activeLookSelections[lookbook.id] || [];
    const itemsToAdd = lookbook.items.filter(item => {
      const isSoldOut = item.status === 'Sold Out' || item.status === 'Out of Stock' || item.stock === 0 || item.status === 'Reserved';
      return selectedIds.includes(item.id) && !isSoldOut;
    });
    
    itemsToAdd.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title || item.name,
        price: item.price,
        image: lookbook.image,
        brandCategory: "Lookbook Item",
        category: "Lookbook",
        size: item.size,
      });
    });

    setIsLookAdding(prev => ({ ...prev, [lookbook.id]: false }));
    setIsLookSelecting(prev => ({ ...prev, [lookbook.id]: false }));
  };

  return (
    <div className="pt-24 pb-10 border-t border-[#EAE5DB] mt-20">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold text-[#2D2D2A]">
          LOOKBOOK
        </h2>
        <p className="text-[13px] text-[#5C5C5A] mt-2 font-sans font-medium">
          Inspiration and mix-and-match ideas from our team.
        </p>
      </div>

      {lookbooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[#8B8B88] font-medium">There are no lookbooks available right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-24 lg:gap-32">
          {lookbooks.map((lookbook, lookIndex) => (
          <div key={lookbook.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className={`relative aspect-[4/5] w-full overflow-hidden ${lookIndex % 2 === 1 ? 'lg:order-2' : ''}`}>
              <Image
                src={lookbook.image || "/styling_1.png"}
                alt={lookbook.title}
                fill
                className="object-cover"
              />
            </div>

            <div className={`flex flex-col justify-center ${lookIndex % 2 === 1 ? 'lg:order-1' : ''}`}>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8B8B88] mb-4">
                {lookbook.subtitle}
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#2D2D2A] mb-12">
                {lookbook.title}
              </h3>

              <div className="space-y-6 mb-12 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {lookbook.items?.map((item, idx) => {
                  const isSoldOut = item.status === 'Sold Out' || item.status === 'Out of Stock' || item.stock === 0 || item.status === 'Reserved';
                  const isSelecting = isLookSelecting[lookbook.id];
                  const selectedIds = activeLookSelections[lookbook.id] || [];
                  const isSelected = selectedIds.includes(item.id) && !isSoldOut;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isSelecting && !isSoldOut) {
                          toggleLookItem(lookbook.id, item.id);
                        }
                      }}
                      className={`flex items-start gap-4 ${isSelecting && !isSoldOut ? "cursor-pointer group" : ""} ${isSoldOut ? "opacity-60" : ""} ${idx !== lookbook.items.length - 1 ? "border-b border-[#EAE5DB] pb-5" : ""}`}
                    >
                      {isSelecting && (
                        <div className="relative flex items-center justify-center mt-1 shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isSoldOut}
                            readOnly
                            className="peer appearance-none w-5 h-5 border-2 border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] disabled:bg-[#EAE5DB] disabled:border-[#D1D1D1] transition-colors cursor-pointer disabled:cursor-not-allowed"
                          />
                          <svg
                            className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
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
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-[14px] font-bold transition-colors ${!isSelecting || isSelected ? "text-[#2D2D2A]" : "text-[#A0A09F]"} ${isSoldOut ? "line-through text-[#A0A09F]" : ""}`}
                          >
                            {item.title || item.name}
                          </h4>
                          {isSoldOut && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#FEE2E2] text-[#D03C31] px-1.5 py-0.5 rounded-sm">
                              {item.status === 'Reserved' ? 'Reserved' : 'Sold Out'}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[12px] font-medium tracking-wide mt-1.5 transition-colors flex flex-wrap items-center gap-2 ${(!isSelecting || isSelected) && !isSoldOut ? "text-[#5C5C5A]" : "text-[#A0A09F]"} ${isSoldOut ? "line-through" : ""}`}
                        >
                          <div className="flex items-center gap-1.5">
                            Color:{" "}
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: item.color?.startsWith('#') ? item.color : (item.hex || item.color) }}
                            />{" "}
                            {item.color && !item.color.startsWith('#') && item.color}
                          </div>
                          <span className="text-[#EAE5DB]">|</span>
                          <span>Size: {item.size}</span>
                          <span className="text-[#EAE5DB]">|</span>
                          <span>THB {item.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isLookSelecting[lookbook.id] ? (
                <button
                  onClick={() => handleShopLookClick(lookbook.id)}
                  className="bg-[#2D2D2A] text-white text-[12px] font-bold tracking-[0.15em] uppercase py-5 px-8 w-full hover:bg-[#1A1A1A] transition-colors rounded-sm flex items-center justify-center gap-3 group"
                >
                  SHOP THIS LOOK (THB{" "}
                  {(lookbook.items || []).reduce(
                    (sum, item) => {
                      const isSoldOut = item.status === 'Sold Out' || item.status === 'Out of Stock' || item.stock === 0 || item.status === 'Reserved';
                      return sum + (isSoldOut ? 0 : (item.price || 0));
                    },
                    0,
                  ).toLocaleString()}
                  )
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  disabled={lookbook.items.filter(i => {
                    const isSoldOut = i.status === 'Sold Out' || i.status === 'Out of Stock' || i.stock === 0 || i.status === 'Reserved';
                    return (activeLookSelections[lookbook.id] || []).includes(i.id) && !isSoldOut;
                  }).length === 0 || isLookAdding[lookbook.id]}
                  onClick={() => handleAddLookToCart(lookbook)}
                  className="bg-[#5F6B4E] text-white text-[12px] font-bold tracking-[0.15em] uppercase py-5 px-8 w-full hover:bg-[#4A533D] transition-colors rounded-sm flex items-center justify-center gap-3 group disabled:bg-[#D1D1D1] disabled:text-[#8B8B88] disabled:cursor-not-allowed"
                >
                  {isLookAdding[lookbook.id] ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      ADDING...
                    </>
                  ) : lookbook.items.filter(i => {
                    const isSoldOut = i.status === 'Sold Out' || i.status === 'Out of Stock' || i.stock === 0 || i.status === 'Reserved';
                    return (activeLookSelections[lookbook.id] || []).includes(i.id) && !isSoldOut;
                  }).length > 0 ? (
                    `ADD SELECTED TO CART (THB ${lookbook.items.filter(i => {
                      const isSoldOut = i.status === 'Sold Out' || i.status === 'Out of Stock' || i.stock === 0 || i.status === 'Reserved';
                      return (activeLookSelections[lookbook.id] || []).includes(i.id) && !isSoldOut;
                    }).reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString()})`
                  ) : (
                    "SELECT ITEMS"
                  )}
                  {!isLookAdding[lookbook.id] && (activeLookSelections[lookbook.id] || []).length > 0 && (
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
