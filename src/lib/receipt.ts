import { Transaction } from "../types";

// BENGALI TIME FORMAT function:
const formatBengaliTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? 'সকাল' : hours < 17 ? 'দুপুর' : hours < 20 ? 'বিকাল' : 'রাত';
  const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${period} ${h}:${minutes} টা`;
};

// BENGALI DATE FORMAT function:
const formatBengaliDate = (date: Date) => {
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
};

// Helper for drawing rounded rectangle
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function downloadReceiptImage(tx: any) {
  const width = 600;
  const height = 940;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Normalize variables and parameters from different structures safely
  const recipientAmount = Number(tx.amountUsd || tx.amount || tx.recipientAmount || 0);
  const serviceCharge = Number(tx.feeUsd || tx.serviceCharge || (recipientAmount * 0.02) || 0);
  const totalDeducted = Number(tx.totalDeducted || (recipientAmount + serviceCharge) || 0);
  const bdtAmount = Number(tx.amountBdt || tx.calculatedBdt || tx.bdtAmount || 0);
  const rate = recipientAmount > 0 ? (bdtAmount / recipientAmount) : 110.8;
  const exchangeRateStr = `1 USD = ${rate.toFixed(2)} BDT`;

  const recipientName = tx.recipientName || "প্রবাসী গ্রাহক";
  const recipientPhone = tx.recipientNumber || tx.recipientPhone || tx.recipientBankAccount || "";
  const rawMethod = tx.recipientMethodName || tx.recipientMethod || "Bank";
  
  // Format method nicely
  const getMethodLabel = (m: string) => {
    if (m === "bKash") return "bKash (বিকাশ)";
    if (m === "Nagad") return "Nagad (নগদ)";
    if (m === "Rocket") return "Rocket (রকেট)";
    if (m === "Bank") return "Bank (ব্যাংক ট্রান্সফার)";
    return m;
  };
  const methodLabel = getMethodLabel(rawMethod);

  // Parse transaction timestamp
  let dateObj = new Date();
  if (tx.createdAt) {
    const parsed = new Date(tx.createdAt);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  } else if (tx.date) {
    const parsed = new Date(tx.date);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  const displayDate = formatBengaliDate(dateObj);
  const displayTime = formatBengaliTime(dateObj);

  // Clear/draw canvas background
  ctx.fillStyle = "#F7F8FA";
  ctx.fillRect(0, 0, width, height);

  // Save drawing context state and clip inside a 16px rounded paper sheet
  ctx.save();
  drawRoundRect(ctx, 25, 25, 550, 890, 16);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // Subtle border around the receipt sheet
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.clip(); // Now all elements will fit perfectly aligned inside the paper rounded corners

  // 1. HEADER (background #1B4F72, from y=25 to y=185)
  ctx.fillStyle = "#1B4F72";
  ctx.fillRect(25, 25, 550, 160);

  // Logo Box: white background, 44px, border-radius 10px
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  drawRoundRect(ctx, 45, 45, 44, 44, 10);
  ctx.fill();
  
  ctx.fillStyle = "#1B4F72";
  ctx.font = "bold 9px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("প্রবাসী", 67, 61);
  ctx.fillText("সেবা", 67, 75);
  ctx.restore();

  // App name: "Probashi Sheba" white 16px 500
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.font = "500 16px 'Inter', Arial, sans-serif";
  ctx.fillText("Probashi Sheba", 105, 61);

  // Subtitle: "কম্বোডিয়া • বাংলাদেশ" rgba(255,255,255,0.65) 11px
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("কম্বোডিয়া • বাংলাদেশ", 105, 79);

  // Divider inside header
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, 105);
  ctx.lineTo(555, 105);
  ctx.stroke();

  // Below divider
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("অফিসিয়াল লেনদেনের রশিদ", 45, 130);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px 'Inter', Arial, sans-serif";
  ctx.fillText("Official Transaction Receipt", 45, 148);

  ctx.restore(); // Undo the clip to retain custom borders/shadows/dashed lines

  // 2. SUCCESS BADGE (center, around y=205)
  ctx.save();
  ctx.fillStyle = "#E8F8F1";
  drawRoundRect(ctx, 210, 200, 180, 32, 16);
  ctx.fill();

  ctx.strokeStyle = "#1D9E75";
  ctx.lineWidth = 0.5;
  drawRoundRect(ctx, 210, 200, 180, 32, 16);
  ctx.stroke();

  ctx.fillStyle = "#0F6E56";
  ctx.font = "500 12px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✓ সফল / SUCCESS", 300, 220);
  ctx.restore();

  // 3. TRANSACTION INFO CARD
  ctx.save();
  const hasDigits = !!tx.confirmationDigits;
  const cardHeight = hasDigits ? 82 : 62;
  const offset = hasDigits ? 20 : 0;

  ctx.fillStyle = "#F7F8FA";
  drawRoundRect(ctx, 45, 248, 510, cardHeight, 12);
  ctx.fill();

  // Left side
  ctx.textAlign = "left";
  ctx.fillStyle = "#6B7280";
  ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("রশিদ নম্বর", 60, 270);
  
  ctx.fillStyle = "#1B4F72";
  ctx.font = "500 13px 'Inter', Arial, sans-serif";
  ctx.fillText(`TXN-${tx.id || "PENDING"}`, 60, 288);

  if (hasDigits) {
    ctx.fillStyle = "#6B7280";
    ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
    ctx.fillText("নিশ্চিতকরণ কোড", 60, 312);

    ctx.fillStyle = "#1B4F72";
    ctx.font = "500 13px 'Inter', Arial, sans-serif";
    ctx.fillText(String(tx.confirmationDigits), 165, 312);
  }

  // Right side
  ctx.textAlign = "right";
  ctx.fillStyle = "#6B7280";
  ctx.font = "10px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("তারিখ ও সময়", 540, 268);
  
  ctx.fillStyle = "#1A1A2E";
  ctx.font = "500 12px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText(displayDate, 540, 283);
  
  ctx.fillStyle = "#6B7280";
  ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText(displayTime, 540, 297);
  ctx.restore();

  // 4. RECIPIENT INFO SECTION
  ctx.save();
  ctx.fillStyle = "#1B4F72";
  ctx.font = "500 13px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("প্রাপকের তথ্য", 45, 340 + offset);

  // Card box
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 0.5;
  drawRoundRect(ctx, 45, 350 + offset, 510, 130, 14);
  ctx.fill();
  drawRoundRect(ctx, 45, 350 + offset, 510, 130, 14);
  ctx.stroke();

  // Rows helper inside Card
  const drawCardRow = (y: number, iconAndLabel: string, value: string, badgeMode: boolean = false) => {
    ctx.fillStyle = "#6B7280";
    ctx.font = "12px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(iconAndLabel, 60, y);

    if (badgeMode) {
      // Draw status blue pill
      ctx.fillStyle = "#EBF5FB";
      drawRoundRect(ctx, 420, y - 16, 120, 22, 11);
      ctx.fill();
      
      ctx.fillStyle = "#1B4F72";
      ctx.font = "500 11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(value, 480, y - 1);
    } else {
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "500 13px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(value, 540, y);
    }
  };

  drawCardRow(385 + offset, "👤 নাম", recipientName);
  drawCardRow(422 + offset, "📱 নম্বর", recipientPhone);
  drawCardRow(459 + offset, "💼 মাধ্যম", methodLabel, true);
  ctx.restore();

  // 5. TRANSACTION DETAILS SECTION
  ctx.save();
  ctx.fillStyle = "#1B4F72";
  ctx.font = "500 13px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("লেনদেনের বিবরণ", 45, 510 + offset);

  // Card Box
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 0.5;
  drawRoundRect(ctx, 45, 520 + offset, 510, 205, 14);
  ctx.fill();
  drawRoundRect(ctx, 45, 520 + offset, 510, 205, 14);
  ctx.stroke();

  // Inner Rows
  const drawDetailsRow = (y: number, label: string, value: string, valColor: string = "#1A1A2E", valFont: string = "500 13px 'Inter'") => {
    ctx.fillStyle = "#6B7280";
    ctx.font = "12px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, 60, y);

    ctx.fillStyle = valColor;
    ctx.font = valFont;
    ctx.textAlign = "right";
    ctx.fillText(value, 540, y);
  };

  drawDetailsRow(552 + offset, "প্রেরিত পরিমাণ", `$${recipientAmount.toFixed(2)} USD`, "#1A1A2E", "600 13px 'Inter'");
  drawDetailsRow(584 + offset, "এক্সচেঞ্জ রেট", exchangeRateStr, "#1A1A2E", "500 12px 'Inter'");
  drawDetailsRow(616 + offset, "সার্ভিস চার্জ (2%)", `$${serviceCharge.toFixed(2)} USD`, "#E74C3C", "500 12px 'Inter'");
  drawDetailsRow(648 + offset, "প্রাপক পাবেন", `৳ ${bdtAmount.toLocaleString("bn-BD")} BDT`, "#0F6E56", "bold 14px 'Inter', 'Noto Sans Bengali', Arial, sans-serif");

  // Dashed lines divider
  ctx.save();
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(60, 670 + offset);
  ctx.lineTo(540, 670 + offset);
  ctx.stroke();
  ctx.restore();

  // Grand Total
  drawDetailsRow(700 + offset, "মোট ব্যালেন্স কাটা", `$${totalDeducted.toFixed(2)} USD`, "#1B4F72", "500 20px 'Inter'");
  ctx.restore();

  // 6. SECURITY BADGE
  ctx.save();
  ctx.fillStyle = "#EBF5FB";
  drawRoundRect(ctx, 45, 745 + offset, 510, 52, 12);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = "#1B4F72";
  ctx.font = "500 12px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("🛡️ যাচাইকৃত ও নিরাপদ লেনদেন", 65, 767 + offset);

  ctx.fillStyle = "#2E86C1";
  ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("Probashi Sheba কর্তৃক প্রক্রিয়াকৃত", 65, 785 + offset);
  ctx.restore();

  // 7. FOOTER text
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#6B7280";
  ctx.font = "10px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("এটি একটি স্বয়ংক্রিয়ভাবে তৈরি রশিদ", 300, 825 + offset);
  ctx.fillText("This is a computer-generated receipt.", 300, 840 + offset);

  ctx.fillStyle = "#1B4F72";
  ctx.font = "500 10px 'Inter', Arial, sans-serif";
  ctx.fillText("probashisheba.vercel.app", 300, 858 + offset);

  ctx.font = "11px 'Inter', 'Noto Sans Bengali', Arial, sans-serif";
  ctx.fillText("🇧🇩 Bangladesh • 🇰🇭 Cambodia", 300, 878 + offset);
  ctx.restore();

  // Download Trigger
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `Receipt_${tx.id || "PS-TRANSACTION"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to generate and download receipt image:", err);
    alert(`অফিসিয়াল লেনদেনের রশিদ:\n\nরশিদ নম্বর: TXN-${tx.id}\nপ্রাপক: ${recipientName}\nপরিমাণ: $${recipientAmount} USD\nপ্রাপক পাবেন: ৳ ${bdtAmount} BDT\n\n(ডাউনলোড ব্যর্থ হয়েছে, ব্রাউজার সিকিউরিটি চেক করুন)`);
  }
}
