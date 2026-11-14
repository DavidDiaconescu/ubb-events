"use client";

import type { LucideIcon } from "lucide-react";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function Tabs<T extends string>({ tabs, activeTab, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="-mx-1 mb-5 flex gap-1 overflow-x-auto border-b border-border px-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`-mb-px inline-flex items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            {tab.icon && <tab.icon className="mr-1.5 size-4" aria-hidden="true" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  isActive ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
