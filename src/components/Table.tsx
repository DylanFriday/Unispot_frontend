import type { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
}

const Table = ({ headers, children }: TableProps) => (
  <div className="glass-panel-strong w-full overflow-x-auto rounded-2xl">
    <table className="w-full text-left text-sm">
      <thead className="bg-white/45 text-xs uppercase text-slate-600">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/45">{children}</tbody>
    </table>
  </div>
)

export default Table
