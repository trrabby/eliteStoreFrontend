export function Logo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    default: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={`font-display font-bold ${sizes[size]} leading-none`}>
      <span className="text-gray-900">Elite</span>
      <span className="text-primary"> Store</span>
    </div>
  );
}
