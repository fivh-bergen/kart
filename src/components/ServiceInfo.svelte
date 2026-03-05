<script lang="ts">
  import { config } from "../config.local";
</script>

<div class="panel-lead">
  <p>
    Velkommen til gjenbruksportalen! Denne tjenesten er utviklet av
    <a href="https://www.framtiden.no/om-oss/lokallag/vestland" target="_blank">
      Fremtiden i Våre Hender Bergen
    </a>
    med midler fra
    <a href="https://www.lnu.no" target="_blank">LNU</a>, og er til for å gjøre
    det enklere for deg å finne bruktbutikker, reparasjonssteder og utleiesteder
    i {config.appAreaName}.
  </p>
  <p>
    Med filterknappene kan du velge hvilken type steder du vil se i kartet.
    Trykk på samme filterknapp igjen for å fjerne filteret. Ved å trykke på en
    nål på kartet får du opp detaljer om det stedet.
  </p>
  <h2>Åpen kildekode, åpen data</h2>
  <p>
    Dette prosjektet har åpen kildekode. Kildekoden og teknisk dokumentasjon
    finnes på
    <a href="https://github.com/fivh-bergen/kart" target="_blank">GitHub</a>.
  </p>
  <p>
    Informasjonen i kartet kommer fra OpenStreetMap, en åpen database for
    geografisk informasjon som alle kan bruke og alle kan bidra til. Det er i
    bunn og grunn wikipedia i kartform. Hvis du vet om en butikk som ikke er på
    kartet eller ser noen manglende eller gale opplysninger, kan du selv rette
    opp i dette ved å logge inn med din
    <a href="https://openstreetmap.org" target="_blank">OpenStreetMap.org</a>
    konto eller via en app som
    <a href="https://streetcomplete.app/" target="_blank">StreetComplete</a>
    eller
    <a href="https://every-door.app/" target="_blank">EveryDoor</a>.
  </p>
  <p>
    Ved å bidra til OpenStreetMap bidrar du til å holde gjenbruksportalen
    oppdatert, men du bidrar også til flerfoldige andre løsninger som bruker
    data fra OpenStreetMap.
  </p>
  <h2>Ofte stilte spørsmål</h2>
  <h3>Har dere riktige åpningstider for påske, jul, sommer, osv.?</h3>
  <p>
    Sannsynligvis ikke. Det er en del jobb å kartlegge avvikende åpningstider,
    så du må nok undersøke dette selv, for eksempel på nettsiden til
    butikken/tjenesten.
  </p>

  <a class="contact-link" href="mailto:bergen@framtiden.no">
    Kontakt oss på bergen@framtiden.no
    <!-- Arrow right icon -->
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  </a>
</div>

<style>
  .panel-lead {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .contact-link {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;
    background-color: #ff7a00;
    color: white;
    border-radius: 2rem;
    padding: 1rem;
    width: fit-content;
  }

  .contact-link:hover {
    text-decoration: none;
  }
</style>
