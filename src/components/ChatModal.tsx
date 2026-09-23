import React, { useState } from 'react';
import type { ChatMessage, DeliveryRequest } from '../types';
import { X, Send, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { EmirateBadge } from './EmirateBadge';

interface ChatModalProps {
  request: DeliveryRequest;
  messages: ChatMessage[];
  currentUserId?: string;
  currentUserRole: 'customer' | 'driver';
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  request,
  messages,
  currentUserId: _currentUserId,
  currentUserRole,
  onSendMessage,
  onClose
}) => {
  const [text, setText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const otherPersonName = currentUserRole === 'customer'
    ? (request.offers.find(o => o.id === request.selectedOfferId)?.driverName || 'السائق')
    : request.customerName;

  const otherPersonPhone = currentUserRole === 'customer'
    ? (request.offers.find(o => o.id === request.selectedOfferId)?.driverPhone || '+971 50 123 4567')
    : request.customerPhone;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full h-[92dvh] sm:h-[600px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-950 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Chat Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>المحادثة مع {otherPersonName}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> آمن
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 truncate max-w-[160px] sm:max-w-xs">{request.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${otherPersonPhone}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors active:scale-95"
              title="اتصال هاتفي"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Route Info Strip */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
            <span className="text-slate-500">⬅️</span>
            <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
          </div>
          <div className="font-bold text-cyan-400">
            {request.offers.find(o => o.id === request.selectedOfferId)?.price || 150} AED
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-900/50 overscroll-contain touch-pan-y">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <MessageSquare className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="font-semibold text-xs sm:text-sm text-white">بدء المحادثة المباشرة</p>
              <p className="text-[11px] text-slate-400 mt-1">نسّق مكان الاستلام والتفاصيل مع السائق مباشرة.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[9px] text-slate-400 mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-tr-none shadow-md shadow-blue-500/10'
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95"
          >
            <span>إرسال</span>
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>

      </div>
    </div>
  );
};
