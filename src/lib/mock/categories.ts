import type { ServiceCategory } from "@/lib/types";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { slug: "fbo", name: "FBO", longName: "Fixed Base Operator", icon: "building" },
  { slug: "ground-handler", name: "Ground Handler", longName: "Ground Handling Agent", icon: "plane" },
  { slug: "trip-support", name: "Trip Support", longName: "Trip Support Provider", icon: "globe" },
  { slug: "permit", name: "Permit", longName: "Permits & Overflight", icon: "file-check" },
  { slug: "fuel", name: "Fuel", longName: "Fuel Supplier", icon: "fuel" },
  { slug: "catering", name: "Catering", longName: "In-flight Catering", icon: "utensils" },
  { slug: "ground-transportation", name: "Ground Transportation", longName: "Ground Transportation", icon: "car" },
  { slug: "charter-operator", name: "Charter Operator", longName: "Air Charter Operator", icon: "plane-takeoff" },
  { slug: "charter-broker", name: "Charter Broker", longName: "Air Charter Broker", icon: "file-text" },
  { slug: "supervisory-agent", name: "Supervisory Agent", longName: "Supervisory Agent", icon: "user-check" },
  { slug: "mro", name: "MRO", longName: "Maintenance, Repair & Overhaul", icon: "wrench" },
  { slug: "meet-and-assist", name: "Meet and Assist", longName: "Meet & Assist Service", icon: "handshake" },
];

export function getCategory(slug: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((c) => c.slug === slug);
}
