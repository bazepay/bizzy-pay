export type CurrencyCode = "NGN" | "USD" | "EUR" | "GBP";

export type Wallet = {
  symbol: string;
  whole: string;
  decimals: string;
  equiv: string;
  gradient: string;
  rate: string;
};

export const wallets: Record<CurrencyCode, Wallet> = {
  NGN: {
    symbol: "₦",
    whole: "845,320",
    decimals: ".50",
    equiv: "≈ $548.20",
    gradient: "linear-gradient(135deg, #008751, #ffffff, #008751)",
    rate: "Base currency",
  },
  USD: {
    symbol: "$",
    whole: "548",
    decimals: ".20",
    equiv: "≈ ₦845,320",
    gradient: "linear-gradient(135deg, #B22234, #ffffff, #3C3B6E)",
    rate: "1 USD = ₦1,542",
  },
  EUR: {
    symbol: "€",
    whole: "502",
    decimals: ".15",
    equiv: "≈ ₦774,316",
    gradient: "linear-gradient(135deg, #003399, #FFCC00)",
    rate: "1 EUR = ₦1,540",
  },
  GBP: {
    symbol: "£",
    whole: "432",
    decimals: ".80",
    equiv: "≈ ₦845,320",
    gradient: "linear-gradient(135deg, #012169, #ffffff, #C8102E)",
    rate: "1 GBP = ₦1,952",
  },
};

export const currencyOrder: CurrencyCode[] = ["NGN", "USD", "EUR", "GBP"];
