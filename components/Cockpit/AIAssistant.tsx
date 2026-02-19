import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button } from '../ui/BaseComponents';
import { Message, DroneTelemetry, DeliveryOrder } from '../../types';
import { getMissionAdvice } from '../../services/geminiService';
import { Send, Bot, Loader2, Terminal } from 'lucide-react';

interface AIAssistantProps {
  telemetry: DroneTelemetry;
  activeOrder: DeliveryOrder | null;
  logs: string[];
  onCommand: (command: string, args: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ telemetry, activeOrder, logs, onCommand }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: 'Logistics Link Established. Ready to manage delivery manifest.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getMissionAdvice(userMsg.text, telemetry, activeOrder, logs);

      // Handle Text Response
      if (response.text) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: response.text,
          timestamp: new Date()
        }]);
      }

      // Handle Function Calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        response.functionCalls.forEach(call => {
          setMessages(prev => [...prev, {
            id: `cmd-${Date.now()}-${Math.random()}`,
            sender: 'system',
            text: `EXECUTING: ${call.name.toUpperCase()}`,
            timestamp: new Date()
          }]);
          onCommand(call.name, call.args);
        });
      }

    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'system',
        text: 'Error connecting to Logistics Control.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden bg-slate-900/95 border-emerald-500/20 shadow-emerald-900/10">
      <div className="p-3 border-b border-slate-700 bg-slate-900 flex items-center gap-2">
        <Bot className="w-4 h-4 text-emerald-500" />
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Logistics AI</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' 
                : msg.sender === 'system'
                  ? 'bg-slate-950 text-amber-400 font-mono border border-amber-500/10'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
               <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700 bg-slate-900 flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about delivery status..."
          className="bg-slate-950 border-slate-700 text-xs h-9"
        />
        <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} variant="primary" className="h-9 w-9">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};