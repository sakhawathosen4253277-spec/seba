export type Language = "BN" | "EN" | "KH";

export type NavTab = "home" | "services" | "chat" | "notifications" | "profile";

export interface Transaction {
  id: string;
  senderName: string;
  recipientName: string;
  recipientMethod: "bKash" | "Nagad" | "Rocket" | "Bank";
  recipientNumber: string;
  amountUsd: number;
  amountBdt: number;
  feeUsd: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

export interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface VisaGuide {
  id: string;
  title: string;
  icon: string;
  description: string;
  requirements: string[];
  steps: string[];
  cost: string;
  duration: string;
}

export interface TicketRequest {
  id: string;
  pnr?: string;
  routeFrom: string;
  routeTo: string;
  date: string;
  passengerCount: number;
  passengerName: string;
  phone: string;
  status: "verified" | "warning" | "pending";
  dateAdded: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  category: "all" | "factory" | "restaurant" | "household" | "construction" | "office";
  isVerified: boolean;
  contactNumber?: string;
  description: string;
}

export interface ScamReport {
  id: string;
  scammerName: string;
  scammerMeta: string; // phone, facebook ID etc.
  type: "visa" | "job" | "ticket" | "money" | "other";
  description: string;
  date: string;
  isAnonymous: boolean;
  isApproved: boolean;
}

export interface LiveNotification {
  id: string;
  title: string;
  bengaliTitle: string;
  description: string;
  date: string;
  type: "alert" | "info" | "success" | "warning";
}
