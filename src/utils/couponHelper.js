export const redeemCoupon = (currentUser, deductPoints, type) => {
  if (!currentUser) return { success: false, error: 'Must be logged in' };

  let cost = 0;
  let code = '';
  let discountType = '';
  let discountValue = 0;

  const tier = currentUser.tier || 'Seed';
  const maxCoupons = tier === 'Harvest' ? 2 : 5;
  const currentCouponsRedeemed = currentUser.couponsRedeemed || 0;

  switch (type) {
    case 'discount':
      if (currentCouponsRedeemed >= maxCoupons) return { success: false, error: `You have reached your limit of ${maxCoupons} discount coupons this year.` };
      if (tier === 'Seed' || tier === 'Sprout') {
        cost = 500; // Assuming cost
        code = `SS-DISCOUNT-${Math.floor(Math.random() * 90000 + 10000)}`;
        discountType = 'percentage';
        discountValue = 10;
      } else if (tier === 'Bloom' || tier === 'Fruit') {
        cost = 1000;
        code = `BF-DISCOUNT-${Math.floor(Math.random() * 90000 + 10000)}`;
        discountType = 'percentage';
        discountValue = 20;
      } else if (tier === 'Harvest') {
        cost = 2000;
        code = `HV-DISCOUNT-${Math.floor(Math.random() * 90000 + 10000)}`;
        discountType = 'percentage';
        discountValue = 30; // OR 500 THB cash. We'll handle this as 30% for now.
      }
      break;

    case 'shipping_standard':
      if (tier === 'Seed' || tier === 'Sprout') cost = 250;
      else if (tier === 'Bloom' || tier === 'Fruit') cost = 200;
      else if (tier === 'Harvest') return { success: false, error: 'You already get free shipping forever!' };
      code = `STD-FREE-${Math.floor(Math.random() * 90000 + 10000)}`;
      discountType = 'shipping';
      discountValue = 'standard';
      break;

    case 'shipping_express':
      if (tier === 'Seed' || tier === 'Sprout') cost = 200;
      else if (tier === 'Bloom' || tier === 'Fruit') cost = 150;
      else if (tier === 'Harvest') return { success: false, error: 'You already get free shipping forever!' };
      code = `EXP-FREE-${Math.floor(Math.random() * 90000 + 10000)}`;
      discountType = 'shipping';
      discountValue = 'express';
      break;
      
    case 'cash_500':
      if (tier !== 'Harvest') return { success: false, error: 'Only Harvest tier can redeem this coupon.' };
      if (currentCouponsRedeemed >= maxCoupons) return { success: false, error: `You have reached your limit of ${maxCoupons} discount coupons this year.` };
      cost = 2000;
      code = `HV-CASH500-${Math.floor(Math.random() * 90000 + 10000)}`;
      discountType = 'fixed';
      discountValue = 500;
      break;

    default:
      return { success: false, error: 'Unknown coupon type' };
  }

  if (deductPoints(cost)) {
    // We should save this generated coupon to localStorage so it can be verified in payment/page.jsx
    const coupons = JSON.parse(localStorage.getItem('my_coupons') || '[]');
    coupons.push({ code, discountType, discountValue, used: false });
    localStorage.setItem('my_coupons', JSON.stringify(coupons));
    
    // Increment redeemed count if it's a discount or cash coupon
    if (type === 'discount' || type === 'cash_500') {
       const userStr = localStorage.getItem('currentUser');
       if (userStr) {
           const u = JSON.parse(userStr);
           u.couponsRedeemed = (u.couponsRedeemed || 0) + 1;
           localStorage.setItem('currentUser', JSON.stringify(u));
           // NOTE: Ideally we update Context state as well, but this is a rough mock helper
       }
    }

    return { success: true, code, discountType, discountValue };
  }

  return { success: false, error: 'Not enough points' };
};
