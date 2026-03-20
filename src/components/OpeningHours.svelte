<script lang="ts">
  import { addDays, endOfWeek, format, isBefore, startOfWeek } from "date-fns";
  import opening_hours from "opening_hours";
  import { nb } from "date-fns/locale";

  interface Props {
    openingHours: string;
    openingHoursChecked?: Date;
  }

  let { openingHours, openingHoursChecked }: Props = $props();

  let showDetails = $state(false);
  let parsed = $state<{
    isOpen: boolean;
    nextChange: Date | undefined;
    nextChangeIsWithinWeek: boolean;
    nextChangeIsWithinTwoWeeks: boolean;
    intervals: [Date, Date][];
    hasDetailed: boolean;
  } | null>(null);

  try {
    const oh = new opening_hours(openingHours, null);
    const now = new Date();
    const mondayMorning = startOfWeek(now);
    const sundayEvening = endOfWeek(now);
    const rawIntervals = oh
      .getOpenIntervals(mondayMorning, sundayEvening)
      .filter(
        ([_start, _end, unknown, comment]: [Date, Date, boolean, string]) =>
          !unknown && !comment,
      );
    const isOpen = oh.getState();
    const nextChange = oh.getNextChange();
    const hasDetailed = rawIntervals.length > 1;

    const nextChangeIsWithinWeek = nextChange
      ? isBefore(nextChange, addDays(now, 7))
      : false;
    const nextChangeIsWithinTwoWeeks = nextChange
      ? isBefore(nextChange, addDays(now, 14))
      : false;

    showDetails = window.innerWidth > 968 && hasDetailed;

    parsed = {
      isOpen,
      nextChange,
      nextChangeIsWithinWeek,
      nextChangeIsWithinTwoWeeks,
      intervals: rawIntervals.map(([s, e]: [Date, Date]) => [s, e]),
      hasDetailed,
    };
  } catch {
    parsed = null;
  }
</script>

{#if parsed}
  <div>
    <div class="opening-hours-flex">
      <!-- Clock icon -->
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <div class="opening-hours-box">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class="opening-hours-lead"
          class:pointer={parsed.hasDetailed}
          onclick={parsed.hasDetailed
            ? () => (showDetails = !showDetails)
            : undefined}
          role={parsed.hasDetailed ? "button" : undefined}
          tabindex={parsed.hasDetailed ? 0 : undefined}
          onkeydown={parsed.hasDetailed
            ? (e) => {
                if (e.key === "Enter" || e.key === " ")
                  showDetails = !showDetails;
              }
            : undefined}
        >
          <div class="opening-hours">
            {#if parsed.isOpen}
              <div>
                <span style="color: green">Åpent</span>
                {#if parsed.nextChange}
                  <span
                    >, stenger {format(parsed.nextChange, "HH:mm", {
                      locale: nb,
                    })}</span
                  >
                {/if}
              </div>
            {:else}
              <div>
                <span style="color: red">Stengt</span>
                {#if parsed.nextChange}
                  <span
                    >, åpner
                    {parsed.nextChangeIsWithinWeek
                      ? format(parsed.nextChange, "eeee HH:mm", {
                          locale: nb,
                        })
                      : parsed.nextChangeIsWithinTwoWeeks
                        ? `neste ${format(parsed.nextChange, "eeee HH:mm", { locale: nb })}`
                        : format(parsed.nextChange, "do MMMM", {
                            locale: nb,
                          })}</span
                  >
                {/if}
              </div>
            {/if}
            {#if parsed.hasDetailed}
              <div class="opening-hours-toggle">
                {showDetails ? "vis mindre" : "vis mer"}
              </div>
            {/if}
          </div>
          <div class="opening-hours-checked">
            {#if openingHoursChecked}
              Sist sjekket {format(openingHoursChecked, "dd.MM.yyyy")}
            {/if}
          </div>
        </div>
        {#if showDetails}
          <div class="opening-hours-grid">
            {#each parsed.intervals as [start, end]}
              <div>{format(start, "cccc", { locale: nb })}</div>
              <div>{format(start, "HH:mm")} – {format(end, "HH:mm")}</div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .opening-hours-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .opening-hours-lead {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .pointer {
    cursor: pointer;
  }

  .opening-hours {
    display: flex;
    gap: 0.5rem;
  }

  .opening-hours-toggle {
    color: #777777;
  }

  .opening-hours-checked {
    color: #777777;
    font-size: 0.9rem;
  }

  .opening-hours-flex {
    display: flex;
    gap: 0.5rem;
  }

  .opening-hours-box {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
