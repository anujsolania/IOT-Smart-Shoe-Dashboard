import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SensorCard = ({ title, value, unit, icon: Icon, color, trend, loading }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", color || "bg-blue-500/10 text-blue-500")}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-white">
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded" />
            ) : (
              value
            )}
          </h3>
          <span className="text-slate-500 text-sm">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
