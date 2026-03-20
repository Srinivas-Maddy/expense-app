export const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "🍔", color: "#FF6B6B" },
  { name: "Travel", icon: "✈️", color: "#4ECDC4" },
  { name: "Bills", icon: "📄", color: "#45B7D1" },
  { name: "Shopping", icon: "🛍️", color: "#96CEB4" },
] as const;

export const SUPPORTED_CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", locale: "es-MX" },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA" },
] as const;

export const DEFAULT_CURRENCY = "INR";

// Auto-categorization keyword rules (lowercase)
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    "restaurant", "cafe", "coffee", "starbucks", "mcdonald", "pizza", "burger", "food",
    "swiggy", "zomato", "uber eats", "doordash", "grubhub", "lunch", "dinner", "breakfast",
    "grocery", "supermarket", "bakery", "snack", "dominos", "kfc", "subway", "biryani",
    "tea", "chai", "juice", "milk", "chicken", "paneer", "dosa", "idli",
  ],
  Travel: [
    "uber", "ola", "lyft", "taxi", "cab", "flight", "airline", "airport", "train",
    "railway", "irctc", "bus", "metro", "petrol", "gas", "fuel", "diesel", "parking",
    "toll", "rapido", "grab", "bolt", "hotel", "airbnb", "booking",
  ],
  Bills: [
    "electricity", "electric", "water", "gas bill", "internet", "wifi", "broadband",
    "phone", "mobile", "recharge", "airtel", "jio", "vodafone", "rent", "emi",
    "insurance", "netflix", "spotify", "amazon prime", "youtube", "disney", "hotstar",
    "hulu", "apple", "google", "subscription", "membership", "gym", "club",
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "mall", "shop", "store", "clothing", "shoes",
    "electronics", "gadget", "laptop", "phone", "watch", "furniture", "ikea",
    "walmart", "target", "costco", "online order", "delivery",
  ],
};

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
