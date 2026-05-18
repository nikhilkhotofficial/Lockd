import { ReactNode } from 'react'

export default function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
