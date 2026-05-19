import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ---------- Types ----------
export type BatchStatus = "Planned" | "In Progress" | "Completed" | "Partial" | "Scrapped" | "Needs Review";
export type Batch = {
  id: string;
  product: string;
  machine: string;
  shift: "Morning" | "Evening" | "Night";
  operator: string;
  rawLot: string;
  outputQty: number;
  status: BatchStatus;
  notes: string;
  date: string;
};

export type InvStatus = "Normal" | "Low Stock" | "Out of Stock";
export type InventoryItem = {
  id: string;
  name: string;
  category: "Raw Material" | "Finished Goods";
  quantity: number;
  minStock: number;
  location: string;
};

export type Supplier = { id: string; name: string; contact: string; rating: number };

export type POStatus = "Draft" | "Pending Approval" | "Approved" | "Ordered" | "Partially Received" | "Received";
export type PurchaseOrder = {
  id: string;
  supplierId: string;
  itemId: string;
  quantity: number;
  expectedDate: string;
  status: POStatus;
};

export type Client = { id: string; name: string; address: string };

export type SOStatus = "Pending" | "Confirmed" | "Packed" | "Dispatched" | "Delivered" | "Returned";
export type SalesOrder = {
  id: string;
  clientId: string;
  itemId: string;
  quantity: number;
  deliveryDate: string;
  assignedBatch?: string;
  status: SOStatus;
};

export type DeliveryStatus = "Scheduled" | "In Transit" | "Delivered" | "Issue";
export type Delivery = {
  id: string;
  salesOrderId: string;
  driver: string;
  status: DeliveryStatus;
  issueNotes: string;
  date: string;
};

export type MachineStatus = "Running" | "Idle" | "Down" | "Under Maintenance";
export type Machine = { id: string; name: string; status: MachineStatus };

export type Downtime = {
  id: string;
  machineId: string;
  start: string;
  end: string;
  reason: string;
  operator: string;
  shift: "Morning" | "Evening" | "Night";
};

export type Inspection = {
  id: string;
  batchId: string;
  inspector: string;
  result: "Passed" | "Failed" | "Needs Review";
  defects: string;
  date: string;
};

export type Operator = { id: string; name: string; shift: "Morning" | "Evening" | "Night"; machine: string };

export type Activity = { id: string; text: string; time: string };

type State = {
  batches: Batch[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  pos: PurchaseOrder[];
  clients: Client[];
  sos: SalesOrder[];
  deliveries: Delivery[];
  machines: Machine[];
  downtimes: Downtime[];
  inspections: Inspection[];
  operators: Operator[];
  activity: Activity[];
};

// ---------- Mock seed ----------
const seed: State = {
  batches: [
    { id: "B-1001", product: "Toilet Roll 2-Ply", machine: "M-01", shift: "Morning", operator: "Ali Hassan", rawLot: "RL-220", outputQty: 4200, status: "Completed", notes: "Smooth run", date: "2025-05-15" },
    { id: "B-1002", product: "Facial Tissue 100s", machine: "M-02", shift: "Evening", operator: "Sara Khan", rawLot: "RL-221", outputQty: 3100, status: "In Progress", notes: "", date: "2025-05-18" },
    { id: "B-1003", product: "Kitchen Towel", machine: "M-03", shift: "Night", operator: "Bilal Ahmed", rawLot: "RL-222", outputQty: 0, status: "Planned", notes: "", date: "2025-05-19" },
    { id: "B-1004", product: "Napkin 50s", machine: "M-01", shift: "Morning", operator: "Ali Hassan", rawLot: "RL-219", outputQty: 1800, status: "Partial", notes: "Jam at roller", date: "2025-05-14" },
  ],
  inventory: [
    { id: "I-RM-01", name: "Virgin Pulp", category: "Raw Material", quantity: 1200, minStock: 800, location: "WH-A" },
    { id: "I-RM-02", name: "Recycled Pulp", category: "Raw Material", quantity: 450, minStock: 600, location: "WH-A" },
    { id: "I-RM-03", name: "Core Board", category: "Raw Material", quantity: 0, minStock: 200, location: "WH-B" },
    { id: "I-RM-04", name: "Packaging Film", category: "Raw Material", quantity: 950, minStock: 300, location: "WH-B" },
    { id: "I-FG-01", name: "Toilet Roll 2-Ply", category: "Finished Goods", quantity: 8200, minStock: 2000, location: "WH-FG" },
    { id: "I-FG-02", name: "Facial Tissue 100s", category: "Finished Goods", quantity: 1500, minStock: 1800, location: "WH-FG" },
    { id: "I-FG-03", name: "Kitchen Towel", category: "Finished Goods", quantity: 3400, minStock: 1000, location: "WH-FG" },
    { id: "I-FG-04", name: "Napkin 50s", category: "Finished Goods", quantity: 5200, minStock: 1500, location: "WH-FG" },
  ],
  suppliers: [
    { id: "S-01", name: "NorthPulp Co.", contact: "ahmed@northpulp.com", rating: 4.6 },
    { id: "S-02", name: "GreenFiber Ltd.", contact: "sales@greenfiber.com", rating: 4.1 },
    { id: "S-03", name: "PackRight", contact: "info@packright.com", rating: 4.8 },
  ],
  pos: [
    { id: "PO-501", supplierId: "S-01", itemId: "I-RM-01", quantity: 800, expectedDate: "2025-05-22", status: "Ordered" },
    { id: "PO-502", supplierId: "S-02", itemId: "I-RM-02", quantity: 600, expectedDate: "2025-05-25", status: "Pending Approval" },
    { id: "PO-503", supplierId: "S-03", itemId: "I-RM-04", quantity: 500, expectedDate: "2025-05-20", status: "Approved" },
  ],
  clients: [
    { id: "C-01", name: "MegaMart", address: "Industrial Area, Karachi" },
    { id: "C-02", name: "FreshFoods Hotel", address: "Gulberg, Lahore" },
    { id: "C-03", name: "QuickStop Chain", address: "Blue Area, Islamabad" },
  ],
  sos: [
    { id: "SO-301", clientId: "C-01", itemId: "I-FG-01", quantity: 2000, deliveryDate: "2025-05-20", assignedBatch: "B-1001", status: "Confirmed" },
    { id: "SO-302", clientId: "C-02", itemId: "I-FG-03", quantity: 800, deliveryDate: "2025-05-19", status: "Pending" },
    { id: "SO-303", clientId: "C-03", itemId: "I-FG-04", quantity: 1500, deliveryDate: "2025-05-19", assignedBatch: "B-1004", status: "Packed" },
  ],
  deliveries: [
    { id: "D-201", salesOrderId: "SO-301", driver: "Imran Q.", status: "In Transit", issueNotes: "", date: "2025-05-19" },
    { id: "D-202", salesOrderId: "SO-303", driver: "Faisal M.", status: "Scheduled", issueNotes: "", date: "2025-05-19" },
  ],
  machines: [
    { id: "M-01", name: "Converter Line 1", status: "Running" },
    { id: "M-02", name: "Converter Line 2", status: "Running" },
    { id: "M-03", name: "Converter Line 3", status: "Idle" },
    { id: "M-04", name: "Embosser A", status: "Down" },
    { id: "M-05", name: "Packaging Unit", status: "Under Maintenance" },
  ],
  downtimes: [
    { id: "DT-01", machineId: "M-04", start: "2025-05-18 09:00", end: "2025-05-18 13:00", reason: "Bearing failure", operator: "Bilal Ahmed", shift: "Morning" },
    { id: "DT-02", machineId: "M-05", start: "2025-05-19 08:00", end: "2025-05-19 12:00", reason: "Scheduled maintenance", operator: "Sara Khan", shift: "Morning" },
  ],
  inspections: [
    { id: "QI-01", batchId: "B-1001", inspector: "Nadia R.", result: "Passed", defects: "", date: "2025-05-15" },
    { id: "QI-02", batchId: "B-1004", inspector: "Nadia R.", result: "Needs Review", defects: "Uneven cut on 5% rolls", date: "2025-05-14" },
  ],
  operators: [
    { id: "O-01", name: "Ali Hassan", shift: "Morning", machine: "M-01" },
    { id: "O-02", name: "Sara Khan", shift: "Evening", machine: "M-02" },
    { id: "O-03", name: "Bilal Ahmed", shift: "Night", machine: "M-03" },
    { id: "O-04", name: "Nadia R.", shift: "Morning", machine: "QC" },
    { id: "O-05", name: "Imran Q.", shift: "Morning", machine: "Delivery" },
  ],
  activity: [
    { id: "A-1", text: "Batch B-1001 completed (4200 units)", time: "2h ago" },
    { id: "A-2", text: "PO-502 awaiting manager approval", time: "3h ago" },
    { id: "A-3", text: "Machine M-04 marked Down — bearing failure", time: "5h ago" },
    { id: "A-4", text: "SO-303 packed and ready for dispatch", time: "6h ago" },
  ],
};

// ---------- Context ----------
type Ctx = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  addActivity: (text: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = "spf-oms-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addActivity = (text: string) =>
    setState((s) => ({ ...s, activity: [{ id: "A-" + Date.now(), text, time: "just now" }, ...s.activity].slice(0, 30) }));

  return <StoreContext.Provider value={{ state, setState, addActivity }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

// helper
export function invStatus(it: InventoryItem): InvStatus {
  if (it.quantity <= 0) return "Out of Stock";
  if (it.quantity < it.minStock) return "Low Stock";
  return "Normal";
}

export function resetSeed() {
  localStorage.removeItem(KEY);
  location.reload();
}
