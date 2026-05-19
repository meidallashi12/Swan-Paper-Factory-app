import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

/* =========================================================================
 * Schema-aligned types (PascalCase fields, matches SQL DDL provided by user)
 * ========================================================================= */

export type Supplier = {
  SupplierID: string;
  CompanyName: string;
  PaymentTerms: string;
  Phone: string;
  Country: string;
};

export type RawMaterial = {
  MaterialID: string;
  Name: string;
  UnitCost: number;
  UnitOfMeasure: string;
  ReorderThreshhold: number;
  SupplierID: string;
};

export type Product = {
  ProductID: string;
  Name: string;
  UnitPrice: number;
  Type: string;
  SheetSize: string;
};

export type Shift = {
  ShiftID: string;
  ShiftName: string;
  ShiftDate: string;
  StartTime: string;
  EndTime: string;
};

export type ProdOrderStatus = "Planned" | "In Progress" | "Completed" | "Partial" | "Scrapped" | "Needs Review";
export type ProductionOrder = {
  ProdOrderID: string;
  TargetQuantity: number;
  ScheduledDate: string;
  Status: ProdOrderStatus;
  ProductID: string;
  ShiftID: string;
};

export type Customer = {
  CustomerID: string;
  Name: string;
  Type: "Retail" | "Wholesale" | "Hospitality";
  Attribute: string;
  PaymentTerms: string;
  ContactPhone: string;
};

export type SOStatus = "Pending" | "Confirmed" | "Packed" | "Dispatched" | "Delivered" | "Returned";
export type SalesOrder = {
  SalesOrderID: string;
  Status: SOStatus;
  TotalValueD: number;
  OrderDate: string;
  DeliveryDate: string;
  CustomerID: string;
};

export type Employee = {
  EmployeeID: string;
  FullName: string;
  Role: "Production Manager" | "Inventory Manager" | "Sales Clerk" | "Procurement Officer" | "Machine Operator" | "Quality Inspector";
  ContactPhone: string;
  ShiftID: string;
};

export type ProductionBatch = {
  BatchID: string;
  StartTime: string;
  EndTime: string;
  QtyProduced: number;
  WasteQty: number;
  EmployeeID: string;
  ProdOrderID: string;
};

export type QCResult = "Passed" | "Failed" | "Needs Review";
export type QualityCheck = {
  QualityCheckID: string;
  CheckedAt: string;
  DefectNotes: string;
  Result: QCResult;
  BatchID: string;
};

export type Driver = {
  DriverID: string;
  FullName: string;
  LicenseNumber: string;
  Phone: string;
};

export type DeliveryStatus = "Scheduled" | "Dispatched" | "Delivered" | "Issue";
export type Delivery = {
  DeliveryID: string;
  DispatchedDate: string;
  DeliveredDate: string;
  DeliveryStatus: DeliveryStatus;
  VeichlePlate: string;
  SalesOrderID: string;
  DriverID: string;
  IssueNotes?: string;
};

export type InventoryRecord = {
  InvRecordID: string;
  QtyOnHand: number;
  LastUpdated: string;
  WarehouseLoc: string;
  MaterialID: string;
};

export type UsedIn = { MaterialID: string; ProdOrderID: string };
export type ContainedIn = { ProductID: string; SalesOrderID: string; Quantity: number };

export type Activity = { id: string; text: string; time: string };

type State = {
  suppliers: Supplier[];
  materials: RawMaterial[];
  products: Product[];
  shifts: Shift[];
  prodOrders: ProductionOrder[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  employees: Employee[];
  batches: ProductionBatch[];
  qcs: QualityCheck[];
  drivers: Driver[];
  deliveries: Delivery[];
  inventory: InventoryRecord[];
  usedIn: UsedIn[];
  containedIn: ContainedIn[];
  activity: Activity[];
};

/* =========================================================================
 * Seed data
 * ========================================================================= */

const seed: State = {
  suppliers: [
    { SupplierID: "S-01", CompanyName: "NorthPulp Co.", PaymentTerms: "Net 30", Phone: "+92-21-1111111", Country: "Pakistan" },
    { SupplierID: "S-02", CompanyName: "GreenFiber Ltd.", PaymentTerms: "Net 45", Phone: "+92-42-2222222", Country: "Pakistan" },
    { SupplierID: "S-03", CompanyName: "PackRight", PaymentTerms: "Net 15", Phone: "+92-51-3333333", Country: "Pakistan" },
  ],
  materials: [
    { MaterialID: "M-01", Name: "Virgin Pulp", UnitCost: 180, UnitOfMeasure: "kg", ReorderThreshhold: 800, SupplierID: "S-01" },
    { MaterialID: "M-02", Name: "Recycled Pulp", UnitCost: 120, UnitOfMeasure: "kg", ReorderThreshhold: 600, SupplierID: "S-02" },
    { MaterialID: "M-03", Name: "Core Board", UnitCost: 90, UnitOfMeasure: "roll", ReorderThreshhold: 200, SupplierID: "S-03" },
    { MaterialID: "M-04", Name: "Packaging Film", UnitCost: 60, UnitOfMeasure: "m", ReorderThreshhold: 300, SupplierID: "S-03" },
  ],
  products: [
    { ProductID: "P-01", Name: "Toilet Roll 2-Ply", UnitPrice: 220, Type: "Roll", SheetSize: "100x100mm" },
    { ProductID: "P-02", Name: "Facial Tissue 100s", UnitPrice: 150, Type: "Box", SheetSize: "200x200mm" },
    { ProductID: "P-03", Name: "Kitchen Towel", UnitPrice: 320, Type: "Roll", SheetSize: "250x230mm" },
    { ProductID: "P-04", Name: "Napkin 50s", UnitPrice: 110, Type: "Pack", SheetSize: "300x300mm" },
  ],
  shifts: [
    { ShiftID: "SH-01", ShiftName: "Morning", ShiftDate: "2025-05-19", StartTime: "06:00", EndTime: "14:00" },
    { ShiftID: "SH-02", ShiftName: "Evening", ShiftDate: "2025-05-19", StartTime: "14:00", EndTime: "22:00" },
    { ShiftID: "SH-03", ShiftName: "Night", ShiftDate: "2025-05-19", StartTime: "22:00", EndTime: "06:00" },
  ],
  prodOrders: [
    { ProdOrderID: "PO-1001", TargetQuantity: 5000, ScheduledDate: "2025-05-15", Status: "Completed", ProductID: "P-01", ShiftID: "SH-01" },
    { ProdOrderID: "PO-1002", TargetQuantity: 3500, ScheduledDate: "2025-05-18", Status: "In Progress", ProductID: "P-02", ShiftID: "SH-02" },
    { ProdOrderID: "PO-1003", TargetQuantity: 2000, ScheduledDate: "2025-05-19", Status: "Planned", ProductID: "P-03", ShiftID: "SH-03" },
    { ProdOrderID: "PO-1004", TargetQuantity: 2000, ScheduledDate: "2025-05-14", Status: "Partial", ProductID: "P-04", ShiftID: "SH-01" },
  ],
  customers: [
    { CustomerID: "C-01", Name: "MegaMart", Type: "Retail", Attribute: "Key account", PaymentTerms: "Net 30", ContactPhone: "+92-21-555-1000" },
    { CustomerID: "C-02", Name: "FreshFoods Hotel", Type: "Hospitality", Attribute: "B2B", PaymentTerms: "Net 15", ContactPhone: "+92-42-555-2000" },
    { CustomerID: "C-03", Name: "QuickStop Chain", Type: "Wholesale", Attribute: "Bulk", PaymentTerms: "Net 45", ContactPhone: "+92-51-555-3000" },
  ],
  salesOrders: [
    { SalesOrderID: "SO-301", Status: "Confirmed", TotalValueD: 440000, OrderDate: "2025-05-12", DeliveryDate: "2025-05-20", CustomerID: "C-01" },
    { SalesOrderID: "SO-302", Status: "Pending", TotalValueD: 256000, OrderDate: "2025-05-16", DeliveryDate: "2025-05-19", CustomerID: "C-02" },
    { SalesOrderID: "SO-303", Status: "Packed", TotalValueD: 165000, OrderDate: "2025-05-17", DeliveryDate: "2025-05-19", CustomerID: "C-03" },
  ],
  employees: [
    { EmployeeID: "E-01", FullName: "Ali Hassan", Role: "Machine Operator", ContactPhone: "+92-300-111", ShiftID: "SH-01" },
    { EmployeeID: "E-02", FullName: "Sara Khan", Role: "Machine Operator", ContactPhone: "+92-300-222", ShiftID: "SH-02" },
    { EmployeeID: "E-03", FullName: "Bilal Ahmed", Role: "Machine Operator", ContactPhone: "+92-300-333", ShiftID: "SH-03" },
    { EmployeeID: "E-04", FullName: "Nadia R.", Role: "Quality Inspector", ContactPhone: "+92-300-444", ShiftID: "SH-01" },
    { EmployeeID: "E-05", FullName: "Faisal M.", Role: "Production Manager", ContactPhone: "+92-300-555", ShiftID: "SH-01" },
    { EmployeeID: "E-06", FullName: "Hina J.", Role: "Inventory Manager", ContactPhone: "+92-300-666", ShiftID: "SH-02" },
    { EmployeeID: "E-07", FullName: "Omar S.", Role: "Procurement Officer", ContactPhone: "+92-300-777", ShiftID: "SH-01" },
    { EmployeeID: "E-08", FullName: "Mehwish A.", Role: "Sales Clerk", ContactPhone: "+92-300-888", ShiftID: "SH-02" },
  ],
  batches: [
    { BatchID: "B-5001", StartTime: "2025-05-15 06:30", EndTime: "2025-05-15 13:30", QtyProduced: 4200, WasteQty: 120, EmployeeID: "E-01", ProdOrderID: "PO-1001" },
    { BatchID: "B-5002", StartTime: "2025-05-18 14:30", EndTime: "", QtyProduced: 1800, WasteQty: 40, EmployeeID: "E-02", ProdOrderID: "PO-1002" },
    { BatchID: "B-5003", StartTime: "2025-05-14 06:30", EndTime: "2025-05-14 13:00", QtyProduced: 1800, WasteQty: 200, EmployeeID: "E-01", ProdOrderID: "PO-1004" },
  ],
  qcs: [
    { QualityCheckID: "QC-01", CheckedAt: "2025-05-15", DefectNotes: "", Result: "Passed", BatchID: "B-5001" },
    { QualityCheckID: "QC-02", CheckedAt: "2025-05-14", DefectNotes: "Uneven cut on 5% rolls", Result: "Needs Review", BatchID: "B-5003" },
  ],
  drivers: [
    { DriverID: "D-01", FullName: "Imran Q.", LicenseNumber: "LIC-998877", Phone: "+92-301-100" },
    { DriverID: "D-02", FullName: "Tariq P.", LicenseNumber: "LIC-998878", Phone: "+92-301-200" },
  ],
  deliveries: [
    { DeliveryID: "DL-201", DispatchedDate: "2025-05-19", DeliveredDate: "", DeliveryStatus: "Dispatched", VeichlePlate: "KAR-1234", SalesOrderID: "SO-301", DriverID: "D-01" },
    { DeliveryID: "DL-202", DispatchedDate: "", DeliveredDate: "", DeliveryStatus: "Scheduled", VeichlePlate: "LHR-5678", SalesOrderID: "SO-303", DriverID: "D-02" },
  ],
  inventory: [
    { InvRecordID: "IR-01", QtyOnHand: 1200, LastUpdated: "2025-05-19", WarehouseLoc: "WH-A", MaterialID: "M-01" },
    { InvRecordID: "IR-02", QtyOnHand: 450, LastUpdated: "2025-05-19", WarehouseLoc: "WH-A", MaterialID: "M-02" },
    { InvRecordID: "IR-03", QtyOnHand: 0, LastUpdated: "2025-05-18", WarehouseLoc: "WH-B", MaterialID: "M-03" },
    { InvRecordID: "IR-04", QtyOnHand: 950, LastUpdated: "2025-05-19", WarehouseLoc: "WH-B", MaterialID: "M-04" },
  ],
  usedIn: [
    { MaterialID: "M-01", ProdOrderID: "PO-1001" },
    { MaterialID: "M-03", ProdOrderID: "PO-1001" },
    { MaterialID: "M-02", ProdOrderID: "PO-1002" },
    { MaterialID: "M-01", ProdOrderID: "PO-1003" },
    { MaterialID: "M-04", ProdOrderID: "PO-1004" },
  ],
  containedIn: [
    { ProductID: "P-01", SalesOrderID: "SO-301", Quantity: 2000 },
    { ProductID: "P-03", SalesOrderID: "SO-302", Quantity: 800 },
    { ProductID: "P-04", SalesOrderID: "SO-303", Quantity: 1500 },
  ],
  activity: [
    { id: "A-1", text: "Batch B-5001 completed (4200 units)", time: "2h ago" },
    { id: "A-2", text: "PO-1002 in progress on Evening shift", time: "3h ago" },
    { id: "A-3", text: "Material M-03 out of stock", time: "5h ago" },
    { id: "A-4", text: "SO-303 packed and ready for dispatch", time: "6h ago" },
  ],
};

/* =========================================================================
 * Context
 * ========================================================================= */

type Ctx = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  addActivity: (text: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = "spf-oms-state-v2";

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

/* =========================================================================
 * Derived helpers
 * ========================================================================= */

export type StockState = "Normal" | "Low Stock" | "Out of Stock";

export function rmStockState(qty: number, threshold: number): StockState {
  if (qty <= 0) return "Out of Stock";
  if (qty < threshold) return "Low Stock";
  return "Normal";
}

/** Finished-goods stock derived from batches minus delivered sales order lines. */
export function productStock(state: State, productID: string): number {
  const produced = state.batches.reduce((sum, b) => {
    const po = state.prodOrders.find((p) => p.ProdOrderID === b.ProdOrderID);
    return po && po.ProductID === productID ? sum + b.QtyProduced : sum;
  }, 0);
  const delivered = state.containedIn.reduce((sum, ci) => {
    if (ci.ProductID !== productID) return sum;
    const so = state.salesOrders.find((s) => s.SalesOrderID === ci.SalesOrderID);
    return so && (so.Status === "Dispatched" || so.Status === "Delivered") ? sum + ci.Quantity : sum;
  }, 0);
  return produced - delivered;
}

export function resetSeed() {
  localStorage.removeItem(KEY);
  location.reload();
}
