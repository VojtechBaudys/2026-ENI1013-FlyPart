import React from 'react';
import { Card, Badge } from '../ui/BaseComponents';
import { Drone } from '../../types';
import { Disc, Battery, Signal, ArrowUpRight } from 'lucide-react';

interface DroneListProps {
  drones: Drone[];
  selectedDroneId: string;
  onSelectDrone: (id: string) => void;
}

export const DroneList: React.FC<DroneListProps> = ({ drones, selectedDroneId, onSelectDrone }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden bg-slate-900/95 border-slate-700">
      <div className="p-3 border-b border-slate-700 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Disc className="w-4 h-4 text-emerald-500 animate-spin-slow" />
           <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Fleet (8)</h3>
        </div>
        <Badge variant="success">ONLINE</Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800 text-[10px] uppercase text-slate-500 font-bold sticky top-0 z-10">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Bat</th>
              <th className="p-3 text-right">Alt</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {drones.map(drone => {
              const isSelected = drone.id === selectedDroneId;
              const statusColor = drone.telemetry.status === 'IDLE_AT_BASE' ? 'text-slate-400' 
                                : drone.telemetry.status === 'RETURNING_TO_BASE' ? 'text-blue-400'
                                : 'text-emerald-400';

              return (
                <tr 
                  key={drone.id}
                  onClick={() => onSelectDrone(drone.id)}
                  className={`
                    border-b border-slate-800 cursor-pointer transition-colors
                    ${isSelected ? 'bg-emerald-900/20 hover:bg-emerald-900/30' : 'hover:bg-slate-800'}
                  `}
                >
                  <td className="p-3 font-bold text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                      {drone.label}
                    </div>
                  </td>
                  <td className={`p-3 ${statusColor}`}>
                     {drone.telemetry.status === 'EN_ROUTE_TO_SITE' ? 'EN ROUTE' : drone.telemetry.status.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Battery className={`w-3 h-3 ${drone.telemetry.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
                      {drone.telemetry.battery.toFixed(0)}%
                    </div>
                  </td>
                  <td className="p-3 text-right text-slate-400">
                    {drone.telemetry.altitude.toFixed(0)}m
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};