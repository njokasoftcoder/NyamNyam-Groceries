/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Send, Check, RefreshCw, Layers } from 'lucide-react';

export default function ApiPlaygroundModule() {
  const [activeRoute, setActiveRoute] = useState<'GET_DB' | 'POST_EXPENSE' | 'POST_STK' | 'POST_FEEDBACK'>('GET_DB');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const routeDetails = {
    GET_DB: {
      method: 'GET',
      url: '/api/db',
      description: 'Fetch complete database snapshot including products, users, sales, debts, feedback logs, and movements.',
      payload: null
    },
    POST_EXPENSE: {
      method: 'POST',
      url: '/api/expenses',
      description: 'Record business cash expenditure outlay. Triggers automatic audit trails.',
      payload: {
        category: 'TRANSPORT',
        description: 'Tuk Tuk transport of 3 cabbage crates from Kongowea Market',
        amount: 350
      }
    },
    POST_STK: {
      method: 'POST',
      url: '/api/mpesa/stkpush',
      description: 'Asynchronously initiate Safaricom Daraja MPesa push message prompt to client.',
      payload: {
        phone: '254712345678',
        amount: 1200,
        saleId: 'sal_optional_90'
      }
    },
    POST_FEEDBACK: {
      method: 'POST',
      url: '/api/feedback',
      description: 'Create customer voice message logs, quality ratings, or requests for supplies.',
      payload: {
        customerName: 'Hamisi Mwadzame',
        customerPhone: '+254 711 222 333',
        rating: 5,
        category: 'SUGGESTION',
        message: 'Tafadhali leteni spinach safi upande wa Likoni.'
      }
    }
  };

  const handleTestCall = async () => {
    setLoading(true);
    setApiResponse(null);

    const specs = routeDetails[activeRoute];
    const options: RequestInit = {
      method: specs.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (specs.payload) {
      options.body = JSON.stringify(specs.payload);
    }

    try {
      const response = await fetch(specs.url, options);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      } else {
        const err = await response.json().catch(() => ({}));
        setApiResponse({ error_status: response.status, body: err });
      }
    } catch (err: any) {
      setApiResponse({ error: 'Network failure or server closed', details: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Title block */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-1 font-mono">
          <Terminal className="h-4 w-4 text-emerald-450" />
          NyamNyam REST API Playgrounds
        </h2>
        <p className="text-[10px] text-slate-505 font-sans leading-relaxed">
          Test live interactive HTTP integrations on-applet against our active custom Express backend. Select routes to fire payload triggers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-900">
        {Object.keys(routeDetails).map(r => (
          <button
            key={r}
            onClick={() => { setActiveRoute(r as any); setApiResponse(null); }}
            className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold font-mono transition whitespace-nowrap uppercase ${
              activeRoute === r ? 'bg-emerald-950 text-emerald-305 border border-emerald-900/40' : 'bg-slate-900 text-slate-450 hover:bg-slate-850'
            }`}
          >
            {routeDetails[r as keyof typeof routeDetails].method} {routeDetails[r as keyof typeof routeDetails].url}
          </button>
        ))}
      </div>

      {/* Active specs card */}
      <div className="bg-slate-900/40 border border-slate-905 p-3.5 rounded-xl space-y-3">
        <div className="space-y-1 select-text">
          <span className="text-[9px] bg-emerald-950 border border-emerald-900/45 px-1.5 py-0.5 text-emerald-305 font-mono rounded font-bold uppercase tracking-wider">
            {routeDetails[activeRoute].method} Endpoints
          </span>
          <h4 className="text-sm font-black text-slate-100 font-mono tracking-wide pt-1">
            {routeDetails[activeRoute].url}
          </h4>
          <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
            {routeDetails[activeRoute].description}
          </p>
        </div>

        {/* Payload preview if required */}
        {routeDetails[activeRoute].payload && (
          <div className="space-y-1">
            <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Trigger Payload Body:</span>
            <pre className="text-[10.5px] font-mono leading-normal text-slate-350 bg-slate-950 p-2 rounded-lg scroll-x max-h-36 overflow-y-auto">
              {JSON.stringify(routeDetails[activeRoute].payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Trigger execution control */}
        <button 
          id="trigger-api-call"
          onClick={handleTestCall}
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 font-bold text-white rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
          <span>{loading ? 'Transmitting...' : 'FIRE LIVE REQUEST'}</span>
        </button>
      </div>

      {/* Output JSON Response block */}
      {apiResponse && (
        <div className="bg-slate-905 border border-emerald-500/20 rounded-xl p-3.5 space-y-2 select-text">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="font-mono text-[9.5px] text-emerald-400 font-bold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              HTTP RESPONSIVE CODE 200 (Success)
            </span>
            <span className="text-[9px] text-slate-550 font-bold uppercase">JSON schema payload</span>
          </div>

          <pre id="api-response-block" className="text-[10px] font-mono leading-relaxed text-emerald-305 max-h-60 overflow-y-auto overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
