"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Leaf, Award, Gift, Flame, Droplet, TreePine, Info, X, Recycle, Copy, CheckCircle2, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getOrdersByUser } from '../../utils/localStorageHelper';
import { useToast } from '../../components/ui/ToastProvider';

const getRewardsByRank = (rank) => {
  if (rank === 'Harvest') {
    return [
      { id: 1, title: '15% - 20% Discount Coupon', pointsRequired: 200, description: 'Limit 5 coupons/year', isAuto: false, available: true },
      { id: 2, title: 'Free Standard Delivery', pointsRequired: 50, description: 'Unlimited redemptions', isAuto: false, available: true },
      { id: 3, title: 'Free Express Delivery', pointsRequired: 0, description: 'Unlimited free express delivery', isAuto: true, available: true },
    ];
  } else if (rank === 'Bloom' || rank === 'Fruit') {
    return [
      { id: 1, title: '10% - 15% Discount Coupon', pointsRequired: 300, description: 'Limit 5 coupons/year', isAuto: false, available: true },
      { id: 2, title: 'Free Standard Delivery', pointsRequired: 150, description: 'Unlimited redemptions', isAuto: false, available: true },
      { id: 3, title: 'Free Express Delivery', pointsRequired: 100, description: 'Unlimited redemptions', isAuto: false, available: true },
    ];
  } else if (rank === 'Seed' || rank === 'Sprout') {
    return [
      { id: 1, title: '5% - 10% Discount Coupon', pointsRequired: 400, description: 'Limit 5 coupons/year', isAuto: false, available: true },
      { id: 2, title: 'Free Standard Delivery', pointsRequired: 250, description: 'Unlimited redemptions', isAuto: false, available: true },
      { id: 3, title: 'Free Express Delivery', pointsRequired: 200, description: 'Unlimited redemptions', isAuto: false, available: true },
    ];
  }

  // Default for No Rank (None)
  return [
    { id: 1, title: '5% Discount Coupon', pointsRequired: 500, description: 'Limit 5 coupons/year', isAuto: false, available: true },
    { id: 2, title: 'Free Standard Delivery', pointsRequired: 400, description: 'Unlimited redemptions', isAuto: false, available: true },
    { id: 3, title: 'Free Express Delivery', pointsRequired: 350, description: 'Unlimited redemptions', isAuto: false, available: true },
  ];
};

const dailyMissions = [
  { id: 1, title: 'Eco-Shipping', desc: 'Choose standard shipping at checkout', points: 20 },
  { id: 2, title: 'No Excess Packaging', desc: 'Select "Pack in one box / No plastic wrapping"', points: 30 },
  { id: 3, title: 'Simple Product Review', desc: 'Rate and select short tags (e.g. Good condition/Fast shipping)', points: 20 },
  { id: 4, title: 'Review with Photo', desc: 'Review with a photo of you wearing the item', points: 50 },
  { id: 5, title: 'Invite a Friend', desc: 'Share your code; get points when they complete their first order (both get points)', points: 100 },
];

const oneTimeMissions = [
  { id: 1, title: 'Complete Your Profile', desc: 'Update Address, Birthday, and Size for special promotions', points: 50 },
];

export default function EcoImpact() {
  const { currentUser, claimMission, redeemReward, updateUser } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [justClaimed, setJustClaimed] = useState(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const completedMissions = currentUser?.completedMissions || [];

  const handleClaim = (missionId, points) => {
    claimMission(missionId, points);
    setJustClaimed(missionId);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  const spending = currentUser?.total_spending || 0;
  let nextRank = '';
  let spendingNeeded = 0;
  let progressPercent = 0;
  let currentRank = currentUser?.tier || currentUser?.rank || 'None';
  const [showEcoInfo, setShowEcoInfo] = useState(false);
  const [activeMockModal, setActiveMockModal] = useState(null);
  const [deliveredItemsCount, setDeliveredItemsCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser?.id) {
        const orders = await getOrdersByUser(currentUser.id);
        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        let totalItems = 0;
        deliveredOrders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            totalItems += order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          }
        });
        setDeliveredItemsCount(totalItems);
      } else {
        setDeliveredItemsCount(0);
      }
    };
    fetchOrders();
  }, [currentUser?.id]);

  const checkCondition = (missionId) => {
    if (missionId === 'onetime-1') {
      return !!(currentUser?.name && currentUser?.phone && currentUser?.address);
    }
    if (missionId === 'daily-1') return !!currentUser?.hasEcoShipping;
    if (missionId === 'daily-2') return !!currentUser?.hasNoPackaging;
    if (missionId === 'daily-3') return !!currentUser?.hasReviewed;
    if (missionId === 'daily-4') return !!currentUser?.hasPhotoReviewed;
    if (missionId === 'daily-5') return !!currentUser?.hasInvited;
    return false;
  };

  const handleSimulateAction = (missionId) => {
    if (missionId === 'daily-3' || missionId === 'daily-4') router.push('/orders');
    else if (missionId === 'daily-5') setActiveMockModal('invite');
    else if (missionId === 'onetime-1') router.push('/profile');
    else if (missionId === 'daily-1' || missionId === 'daily-2') router.push('/'); // Shop to checkout
  };

  const handleRedeem = (reward) => {
    const result = redeemReward(reward);
    if (result.success) {
      addToast(`Redeemed ${reward.title} successfully! Coupon code: ${result.coupon.code}`, 'success');
    } else {
      addToast(result.error || 'Failed to redeem reward', 'error');
    }
  };

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/?ref=${currentUser?.id}`;
    navigator.clipboard.writeText(link);
    setInviteCopied(true);
    addToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setInviteCopied(false), 2000);
  };



  if (spending < 2000) {
    nextRank = 'Sprout';
    spendingNeeded = 2000 - spending;
    progressPercent = (spending / 2000) * 100;
  } else if (spending < 6000) {
    nextRank = 'Bloom';
    spendingNeeded = 6000 - spending;
    progressPercent = ((spending - 2000) / 4000) * 100;
  } else if (spending < 12000) {
    nextRank = 'Fruit';
    spendingNeeded = 12000 - spending;
    progressPercent = ((spending - 6000) / 6000) * 100;
  } else if (spending < 25000) {
    nextRank = 'Harvest';
    spendingNeeded = 25000 - spending;
    progressPercent = ((spending - 12000) / 13000) * 100;
  } else {
    nextRank = 'Max Level';
    spendingNeeded = 0;
    progressPercent = 100;
  }

  const ecoPoints = currentRank !== 'None' 
    ? (currentUser?.points !== undefined ? currentUser.points : (currentUser?.total_spending || 0))
    : (currentUser?.points || 0);
  const rewards = getRewardsByRank(currentRank);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Left */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>

        {/* Content Right */}
        <div className="lg:col-span-3 space-y-8">

          {/* 1. Rank Progress (Only show if user has a rank) */}
          {currentRank !== 'None' ? (
            <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-earth-100 pb-4">
                <div>
                  <p className="text-sm text-earth-500 font-medium">Your Current Status</p>
                  <h2 className="text-2xl font-bold text-earth-900 flex items-center gap-2 mt-1">
                    {currentRank} Member
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-earth-500 font-medium">Total Spent</p>
                  <p className="text-xl font-bold text-sage-700 mt-1">{spending.toLocaleString()} THB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-semibold text-earth-800">
                  <span>Current Progress</span>
                  {spendingNeeded > 0 ? (
                    <span>Next Goal: {nextRank}</span>
                  ) : (
                    <span>Congratulations, you've reached the highest level!</span>
                  )}
                </div>
                <div className="h-3 w-full bg-earth-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sage-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}></div>
                </div>
                {spendingNeeded > 0 && (
                  <p className="text-xs text-earth-500">
                    Spend <span className="font-bold text-sage-600">{spendingNeeded.toLocaleString()} THB</span> more to upgrade to {nextRank}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center text-sage-600 flex-shrink-0 mx-auto sm:mx-0">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-earth-900 mb-2">Unlock Eco-Impact Ranks</h2>
                <p className="text-sm text-earth-500 leading-relaxed">
                  Subscribe to our membership to start earning ranks, unlocking exclusive green rewards, and accumulating points on every purchase!
                </p>
              </div>
            </div>
          )}

          {/* 2. Points & Rewards */}
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="text-center pb-6 border-b border-earth-100">
              <p className="text-sm text-earth-500 font-medium">Your Accumulated Points</p>
              <h1 className="text-4xl sm:text-5xl font-black text-sage-600 mt-2">{ecoPoints.toLocaleString()} <span className="text-xl sm:text-2xl font-bold text-earth-800">Eco Points</span></h1>
            </div>

            <div>
              <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2 mb-6">
                <Gift className="h-5 w-5 text-sage-600" />
                Green Rewards (Redeem)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`border border-earth-200 rounded-2xl p-5 flex flex-col justify-between hover:border-sage-500 transition-all ${!reward.available ? 'opacity-65' : ''
                      }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        {reward.isAuto ? (
                          <span className="inline-flex px-2.5 py-1 bg-earth-100 border border-earth-200 text-earth-800 text-[10px] font-bold rounded-lg">
                            Auto Privilege
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 bg-sage-50 border border-sage-200 text-sage-800 text-[10px] font-bold rounded-lg">
                            {reward.pointsRequired} Points
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-earth-800">{reward.title}</h3>
                      <p className="text-xs text-earth-500 leading-normal">{reward.description}</p>
                    </div>

                    <button
                      disabled={!reward.available || (reward.isAuto && !reward.link)}
                      onClick={() => reward.link ? router.push(reward.link) : (!reward.isAuto ? handleRedeem(reward) : null)}
                      className={`w-full mt-6 py-2 rounded-full text-xs font-semibold transition-all ${reward.link
                        ? 'bg-sage-600 hover:bg-sage-700 text-white hover-lift'
                        : reward.isAuto
                          ? 'bg-earth-100 text-earth-600 border border-earth-200 cursor-default'
                          : reward.available
                            ? 'bg-sage-600 hover:bg-sage-700 text-white hover-lift'
                            : 'bg-earth-100 text-earth-400 cursor-not-allowed'
                        }`}
                    >
                      {reward.link ? 'Use Service' : reward.isAuto ? 'Your Privilege (Activated)' : reward.available ? 'Redeem Reward' : 'Temporarily Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Eco Achievements */}
          <div className="bg-gradient-to-br from-sage-600 to-sage-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-sage-500/30 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none">
              <Leaf className="w-full h-full text-white" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white/20 rounded-xl">
                    <Leaf className="h-6 w-6 text-sage-100" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      Eco Achievements
                      <button
                        onClick={() => setShowEcoInfo(true)}
                        className="text-sage-100 hover:text-white transition-colors"
                        title="Learn more about eco achievements"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </h2>
                    <p className="text-xs text-sage-100 font-medium opacity-90">Your eco-friendly stats from circular fashion</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2.5 bg-sage-400/30 text-sage-100 rounded-xl">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-sage-100 font-medium">Carbon Reduced</span>
                    <span className="block text-lg font-bold">{(deliveredItemsCount * 6.5).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e</span>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2.5 bg-sage-400/30 text-sage-100 rounded-xl">
                    <Droplet className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-sage-100 font-medium">Water Saved</span>
                    <span className="block text-lg font-bold">{(deliveredItemsCount * 2700).toLocaleString()} L</span>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2.5 bg-sage-400/30 text-sage-100 rounded-xl">
                    <Recycle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-sage-100 font-medium">Waste Diverted</span>
                    <span className="block text-lg font-bold">{(deliveredItemsCount * 0.2).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Earn More Points */}
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-earth-100 pb-5">
              <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-sage-600" />
                Earn More Points
              </h2>
              <p className="text-xs text-earth-500 mt-1">Complete simple eco-missions to earn Eco Points and redeem rewards</p>
            </div>

            <div className="space-y-8">
              {/* Daily Missions */}
              <div>
                <h3 className="font-bold text-sm text-earth-800 mb-4 bg-earth-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <span className="text-sage-600">♻️</span> Daily Missions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dailyMissions.map(mission => {
                    const isCompleted = completedMissions.includes(`daily-${mission.id}`);
                    return (
                      <div key={mission.id} className={`border p-4 rounded-xl flex items-start justify-between gap-3 transition-colors ${isCompleted ? 'border-earth-200 bg-earth-50/50 opacity-60' : 'border-earth-200 hover:border-sage-400 bg-white'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`font-bold text-[10px] px-2 py-1 rounded-md shrink-0 mt-0.5 ${isCompleted ? 'bg-earth-200 text-earth-600' : 'bg-sage-50 text-sage-700'}`}>
                            +{mission.points}
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm ${isCompleted ? 'text-earth-600 line-through' : 'text-earth-800'}`}>{mission.title}</h4>
                            <p className="text-xs text-earth-500 mt-1">{mission.desc}</p>
                          </div>
                        </div>
                        {isCompleted ? (
                          <div className="text-[10px] font-bold text-earth-500 bg-earth-100 px-3 py-1.5 rounded-full shrink-0">
                            Completed
                          </div>
                        ) : checkCondition(`daily-${mission.id}`) ? (
                          <button
                            onClick={() => handleClaim(`daily-${mission.id}`, mission.points)}
                            className="text-[10px] font-bold text-white bg-sage-600 hover:bg-sage-700 px-4 py-1.5 rounded-full shrink-0 transition-colors shadow-sm relative overflow-hidden"
                          >
                            {justClaimed === `daily-${mission.id}` ? 'Claimed!' : 'Claim'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulateAction(`daily-${mission.id}`)}
                            className="text-[10px] font-bold text-earth-500 bg-earth-100 hover:bg-earth-200 px-4 py-1.5 rounded-full shrink-0 transition-colors shadow-sm"
                          >
                            To Do
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* One-time Missions */}
              <div>
                <h3 className="font-bold text-sm text-earth-800 mb-4 bg-earth-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span> One-time Missions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {oneTimeMissions.map(mission => {
                    const isCompleted = completedMissions.includes(`onetime-${mission.id}`);
                    return (
                      <div key={mission.id} className={`border p-4 rounded-xl flex items-start justify-between gap-3 transition-colors ${isCompleted ? 'border-earth-200 bg-earth-50/50 opacity-60' : 'border-earth-200 hover:border-sage-400 bg-white'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`font-bold text-[10px] px-2 py-1 rounded-md shrink-0 mt-0.5 ${isCompleted ? 'bg-earth-200 text-earth-600' : 'bg-sage-50 text-sage-700'}`}>
                            +{mission.points}
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm ${isCompleted ? 'text-earth-600 line-through' : 'text-earth-800'}`}>{mission.title}</h4>
                            <p className="text-xs text-earth-500 mt-1">{mission.desc}</p>
                          </div>
                        </div>
                        {isCompleted ? (
                          <div className="text-[10px] font-bold text-earth-500 bg-earth-100 px-3 py-1.5 rounded-full shrink-0">
                            Completed
                          </div>
                        ) : checkCondition(`onetime-${mission.id}`) ? (
                          <button
                            onClick={() => handleClaim(`onetime-${mission.id}`, mission.points)}
                            className="text-[10px] font-bold text-white bg-sage-600 hover:bg-sage-700 px-4 py-1.5 rounded-full shrink-0 transition-colors shadow-sm relative overflow-hidden"
                          >
                            {justClaimed === `onetime-${mission.id}` ? 'Claimed!' : 'Claim'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulateAction(`onetime-${mission.id}`)}
                            className="text-[10px] font-bold text-earth-500 bg-earth-100 hover:bg-earth-200 px-4 py-1.5 rounded-full shrink-0 transition-colors shadow-sm"
                          >
                            To Do
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Eco Info Modal */}
      {showEcoInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowEcoInfo(false)}
              className="absolute top-4 right-4 text-earth-400 hover:text-earth-600 bg-earth-100 hover:bg-earth-200 p-1.5 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-sage-100 rounded-full text-sage-600 shadow-inner">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-earth-900">About Eco Achievements</h3>
            </div>
            <div className="space-y-4 text-sm text-earth-600 leading-relaxed">
              <p>
                Every time you buy or sell second-hand clothing on <strong className="text-sage-700">Re-wear</strong>, you actively contribute to reducing the fashion industry's environmental footprint.
              </p>
              <div className="bg-earth-50 border border-earth-100 p-4 rounded-xl space-y-4">
                <div className="flex gap-3">
                  <Flame className="h-5 w-5 text-orange-400 shrink-0" />
                  <div>
                    <strong className="block text-earth-800 font-bold mb-0.5">Carbon Reduced</strong>
                    Buying used clothes prevents the carbon emissions associated with manufacturing new garments.
                  </div>
                </div>
                <div className="flex gap-3">
                  <Droplet className="h-5 w-5 text-blue-400 shrink-0" />
                  <div>
                    <strong className="block text-earth-800 font-bold mb-0.5">Water Saved</strong>
                    Producing new textiles requires thousands of liters of water. Reusing clothes saves this precious resource.
                  </div>
                </div>
                <div className="flex gap-3">
                  <TreePine className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <strong className="block text-earth-800 font-bold mb-0.5">Equivalent Trees</strong>
                    Your carbon savings are translated into the number of trees it would take to absorb that same amount of CO₂.
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEcoInfo(false)}
              className="w-full mt-6 bg-sage-600 text-white font-bold py-3 rounded-xl hover:bg-sage-700 hover:shadow-md transition-all active:scale-[0.98]"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal for displaying referral link */}
      {activeMockModal === 'invite' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sage-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
            
            <button 
              onClick={() => setActiveMockModal(null)}
              className="absolute top-6 right-6 p-2 text-earth-400 hover:text-earth-800 bg-earth-50 hover:bg-earth-100 rounded-full transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-10 relative z-10 pt-4">
              <div className="w-20 h-20 bg-gradient-to-br from-sage-100 to-sage-50 text-sage-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-sage-100/50">
                <Share2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-earth-900 mb-3 tracking-tight">Invite a Friend</h3>
              <p className="text-sm text-earth-500 max-w-[280px] leading-relaxed">
                Share this link with a friend. When they sign up and make their first purchase, <strong className="text-sage-700 bg-sage-50 px-1 py-0.5 rounded">you'll both earn 100 points!</strong>
              </p>
            </div>

            <div className="mb-8 relative z-10">
              <label className="block text-[11px] font-bold text-earth-500 uppercase tracking-widest mb-3 ml-1">Your Referral Link</label>
              <div className="flex items-center gap-3 bg-earth-50/80 p-2.5 rounded-2xl border border-earth-200/80 hover:border-sage-300 transition-colors group">
                <div className="flex-1 overflow-hidden px-4">
                  <p className="text-sm font-mono text-earth-800 truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${currentUser?.id}` : ''}
                  </p>
                </div>
                <button
                  onClick={handleCopyInvite}
                  className={`flex items-center justify-center px-5 py-3 rounded-xl transition-all font-bold text-sm shadow-sm ${
                    inviteCopied 
                      ? 'bg-sage-600 text-white shadow-sage-600/20' 
                      : 'bg-white text-earth-700 border border-earth-200 hover:border-sage-400 hover:text-sage-700'
                  }`}
                  title="Copy link"
                >
                  {inviteCopied ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</span>
                  )}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setActiveMockModal(null)} 
              className="w-full py-4 bg-earth-900 hover:bg-earth-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-earth-900/10 hover:shadow-2xl active:scale-[0.98] relative z-10"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
