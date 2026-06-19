import React, { useState } from "react";
import { Plane, AlertTriangle } from "lucide-react";

export default function AirTicket() {
  const [routeFrom, setRouteFrom] = useState("Phnom Penh (PNH)");
  const [routeTo, setRouteTo] = useState("Dhaka (DAC)");
  const [date, setDate] = useState("");
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Submit manual booking request
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !phone || !date) {
      alert("দয়া করে নাম, মোবাইল নম্বর এবং যাত্রার তারিখ দিন ভাই।");
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setPassengerName("");
      setPhone("");
      setDate("");
      alert("টিকিট অনুরোধ সফলভাবে পাঠানো হয়েছে ভাই! আমাদের ট্রাভেল পার্টনার ৩০ মিনিটের মধ্যে কল দিয়ে আপনার বুকিং সম্পন্ন করবেন।");
    }, 1500);
  };

  return (
    <div className="flex flex-col space-y-4 px-4 font-sans bg-[#F0F4F8] min-h-screen text-[#1A1A2E]" style={{ paddingBottom: "80px" }}>
      {/* View Header */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-medium text-[#1A1A2E] flex items-center justify-center gap-2 font-sans">
          <Plane className="w-5.5 h-5.5 rotate-45 text-[#1B4F72]" />
          <span>এয়ার টিকেট সেবা</span>
        </h2>
        <p className="text-xs text-[#6B7280] mt-1 font-sans">সবচেয়ে কম মূল্যে ঢাকা-সিলেট-চট্টগ্রাম বিমান টিকেট অনুরোধ দিন</p>
      </div>

      {/* Fraud Warning Banner */}
      <div className="p-4 rounded-xl bg-[#FDEDEC] border flex items-start gap-3" style={{borderColor:'#E74C3C', borderWidth:'0.5px'}}>
        <AlertTriangle className="w-5.5 h-5.5 shrink-0 mt-0.5 text-[#E74C3C]" />
        <div className="text-left">
          <h4 className="font-semibold text-[#E74C3C] text-[12px] mb-1 font-sans">দালাল ও ভুয়া এজেন্ট হতে সাবধান থাকুন</h4>
          <p className="text-[#E74C3C] text-[11px] leading-relaxed font-sans">পিডিএফ এডিট করে ভুয়া পিন বা ভুয়া টিকিট দেওয়ার প্রচুর স্ক্যাম হচ্ছে ভাই! টাকা দেওয়ার আগে অবশ্যই নিচের ভেরিফিকেশন বক্সে পিএনআর কোড দিয়ে যাচাই করুন বা আমাদের এজেন্টকে জানান।</p>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-white rounded-2xl p-5 border space-y-4 text-left" style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
        <h3 className="text-[13px] font-medium text-[#1B4F72] pb-2 border-b font-sans" style={{borderColor:'#E5E7EB', borderBottomWidth: '0.5px'}}>
          নতুন টিকিট বুকিং অনুরোধ (Flight Request)
        </h3>

        <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
          {/* Route Selector */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="text-left">
              <label className="block text-[12px] text-[#6B7280] font-medium mb-1 font-sans">কোথাকার ফ্লাইং (From):</label>
              <select
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                className="w-full h-12 bg-white text-[#1A1A2E] rounded-xl px-3 text-[13px] border focus:outline-none focus:border-[#1B4F72] font-sans"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              >
                <option value="Phnom Penh (PNH)">Phnom Penh (PNH)</option>
                <option value="Siem Reap (REP)">Siem Reap (REP)</option>
                <option value="Dhaka (DAC)">Dhaka (DAC)</option>
                <option value="Chittagong (CGP)">Chittagong (CGP)</option>
              </select>
            </div>

            <div className="text-left">
              <label className="block text-[12px] text-[#6B7280] font-medium mb-1 font-sans">যাবেন কোথায় (To):</label>
              <select
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                className="w-full h-12 bg-white text-[#1A1A2E] rounded-xl px-3 text-[13px] border focus:outline-none focus:border-[#1B4F72] font-sans"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              >
                <option value="Dhaka (DAC)">Dhaka (DAC)</option>
                <option value="Chittagong (CGP)">Chittagong (CGP)</option>
                <option value="Sylhet (ZYL)">Sylhet (ZYL)</option>
                <option value="Phnom Penh (PNH)">Phnom Penh (PNH)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="text-left">
              <label className="block text-[12px] text-[#6B7280] font-medium mb-1 font-sans">যাত্রার তারিখ (Date):</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 bg-white text-[#1A1A2E] rounded-xl px-3 text-[13px] border focus:outline-none focus:border-[#1B4F72] font-sans"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              />
            </div>

            <div className="text-left">
              <label className="block text-[12px] text-[#6B7280] font-medium mb-1 font-sans">যাত্রী সংখ্যা (Passengers):</label>
              <input
                type="number"
                min={1}
                max={9}
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                className="w-full h-12 bg-white text-[#1A1A2E] rounded-xl px-3 text-[13px] border focus:outline-none focus:border-[#1B4F72] font-sans"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-[12px] text-[#6B7280] font-medium mb-1 font-sans">যাত্রীর পূর্ণ নাম (Passport Name):</label>
            <input
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="পাসপোর্ট অনুযায়ী ইংরেজিতে লিখুন"
              className="w-full h-12 bg-white text-[#1A1A2E] rounded-xl px-3 text-[13px] border focus:outline-none focus:border-[#1B4F72] font-sans"
              style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
            />
          </div>

          <div className="text-left">
            <label className="block text-[12px] text-[#6B7280] font-medium mb-1 font-sans">মোবাইল নম্বর (Phone NO):</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: +855 1234 5678"
              className="w-full h-12 bg-white text-[#1A1A2E] rounded-xl px-3 text-[13px] border focus:outline-none focus:border-[#1B4F72] font-sans"
              style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
            />
          </div>

          <a
            href="https://wa.me/855762012121?text=আমি%20একটি%20এয়ার%20টিকেট%20বুকিং%20করতে%20চাই"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 bg-[#1D9E75] text-white font-medium text-[13px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-opacity-95"
          >
            <span>WhatsApp-এ টিকেট অনুরোধ করুন</span>
          </a>
        </form>
      </div>

      {/* Trusted airlines section */}
      <div className="bg-white rounded-2xl p-4 border text-left font-sans" style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
        <p className="text-[13px] font-medium text-[#1A1A2E] mb-3 text-left">কম্বোডিয়া → বাংলাদেশ বিশ্বস্ত এয়ারলাইন্স</p>
        <div className="space-y-2">
          {[
            {name:'Thai Airways', route:'PNH → DAC (Bangkok হয়ে)', url:'https://www.thaiairways.com'},
            {name:'AirAsia', route:'PNH → DAC (KL হয়ে)', url:'https://www.airasia.com'},
            {name:'Vietnam Airlines', route:'PNH → DAC (Hanoi হয়ে)', url:'https://www.vietnamairlines.com'},
            {name:'Biman Bangladesh', route:'DAC → PNH (Direct)', url:'https://www.biman-airlines.com'},
          ].map((airline, i) => (
            <a key={i} href={airline.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 bg-[#F0F4F8] hover:bg-[#E5E7EB] rounded-xl border cursor-pointer transition-colors" 
              style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
              <div className="text-left font-sans">
                <p className="text-[13px] font-medium text-[#1A1A2E]">{airline.name}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{airline.route}</p>
              </div>
              <span className="text-[12px] text-[#1B4F72] font-medium font-sans">Official Site →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
