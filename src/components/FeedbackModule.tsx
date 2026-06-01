/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomerFeedback } from '../types';
import { 
  MessageSquare, 
  PlusCircle, 
  Star, 
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Check
} from 'lucide-react';

interface FeedbackProps {
  feedbacks: CustomerFeedback[];
  onAddFeedback: (feedbackData: any) => Promise<any>;
  onResolveFeedback: (id: string, note: string) => Promise<any>;
}

export default function FeedbackModule({
  feedbacks,
  onAddFeedback,
  onResolveFeedback
}: FeedbackProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeResolvingId, setActiveResolvingId] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'COMPLAINT' | 'SUGGESTION' | 'PRAISE' | 'QUALITY_ISSUE'>('SUGGESTION');
  const [message, setMessage] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !message) return;
    try {
      await onAddFeedback({ customerName, customerPhone, rating, category, message });
      setCustomerName('');
      setCustomerPhone('');
      setRating(5);
      setMessage('');
      setShowAddForm(false);
    } catch (err) {
      alert("Error logging customer voice");
    }
  };

  const submitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResolvingId || !resolutionNote) return;
    try {
      await onResolveFeedback(activeResolvingId, resolutionNote);
      setActiveResolvingId(null);
      setResolutionNote('');
    } catch (err) {
      alert("Error updating resolution status");
    }
  };

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            Customer Feedback
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">
            Quality Assurance and Suggestions
          </span>
        </div>

        <button 
          id="add-feedback-toggle"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-2.5 py-1.5 bg-emerald-950 text-emerald-305 text-[10px] font-bold rounded-lg border border-emerald-900/40 flex items-center gap-1 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{showAddForm ? 'Close' : 'Add feedback'}</span>
        </button>
      </div>

      {/* Creation form */}
      {showAddForm && (
        <form onSubmit={submitFeedback} className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3 font-semibold">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest border-b border-slate-950 pb-2">
            Submit Customer Suggestion or Complaint
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Customer Name</label>
              <input 
                id="feedback-name"
                type="text" 
                placeholder="Rachel Mbeyu"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Phone Contact</label>
                <input 
                  id="feedback-phone"
                  type="text" 
                  placeholder="+254 755 000 000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                <select 
                  id="feedback-category"
                  value={category} 
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="SUGGESTION">Suggestion / Product Request</option>
                  <option value="COMPLAINT">Complaint / Payment Issue</option>
                  <option value="QUALITY_ISSUE">Product Quality Issue</option>
                  <option value="PRAISE">General Compliment</option>
                </select>
              </div>
            </div>

            {/* Stars Selector */}
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Quality Experience Star Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`h-5 w-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Feedback Message Details</label>
              <textarea 
                id="feedback-message"
                placeholder="Details of complaint or request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-950">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 font-bold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Cancel
            </button>
            <button 
              id="submit-feedback-btn"
              type="submit" 
              className="px-4 py-2 bg-emerald-600 font-bold text-white rounded-lg uppercase tracking-wide cursor-pointer hover:bg-emerald-555"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Publish Feedback
            </button>
          </div>
        </form>
      )}

      {/* Admin Resolving Form modal inline */}
      {activeResolvingId && (
        <form onSubmit={submitResolve} className="bg-slate-905 border border-amber-500/25 p-4 rounded-xl space-y-3 font-semibold">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 select-none">
            <UserCheck className="h-4 w-4 animate-bounce" />
            Resolve Client Issue #{activeResolvingId}
          </h3>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Enter Actions Taken (Resolution message)</label>
            <textarea 
              id="resolution-note-field"
              placeholder="e.g. Contacted Rachel, refunded ruined onions. Arranged fresh supply lines with Mtwapa farmers."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white h-20 resize-none focus:outline-none focus:border-emerald-555"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button 
              type="button" 
              onClick={() => setActiveResolvingId(null)} 
              className="px-3 py-1.5 bg-slate-950 border border-slate-850 text-slate-400 font-bold rounded-md"
            >
              Cancel
            </button>
            <button 
              id="submit-resolution-btn"
              type="submit" 
              className="px-3 py-1.5 bg-emerald-600 font-black text-white rounded-md uppercase tracking-wide hover:bg-emerald-555 cursor-pointer"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Complete Resolve Action
            </button>
          </div>
        </form>
      )}

      {/* Feedbacks list timeline */}
      <div className="space-y-3">
        {feedbacks.map(f => (
          <div key={f.id} className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl space-y-2.5">
            <div className="flex justify-between items-start select-none">
              <div>
                <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded border ${
                  f.category === 'COMPLAINT' ? 'bg-rose-950/20 text-rose-400 border-rose-900/40' :
                  f.category === 'QUALITY_ISSUE' ? 'bg-yellow-950/20 text-yellow-500 border-yellow-905/40' : 'bg-slate-950 text-slate-400 border-slate-850'
                }`}>
                  {f.category}
                </span>

                <h4 className="text-xs font-bold text-white pt-1">{f.customerName}</h4>
                <p className="text-[10px] text-slate-505 font-mono leading-none">{f.customerPhone || 'Anonymous contact'}</p>
              </div>

              {/* Stars layout visual representation */}
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < f.rating ? 'fill-amber-400' : 'text-slate-800'}`} />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300 italic bg-slate-950/20 p-2.5 rounded border border-slate-900/50">
              “{f.message}”
            </p>

            {/* If resolved render note, else render action triggers */}
            {f.status === 'RESOLVED' ? (
              <div className="bg-emerald-950/15 border border-emerald-900/20 p-2.5 rounded-lg text-[10.5px] text-slate-450 leading-relaxed font-sans mt-2">
                <div className="flex items-center gap-1 font-bold text-emerald-450 text-[10px]">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>RESOLVED SYSTEM STATUS ACTION:</span>
                </div>
                <p className="italic mt-1">“{f.resolutionNote}”</p>
              </div>
            ) : (
              <div className="flex justify-between items-center text-[10.5px] pt-1 select-none">
                <span className="text-rose-400 font-bold animate-pulse flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Awaiting Operator Resolve
                </span>
                
                <button 
                  id={`action-resolve-${f.id}`}
                  onClick={() => { setActiveResolvingId(f.id); setResolutionNote(''); }}
                  className="px-2 py-1 bg-emerald-950 text-emerald-355 border border-emerald-900 text-[10.5px] font-black hover:bg-slate-800 rounded transition cursor-pointer"
                >
                  Resolve Issue
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
