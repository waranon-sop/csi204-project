"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const SupportContext = createContext(null);

const defaultFaqData = [
  {
    id: 'cat-1',
    category: 'Orders & Shipping',
    iconName: 'Package',
    questions: [
      { id: 'q-1-1', q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days within the country." },
      { id: 'q-1-2', q: "How can I track my order?", a: "Once your order ships, you will receive an email with a tracking link. You can also view tracking information in your Account Profile under 'Order History'." },
      { id: 'q-1-3', q: "Do you ship internationally?", a: "Currently, we only ship domestically. We are looking to expand internationally in the near future!" }
    ]
  },
  {
    id: 'cat-2',
    category: 'Returns & Refunds',
    iconName: 'RefreshCcw',
    questions: [
      { id: 'q-2-1', q: "What is your return policy?", a: "We accept returns within 14 days of delivery. Items must be in their original condition with all ReWear tags still attached." },
      { id: 'q-2-2', q: "How do I request a refund?", a: "Go to your 'Order History', select the item you wish to return, and click 'Request Return'. A shipping label will be generated for you." },
      { id: 'q-2-3', q: "When will I get my refund?", a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item." }
    ]
  },
  {
    id: 'cat-3',
    category: 'Selling / Consignment',
    iconName: 'Tag',
    questions: [
      { id: 'q-3-1', q: "How do I sell my clothes?", a: "You can request a 'Clean Out Bag' from your profile. Fill it with your gently used clothes and drop it off at any post office using the pre-paid label." },
      { id: 'q-3-2', q: "What items do you accept?", a: "We accept women's, men's, and kids' clothing in excellent condition. We do not accept items with stains, tears, or missing labels." },
      { id: 'q-3-3', q: "How much do I earn?", a: "You earn up to 70% of the selling price depending on the brand and item condition. Payouts can be taken as cash or store credit (+10% bonus)." }
    ]
  },
  {
    id: 'cat-4',
    category: 'Account & Payment',
    iconName: 'User',
    questions: [
      { id: 'q-4-1', q: "What payment methods do you accept?", a: "We accept Visa, MasterCard, PromptPay, and Store Credit." },
      { id: 'q-4-2', q: "How do I reset my password?", a: "Click 'Forgot Password' on the login screen. We will send a reset link to your registered email." }
    ]
  }
];

const defaultContactInfo = {
  email: 'support@rewear.com',
  phone: '+66 2 123 4567',
  hours: 'Mon - Fri, 9am - 6pm (TH)',
  address: '123 Fashion District, Bangkok 10110'
};

export function SupportProvider({ children }) {
  const [faqData, setFaqData] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage
    const storedFaq = localStorage.getItem('reWearFaqData');
    const storedContact = localStorage.getItem('reWearContactInfo');
    
    if (storedFaq) {
      try { setFaqData(JSON.parse(storedFaq)); } catch(e) { setFaqData(defaultFaqData); }
    } else {
      setFaqData(defaultFaqData);
      localStorage.setItem('reWearFaqData', JSON.stringify(defaultFaqData));
    }

    if (storedContact) {
      try { setContactInfo(JSON.parse(storedContact)); } catch(e) { setContactInfo(defaultContactInfo); }
    } else {
      setContactInfo(defaultContactInfo);
      localStorage.setItem('reWearContactInfo', JSON.stringify(defaultContactInfo));
    }
    
    setIsLoaded(true);
  }, []);

  const updateFaqData = (newFaqData) => {
    setFaqData(newFaqData);
    localStorage.setItem('reWearFaqData', JSON.stringify(newFaqData));
  };

  const updateContactInfo = (newContactInfo) => {
    setContactInfo(newContactInfo);
    localStorage.setItem('reWearContactInfo', JSON.stringify(newContactInfo));
  };

  return (
    <SupportContext.Provider value={{ faqData, contactInfo, updateFaqData, updateContactInfo, isLoaded }}>
      {children}
    </SupportContext.Provider>
  );
}

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};
