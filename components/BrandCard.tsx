interface BrandCardProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
}

export default function BrandCard({ name, logoUrl, className = '' }: BrandCardProps) {
  return (
    <div className={`flex items-center justify-center border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}>
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={name} 
          className="h-12 w-auto object-contain max-w-full"
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-lg font-medium">${name}</span>`;
            }
          }}
        />
      ) : (
        <span className="text-lg font-medium">{name}</span>
      )}
    </div>
  );
}
