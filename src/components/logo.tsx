export function Logo({ logo, className }: { logo: string, className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-primary text-primary-foreground rounded-lg aspect-square ${className}`}>
        <span className="font-bold font-headline">{logo}</span>
    </div>
  );
}
