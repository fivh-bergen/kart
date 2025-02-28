import { endOfWeek, format, startOfWeek } from "date-fns";
import opening_hours from "opening_hours";
import "./OpeningHours.css";
import { nb } from "date-fns/locale";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
export interface OpeningHoursProps {
  openingHours: string;
  openingHoursChecked?: Date;
}

export const OpeningHours: React.FC<OpeningHoursProps> = ({
  openingHours,
  openingHoursChecked,
}) => {
  const oh = new opening_hours(openingHours, null);
  const now = new Date();
  const mondayMorning = startOfWeek(now);
  const sundayEvening = endOfWeek(now);
  const intervals = oh.getOpenIntervals(mondayMorning, sundayEvening);
  const isOpen = oh.getState();
  const nextChange = oh.getNextChange();

  const [showOpeningHours, setShowOpeningHours] = useState(false);

  return (
    <>
      <div
        className="opening-hours-lead"
        onClick={() => setShowOpeningHours(!showOpeningHours)}
      >
        <div className="opening-hours">
          {isOpen ? (
            <span style={{ color: "green" }}>Åpent</span>
          ) : (
            <div>
              <span style={{ color: "red" }}>Stengt</span>
              {nextChange && (
                <span>
                  , åpner {format(nextChange, "eeee HH:mm", { locale: nb })}
                </span>
              )}
            </div>
          )}
          <div className="opening-hours-toggle">
            {showOpeningHours ? "vis mindre" : "vis mer"}
          </div>
        </div>
        <div className="opening-hours-checked">
          {openingHoursChecked &&
            `Sist sjekket ${format(openingHoursChecked, "dd.MM.yyyy")}`}
        </div>
      </div>
      {showOpeningHours && (
        <>
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
      )}
    </>
  );
};
