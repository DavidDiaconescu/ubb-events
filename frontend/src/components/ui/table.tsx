import type { ReactNode } from "react";

export interface TableColumn {
  label: string;
  /** Visually hidden header (e.g. for a column of action buttons). */
  hidden?: boolean;
  align?: "left" | "right";
}

interface TableProps {
  columns: TableColumn[];
  children: ReactNode;
  /** Header cell padding; tables inside a CardSection bleed to the card edges with "px-5". */
  cellPadding?: string;
  /** "bottom" when the table starts at the top edge of its own card. */
  headerBorder?: "both" | "bottom";
}

/** A scrollable data table with the app's header style. Rows go in `children`. */
export function Table({ columns, children, cellPadding = "px-5 py-2", headerBorder = "both" }: TableProps) {
  return (
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className={`${headerBorder === "both" ? "border-y" : "border-b"} border-border bg-surface-muted text-xs uppercase tracking-wide text-muted`}>
        <tr>
          {columns.map((column) => (
            <th
              key={column.label}
              scope="col"
              className={`${cellPadding} font-medium ${column.align === "right" ? "text-right" : ""}`}
            >
              {column.hidden ? <span className="sr-only">{column.label}</span> : column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">{children}</tbody>
    </table>
  );
}

/** Wraps a table inside a CardSection so it spans the card's full width and scrolls horizontally. */
export function CardTable({ children }: { children: ReactNode }) {
  return <div className="-mx-5 overflow-x-auto">{children}</div>;
}
