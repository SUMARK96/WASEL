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
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-xl w-full h-[92dvh] sm:h-[600px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Chat Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#142F52] text-xs sm:text-sm flex items-center gap-1.5">
                <span>المحادثة مع {otherPersonName}</span>
                <span className="text-[10px] bg-[#EAF6F1] text-[#159B7A] px-2 py-0.5 rounded-full border border-[#159B7A]/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#159B7A]" /> آمن
                </span>
              </h3>
              <p className="text-[10px] text-[#64748B] truncate max-w-[160px] sm:max-w-xs">{request.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${otherPersonPhone}`}
              className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#159B7A] border border-[#E5EDF3] transition-colors active:scale-95"
              title="اتصال هاتفي"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Route Info Strip */}
        <div className="bg-[#EEF4FA] px-4 sm:px-6 py-2 border-b border-[#E5EDF3] flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
            <span className="text-[#94A3B8]">⬅️</span>
            <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
          </div>
          <div className="font-bold text-[#159B7A]">
            {request.offers.find(o => o.id === request.selectedOfferId)?.price || 150} AED
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F5F9FC] overscroll-contain touch-pan-y">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#64748B] p-6">
              <MessageSquare className="w-10 h-10 text-[#94A3B8] mb-2 stroke-[1.5]" />
              <p className="font-semibold text-xs sm:text-sm text-[#142F52]">بدء المحادثة المباشرة</p>
              <p className="text-[11px] text-[#64748B] mt-1">نسّق مكان الاستلام والتفاصيل مع السائق مباشرة.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[9px] text-[#94A3B8] mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#159B7A] text-white font-semibold rounded-tr-none shadow-xs'
                        : 'bg-white text-[#142F52] rounded-tl-none border border-[#E5EDF3] shadow-xs'
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
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-[#E5EDF3] flex gap-2 shrink-0">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#142F52] placeholder-[#94A3B8] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#159B7A] hover:bg-[#108466] text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>إرسال</span>
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>

      </div>
    </div>
  );
};
