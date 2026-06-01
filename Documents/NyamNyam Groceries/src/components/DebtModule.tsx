/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Debt, Customer } from '../types';
import { 
  Coins, 
  Clock, 
  MessageSquareShare, 
  PlusCircle, 
  Calendar,
  AlertCircle,
  TrendingDown,
  Check
} from 'lucide-react';

interface DebtProps {
  debts: Debt[];
  customers: Customer[];
  onPayDebt: (debtId: string, amount: number, paymentMethod: 'CASH' | 'MPESA', mpesaCode?: string) => Promise<any>;
}

export default function DebtModule({
  debts,
  customers,
  onPayDebt
}: DebtProps) {
  const [activeRepayDebt, setActiveRepayDebt] = useState<Debt | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(0);
  const [repayMethod, setRepayMethod] = useState<'CASH' | 'MPESA'>('CASH');
  const [repayMpesaCode, setRepayMpesaCode] = useState('');

  const activeDebtsList = debts.filter(d => d.status !== 'PAID');
  const totalOutstandingCredit = activeDebtsList.reduce((sum, d) => sum + d.remainingAmount, 0);

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRepayDebt || repayAmount <= 0) return;

    try {
      await onPayDebt(
        activeRepayDebt.id, 
        repayAmount, 
        repayMethod, 
        repayMethod === 'MPESA' ? repayMpesaCode : undefined
      );
      setActiveRepayDebt(null);
      setRepayAmount(0);
      setRepayMpesaCode('');
    } catch (err) {
      alert("Error recording credit repayment");
    }
  };

  // Compile a customized WhatsApp message remind link
  const getWhatsAppReminderURI = (debt: Debt) => {
    const cust = customers.find(c => c.id === debt.customerId);
    const phoneNum = cust ? cust.phone.replace(/[\s+]/g, '') : '254700050000';
    
    const lines = [
      `*CREDIT OUTSTANDING REMINDER - NYAMNYAM GROCERIES*`,
      `Hello ${debt.customerName},`,
      `This is a friendly reminder regarding your outstanding credit balance of KSh ${debt.remainingAmount.toLocaleString()} for the fresh produce purchase recorded on ${new Date(debt.timestamp).toLocaleDateString()}.`,
      `Kindly clear this balance by the due date: *${new Date(debt.dueDate).toLocaleDateString()}*.`,
      `You can pay via Cash or our M-Pesa Till number.`,
      `Thank you and have a great day!`
    ];

    const text = encodeURIComponent(lines.join('\n'));
    return `https://api.whatsapp.com/send?phone=${phoneNum}&text=${text}`;
  };

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Overview Card */}
      <div className="bg-slate-900/40 p-4 rounded-xl flex items-center justify-between border border-slate-900">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
            Overall Credit Exposure
          </span>
          <h2 id="overall-debt-count" className="text-xl font-black text-rose-450 font-mono mt-1">KSh {totalOutstandingCredit.toLocaleString()}</h2>
          <p className="text-[9.5px] text-slate-400 mt-1">
            {activeDebtsList.length} unresolved credit balance columns
          </p>
        </div>

        <TrendingDown className="h-10 w-10 text-rose-500/20" />
      </div>

      {/* Partial Refunding payment Form */}
      {activeRepayDebt && (
        <form onSubmit={handleRepaySubmit} className="bg-slate-900/40 border border-emerald-555/20 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-355 uppercase tracking-widest border-b border-slate-950 pb-2 flex items-center gap-1">
            <Coins className="h-4 w-4 text-emerald-450" />
            Apply Payment: {activeRepayDebt.customerName}
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10.5px] bg-slate-955 p-2 rounded border border-slate-900">
              <span className="text-slate-400">Remaining Balance:</span>
              <span className="font-bold text-rose-450 font-mono">KSh {activeRepayDebt.remainingAmount}</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Repay Amount (KSh)</label>
              <input 
                id="repay-amount-input"
                type="number" 
                max={activeRepayDebt.remainingAmount}
                placeholder={activeRepayDebt.remainingAmount.toString()}
                value={repayAmount || ''}
                onChange={(e) => setRepayAmount(Math.min(activeRepayDebt.remainingAmount, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Pay Method</label>
                <select 
                  id="repay-method-select"
                  value={repayMethod}
                  onChange={(e: any) => setRepayMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="CASH">CASH</option>
                  <option value="MPESA">M-PESA / TILL</option>
                </select>
              </div>

              {repayMethod === 'MPESA' && (
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">M-Pesa Code</label>
                  <input 
                    id="repay-mpesa-code-input"
                    type="text" 
                    placeholder="QRF612..."
                    value={repayMpesaCode}
                    onChange={(e) => setRepayMpesaCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-950">
            <button 
              type="button" 
              onClick={() => setActiveRepayDebt(null)} 
              className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 font-bold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Cancel
            </button>
            <button 
              id="submit-repayment-btn"
              type="submit" 
              className="px-4 py-2 bg-emerald-600 font-bold text-white rounded-lg uppercase tracking-wide cursor-pointer hover:bg-emerald-555"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Apply Repayment
            </button>
          </div>
        </form>
      )}

      {/* Credit rows lists */}
      <div className="space-y-3">
        {activeDebtsList.length === 0 ? (
          <p className="text-center text-slate-500 py-10 font-medium">
            🎉 Zero outstanding customer debts. Excellent!
          </p>
        ) : (
          activeDebtsList.map(debt => {
            const isOverdue = new Date(debt.dueDate) < new Date();
            return (
              <div key={debt.id} className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-black tracking-wide bg-slate-955 border border-slate-850 px-1.5 py-0.5 rounded-md uppercase">
                      ID: {debt.id}
                    </span>
                    <h4 className="text-xs font-bold text-white pt-1">{debt.customerName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Acquired: {new Date(debt.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-slate-550 uppercase font-black text-slate-450">Pending Sum</span>
                    <span className="text-sm font-black text-rose-400 font-mono">KSh {debt.remainingAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Due dates progress indicators */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-900/80 text-[11px] items-center">
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Due by: <span className="font-bold text-slate-350">{debt.dueDate}</span></span>
                  </div>

                  <div className="text-right">
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-rose-955/35 text-rose-450 font-black rounded px-1.5 py-0.5 border border-rose-900/40 animate-pulse">
                        <AlertCircle className="h-3 w-3" />
                        OVERDUE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-950/30 text-emerald-450 font-bold rounded px-1.5 py-0.5 border border-emerald-900/20">
                        <Clock className="h-3 w-3" />
                        PENDING
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick collect payload triggers and remind templates dispatchers */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-950">
                  <a 
                    id={`remind-debt-btn-${debt.id}`}
                    href={getWhatsAppReminderURI(debt)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="py-1.5 bg-slate-900 hover:bg-slate-850 text-sky-400 font-bold rounded-lg border border-slate-850 flex items-center justify-center gap-1 uppercase text-[10px] transition cursor-pointer"
                  >
                    <MessageSquareShare className="h-3 w-3 text-sky-500" />
                    <span>Send Reminder</span>
                  </a>

                  <button 
                    id={`pay-debt-action-${debt.id}`}
                    onClick={() => { setActiveRepayDebt(debt); setRepayAmount(debt.remainingAmount); }}
                    className="py-1.5 bg-emerald-600 hover:bg-emerald-555 font-black text-white rounded-lg uppercase tracking-wide flex items-center justify-center gap-1 text-[10.5px] transition cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Apply Refund</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
