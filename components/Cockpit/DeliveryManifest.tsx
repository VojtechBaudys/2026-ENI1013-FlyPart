import React from 'react';
import { Card, Badge, Button } from '../ui/BaseComponents';
import { DeliveryOrder } from '../../types';
import { MapPin, User, Clock, Wrench, LandPlot } from 'lucide-react';

interface DeliveryManifestProps {
  order: DeliveryOrder | null;
  availableOrders: DeliveryOrder[];
  status: string;
  eta: string | null;
}

export const DeliveryManifest: React.FC<DeliveryManifestProps> = ({ order, availableOrders, status, eta }) => {
  if (!order) {
    return (
      <Card className="p-4 flex flex-col gap-4 bg-slate-900/95 border-blue-900/30">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
          <Wrench className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Trade Requests</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px]">
          {availableOrders.map((o) => (
            <div key={o.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   {/* Location Type Indicator - Matches Map Icons */}
                   {o.locationType === 'KNOWN_PAD' ? (
                     <div title="Verified Landing Pad" className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-cyan-950 border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.15)] transition-all">
                       <LandPlot className="w-3 h-3 text-cyan-400" />
                       <span className="text-[10px] font-bold text-cyan-400 tracking-wider">PAD</span>
                     </div>
                   ) : (
                     <div title="On-Site Delivery" className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-950 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)] transition-all">
                       <MapPin className="w-3 h-3 text-amber-500" />
                       <span className="text-[10px] font-bold text-amber-500 tracking-wider">SITE</span>
                     </div>
                   )}
                   <span className="text-[10px] text-slate-500 font-mono">{o.id}</span>
                </div>
              </div>
              <div className="text-sm font-bold text-white mb-1">{o.item}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                <span className="text-slate-500">To:</span> {o.locationName}
              </div>
              <div className="text-[10px] text-slate-500 italic text-center w-full border-t border-slate-700 pt-1">
                Waiting for 100% Charge
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col gap-4 bg-slate-900/95 border-amber-500/20 shadow-amber-900/10 relative overflow-hidden">
      {/* Progress Bar Background */}
      <div className="absolute top-0 left-0 h-1 bg-amber-600 transition-all duration-1000" style={{ width: status === 'DELIVERING' ? '90%' : status === 'RETURNING_TO_BASE' ? '100%' : '30%' }}></div>

      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Active Delivery
        </h3>
        <span className="font-mono text-xs text-slate-400">{order.id}</span>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold">Item Manifest</span>
          <div className="text-lg font-bold text-white leading-tight">{order.item}</div>
          <div className="text-xs text-slate-400 mt-1">Weight: {order.weight}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-3 p-2 rounded bg-slate-800/50">
            <User className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 uppercase">Tradesperson</div>
              <div className="text-sm text-slate-200">{order.recipient}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-2 rounded bg-slate-800/50">
            {/* Active Order Icon Matching Map Style */}
            {order.locationType === 'KNOWN_PAD' ? (
              <div className="mt-1 w-6 h-6 flex items-center justify-center bg-cyan-950 border border-cyan-400 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                 <LandPlot className="w-3 h-3 text-cyan-400" />
              </div>
            ) : (
              <div className="mt-1 w-6 h-6 flex items-center justify-center bg-amber-950 border border-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                 <MapPin className="w-3 h-3 text-amber-500" />
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 uppercase">
                {order.locationType === 'KNOWN_PAD' ? 'Verified Pad' : 'On-Site Drop'}
              </div>
              <div className="text-sm text-slate-200">{order.locationName}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-slate-500" />
             <span className={`text-xs font-mono font-bold ${eta ? 'text-emerald-400' : 'text-slate-400'}`}>
               ETA: {eta || 'CALCULATING...'}
             </span>
           </div>
           <Badge variant="warning">{status.replace(/_/g, ' ')}</Badge>
        </div>
      </div>
    </Card>
  );
};