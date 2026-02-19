import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameWeek,
  isSameDay,
  isSameMonth
} from 'date-fns';
import './index.css';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekSelector({
  selectedWeekStart,  
  onWeekChange,        
  locale = undefined,  
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(selectedWeekStart);

  // keep internal state in sync if the parent changes the prop
  useEffect(() => {
    setSelectedWeek(selectedWeekStart);
  }, [selectedWeekStart]);

  /* -------- helpers -------- */
  const generateMonthWeeks = month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const weeks = [];

    let current = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const monthEndWeek = endOfWeek(monthEnd, { weekStartsOn: 1 });

    while (current <= monthEndWeek) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = addDays(current, 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const handlePrevMonth = () => setCurrentMonth(d => subMonths(d, 1));
  const handleNextMonth = () => setCurrentMonth(d => addMonths(d, 1));

  const handleWeekClick = weekStart => {
    setSelectedWeek(weekStart);
    onWeekChange(weekStart);
  };

  const weeks = generateMonthWeeks(currentMonth);

  /* -------- render -------- */
  return (
    <div className="container my-3">
      {/* Month navigation */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={handlePrevMonth}
        >
          &lt;
        </button>
        <h5 className="mb-0">
          {format(currentMonth, 'MMMM yyyy', { locale })}
        </h5>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={handleNextMonth}
        >
          &gt;
        </button>
      </div>

      {/* Calendar table */}
      <table className="table table-bordered table-hover small">
        <thead className="table-light">
          <tr>
            {WEEK_DAYS.map(d => (
              <th key={d} className="text-center">
                {d}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {weeks.map((week, idx) => {
            const weekStart = week[0];
            const isSelected =
              selectedWeek &&
              isSameWeek(weekStart, selectedWeek, { weekStartsOn: 1 });

            return (
              <tr
                key={idx}
                className={isSelected ? 'table-primary' : ''}
                onClick={() => handleWeekClick(weekStart)}
                style={{ cursor: 'pointer' }}
              >
                {week.map((day, i) => (
                  <td
                    key={i}
                    className={isSameMonth(day, currentMonth) ? '' : 'text-muted'}
                    style={{ verticalAlign: 'top' }}
                  >
                    <div
                      className={
                        isSameDay(day, new Date())
                          ? 'fw-bold text-danger'
                          : ''
                      }
                    >
                      {format(day, 'd', { locale })}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
