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
    <div className="flex flex-col space-y-4 pb-20 px-4 font-sans bg-[#F7F8FA]">
      {/* View Header */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-medium text-[#1A1A2E] flex items-center justify-center gap-2 font-sans">
          <Plane className="w-5.5 h-5.5 rotate-45" style={{color: '#1B4F72'}} />
          <span>এয়ার টিকেট সেবা</span>
        </h2>
        <p className="text-xs text-[#6B7280] mt-1">সবচেয়ে কম মূল্যে ঢাকা-সিলেট-চট্টগ্রাম বিমান টিকেট অনুরোধ দিন</p>
      </div>

      {/* Fraud Warning Banner */}
      <div className="p-4 rounded-xl bg-[#FEF3CD] border flex items-start gap-3" style={{borderColor:'#F5A623', borderWidth:'0.5px'}}>
        <AlertTriangle className="w-5.5 h-5.5 shrink-0 mt-0.5" style={{color: '#F5A623'}} />
        <div>
          <h4 className="font-medium text-[#7D5000] text-xs mb-1">দালাল ও ভুয়া এজেন্ট হতে সাবধান থাকুন</h4>
          <p className="text-[#7D5000] text-[10px] leading-relaxed">পিডিএফ এডিট করে ভুয়া পিন বা ভুয়া টিকিট দেওয়ার প্রচুর স্ক্যাম হচ্ছে ভাই! টাকা দেওয়ার আগে অবশ্যই নিচের ভেরিফিকেশন বক্সে পিএনআর কোড দিয়ে যাচাই করুন বা আমাদের এজেন্টকে জানান।</p>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-white rounded-2xl p-5 border space-y-4" style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
        <h3 className="text-sm font-medium text-[#1B4F72] pb-2 border-b" style={{borderColor:'#E5E7EB'}}>
          নতুন টিকিট বুকিং অনুরোধ (Flight Request)
        </h3>

        <form onSubmit={handleBookingSubmit} className="space-y-3">
          {/* Route Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">কোথাকার ফ্লাইং (From):</label>
              <select
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#1B4F72]"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              >
                <option value="Phnom Penh (PNH)">Phnom Penh (Phnom Penh)</option>
                <option value="Siem Reap (REP)">Siem Reap (Siem Reap)</option>
                <option value="Dhaka (DAC)">Dhaka (Dhaka)</option>
                <option value="Chittagong (CGP)">Chittagong (Chittagong)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">যাবেন কোথায় (To):</label>
              <select
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#1B4F72]"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              >
                <option value="Dhaka (DAC)">Dhaka (Bangladesh)</option>
                <option value="Chittagong (CGP)">Chittagong (Bangladesh)</option>
                <option value="Sylhet (ZYL)">Sylhet (Bangladesh)</option>
                <option value="Phnom Penh (PNH)">Phnom Penh (Cambodia)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">যাত্রার তারিখ (Date):</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#1B4F72]"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B7280] font-medium mb-1">যাত্রী সংখ্যা (Passengers):</label>
              <input
                type="number"
                min={1}
                max={9}
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#1B4F72]"
                style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#6B7280] font-medium mb-1">যাত্রীর পূর্ণ নাম (Passport Name):</label>
            <input
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="পাসপোর্ট অনুযায়ী ইংরেজিতে লিখুন"
              className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#1B4F72]"
              style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#6B7280] font-medium mb-1">মোবাইল নম্বর (Phone NO):</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: +855 1234 5678"
              className="w-full bg-[#F9FAFB] text-[#1A1A2E] rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#1B4F72]"
              style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}
            />
          </div>

          <a
            href="https://wa.me/855762012121?text=আমি%20একটি%20এয়ার%20টিকেট%20বুকিং%20করতে%20চাই"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <span>WhatsApp-এ টিকেট অনুরোধ করুন</span>
          </a>
        </form>
      </div>

      {/* Trusted airlines section */}
      <div className="bg-white rounded-2xl p-4 border" style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
        <p className="text-sm font-medium text-[#1A1A2E] mb-3">কম্বোডিয়া → বাংলাদেশ বিশ্বস্ত এয়ারলাইন্স</p>
        <div className="space-y-2">
          {[
            {name:'Thai Airways', route:'PNH → DAC (Bangkok হয়ে)', url:'https://www.thaiairways.com'},
            {name:'AirAsia', route:'PNH → DAC (KL হয়ে)', url:'https://www.airasia.com'},
            {name:'Vietnam Airlines', route:'PNH → DAC (Hanoi হয়ে)', url:'https://www.vietnamairlines.com'},
            {name:'Biman Bangladesh', route:'DAC → PNH (Direct)', url:'https://www.biman-airlines.com'},
          ].map((airline, i) => (
            <a key={i} href={airline.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-xl border" 
              style={{borderColor:'#E5E7EB', borderWidth:'0.5px'}}>
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">{airline.name}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{airline.route}</p>
              </div>
              <span className="text-[11px] text-[#1B4F72]">Official Site →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
