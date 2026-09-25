import { flagEmoji } from "@/lib/utils";

const CODES: Array<[country: string, code: string]> = [
  ["IN", "+91"],
  ["US", "+1"],
  ["GB", "+44"],
  ["AE", "+971"],
  ["SA", "+966"],
  ["QA", "+974"],
  ["CH", "+41"],
  ["DE", "+49"],
  ["FR", "+33"],
  ["IT", "+39"],
  ["ES", "+34"],
  ["NL", "+31"],
  ["LU", "+352"],
  ["MT", "+356"],
  ["SG", "+65"],
  ["HK", "+852"],
  ["JP", "+81"],
  ["CN", "+86"],
  ["AU", "+61"],
  ["ZA", "+27"],
  ["BR", "+55"],
  ["MX", "+52"],
];

export const DIAL_CODES = CODES.map(([country, code]) => ({ country, code, label: `${flagEmoji(country)} ${code}` }));

export const DEFAULT_DIAL_CODE = "+91";
