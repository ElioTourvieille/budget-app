export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f5f0e6]">
      <span className="text-4xl font-bold tracking-tight select-none">Klear</span>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="size-1.5 rounded-full bg-foreground/30 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
