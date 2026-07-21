"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { CreditCard, Plus, Trash2, Building2, CheckCircle2, X } from 'lucide-react';

const mockCards = [];

const mockBanks = [];

export default function PaymentMethods() {
  const [cards, setCards] = useState(mockCards);
  const [banks, setBanks] = useState(mockBanks);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  
  const [cardInput, setCardInput] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bankInput, setBankInput] = useState({ bankName: 'ธนาคารกรุงเทพ (Bangkok Bank)', accountName: '', accountNumber: '' });

  const removeCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const removeBank = (id) => {
    setBanks(banks.filter(b => b.id !== id));
  };

  const getCardType = (numStr) => {
    const cleanNum = numStr.replace(/\D/g, '');
    if (!cleanNum) return 'Card';
    if (cleanNum.startsWith('5')) return 'Mastercard';
    if (cleanNum.startsWith('34') || cleanNum.startsWith('37')) return 'Amex';
    if (cleanNum.startsWith('35')) return 'JCB';
    if (cleanNum.startsWith('4')) return 'Visa';
    return 'Card';
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    
    // Only allow starting with 3, 4, or 5 (Visa, Mastercard, Amex, JCB)
    if (val.length > 0 && !['3', '4', '5'].includes(val[0])) {
      val = '';
    }

    val = val.replace(/(.{4})/g, '$1 ').trim();
    if (val.length > 19) val = val.substring(0, 19);
    setCardInput({ ...cardInput, number: val });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + (val.length > 2 ? '/' : '') + val.substring(2, 4);
    }
    setCardInput({ ...cardInput, expiry: val });
  };

  const handleBankNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length > 3 && val.length <= 4) {
      formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
    } else if (val.length > 4 && val.length <= 9) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4)}`;
    } else if (val.length > 9) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 4)}-${val.slice(4, 9)}-${val.slice(9, 10)}`;
    }
    setBankInput({ ...bankInput, accountNumber: formatted });
  };

  const submitCardForm = (e) => {
    e.preventDefault();
    if (!cardInput.number || !cardInput.expiry) return;
    
    let type = getCardType(cardInput.number);

    const last4 = cardInput.number.replace(/\D/g, '').slice(-4) || '0000';
    const isFirstCard = cards.length === 0;
    
    setCards([...cards, { id: Date.now(), type, last4, expiry: cardInput.expiry, isDefault: isFirstCard }]);
    setShowCardForm(false);
    setCardInput({ number: '', name: '', expiry: '', cvv: '' });
  };

  const submitBankForm = (e) => {
    e.preventDefault();
    if (!bankInput.accountNumber || !bankInput.accountName) return;
    
    const last4 = bankInput.accountNumber.slice(-4) || '0000';
    setBanks([...banks, { id: Date.now(), bankName: bankInput.bankName, accountName: bankInput.accountName, last4 }]);
    setShowBankForm(false);
    setBankInput({ bankName: 'ธนาคารกรุงเทพ (Bangkok Bank)', accountName: '', accountNumber: '' });
  };

  const setAsDefault = (id) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
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
            <div className="border-b border-earth-100 pb-5 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-earth-900">Payment Methods</h1>
                <p className="text-xs text-earth-500 mt-1">Manage your credit cards and bank accounts securely.</p>
              </div>
            </div>

            {/* Credit/Debit Cards Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-earth-800 font-bold">
                  <CreditCard className="h-5 w-5 text-sage-600" />
                  <h3>Credit & Debit Cards</h3>
                </div>
                {!showCardForm && (
                  <button 
                    onClick={() => setShowCardForm(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sage-600 hover:text-sage-700 bg-sage-50 px-3 py-1.5 rounded-full transition-colors active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add New Card
                  </button>
                )}
              </div>

              {showCardForm && (
                <form onSubmit={submitCardForm} className="mb-6 p-6 rounded-2xl border border-sage-200 bg-sage-50/20 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-earth-800">Add New Card</h4>
                    <button type="button" onClick={() => setShowCardForm(false)} className="text-earth-400 hover:text-clay-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-earth-600 mb-1">Card Number</label>
                      <input required type="text" placeholder="0000 0000 0000 0000" className="w-full text-sm p-3 pr-20 rounded-xl border border-earth-200 focus:outline-none focus:border-sage-500" value={cardInput.number} onChange={handleCardNumberChange} />
                      <div className="absolute right-3 top-[34px] text-[10px] font-bold text-earth-400 tracking-widest uppercase pointer-events-none">
                        {getCardType(cardInput.number)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-earth-600 mb-1">Cardholder Name</label>
                      <input required type="text" placeholder="e.g., Name on card" className="w-full text-sm p-3 rounded-xl border border-earth-200 focus:outline-none focus:border-sage-500" value={cardInput.name} onChange={e => setCardInput({...cardInput, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-earth-600 mb-1">Expiry Date</label>
                        <input required type="text" placeholder="MM/YY" className="w-full text-sm p-3 rounded-xl border border-earth-200 focus:outline-none focus:border-sage-500" value={cardInput.expiry} onChange={handleExpiryChange} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-earth-600 mb-1">CVV</label>
                        <input required type="password" placeholder="***" maxLength="4" className="w-full text-sm p-3 rounded-xl border border-earth-200 focus:outline-none focus:border-sage-500" value={cardInput.cvv} onChange={e => setCardInput({...cardInput, cvv: e.target.value.replace(/\D/g, '')})} />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="bg-sage-600 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-sage-700 transition-colors">
                      Save Card
                    </button>
                  </div>
                </form>
              )}

              {cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map(card => (
                    <div key={card.id} className={`p-5 rounded-2xl border ${card.isDefault ? 'border-sage-400 bg-sage-50/30' : 'border-earth-200 bg-white'} relative group transition-all hover:shadow-sm`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                          <div className="w-auto px-3 h-8 bg-earth-100 rounded flex items-center justify-center text-[10px] font-bold tracking-widest text-earth-600">
                            {card.type.toUpperCase()}
                          </div>
                          {card.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] text-sage-600 font-bold bg-white border border-sage-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Default
                            </span>
                          )}
                        </div>
                        <button onClick={() => removeCard(card.id)} className="text-earth-400 hover:text-clay-600 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-lg font-mono text-earth-800 tracking-widest">
                          **** **** **** {card.last4}
                        </div>
                        <div className="text-xs text-earth-500 font-medium">
                          Expires {card.expiry}
                        </div>
                      </div>

                      {!card.isDefault && (
                        <div className="mt-4 pt-4 border-t border-earth-100/50">
                          <button 
                            onClick={() => setAsDefault(card.id)}
                            className="text-[11px] font-semibold text-earth-500 hover:text-sage-600 transition-colors"
                          >
                            Set as default
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-earth-50/50 rounded-2xl border border-dashed border-earth-200">
                  <p className="text-sm text-earth-500">No cards saved.</p>
                </div>
              )}
            </div>

            {/* Bank Accounts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-earth-800 font-bold">
                  <Building2 className="h-5 w-5 text-clay-600" />
                  <h3>Bank Accounts</h3>
                </div>
                {!showBankForm && (
                  <button 
                    onClick={() => setShowBankForm(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-clay-600 hover:text-clay-700 bg-clay-50 px-3 py-1.5 rounded-full transition-colors active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Bank Account
                  </button>
                )}
              </div>

              {showBankForm && (
                <form onSubmit={submitBankForm} className="mb-6 p-6 rounded-2xl border border-clay-200 bg-clay-50/20 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-earth-800">Add Bank Account</h4>
                    <button type="button" onClick={() => setShowBankForm(false)} className="text-earth-400 hover:text-clay-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-earth-600 mb-1">Bank Name</label>
                      <select className="w-full text-sm p-3 rounded-xl border border-earth-200 focus:outline-none focus:border-clay-500" value={bankInput.bankName} onChange={e => setBankInput({...bankInput, bankName: e.target.value})}>
                        <option>ธนาคารกรุงเทพ (Bangkok Bank)</option>
                        <option>ธนาคารกสิกรไทย (Kasikorn Bank)</option>
                        <option>ธนาคารไทยพาณิชย์ (Siam Commercial Bank)</option>
                        <option>ธนาคารกรุงไทย (Krung Thai Bank)</option>
                        <option>ธนาคารทหารไทยธนชาต (TTB)</option>
                        <option>ธนาคารกรุงศรีอยุธยา (Bank of Ayudhya)</option>
                        <option>ธนาคารออมสิน (Government Savings Bank)</option>
                        <option>ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-earth-600 mb-1">Account Name</label>
                      <input required type="text" placeholder="e.g., Account holder name" className="w-full text-sm p-3 rounded-xl border border-earth-200 focus:outline-none focus:border-clay-500" value={bankInput.accountName} onChange={e => setBankInput({...bankInput, accountName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-earth-600 mb-1">Account Number</label>
                      <input required type="text" placeholder="123-4-56789-0" className="w-full text-sm p-3 rounded-xl border border-earth-200 focus:outline-none focus:border-clay-500" value={bankInput.accountNumber} onChange={handleBankNumberChange} />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="bg-clay-600 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-clay-700 transition-colors">
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              {banks.length > 0 ? (
                <div className="space-y-3">
                  {banks.map(bank => (
                    <div key={bank.id} className="flex items-center justify-between p-4 rounded-xl border border-earth-200 bg-white hover:border-earth-300 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-clay-100 rounded-full flex items-center justify-center text-clay-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-earth-800">{bank.bankName}</div>
                          <div className="text-xs text-earth-500">
                            {bank.accountName} • *** {bank.last4}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeBank(bank.id)} className="text-earth-400 hover:text-clay-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-earth-50/50 rounded-2xl border border-dashed border-earth-200">
                  <p className="text-sm text-earth-500">No bank accounts linked.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
