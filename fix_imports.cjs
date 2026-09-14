const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const lines = content.split('\n');
const fixedLines = [
  "import React, { useState, useEffect, useMemo } from 'react';",
  "import { Camera, Image as ImageIcon, CheckCircle, Save, QrCode, Clock, CreditCard, ChevronRight, User, AlertCircle, Info, Ticket, Phone, Loader2, ArrowRight, Tag, LogOut, Sparkles, MapPin, Award, Banknote, ShoppingBag, HeartPulse, Home, History as HistoryIcon, Database, CalendarPlus, X, TicketCheck, CalendarDays, Store, Upload, ReceiptText, Gift, Truck, Percent, ShoppingCart, Plus, Search, ChevronLeft, Share2, Copy, Lock, Minus, Trash2, Package, Download, CalendarClock, Send, ArrowRightLeft } from 'lucide-react';"
];

content = fixedLines.join('\n') + '\n' + lines.slice(6).join('\n');
fs.writeFileSync(appPath, content);
console.log("Fixed imports");
