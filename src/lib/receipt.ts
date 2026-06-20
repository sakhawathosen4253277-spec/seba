import { Transaction } from "../types";

export function downloadReceiptImage(tx: Transaction) {
  const width = 600;
  const height = 800;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Background
  ctx.fillStyle = "#F7F8FA";
  ctx.fillRect(0, 0, width, height);

  // 2. Receipt Container shadow/border mimic
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(15, 15, width - 30, height - 30);

  // Subtle border around the receipt paper
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#E5E7EB";
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // 3. Green top border (Success Accent)
  ctx.fillStyle = "#1D9E75";
  ctx.fillRect(15, 15, width - 30, 8);

  // 4. Header with Navy Blue
  ctx.fillStyle = "#1B4F72";
  ctx.font = "bold 24px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PROBASHI SHEBA", width / 2, 65);

  ctx.fillStyle = "#1A1A2E";
  ctx.font = "500 16px 'Inter', sans-serif";
  ctx.fillText("প্রবাসী সেবা — নির্ভরযোগ্য সাপোর্ট প্ল্যাটফর্ম", width / 2, 90);

  // Tagline/Header Sub
  ctx.fillStyle = "#6B7280";
  ctx.font = "italic 11px 'Inter', sans-serif";
  ctx.fillText("Cambodia to Bangladesh Secure Transfer Systems", width / 2, 110);

  // Divider line
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 130);
  ctx.lineTo(width - 40, 130);
  ctx.stroke();

  // 5. Receipt Title
  ctx.fillStyle = "#1B4F72";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.fillText("OFFICIAL TRANSACTION RECEIPT", width / 2, 160);

  ctx.fillStyle = "#1A1A2E";
  ctx.font = "500 14px 'Inter', sans-serif";
  ctx.fillText("লেনদেনের অফিসিয়াল রশিদ", width / 2, 182);

  // 6. Succesful Stamp Badge
  ctx.fillStyle = "rgba(29, 158, 117, 0.1)"; // success background alpha
  const badgeWidth = 140;
  const badgeHeight = 32;
  ctx.beginPath();
  ctx.roundRect((width - badgeWidth) / 2, 202, badgeWidth, badgeHeight, 16);
  ctx.fill();

  ctx.strokeStyle = "#1D9E75";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect((width - badgeWidth) / 2, 202, badgeWidth, badgeHeight, 16);
  ctx.stroke();

  ctx.fillStyle = "#1D9E75";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillText("✓ SUCCESS / সফল", width / 2, 222);

  // Detailed rows starter Y coordinate
  let currentY = 275;
  const drawRow = (labelBn: string, labelEn: string, value: string, isHighlighted: boolean = false) => {
    // Label left
    ctx.textAlign = "left";
    ctx.fillStyle = "#6B7280";
    ctx.font = "500 12px 'Inter', sans-serif";
    ctx.fillText(labelBn, 45, currentY);
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillText(labelEn, 45, currentY + 15);

    // Value right
    ctx.textAlign = "right";
    if (isHighlighted) {
      ctx.fillStyle = "#1B4F72";
      ctx.font = "bold 14px 'Inter', sans-serif";
    } else {
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "semibold 13px 'Inter', sans-serif";
    }
    ctx.fillText(value, width - 45, currentY + 8);

    // Subtle dash divider beneath row
    ctx.strokeStyle = "#F3F4F6";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(40, currentY + 28);
    ctx.lineTo(width - 40, currentY + 28);
    ctx.stroke();

    currentY += 45;
  };

  // Convert recipient method En to Bn
  const cleanMethod = (method: string) => {
    if (method.toLowerCase() === "bkash") return "বিকাশ (bKash)";
    if (method.toLowerCase() === "nagad") return "নগদ (Nagad)";
    if (method.toLowerCase() === "rocket") return "রকেট (Rocket)";
    if (method.toLowerCase() === "bank") return "ব্যাংক (Bank Transfer)";
    return method;
  };

  // Drawn parameters
  drawRow("রশিদ আইডি (Transaction ID)", "Transaction reference code", tx.id);
  drawRow("তারিখ ও সময় (Date & Time)", "Transaction processed timestamp", tx.date);
  drawRow("প্রাপকের নাম (Recipient Name)", "Receiving person name in Bangladesh", tx.recipientName);
  drawRow("প্রাপক চ্যানেল ও নম্বর (To Number)", "Receiving wallet or account number", tx.recipientNumber);
  drawRow("লেনদেন মাধ্যম (Payment Method)", "Method of cash disbursement", cleanMethod(tx.recipientMethod));
  drawRow("প্রেরিত ডলার পরিমাণ (Amount USD)", "Funds drafted from member wallet", `$${tx.amountUsd.toFixed(2)} USD`, true);
  drawRow("বাংলাদেশের সেরা রেট (Exchange Rate)", "Value of 1 USD exchanged in BDT", `1 USD = ${(tx.amountBdt / tx.amountUsd).toFixed(2)} BDT`);
  drawRow("প্রাপক পেয়েছেন (Amount BDT)", "Net payout amount received in Bangladesh", `৳ ${tx.amountBdt.toLocaleString("bn-BD")} BDT`, true);
  drawRow("সার্ভিস চার্জ (Admin Service Fee)", "Transfer processing fee (1%)", `$${tx.feeUsd.toFixed(2)} USD`);
  drawRow("সর্বমোট ড্রাফট (Total Drafted)", "Total funds charged including service fee", `$${(tx.amountUsd + tx.feeUsd).toFixed(2)} USD`, true);

  // 7. Standard security warning & stamp block at the footer
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]); // Dashed line for tearing receipt
  ctx.beginPath();
  ctx.moveTo(30, height - 100);
  ctx.lineTo(width - 30, height - 100);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dashed state

  ctx.textAlign = "center";
  ctx.fillStyle = "#6B7280";
  ctx.font = "italic 11px 'Inter', sans-serif";
  ctx.fillText("This is a computer-generated transaction copy. No hard signature required.", width / 2, height - 70);

  ctx.fillStyle = "#1B4F72";
  ctx.font = "500 11px 'Inter', sans-serif";
  ctx.fillText("প্রবাসী বাংলাদেশি প্লাটফর্ম — সর্বদা প্রবাসীদের সাথে ও পাশে। 🇧🇩 🫶 🇰🇭", width / 2, height - 50);

  // Convert to image download trigger
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `Receipt_${tx.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to export receipt image:", err);
    // fallback with simple printing if canvas fails
    alert(`Receipt details:\nID: ${tx.id}\nRecipient: ${tx.recipientName}\nAmount: $${tx.amountUsd}`);
  }
}
