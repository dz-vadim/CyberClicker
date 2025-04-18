interface ProgressBarProps {
  value: number
  maxValue: number
  primaryColor: string
  secondaryColor: string
  height?: number
}

export default function ProgressBar({ value, maxValue, primaryColor, secondaryColor, height = 4 }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100))

  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{
        backgroundColor: secondaryColor,
        height: `${height}px`,
      }}
    >
      <div
        className="h-full transition-all duration-100"
        style={{
          width: `${percentage}%`,
          backgroundColor: primaryColor,
          boxShadow: `0 0 5px ${primaryColor}`,
        }}
      ></div>
    </div>
  )
}
