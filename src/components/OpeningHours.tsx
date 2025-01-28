import { endOfDay, format, nextMonday, nextSunday, startOfDay } from "date-fns";
import opening_hours from "opening_hours";
import "./opening-hours.css";
import { nb } from "date-fns/locale";
export interface OpeningHoursProps {
  openingHours: string;
}

export const OpeningHours: React.FC<OpeningHoursProps> = ({ openingHours }) => {
  const oh = new opening_hours(openingHours, {
    lat: 60.39,
    lon: 5.32,
    address: { country_code: "NO", state: "Vestland" },
  });
  const now = new Date();
  const mondayMorning = startOfDay(nextMonday(now));
  const sundayEvening = endOfDay(nextSunday(now));
  const intervals = oh.getOpenIntervals(mondayMorning, sundayEvening);
  const isOpen = oh.getState();
  const nextChange = oh.getNextChange();

  return (
    <>
      {isOpen ? (
        <div>Åpent</div>
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
    </>
  );
};
