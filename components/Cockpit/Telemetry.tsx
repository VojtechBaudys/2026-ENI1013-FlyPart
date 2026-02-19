import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, Badge } from '../ui/BaseComponents';
import { DroneTelemetry } from '../../types';
import { Battery, Signal, Activity } from 'lucide-react';

interface TelemetryProps {
  data: DroneTelemetry;
  history: { time: string; altitude: number; speed: number }[];
}

export const Telemetry: React.FC<TelemetryProps> = ({ data, history }) => {
  return (
    <Card className="p-4 w-full h-72 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Live Telemetry
        </h3>
        <Badge variant={data.battery < 20 ? 'danger' : 'success'}>
          {data.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 uppercase">Altitude</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-white">{data.altitude.toFixed(1)}</span>
            <span className="text-xs text-slate-400">m</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 uppercase">Speed</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-white">{data.speed.toFixed(1)}</span>
            <span className="text-xs text-slate-400">km/h</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 uppercase">Battery</span>
          <div className="flex items-center gap-2">
            <Battery className={`w-4 h-4 ${data.battery < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
            <span className="text-lg font-mono font-bold text-white">{data.battery.toFixed(2)}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 uppercase">Signal</span>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-blue-500" />
            <span className="text-lg font-mono font-bold text-white">{data.signalStrength}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace' }}
            />
            <Area type="monotone" dataKey="altitude" stroke="#10b981" fillOpacity={1} fill="url(#colorAlt)" strokeWidth={2} />
            <Area type="monotone" dataKey="speed" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-2 border-t border-slate-700 flex justify-between text-xs font-mono text-slate-500">
        <span>HDG: {data.heading.toFixed(0)}°</span>
        <span>SAT: {data.satelliteCount}</span>
      </div>
    </Card>
  );
};