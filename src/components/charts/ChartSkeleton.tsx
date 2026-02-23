interface ChartSkeletonProps {
  heightClassName?: string
}

const ChartSkeleton = ({ heightClassName = 'h-72' }: ChartSkeletonProps) => (
  <div className={`w-full animate-pulse rounded-xl bg-slate-200/70 ${heightClassName}`} />
)

export default ChartSkeleton
