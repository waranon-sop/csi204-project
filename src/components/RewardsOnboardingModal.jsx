"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Star, Award, Cake, Leaf, Clock, Tag, Truck, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RewardsOnboardingModal({ isOpen, onClose }) {
  const { currentUser, updateProfile, addPoints } = useAuth();
  const [step, setStep] = useState(0);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // If user already has birthday, mark as locked
  const hasBirthdaySaved = !!(currentUser?.birthMonth && currentUser?.birthDay);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.birthMonth) setBirthMonth(currentUser.birthMonth);
      if (currentUser.birthDay) setBirthDay(currentUser.birthDay);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (birthMonth && birthDay && updateProfile && !hasBirthdaySaved) {
        updateProfile({ birthMonth, birthDay });
        if (addPoints) addPoints(100);
      }
      onClose();
    }
  };

  const getDaysInMonth = (month) => {
    if (!month) return 31;
    return new Date(2024, month, 0).getDate();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-[400px] h-[650px] relative shadow-2xl flex flex-col animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-[#2D2D2A] hover:text-[#C57B57] transition-colors focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Banner - Only show on first step */}
        {step === 0 && (
          <div className="px-4 pt-12 pb-4">
            <div className="bg-white border-2 border-[#8AC926] p-3 flex items-center gap-3">
              <CheckCircle2 className="text-[#8AC926] w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold text-[#2D2D2A]">Thanks, you're now a Member!</span>
            </div>
          </div>
        )}

        {/* Content Carousel */}
        <div className={`flex-1 overflow-y-auto px-8 pb-8 flex flex-col ${step !== 0 ? 'pt-12' : ''}`}>
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center text-center animate-fade-in">
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold tracking-tighter text-[#2D2D2A]">
                  Re-Wear <span className="text-[#C57B57]">REWARDS</span>
                </h2>
              </div>
              <h3 className="text-[15px] font-bold text-[#2D2D2A] mb-4">Welcome to the Re-Wear Rewards Program</h3>
              <p className="text-[13px] text-[#5C5C5A] leading-relaxed mb-6">
                You'll start as <strong className="text-[#2D2D2A]">SEED</strong> — but don't stop there!
                With each tier, you'll earn a little more love, and lots of rewards.
              </p>

              <div className="flex flex-col items-center justify-center relative w-full flex-1">
                <div className="w-12 h-12 rounded-full bg-[#F2E9DC] flex items-center justify-center mb-1 z-10 shadow-sm border border-[#EAE5DB]">
                  <Leaf className="w-6 h-6 text-[#5F6B4E]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#2D2D2A] z-10 bg-white px-2 text-[14px]">Seed</span>
                
                <div className="w-px h-3 border-l-2 border-dashed border-[#EAE5DB] my-1"></div>
                
                <span className="text-[#5C5C5A] bg-white z-10 px-2 text-[13px] font-medium">Sprout</span>
                
                <div className="w-px h-3 border-l-2 border-dashed border-[#EAE5DB] my-1"></div>
                
                <span className="text-[#5C5C5A] bg-white z-10 px-2 text-[13px] font-medium">Bloom</span>
                
                <div className="w-px h-3 border-l-2 border-dashed border-[#EAE5DB] my-1"></div>
                
                <span className="text-[#C57B57] bg-white z-10 px-2 text-[13px] font-bold">Fruit</span>
                
                <div className="w-px h-3 border-l-2 border-dashed border-[#EAE5DB] my-1"></div>
                
                <span className="text-[#C57B57] bg-white z-10 px-2 text-[13px] font-bold">Harvest</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex-1 flex flex-col items-center text-center animate-fade-in">
              <h3 className="text-[15px] font-bold text-[#2D2D2A] mb-4 mt-6">Early Access to New Drops</h3>
              <p className="text-[13px] text-[#5C5C5A] leading-relaxed mb-12">
                Secondhand items are 1-of-1. Upgrade your tier to get first dibs and shop new arrivals before anyone else.
              </p>

              <div className="w-full max-w-[200px] aspect-square relative flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#F2E9DC] rounded-full opacity-50 animate-pulse"></div>
                  <div className="w-32 h-32 bg-[#C57B57] rounded-full flex items-center justify-center z-10 shadow-lg relative">
                     <Clock className="w-16 h-16 text-white" strokeWidth={1.5} />
                     <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#8AC926] rounded-full flex items-center justify-center shadow-md animate-bounce">
                        <Star className="w-5 h-5 text-white fill-current" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col items-center text-center animate-fade-in">
              <h3 className="text-[15px] font-bold text-[#2D2D2A] mb-4 mt-6">Members-Only Perks</h3>
              <p className="text-[13px] text-[#5C5C5A] leading-relaxed mb-12">
                Enjoy special discounts during our Secret Sales, plus get free shipping on your orders when you log in.
              </p>

              <div className="w-full flex justify-center items-center gap-6 mt-8">
                <div className="flex flex-col items-center animate-fade-up">
                  <div className="w-20 h-20 rounded-2xl bg-[#A3B18A] flex items-center justify-center mb-4 shadow-md transform -rotate-6">
                    <Tag className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-[#2D2D2A]">Secret Sale</span>
                </div>
                
                <div className="flex flex-col items-center animate-fade-up" style={{ animationDelay: '150ms' }}>
                  <div className="w-20 h-20 rounded-2xl bg-[#DDA15E] flex items-center justify-center mb-4 shadow-md transform rotate-6">
                    <Truck className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-[#2D2D2A]">Free Shipping</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col items-center text-center animate-fade-in">
              <h3 className="text-[15px] font-bold text-[#2D2D2A] mb-4 mt-6">Track Your Progress & Earn Rewards</h3>
              <p className="text-[13px] text-[#5C5C5A] leading-relaxed mb-12">
                Earn points for shopping online and in-store.<br/>
                2,000 points = 100 THB Reward!
              </p>

              <div className="w-full flex flex-col items-center mb-12">
                <Award className="w-12 h-12 text-[#2D2D2A] mb-8" />
                
                <div className="w-full h-3 bg-[#F2E9DC] rounded-full overflow-hidden mb-2 relative">
                   <div className="absolute left-0 top-0 h-full w-[0%] bg-[#FF85A2] rounded-full"></div>
                </div>
                <div className="w-full flex justify-between text-sm font-bold text-[#2D2D2A]">
                  <span>0</span>
                  <span>2,000</span>
                </div>
              </div>

              <p className="text-[13px] text-[#5C5C5A] leading-relaxed mt-auto">
                Plus earn points for easy account actions, like <strong>adding your birthday</strong>.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center text-center animate-fade-in">
              <h3 className="text-[15px] font-bold text-[#2D2D2A] mb-4 mt-6">Let's Celebrate You!</h3>
              
              <div className="w-32 h-32 mb-6 text-[#FF85A2] flex items-center justify-center relative">
                 <Cake className="w-24 h-24" strokeWidth={1.5} />
                 <Star className="w-4 h-4 absolute top-4 left-4 fill-current opacity-60" />
                 <Star className="w-3 h-3 absolute top-8 right-6 fill-current opacity-80" />
                 <Star className="w-5 h-5 absolute bottom-8 left-2 fill-current opacity-40" />
              </div>

              <p className="text-[13px] text-[#5C5C5A] leading-relaxed mb-8">
                Add your birthday to get a reward on your special day. Plus, earn 100 points!
              </p>

              <div className="w-full grid grid-cols-2 gap-4 relative">
                {/* Overlay to close dropdowns */}
                {openDropdown && (
                  <div className="fixed inset-0 z-[120]" onClick={() => setOpenDropdown(null)}></div>
                )}
                
                {/* DAY Custom Select */}
                <div className="relative z-[125]">
                  <button 
                    type="button"
                    disabled={hasBirthdaySaved}
                    onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
                    className={`w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm flex justify-between items-center ${hasBirthdaySaved ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span className={birthDay ? "text-[#2D2D2A]" : "text-[#8B8B88]"}>{birthDay ? birthDay : "Day*"}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8B8B88] transition-transform ${openDropdown === 'day' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openDropdown === 'day' && (
                    <div className="absolute w-full top-full mt-1 bg-white border border-[#EAE5DB] shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-h-56 overflow-y-auto animate-fade-in z-[130]">
                      {Array.from({ length: getDaysInMonth(birthMonth) }, (_, i) => (
                        <button
                          key={i + 1}
                          type="button"
                          onClick={() => {
                            setBirthDay((i + 1).toString());
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-[13px] transition-colors ${birthDay == (i + 1).toString() ? 'font-bold text-[#C57B57] bg-[#F9F8F6]' : 'text-[#5C5C5A] hover:bg-[#F9F8F6] hover:text-[#2D2D2A]'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* MONTH Custom Select */}
                <div className="relative z-[125]">
                  <button 
                    type="button"
                    disabled={hasBirthdaySaved}
                    onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                    className={`w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm flex justify-between items-center ${hasBirthdaySaved ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span className={birthMonth ? "text-[#2D2D2A]" : "text-[#8B8B88]"}>
                      {birthMonth ? new Date(0, birthMonth - 1).toLocaleString('default', { month: 'long' }) : "Month*"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#8B8B88] transition-transform ${openDropdown === 'month' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openDropdown === 'month' && (
                    <div className="absolute w-full top-full mt-1 bg-white border border-[#EAE5DB] shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-h-56 overflow-y-auto animate-fade-in z-[130]">
                      {Array.from({ length: 12 }, (_, i) => (
                        <button
                          key={i + 1}
                          type="button"
                          onClick={() => {
                            const newMonth = (i + 1).toString();
                            setBirthMonth(newMonth);
                            const days = getDaysInMonth(newMonth);
                            if (birthDay && parseInt(birthDay) > days) {
                              setBirthDay(days.toString());
                            }
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-[13px] transition-colors ${birthMonth == (i + 1).toString() ? 'font-bold text-[#C57B57] bg-[#F9F8F6]' : 'text-[#5C5C5A] hover:bg-[#F9F8F6] hover:text-[#2D2D2A]'}`}
                        >
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mb-6 mt-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <button 
                key={i}
                onClick={() => setStep(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${step === i ? 'bg-[#2D2D2A]' : 'bg-transparent border border-[#8B8B88]'}`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-black text-white font-bold tracking-widest uppercase transition-colors hover:bg-gray-800 text-sm"
          >
            {step === 0 && "NEXT: EARLY ACCESS"}
            {step === 1 && "NEXT: MEMBER PERKS"}
            {step === 2 && "NEXT: TRACK YOUR PROGRESS"}
            {step === 3 && "EARN 100 POINTS NOW"}
            {step === 4 && (hasBirthdaySaved ? "CLOSE" : "SAVE MY BIRTHDAY")}
          </button>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => setShowTerms(true)}
              className="text-xs text-[#5C5C5A] underline hover:text-[#2D2D2A]"
            >
              Terms Apply
            </button>
          </div>
        </div>
        
        {/* Terms & Conditions Modal Overlay */}
        {showTerms && (
          <div className="absolute inset-0 z-[120] bg-white flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-[#EAE5DB]">
              <h3 className="font-bold text-[#2D2D2A] text-lg">Terms & Conditions</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-[#2D2D2A] hover:text-[#C57B57] transition-colors focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[13px] leading-relaxed text-[#5C5C5A] text-left">
              <div>
                <h4 className="font-bold text-[#2D2D2A] mb-1">1. การประเมินและรีเซ็ตระดับสมาชิก</h4>
                <p>ยอดซื้อสะสมเพื่อใช้ในการปรับระดับสมาชิก (Tier Status) จะถูกตัดรอบและรีเซ็ตใหม่ทุกๆ 1 ปี (นับจากวันที่สมัคร หรือตามปีปฏิทิน)</p>
              </div>
              
              <div>
                <h4 className="font-bold text-[#2D2D2A] mb-1">2. เงื่อนไขสิทธิ์ Early Access</h4>
                <p>สิทธิ์ Early Access สำหรับสมาชิกระดับสูง คือสิทธิ์ในการเข้าถึงสินค้าก่อนกำหนดการณ์ปกติ เนื่องจากการจำหน่ายสินค้ามือสองมีเพียงแบบละ 1 ชิ้น สิทธิ์ขาดในการได้สินค้าจะนับจากลำดับการชำระเงินสำเร็จเท่านั้น (First pay, first served)</p>
              </div>
              
              <div>
                <h4 className="font-bold text-[#2D2D2A] mb-1">3. การสะสมและวันหมดอายุของแต้ม</h4>
                <p>ระดับสมาชิกที่สูงขึ้นจะได้รับอัตราการสะสมแต้ม ที่มากกว่าระดับเริ่มต้น  แต้มสะสมที่ไม่ได้ใช้งานจะหมดอายุภายใน 12 เดือน นับจากวันที่ได้รับแต้มครั้งแรก</p>
              </div>
              
              <div>
                <h4 className="font-bold text-[#2D2D2A] mb-1">4. สิทธิ์ในการเปลี่ยนแปลงเงื่อนไข</h4>
                <p>Re-Wear ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไข สิทธิประโยชน์ หรือยกเลิกโปรแกรมสะสมแต้มโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
