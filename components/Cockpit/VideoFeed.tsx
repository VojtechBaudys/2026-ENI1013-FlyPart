import React from 'react';
import { Card, Button } from '../ui/BaseComponents';
import { Camera, Maximize2, Crosshair } from 'lucide-react';

interface VideoFeedProps {
  isRecording: boolean;
  onToggleRecord: () => void;
  droneId: string;
}

// Collection of working stock drone footage
const DRONE_FEEDS = [
  "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4", // Aerial City
  "https://videos.pexels.com/video-files/4427818/4427818-hd_1920_1080_24fps.mp4", // Construction/Industrial
  "https://videos.pexels.com/video-files/2048256/2048256-hd_1920_1080_30fps.mp4", // Suburban
  "https://videos.pexels.com/video-files/4483569/4483569-hd_1920_1080_25fps.mp4", // Warehouse/Interior
  "https://videos.pexels.com/video-files/3195648/3195648-uhd_2560_1440_25fps.mp4", // Forest/Road
  "https://videos.pexels.com/video-files/2834289/2834289-hd_1920_1080_30fps.mp4"  // Park
];

export const VideoFeed: React.FC<VideoFeedProps> = ({ isRecording, onToggleRecord, droneId }) => {
  // Select video based on Drone ID (Simple Hashing)
  const feedIndex = React.useMemo(() => {
    // Extract number from "FP-101" -> 101
    const idNum = parseInt(droneId.replace('FP-', '')) || 0;
    return idNum % DRONE_FEEDS.length;
  }, [droneId]);

  const videoSrc = DRONE_FEEDS[feedIndex];

  return (
    <Card className="relative overflow-hidden group border-slate-700 bg-black aspect-video flex flex-col">
      {/* Simulated Video Source */}
      <div className="absolute inset-0">
        <video 
          key={videoSrc} // Force reload when src changes
          className="w-full h-full object-cover opacity-90"
          autoPlay
          loop
          muted
          playsInline
          src={videoSrc}
        />
        {/* Grain/Scanline Overlay */}
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Scanlines_gradient.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
             <div className="bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                LIVE
             </div>
             {isRecording && (
               <div className="bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                 <span>REC</span>
                 <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
               </div>
             )}
          </div>
          <div className="text-white/80 font-mono text-xs">
            CAM_01 [4K] :: {droneId}
          </div>
        </div>

        {/* Crosshair Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">
          <Crosshair className="w-12 h-12 text-white/60" strokeWidth={1} />
        </div>

        <div className="flex justify-between items-end">
          <div className="text-white/60 font-mono text-[10px]">
            ISO 400 <br/>
            1/2000 <br/>
            f/2.8
          </div>
          <div className="text-white/60 font-mono text-[10px] text-right">
             LAT: 53.377<br/>
             LNG: -6.268
          </div>
        </div>
      </div>

      {/* Controls Overlay (appears on hover) */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
        <Button 
          size="icon" 
          variant={isRecording ? 'danger' : 'secondary'} 
          onClick={onToggleRecord}
          className="bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
        >
          <Camera className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          className="bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};