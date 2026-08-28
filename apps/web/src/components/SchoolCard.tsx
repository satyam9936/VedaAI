import React from 'react';
import dpsLogo from '../assets/dps-logo.png';

interface SchoolCardProps {
  isCollapsed?: boolean;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ isCollapsed = false }) => {
  if (isCollapsed) {
    return (
      <div 
        className="w-10 h-10 rounded-xl bg-white border border-[#E3E3E3] flex items-center justify-center p-1 shadow-sm overflow-hidden" 
        title="Delhi Public School Bokaro Steel City"
      >
        <img src={dpsLogo} alt="Delhi Public School" className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div className="w-[275px] h-[75px] bg-[#F0F0F0] rounded-[17px] p-3 flex items-center gap-3 select-none">
      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center p-1 shrink-0 shadow-sm overflow-hidden">
        <img src={dpsLogo} alt="Delhi Public School" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col justify-center leading-tight truncate">
        <span className="font-medium text-[15px] text-[#292929] block truncate font-sans">
          Delhi Public School
        </span>
        <span className="font-normal text-[13px] text-[#7F7F7F] block truncate mt-0.5 font-sans">
          Bokaro Steel City
        </span>
      </div>
    </div>
  );
};
