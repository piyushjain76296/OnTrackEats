interface CircularProgressProps {
    step: number;
  }
  
  const CircularProgress = ({ step }: CircularProgressProps) => {
    return (
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="#2563EB"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(step / 4) * 377} 377`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{Math.round((step / 4) * 100)}%</span>
        </div>
      </div>
    );
  };
  
  export default CircularProgress;