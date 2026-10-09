interface TopNavProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function TopNav({ search, onSearchChange }: TopNavProps) {
  return (
    <header className="flex items-center justify-between bg-slate-900 text-white px-6 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌍</span>
        <h1 className="text-lg font-semibold tracking-wide">Air Quality Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search stations..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
      </div>
    </header>
  )
}
