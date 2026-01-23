import { IoCalendarOutline } from "react-icons/io5";
import { useRef } from "react";
import { formatDateShort } from "./formatDateShort";
import { getTodayDate } from "./getTodayDate";

const TimeLineDatePicker = ({ selectedDate, setSelectedDate }) => {
  const inputRef = useRef(null);

  const handleIconClick = () => {
    inputRef.current?.showPicker(); // modern browsers
  };

  const handleChange = (e) => {
    const value = e.target.value; // yyyy-mm-dd
    setSelectedDate(value);
  };

  return (
    <div className="flex items-center gap-2 text-white">
      <span>{formatDateShort(selectedDate)}</span>

      {/* Hidden date input */}
      <input
        ref={inputRef}
        type="date"
        value={selectedDate}
        onChange={handleChange}
        className="absolute opacity-0 pointer-events-none"
        max={getTodayDate()}
      />

      {/* Calendar icon */}
      <IoCalendarOutline
        className="cursor-pointer text-lg text-slate-300 hover:text-white"
        onClick={handleIconClick}
      />
    </div>
  );
};

export default TimeLineDatePicker;
