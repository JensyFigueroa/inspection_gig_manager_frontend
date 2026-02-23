const RevLogo = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline">
        <span 
          className="text-4xl font-black text-black tracking-tighter italic" 
          style={{ fontFamily: 'Arial Black, sans-serif' }}
        >
          R
        </span>
        <span 
          className="text-4xl font-black text-black tracking-tighter italic" 
          style={{ fontFamily: 'Arial Black, sans-serif' }}
        >
          E
        </span>
        <svg className="w-10 h-8 -ml-1" viewBox="0 0 50 35">
          <path 
            d="M8 28 L25 5" 
            stroke="#DC2626" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M25 5 L42 28" 
            stroke="#16A34A" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span 
        className="text-[10px] text-red-600 font-normal italic -mt-1" 
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Vehicles for life
      </span>
    </div>
  );
};

export default RevLogo;