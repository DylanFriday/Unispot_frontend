import type { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
}

const Table = ({ headers, children }: TableProps) => (
  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
)

export default Table
