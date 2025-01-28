import {
  endOfDay,
  endOfWeek,
  format,
  nextMonday,
  nextSunday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import opening_hours from "opening_hours";
import "./opening-hours.css";
import { nb } from "date-fns/locale";
import { Fragment } from "react/jsx-runtime";
export interface OpeningHoursProps {
  openingHours: string;
}

export const OpeningHours: React.FC<OpeningHoursProps> = ({ openingHours }) => {
  const oh = new opening_hours(openingHours, null);
  const now = new Date();
  const mondayMorning = startOfWeek(now);
  const sundayEvening = endOfWeek(now);
  const intervals = oh.getOpenIntervals(mondayMorning, sundayEvening);
  const isOpen = oh.getState();
  const nextChange = oh.getNextChange();

  return (
    <>
      {isOpen ? (
        <div>Åpent nå</div>
      ) : (
        <div>
          Stengt
          {nextChange && (
            <span>
              , åpner {format(nextChange, "eeee HH:mm", { locale: nb })}
            </span>
          )}
        </div>
      )}
      <h2>Åpningstider</h2>
      <div className="opening-hours-grid">
        {intervals.map(([start, end], i) => (
          <Fragment key={i}>
            <div>{format(start, "cccc", { locale: nb })}</div>
            <div>
              {format(start, "HH:mm")} – {format(end, "HH:mm")}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
};
