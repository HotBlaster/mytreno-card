import { html, css, LitElement } from "https://unpkg.com/lit@2.8.0/index.js?module";
import { loadHaComponents, DEFAULT_HA_COMPONENTS } from "https://cdn.jsdelivr.net/npm/@kipk/load-ha-components/+esm";

loadHaComponents([
  ...DEFAULT_HA_COMPONENTS,
  "ha-selector",
  "ha-entity-picker",
]).catch(() => {});

// 1. OGGETTO GLOBALE TRADUZIONI E FUNZIONE GLOBALE
if (!window.MyTrenoTranslations) window.MyTrenoTranslations = {
  it: {
    departures: "Partenze da",
    arrivals: "Arrivi a",
    destination: "Destinazione",
    provenance: "Provenienza",
    delay: "Ritardo",
    platform: "Binario",
    real: "Reale",
    info: "Info",
    on_time: "In orario",
    next: "Prossima",
    route: "Percorso",
    loading: "⏳ Caricamento dati...",
    loading_hint: "I dati in tempo reale del treno selezionato vengono scaricati direttamente dalla rete ferroviaria. Ancora qualche secondo…",
    not_available: "⚠️ Dati non disponibili",
    add_card: "Aggiungi card",
    train: "Treno",
    late: "+{delay} min",
    early: "{delay} min",
    min: "min",
    orario: "Orario",
    select_station: "Seleziona la stazione",
    select_theme: "Seleziona il tema",
    theme_default: "Default",
    theme_light: "Light (Chiaro)",
    theme_neon: "Neon (Cyberpunk)",
    theme_retro: "Display",
    theme_trenitalia: "My Treno",
    train_name: "Nome Treno",
    select_train: "Seleziona il treno",
    theme: "Tema",
    show_route: "Percorso",
    missing_sensor: "Config non valida: manca il sensore",
    has_stop_filter: "Filtra per fermata",
    favorite_trains: "Treni preferiti (id separati da virgola)"
  },
  en: {
    departures: "Departures from",
    arrivals: "Arrivals at",
    destination: "Destination",
    provenance: "From",
    delay: "Delay",
    platform: "Platform",
    real: "Actual",
    info: "Info",
    on_time: "On time",
    next: "Next",
    route: "Route",
    loading: "⏳ Loading data...",
    loading_hint: "Real-time data for the selected train is being fetched from the rail network. Just a few more seconds…",
    not_available: "⚠️ Data not available",
    add_card: "Add card",
    train: "Train",
    late: "+{delay} min",
    early: "{delay} min",
    min: "min",
    orario: "Time",
    select_station: "Select station",
    select_theme: "Select theme",
    theme_default: "Default",
    theme_light: "Light",
    theme_neon: "Neon",
    theme_retro: "Display",
    theme_trenitalia: "My Treno",
    train_name: "Train Name",
    select_train: "Select train",
    theme: "Theme",
    show_route: "Route",
    missing_sensor: "Invalid config: missing sensor",
    has_stop_filter: "Filter by stop",
    favorite_trains: "Favorite trains (comma-separated ids)"
  }
};
window.myTrenoT = function(key, lang, vars = {}) {
  const labels = window.MyTrenoTranslations;
  let str = (labels[lang] && labels[lang][key]) ? labels[lang][key] : (labels['en'][key] || key);
  Object.keys(vars).forEach(k => {
    str = str.replace(`{${k}}`, vars[k]);
  });
  return str;
};

class MyTrenoCardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    _config: { type: Object },
  };

  constructor() {
    super();
    this._config = {};
  }

  _getLang() {
    if (!this.hass) return 'en';
    return (this.hass.selectedLanguage || this.hass.language || 'en').substring(0,2);
  }

  setConfig(config) {
    // Imposta valore di default se mancante
    if (!config.extra_sensor) {
      config.extra_sensor = "sensor.mytreno_selected_train";
    }

    this._config = { ...config };
  }

  getConfig() {
    // Assicura che extra_sensor venga incluso
    return {
      ...this._config,
      extra_sensor: this._config.extra_sensor || "sensor.mytreno_selected_train",
    };
  }

  _updateConfig(changedProp, value) {
    const newConfig = { ...this._config, [changedProp]: value };
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.hass) return html``;
    const mytrenoEntities = Object.keys(this.hass.states)
      .filter(e => e.startsWith("sensor.mytreno"));
    return html`
      <div style="background:#e63946;color:#fff;padding:4px 8px;font-size:0.75rem;border-radius:4px;margin-bottom:8px;">⚡ Custom My Treno Card 1.0.2</div>
      <div class="section-title">${window.myTrenoT('select_station', this._getLang())}</div>
      <ha-selector
        .hass=${this.hass}
        .selector=${{
          entity: {
            multiple: false,
            include_entities: mytrenoEntities,
          }
        }}
        .value=${this._config.sensor || ""}
        @value-changed=${e => this._updateConfig("sensor", e.detail.value)}>
      </ha-selector>
      <div class="editor-block">
        <label style="font-size: 0.85rem; opacity: 0.7;">${window.myTrenoT('has_stop_filter', this._getLang())}</label>
        <ha-textfield
          .value=${this._config.hasStop || ""}
          @input=${e => this._updateConfig("hasStop", e.target.value || undefined)}
        ></ha-textfield>
      </div>
      <div class="editor-block">
        <label style="font-size: 0.85rem; opacity: 0.7;">${window.myTrenoT('favorite_trains', this._getLang())}</label>
        <ha-textfield
          .value=${Array.isArray(this._config.favoriteTrains) ? this._config.favoriteTrains.join(", ") : (this._config.favoriteTrains || "")}
          @input=${e => this._updateConfig("favoriteTrains", e.target.value || undefined)}
        ></ha-textfield>
      </div>
      <div class="editor-block">
        <ha-formfield label="${window.myTrenoT('select_theme', this._getLang())}">
          <ha-selector
            .hass=${this.hass}
            .selector=${{
              select: {
                mode: "dropdown",
                options: [
                  { value: "default", label: window.myTrenoT('theme_default', this._getLang()) },
                  { value: "light", label: window.myTrenoT('theme_light', this._getLang()) },
                  { value: "neon", label: window.myTrenoT('theme_neon', this._getLang()) },
                  { value: "retro", label: window.myTrenoT('theme_retro', this._getLang()) },
                  { value: "trenitalia", label: window.myTrenoT('theme_trenitalia', this._getLang()) },
                ]              }
            }}
            .value=${this._config.theme || "default"}
            @value-changed=${e => this._updateConfig("theme", e.detail.value)}
          ></ha-selector>
        </ha-formfield>
      </div>
    `;
  }


  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .editor-block {
      margin-bottom: 1.5rem;
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 500;
    }
  `;
}

customElements.define("my-treno-card-editor", MyTrenoCardEditor);

class MyTrenoCard extends HTMLElement {
  constructor() {
    super();
    this.page = 0;
    this._preventRender = false;
    this._popupOpen = false;
    this._resizeHandler = this._updateScrollingText.bind(this);
    this._visibilityHandler = this._updateScrollingText.bind(this);
    this._routeCache = {};
    this._fetchQueue = [];
    this._fetchingRoute = false;
  }

  connectedCallback() {
    window.addEventListener('resize', this._resizeHandler);
    document.addEventListener('visibilitychange', this._visibilityHandler);
    this._updateScrollingText();
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this._resizeHandler);
    document.removeEventListener('visibilitychange', this._visibilityHandler);
  }

  _updateScrollingText() {
    // Esegui solo se la card è visibile
    if (document.hidden) return;
    requestAnimationFrame(() => {
      this.querySelectorAll('.treno-scrollable-text').forEach(el => {
        const span = el.querySelector('span');
        if (span && span.scrollWidth > el.clientWidth) {
          el.classList.add('treno-overflowing');
          el.style.setProperty('--scroll-width', el.clientWidth + 'px');
        } else {
          el.classList.remove('treno-overflowing');
          el.style.removeProperty('--scroll-width');
        }
      });
      this.querySelectorAll('.treno-ritardo-box').forEach(el => {
        const span = el.querySelector('span');
        if (span && span.scrollWidth > el.clientWidth) {
          el.classList.add('treno-scroll');
        } else {
          el.classList.remove('treno-scroll');
        }
      });
    });
  }

  _getLang() {
    if (!this._hass) return 'en';
    return (this._hass.selectedLanguage || this._hass.language || 'en').substring(0,2);
  }

  async _showTrainDetails(treno) {
    const trainNum = (treno.treno || "").match(/\d+/)?.[0];
    if (!trainNum) return;

    // Rimuovi eventuali popup già aperti
    const existing = this.querySelector(".treno-popup-overlay");
    if (existing) existing.remove();

    // Crea subito il popup con lo stato di caricamento (unico popup)
    this._popupOpen = true;
    const overlay = document.createElement("div");
    overlay.className = "treno-popup-overlay";
    const popup = document.createElement("div");
    popup.className = `treno-popup theme-${this._theme}`;
    popup.innerHTML = `
      <button class="close-btn">&times;</button>
      <div id="treno-detail-body" class="treno-popup-content">
        <div style="text-align:center;padding:2rem 0 0.5rem;opacity:.7;">${window.myTrenoT('loading', this._getLang())}</div>
        <div id="treno-loading-hint" class="treno-loading-hint"></div>
      </div>
    `;
    overlay.appendChild(popup);
    this.appendChild(overlay);
    // Stili applicati subito: anche la schermata di caricamento eredita il tema
    const styleTag = document.createElement("style");
    styleTag.textContent = `
        .fermate {
          margin: 0;
          padding: 0;
          overflow: visible !important;
          max-height: none !important;
        }
        .fermate li { line-height:1.4em; }
        .fermate li.done { opacity:.4; text-decoration:line-through; }
        .bin { font-size:.8em; opacity:.7; }
        .treno-popup-content p {
          margin: 0.75rem 0;
          line-height: 1.4;
        }
        .treno-timeline-scroll {
          overflow-x: auto;
          overflow-y: visible;
          padding: 0;
          margin-top: 1rem;
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: #999 transparent;
        }
        .treno-timeline-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .treno-timeline-scroll::-webkit-scrollbar-thumb {
          background-color: #999;
          border-radius: 10px;
        }
        .treno-timeline {
        	display: flex;
        	position: relative;
        	flex-direction: row;
        	min-height: 200px;
        	width: fit-content;
        	align-items: end;
        	gap: 0;
        	justify-content: center;
        	margin-bottom: 20px;
        }
        .treno-timeline::before {
        	content: '';
        	position: absolute;
        	top: 77.5%;
        	transform: translateY(-50%);
        	left: 0;
        	width: var(--timeline-line-width, 100%);
        	height: 8px;
        	background: #0010ff;
        	z-index: 0;
        }
        .treno-stop {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
          max-width: 80px;
          min-height: 100px;
          max-height: 100px;

        }
        .treno-stop .label {
        	transform: rotate(-35deg);
        	transform-origin: bottom left;
        	font-size: 0.7rem;
        	font-weight: 800;
        	white-space: nowrap;
        	text-overflow: ellipsis;
        	overflow: visible;
        	max-width: 70px;
        	margin-bottom: 1.2rem;
        	height: 2rem;
        	line-height: 8;
        	text-align: left;
        	color: var(--mytreno-text-color, #ffffff);
        	margin-left: 50px;
        }
        .treno-stop .dot {
          width: 16px;
          height: 16px;
          background: #ccc;
          border-radius: 50%;
          position: relative;
          z-index: 1;
          border: 2px solid #fff;
          transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        }

        .treno-stop:hover .dot {
          transform: scale(1.2);
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        }

        .treno-stop.done .dot {
          background: #4caf50;
          opacity: 0.4;
        }
        .treno-stop.next .dot {
          background: #ff9800;
          box-shadow: 0 0 6px #ff9800, 0 0 12px rgba(255, 152, 0, 0.4);
          animation: pulse-dot 1.5s infinite;
        }

        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(255,152,0,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(255,152,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,152,0,0); }
        }

        .treno-stop .info {
          font-size: 0.8rem;
          margin-top: 0.6rem;
          color: var(--mytreno-info-color, #ffffff);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-align: center;
          line-height: 1.2;
        }

        .treno-stop .info span:first-child {
          font-weight: 600;
        }

        .treno-stop .info span:last-child {
          font-style: italic;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .treno-popup.theme-light {
          --mytreno-text-color: #000;
          --mytreno-info-color: #000;
          background: #fff;
          color: #111;
          font-family: 'Inter', sans-serif;
        }

        .treno-popup.theme-retro .treno-timeline::before {
          background: #d00000;
        }
        .treno-popup.theme-neon .treno-timeline::before {
        	background: #e0e2ff;
        	box-shadow: 15px 0px 17px #1af4ff, 0 0 20px #2060f6;
        	border-radius: 36px;
        }
        .treno-popup.theme-light .treno-timeline::before {
          background: #5679ff;
        }
        .treno-popup.theme-light h3 {
          color: #007aff;
        }
        .treno-popup.theme-light .close-btn {
          color: #000;
        }
        .treno-popup.theme-light .treno-popup-content strong {
          color: #444;
        }

        .treno-popup.theme-neon {
          --mytreno-text-color: #66ffe0;
          --mytreno-info-color: #ff00cc;
          background: #0f0f23;
          color: #00ffcc;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 0 20px #00ffcc55;
        }
        .treno-popup.theme-neon h3 {
          color: #ff00cc;
        }
        .treno-popup.theme-neon .close-btn {
          color: #00ffcc;
        }
        .treno-popup.theme-neon .treno-popup-content strong {
          color: #66ffe0;
        }

        .treno-popup.theme-retro {
          --mytreno-text-color: #ffffff;
          --mytreno-info-color: #ffffff;
          background: #202020;
          color: #ffcc00;
          font-family: 'Press Start 2P', monospace;
          border: 2px solid #333;
          box-shadow: inset 0 0 6px #111;
        }
        .treno-popup.theme-retro h3 {
          color: #ffffff;
          font-size: 0.85rem;
        }
        .treno-popup.theme-retro .close-btn {
          color: #ffcc00;
        }
        .treno-popup.theme-retro .treno-popup-content strong {
          color: #ffcc00;
        }

        .treno-loading-hint {
          text-align: center;
          font-size: 0.8rem;
          opacity: 0;
          padding: 0 1rem 1.5rem;
          line-height: 1.5;
          transition: opacity 0.6s ease;
          color: var(--mytreno-text-color, #aaa);
        }
        .treno-loading-hint--visible {
          opacity: 0.55;
        }

        .treno-popup.theme-trenitalia {
          --mytreno-text-color: #cccccc;
          --mytreno-info-color: #00EE44;
          background: #060d07;
          color: #cccccc;
          font-family: 'VT323', monospace;
          border-top: 4px solid #E30613;
          border-bottom: 4px solid #007A33;
          box-shadow: 0 0 0 2px #1c1c1c, 0 0 30px rgba(0,0,0,0.8);
        }
        .treno-popup.theme-trenitalia h3 {
          color: #FF3300;
          font-family: 'VT323', monospace;
          font-size: 1.7rem;
          font-weight: normal;
        }
        .treno-popup.theme-trenitalia h4 {
          color: #00EE44;
          font-family: 'VT323', monospace;
          font-size: 1.4rem;
          font-weight: normal;
        }
        .treno-popup.theme-trenitalia .close-btn {
          color: #cccccc;
        }
        .treno-popup.theme-trenitalia .treno-popup-content strong {
          color: #00EE44;
        }
        .treno-popup.theme-trenitalia .treno-timeline::before {
          background: #E30613;
        }
        .treno-popup.theme-trenitalia .treno-stop .label {
          color: #cccccc;
        }
        .treno-popup.theme-trenitalia .treno-stop .info {
          color: #00EE44;
        }
    `;
    popup.appendChild(styleTag);
    // Mostra il suggerimento di caricamento dopo 2 secondi
    const hintEl = popup.querySelector("#treno-loading-hint");
    if (hintEl) {
      setTimeout(() => {
        if (hintEl.isConnected) {
          hintEl.textContent = window.myTrenoT('loading_hint', this._getLang());
          hintEl.classList.add('treno-loading-hint--visible');
        }
      }, 2000);
    }
    overlay.addEventListener("click", e => {
      if (e.target === overlay) { overlay.remove(); this._popupOpen = false; }
    });
    popup.querySelector(".close-btn").addEventListener("click", () => { overlay.remove(); this._popupOpen = false; });

    // Controlla se il sensore ha già i dati freschi per questo treno
    const cachedAttrs = this._hass.states["sensor.mytreno_selected_train"]?.attributes ?? {};
    console.log(`[MyTreno] click treno: treno.treno=${treno.treno}, trainNum=${trainNum} (${typeof trainNum})`);
    console.log(`[MyTreno] sensore attuale: train_number=${cachedAttrs.train_number} (${typeof cachedAttrs.train_number}), fermate=${Array.isArray(cachedAttrs.fermate) ? cachedAttrs.fermate.length : 'N/A'}`);
    const hasFreshData = String(cachedAttrs.train_number) === String(trainNum) &&
      Array.isArray(cachedAttrs.fermate) && cachedAttrs.fermate.length > 0;
    console.log(`[MyTreno] hasFreshData=${hasFreshData}`);

    let attrs;
    if (hasFreshData) {
      console.log(`[MyTreno] ✅ cache hit, dati già disponibili`);
      attrs = cachedAttrs;
    } else {
      const t0 = Date.now();
      console.log(`[MyTreno] chiamo set_train con train_number=${trainNum} alle ${new Date().toISOString()}`);
      await this._hass.callService("mytreno", "set_train", { train_number: trainNum });
      console.log(`[MyTreno] callService completato in ${Date.now()-t0}ms`);
      const afterService = this._hass.states["sensor.mytreno_selected_train"]?.attributes ?? {};
      console.log(`[MyTreno] sensore SUBITO dopo callService: train_number=${afterService.train_number}, fermate=${Array.isArray(afterService.fermate) ? afterService.fermate.length : 'N/A'}`);
      attrs = await (async () => {
        const startTime = Date.now();
        for (let i = 0; i < 40; i++) {
          const a = this._hass.states["sensor.mytreno_selected_train"]?.attributes ?? {};
          const elapsed = Date.now() - startTime;
          console.log(`[MyTreno] poll #${i} (+${elapsed}ms): train_number=${a.train_number} (${typeof a.train_number}), atteso=${trainNum}, fermate=${Array.isArray(a.fermate) ? a.fermate.length : 'N/A'}`);
          if (String(a.train_number) === String(trainNum) && Array.isArray(a.fermate) && a.fermate.length > 0) {
            console.log(`[MyTreno] ✅ dati trovati al poll #${i} dopo ${elapsed}ms`);
            return a;
          }
          await new Promise(r => setTimeout(r, 300));
        }
        console.warn(`[MyTreno] ❌ timeout dopo ${Date.now() - startTime}ms`);
        return null;
      })();
    }

    const body = popup.querySelector("#treno-detail-body");
    if (!attrs) {
      body.innerHTML = `<p style="color:red;text-align:center;">${window.myTrenoT('not_available', this._getLang())}</p>`;
      return;
    }

    const fermateHTML = `
      <div class="treno-timeline-scroll">
        <div class="treno-timeline">
          ${attrs.fermate.map((f, i) => `
            <div class="treno-stop ${f.arrivato ? 'done' : ''} ${attrs.prossima_stazione === f.stazione ? 'next' : ''}">
              <div class="label">${f.stazione}</div>
              <div class="dot"></div>
              <div class="info">
                <span>${f.programmata?.substring(11, 16) ?? "--"}</span>
                ${f.binario ? `<span>bin ${f.binario}</span>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    body.innerHTML = `
        <h3>${window.myTrenoT('train', this._getLang())} ${attrs.train_number}</h3>
        <p><strong>${window.myTrenoT('delay', this._getLang())}:</strong> ${attrs.ritardo ?? "-"}</p>
        <p><strong>${window.myTrenoT('next', this._getLang())}:</strong> ${attrs.prossima_stazione ?? "-"}</p>
        <h4>${window.myTrenoT('route', this._getLang())}</h4>
        <div class="fermate">${fermateHTML}</div>
    `;
    const scrollContainer = popup.querySelector(".treno-timeline-scroll");
    const nextStop = popup.querySelector(".treno-stop.next");
    if (scrollContainer && nextStop) {
      const offsetLeft = nextStop.offsetLeft - scrollContainer.offsetWidth / 2 + nextStop.offsetWidth / 2;
      scrollContainer.scrollTo({ left: offsetLeft, behavior: "smooth" });
    }
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;

    if (this._popupOpen) {
      const sel = hass.states["sensor.mytreno_selected_train"]?.attributes;
      if (sel) console.log(`[MyTreno] set hass (popup aperto): train_number=${sel.train_number}, fermate=${Array.isArray(sel.fermate) ? sel.fermate.length : 'N/A'}`);
    }

    if (this._preventRender || this._popupOpen) return;

    const changed =
      JSON.stringify(prev?.states?.[this._sensor]) !== JSON.stringify(hass?.states?.[this._sensor]) ||
      JSON.stringify(prev?.states?.[this._extra]) !== JSON.stringify(hass?.states?.[this._extra]);

    if (!changed) return;

    this._render();
  }

  static getConfigElement() {
    return document.createElement("my-treno-card-editor");
  }

  setConfig(config) {
    if (!config.sensor && config.entity) {
      config.sensor = config.entity;
    }

    if (!config.sensor) {
      throw new Error(window.myTrenoT('missing_sensor', this._getLang()));
    }

    if (!config.extra_sensor) {
      config.extra_sensor = "sensor.mytreno_selected_train";
    }

    // hasStop routes are needle-independent, so keep the cache across filter changes
    const newHasStop = config.hasStop || null;
    if (newHasStop !== this._hasStop) {
      this._fetchQueue = [];
    }

    this._config = { ...config };
    this._sensor = config.sensor;
    this._extra  = config.extra_sensor;
    this._theme  = config.theme || "default";
    this._hasStop = newHasStop;
    this._favoriteTrains = this._parseTrainList(config.favoriteTrains);

    // Seed the in-memory cache from localStorage so routes fetched in a
    // previous session (per train, per day) are reused without re-fetching.
    if (this._hasStop && Object.keys(this._routeCache).length === 0) {
      this._routeCache = this._loadPersistedRoutes();
    }
  }
  _parseTrainList(value) {
    if (Array.isArray(value)) return value.map(v => String(v).match(/\d+/)?.[0]).filter(Boolean);
    if (typeof value === "string") return value.split(",").map(v => v.match(/\d+/)?.[0]).filter(Boolean);
    return [];
  }

  _isFavorite(train) {
    if (!this._favoriteTrains || this._favoriteTrains.length === 0) return false;
    const trainNum = String(train.treno || "").match(/\d+/)?.[0];
    return trainNum ? this._favoriteTrains.includes(trainNum) : false;
  }

  _matchesHasStop(train, fieldValue) {
    // Favorite trains bypass the hasStop filter entirely
    if (this._isFavorite(train)) return true;
    const hasFavorites = this._favoriteTrains && this._favoriteTrains.length > 0;
    // No filters at all → show everything
    if (!this._hasStop && !hasFavorites) return true;
    // Favorites configured but no hasStop filter → show only favorites
    if (!this._hasStop) return false;
    const needle = this._hasStop.toLowerCase();
    // 1. Final destination/origin matches → show immediately
    if ((fieldValue || "").toLowerCase().includes(needle)) return true;
    const trainNum = String(train.treno || "").match(/\d+/)?.[0];
    if (!trainNum) return false;
    const cached = this._routeCache[trainNum];
    // 2. Not yet fetched → hide until confirmed, queue for fetch
    if (cached === undefined) {
      if (!this._fetchQueue.includes(trainNum)) {
        this._fetchQueue.push(trainNum);
      }
      return false;
    }
    // 3. Fetch failed/null → hide
    if (!cached) return false;
    // 4. Match only stops still ahead (schedule-based so the cache stays valid all day)
    return cached.some(f => this._isFutureStop(f) && (f.stazione || "").toLowerCase().includes(needle));
  }

  _isFutureStop(f) {
    if (f && f.programmata) {
      const t = new Date(f.programmata).getTime();
      if (!Number.isNaN(t)) return t > Date.now();
    }
    return !(f && f.arrivato);
  }

  _routeCacheKey() {
    return `mytreno_route_cache_${new Date().toISOString().slice(0, 10)}`;
  }

  _loadPersistedRoutes() {
    try {
      const raw = localStorage.getItem(this._routeCacheKey());
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  _persistRoute(trainNum, fermate) {
    try {
      const key = this._routeCacheKey();
      const store = this._loadPersistedRoutes();
      store[trainNum] = fermate;
      localStorage.setItem(key, JSON.stringify(store));
      // Drop caches from previous days to avoid unbounded growth
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("mytreno_route_cache_") && k !== key) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      /* localStorage unavailable or full: keep working with the in-memory cache */
    }
  }

  async _processFetchQueue() {
    if (this._fetchingRoute) return;
    this._fetchingRoute = true;
    while (this._fetchQueue.length > 0) {
      if (this._popupOpen) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      const trainNum = this._fetchQueue.shift();
      if (this._routeCache[trainNum] !== undefined) continue;
      // Block set-hass re-renders while using the shared sensor
      this._preventRender = true;
      try {
        await this._hass.callService("mytreno", "set_train", { train_number: trainNum });
        const fermate = await (async () => {
          for (let i = 0; i < 40; i++) {
            const a = this._hass.states["sensor.mytreno_selected_train"]?.attributes ?? {};
            if (String(a.train_number) === String(trainNum) && Array.isArray(a.fermate) && a.fermate.length > 0) {
              return a.fermate;
            }
            await new Promise(r => setTimeout(r, 150));
          }
          return null;
        })();
        if (!fermate) {
          console.warn(`[hasStop] ⏱ timeout fetching route for train ${trainNum}`);
          this._routeCache[trainNum] = null;
        } else {
          // Keep only what the filter needs and persist it for reuse across reloads
          const minimal = fermate.map(f => ({ stazione: f.stazione, programmata: f.programmata }));
          this._routeCache[trainNum] = minimal;
          this._persistRoute(trainNum, minimal);
        }
      } catch (e) {
        console.warn(`[hasStop] ❌ callService failed for train ${trainNum}:`, e);
        this._routeCache[trainNum] = null;
      }
      this._preventRender = false;
      if (!this._popupOpen) this._render();
    }
    this._fetchingRoute = false;
  }

  _render() {
    if (!this._hass || !this._sensor) return;

    const entity = this._hass.states[this._sensor];
    if (!entity || !entity.attributes) return;

    const partenze = (entity.attributes.partenze || []).filter(t => this._matchesHasStop(t, t.destinazione));
    const arrivi = (entity.attributes.arrivi || []).filter(t => this._matchesHasStop(t, t.provenienza));
    const stationName =
      entity.attributes.station_name ||
      this._hass.entities?.[this._sensor]?.name ||
      this._hass.entities?.[this._sensor]?.original_name ||
      this._sensor.replace(/^sensor\.mytreno_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ||
      "Station";

    this.innerHTML = `
      <div class="theme-${this._config.theme || 'default'}">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
          .theme-default ha-card {
            background: linear-gradient(140deg, #111728 0%, #1a1d26 100%);
            color: #ffffff;
          }
          .theme-retro ha-card {
            background: #202020;
            color: #ffcc00;
            font-family: 'Press Start 2P', monospace;
            border: 2px solid #333;
            border-radius: 4px;
            box-shadow: inset 0 0 6px #111;
          }

          .theme-retro .treno-title {
            font-size: 1.2rem;
            font-weight: bold;
            letter-spacing: 1px;
            color: #ffffff;
            font-family: 'Press Start 2P', monospace;
          }

          .theme-retro .treno-title::before {
            background: none;
          }

          .theme-retro .treno-nav-button {
            background: #111;
            border: 1px solid #666;
            color: #ffcc00;
          }
          .theme-retro table {
            background: black;
          }
          .theme-retro th,
          .theme-retro td {
            font-family: 'Press Start 2P', monospace;
            color: #ffcc00;
            font-size: 0.95rem;
            font-weight: bold;
            border-bottom: 1px solid #222;
          }

          .theme-retro th {
            font-size: 0.75rem;
            font-weight: normal;
            color: #bbbbbb;
            text-transform: uppercase;
          }

          .theme-retro .status-chip {
            background: transparent !important;
            padding: 0 !important;
            font-family: 'Press Start 2P', monospace;
            font-weight: bold;
          }

          .theme-retro .status-chip.on-time {
            color: #00ff00;
          }
          .theme-retro .status-chip.delayed {
            color: #ffaa00;
          }
          .theme-retro .status-chip.late {
            color: #ff4444;
          }

          .theme-retro .treno-platform-badge,
          .theme-retro .treno-platform-arrow {
            all: unset;
          }
          .treno-platform-info {
              display: flex;
              flex-direction: row;
              gap: 5px;
          }
          .theme-light ha-card {
            background: #f9f9f9;
            color: #111;
          }

          .theme-light .treno-title {
            color: #111;
          }

          .theme-light .treno-title::before {
            background: #007aff;
          }

          .theme-light th,
          .theme-light td {
            color: #222;
            border-bottom: 1px solid #ddd;
          }

          .theme-light .treno-nav-button {
            background: rgba(0, 0, 0, 0.05);
            color: #000;
          }

          .theme-light .status-chip.on-time {
            background: rgba(0, 128, 0, 0.1);
            color: #008000;
          }

          .theme-light .status-chip.delayed {
            background: rgba(255, 165, 0, 0.15);
            color: #ff9800;
          }

          .theme-light .status-chip.late {
            background: rgba(255, 0, 0, 0.15);
            color: #d32f2f;
          }

          .theme-light .treno-scrollable-text span,
          .theme-light .treno-ritardo-box span {
            color: #111;
          }

          .theme-neon ha-card {
            background: #0f0f23;
            color: #00ffcc;
            box-shadow: 0 0 15px #00ffcc44;
          }
          .theme-neon .treno-title::before {
            background: #ff00cc;
          }
          .theme-neon .treno-nav-button {
            background: #ff00cc33;
            color: #00ffcc;
          }
          .theme-neon .status-chip.on-time {
            background: #003322;
            color: #00ff99;
          }
          .theme-neon .status-chip.delayed {
            background: #331a00;
            color: #ffaa00;
          }
          .theme-neon .status-chip.late {
            background: #330000;
            color: #ff4444;
          }

          .treno-stripe-top, .treno-stripe-bottom { display: none; }

          /* ── TRENITALIA THEME: LED departure board ── */
          .theme-trenitalia ha-card {
            background: #222d2f;
            color: #cccccc;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 0 0 3px #1c1c1c, 0 8px 32px rgba(0,0,0,0.85);
            border-radius: 6px;
          }
          .theme-trenitalia .treno-stripe-top {
            display: block;
            height: 8px;
            background: linear-gradient(to bottom, #007A33 100%);
            flex-shrink: 0;
          }
          .theme-trenitalia .treno-stripe-bottom {
            display: block;
            margin: 0;
            background: linear-gradient(to bottom, #E30613 100%);
            height: 8px;
            flex-shrink: 0;
          }
          .theme-trenitalia .treno-slider-wrapper {
            padding: 0.4rem 1.2rem 0.8rem;
          }
          .theme-trenitalia .treno-nav-button {
            top: 18px;
            background: rgba(227,6,19,0.2);
            color: #E30613;
          }
          .theme-trenitalia .treno-title {
            font-family: 'VT323', monospace;
            font-size: 2rem;
            color: #FF3300;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: normal;
            margin-top: 0.3rem;
            margin-bottom: 0.4rem;
            padding-right: 3rem;
            line-height: 1.1;
          }
          .theme-trenitalia .treno-title::before {
            display: none;
          }
          .theme-trenitalia th {
            color: #00EE44;
            border-bottom: 1px solid #0f1f0f;
            font-family: 'VT323', monospace;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-weight: normal;
            padding-top: 0.3rem;
            padding-bottom: 0.3rem;
          }
          .theme-trenitalia td {
            color: #cccccc;
            border-bottom: 1px solid #0a140a;
            font-family: 'VT323', monospace;
            font-size: 1.2rem;
          }
          .theme-trenitalia .treno-platform-badge {
            color: #00CC44;
            background: none;
            font-family: 'VT323', monospace;
            font-size: 1.2rem;
            padding: 0;
          }
          .theme-trenitalia .status-chip {
            font-family: 'VT323', monospace;
            font-size: 1.15rem;
            border-radius: 3px;
            animation: none;
          }
          .theme-trenitalia .status-chip.on-time {
            background: #001a08;
            color: #00EE44;
            border: 1px solid #007A33;
          }
          .theme-trenitalia .status-chip.delayed {
            background: #2a1200;
            color: #FF7700;
            border: 2px solid #994400;
          }
          .theme-trenitalia .status-chip.late {
            background: #2a0000;
            color: #FF2200;
            border: 1px solid #991100;
          }
          .theme-trenitalia .treno-scrollable-text span,
          .theme-trenitalia .treno-ritardo-box span {
            color: #cccccc;
          }
          .theme-trenitalia .treno-table-scroll {
            scrollbar-color: rgba(0,238,68,0.3) transparent;
          }
          .theme-trenitalia .treno-table-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,238,68,0.3);
          }

          ha-card {
            display: flex;
            flex-direction: column;
            background: linear-gradient(140deg, #111728 0%, #1a1d26 100%);
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            padding: 1.5rem;
            border-radius: 16px;
            max-width: 500px;
            margin: auto;
            overflow: hidden;
            position: relative;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
          }

          .treno-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
          }

          .treno-popup {
            --mytreno-text-color: #ffffff;
            --mytreno-info-color: #edbd00;
            background: linear-gradient(140deg, #111728 0%, #1a1d26 100%);
            color: #fff;
            padding: 1.5rem;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            min-height: 300px;
            max-height: none;
            overflow: visible;
            box-shadow: 0 0 20px rgba(0,0,0,0.4);
            animation: scaleIn 0.3s ease;
            font-family: 'Inter', sans-serif;
            position: relative;
          }

          .treno-popup h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.25rem;
            color: #edbd00;
          }

          .treno-popup .close-btn {
            position: absolute;
            top: 1rem;
            right: 1.5rem;
            background: transparent;
            border: none;
            font-size: 1.5rem;
            color: #fff;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
          }

          .treno-popup .close-btn:hover {
            transform: scale(1.1);
          }

          .treno-popup-content p {
            margin: 0.75rem 0;
            line-height: 1.4;
          }

          .treno-popup-content strong {
            color: rgba(255, 255, 255, 0.7);
            margin-right: 0.5rem;
          }

          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }

          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0 }
            to { transform: scale(1); opacity: 1 }
          }

          .treno-nav-button {
            position: absolute;
            top: 0.5rem;
            right: 1.2rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            cursor: pointer;
            user-select: none;
            z-index: 1;
            transition: background 0.2s ease;
            font-size: 1rem;
          }

          .treno-nav-button:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .treno-table-scroll {
            overflow-y: auto;
            max-height: calc(10 * 3.2rem);
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.25) transparent;
          }
          .treno-table-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .treno-table-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.25);
            border-radius: 2px;
          }
          .theme-trenitalia .treno-table-scroll,
          .theme-light .treno-table-scroll {
            scrollbar-color: rgba(0,0,0,0.2) transparent;
          }
          .theme-trenitalia .treno-table-scroll::-webkit-scrollbar-thumb,
          .theme-light .treno-table-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.15);
          }
          .treno-slider-wrapper {
            width: 100%;
            overflow: hidden;
          }
          .treno-slider {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 24px;
            width: 100%;
            box-sizing: border-box;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .treno-slider::-webkit-scrollbar {
            display: none;
          }
          .treno-page {
            flex: 0 0 100%;
            min-width: 100%;
            max-width: 100%;
            scroll-snap-align: center;
            box-sizing: border-box;
            /* NIENTE background, border-radius, box-shadow qui! */
          }
          table {
            width: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 0.5rem;
          }
          th {
              text-align: left;
              padding: 0.75rem 1vh;
              color: rgb(217 216 216 / 85%);
              font-weight: 400;
              font-size: 0.85rem;
              border-bottom: 2px solid rgb(255 255 255 / 62%);
              vertical-align: middle;
              background: transparent;
              letter-spacing: 0.01em;
          }
          td {
            text-align: left;
            padding: 0.875rem 1vh;
            font-size: 0.9375rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            vertical-align: middle;
          }
          .treno-scrollable-text {
            min-width: 0;
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            display: block;
          }
          .treno-scrollable-text span {
            display: inline-block;
            white-space: nowrap;
            will-change: transform;
            padding-right: 20px;
            text-overflow: unset;
          }
          .treno-scrollable-text.treno-overflowing span {
            animation: scroll-text 7s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
          }
          @keyframes scroll-text {
            0% { transform: translateX(0); }
            5% { transform: translateX(0); }
            35% { transform: translateX(calc(-100% + var(--scroll-width, 100%))); }
            65% { transform: translateX(calc(-100% + var(--scroll-width, 100%))); }
            95% { transform: translateX(0); }
            100% { transform: translateX(0); }
          }
          @media (max-width: 600px) {
            .treno-scrollable-text {
              font-size: 0.95em;
            }
            .treno-page {
              padding: 0.2em 0.1em;
              border-radius: 10px;
            }
          }
          .treno-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-right: 2rem;
          }

          .treno-title::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 1.25rem;
            background: #edbd00;
            border-radius: 2px;
            flex-shrink: 0;
          }

          .status-chip {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .status-chip.on-time {
            background: rgba(0, 200, 83, 0.15);
            color: #00c853;
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          .status-chip.delayed {
            background: rgba(255, 152, 0, 0.15);
            color: #ffa000;
            animation: pulse 2s infinite;
          }

          .status-chip.late {
            background: rgba(244, 67, 54, 0.15);
            color: #f44336;
            animation: pulse 0.7s infinite;
          }

          .treno-desktop-view th:nth-child(1),
          .treno-desktop-view td:nth-child(1) { width: 30%; }
          .treno-desktop-view th:nth-child(2),
          .treno-desktop-view td:nth-child(2) { width: 12%; }
          .treno-desktop-view th:nth-child(3),
          .treno-desktop-view td:nth-child(3) { width: 22%; }
          .treno-desktop-view th:nth-child(4),
          .treno-desktop-view td:nth-child(4) { width: 18%; }
          .treno-desktop-view th:nth-child(5),
          .treno-desktop-view td:nth-child(5) { width: 18%; }

          .treno-mobile-view {
            display: none;
          }
          .treno-ritardo-box {
            max-width: 100px;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            display: inline-block;
          }

          .treno-ritardo-box span {
            display: block;
            will-change: transform;
          }

          @keyframes scroll-delay {
            0% { transform: translateX(100%); }
            10% { transform: translateX(100%); }
            45% { transform: translateX(-100%); }
            55% { transform: translateX(-100%); }
            90% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }

          @media (max-width: 750px) {
            .treno-desktop-view {
              display: none !important;
            }
            .treno-mobile-view {
              display: table !important;
            }
          }
          @media (min-width: 751px) {
            .treno-desktop-view {
              display: table !important;
            }
            .treno-mobile-view {
              display: none !important;
            }
          }
        </style>
        <ha-card>
          <div class="treno-stripe-top"></div>
          <div class="treno-nav-button" id="nextBtn">→</div>
          <div class="treno-slider-wrapper">
            <div class="treno-slider">
              <div class="treno-page">
                <div class="treno-title">${window.myTrenoT('departures', this._getLang())} ${stationName}</div>
                <div class="treno-table-scroll">
                  ${this._renderTable(partenze, "destinazione", "destination", true)}
                  ${this._renderTable(partenze, "destinazione", "destination", false)}
                </div>
              </div>
              <div class="treno-page">
                <div class="treno-title">${window.myTrenoT('arrivals', this._getLang())} ${stationName}</div>
                <div class="treno-table-scroll">
                  ${this._renderTable(arrivi, "provenienza", "provenance", true)}
                  ${this._renderTable(arrivi, "provenienza", "provenance", false)}
                </div>
              </div>
            </div>
          </div>
          <div class="treno-stripe-bottom"></div>
        </ha-card>
      </div>
    `;
    this.querySelectorAll('table').forEach(table => {
      table.addEventListener('click', (event) => {
        const tr = event.target.closest('tr');
        if (tr) {
          const trenoData = tr.dataset.treno;
          if (trenoData) {
            this._showTrainDetails(JSON.parse(decodeURIComponent(trenoData)));
          }
        }
      });
    });

    this._updateScrollingText();

    this.querySelector("#nextBtn").addEventListener("click", () => {
      this.page = (this.page + 1) % 2;
      this._updateSlide();
    });

    // Kick off background route fetching for hasStop filter
    if (this._hasStop && this._fetchQueue.length > 0) {
      this._processFetchQueue();
    }
  }

  _updateSlide() {
    const slider = this.querySelector('.treno-slider');
    if (slider) {
      const pages = slider.querySelectorAll('.treno-page');
      if (pages.length > this.page) {
        const pageEl = pages[this.page];
        slider.scrollTo({ left: pageEl.offsetLeft, behavior: 'smooth' });
      }
    }
  }

  _sanitizePlatform(value) {
    if (!value || typeof value !== "string" || value.trim() === "") return "-";
    // Mappa dei numeri romani fino a 20 (puoi estendere se serve)
    const romanMap = {
      'XX': '20', 'XIX': '19', 'XVIII': '18', 'XVII': '17', 'XVI': '16', 'XV': '15', 'XIV': '14', 'XIII': '13', 'XII': '12', 'XI': '11',
      'X': '10', 'IX': '9', 'VIII': '8', 'VII': '7', 'VI': '6', 'V': '5', 'IV': '4', 'III': '3', 'II': '2', 'I': '1'
    };
    let sanitized = value;
    // Regex: trova numeri romani all'inizio, dopo spazio, o seguiti da caratteri non alfabetici o fine stringa
    Object.keys(romanMap).forEach(roman => {
      sanitized = sanitized.replace(new RegExp(`(^|\\s)${roman}(?=[^a-zA-Z0-9]|$)`, 'g'), (match, p1) => `${p1}${romanMap[roman]}`);
    });
    // Sostituisci IT, I T, 1T, 1 T (case insensitive, con o senza spazi) con 1/T
    sanitized = sanitized.replace(/\b(1\s*T|I\s*T|IT|1T)\b/gi, '1/T');
    sanitized = sanitized.replace(/ tronco/i, "/T");
    // Sostituisci nT, n T (case insensitive, con o senza spazi) con n/T per n da 1 a 10
    for (let n = 1; n <= 10; n++) {
      sanitized = sanitized.replace(new RegExp(`\\b${n}\\s*T\\b`, 'gi'), `${n}/T`);
      sanitized = sanitized.replace(new RegExp(`\\b${n}T\\b`, 'gi'), `${n}/T`);
    }
    return sanitized;
  }

  _renderTable(data, field, label, isDesktop) {
    return `
      <table class="${isDesktop ? 'treno-desktop-view' : 'treno-mobile-view'}">
        <thead>
          <tr>
            <th>${window.myTrenoT(label, this._getLang())}</th>
            <th>${window.myTrenoT('orario', this._getLang())}</th>
            ${isDesktop ? `<th>${window.myTrenoT('delay', this._getLang())}</th>` : ''}
            ${isDesktop ? `<th>${window.myTrenoT('platform', this._getLang())}</th>` : `<th>${window.myTrenoT('info', this._getLang())}</th>`}
            ${isDesktop ? `<th>${window.myTrenoT('real', this._getLang())}</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${data.map(t => {
            const name = t[field] || "-";
            const binarioPrevisto = this._sanitizePlatform(t.binario_previsto);
            const binarioEffettivo = this._sanitizePlatform(t.binario_effettivo);
            const platformChanged = binarioEffettivo !== binarioPrevisto && binarioEffettivo !== "-";
            const tEncoded = encodeURIComponent(JSON.stringify(t));
            if (isDesktop) {
              return `
                <tr data-treno="${tEncoded}">
                  <td><div class="treno-scrollable-text"><span>${name}</span></div></td>
                  <td>${t.orario}</td>
                  <td><div class="treno-ritardo-box"><span>${this._formatDelay(t.ritardo)}</span></div></td>
                  <td><div class="treno-platform-badge${platformChanged ? ' treno-platform-changed' : ''}">${binarioPrevisto}</div></td>
                  <td>${binarioEffettivo !== "-" ? `<div class="treno-platform-badge">${binarioEffettivo}</div>` : "-"}</td>
                </tr>`;
            } else {
              return `
                <tr data-treno="${tEncoded}">
                  <td><div class="treno-scrollable-text"><span>${name}</span></div></td>
                  <td>${t.orario}</td>
                  <td>
                    <div class="treno-ritardo-box"><span>${this._formatDelay(t.ritardo)}</span></div>
                    ${platformChanged
                      ? `<div class="treno-platform-info">
                          <div class="treno-platform-badge">${binarioPrevisto}</div>
                          <span class="treno-platform-arrow">→</span>
                          <div class="treno-platform-badge treno-platform-changed">${binarioEffettivo}</div>
                        </div>`
                      : `<div class="treno-platform-badge">${binarioPrevisto}</div>`
                    }
                  </td>
                </tr>`;
            }
          }).join("")}
        </tbody>
      </table>
    `;
  }

  _formatDelay(delay) {
    if (delay > 5) {
      return `<div class="status-chip late">${window.myTrenoT('late', this._getLang(), {delay})}</div>`;
    }
    if (delay > 0) {
      return `<div class="status-chip delayed">${window.myTrenoT('late', this._getLang(), {delay})}</div>`;
    }
    if (delay < 0) {
      return `<div class="status-chip delayed">${window.myTrenoT('early', this._getLang(), {delay})}</div>`;
    }
    return `<div class="status-chip on-time">${window.myTrenoT('on_time', this._getLang())}</div>`;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("my-treno-card", MyTrenoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "my-treno-card",
  name: "MyTreno Card",
  description: "Visualizza treni in partenza e arrivo da una stazione ViaggiaTreno"
});
/* MYTRENO TRACKING */
class MyTrenoCardTrackingEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    _config: { type: Object },
  };

  constructor() {
    super();
    this._config = {};
  }

  _getLang() {
    if (!this.hass) return 'en';
    return (this.hass.selectedLanguage || this.hass.language || 'en').substring(0,2);
  }

  setConfig(config) {
    this._config = { ...config };
  }

  getConfig() {
    return { ...this._config };
  }

  _updateConfig(changedProp, value) {
    const newConfig = { ...this._config, [changedProp]: value };
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.hass) return html``;
    const trenoEntities = Object.keys(this.hass.states)
      .filter(e => e.startsWith("sensor.mytreno_treno_"));

    return html`
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.85rem; opacity: 0.7;">${window.myTrenoT('train_name', this._getLang())}</label>
          <ha-textfield style="max-width: 50%;"
            .value=${this._config.title || ""}
            @input=${e => this._updateConfig("title", e.target.value)}
          ></ha-textfield>
        </div>
        <div class="section-title">${window.myTrenoT('select_train', this._getLang())}</div>
        <ha-selector
          style="max-width: 50%;"
          .hass=${this.hass}
          .selector=${{
            entity: {
              multiple: false,
              include_entities: trenoEntities,
            }
          }}
          .value=${this._config.sensor || ""}
          @value-changed=${e => this._updateConfig("sensor", e.detail.value)}>
        </ha-selector>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.85rem; opacity: 0.7;">${window.myTrenoT('theme', this._getLang())}</label>
          <ha-selector style="max-width: 50%;"
            .hass=${this.hass}
            .selector=${{
              select: {
                mode: "dropdown",
                options: [
                  { value: "default", label: window.myTrenoT('theme_default', this._getLang()) },
                  { value: "light", label: window.myTrenoT('theme_light', this._getLang()) },
                  { value: "neon", label: window.myTrenoT('theme_neon', this._getLang()) },
                  { value: "retro", label: window.myTrenoT('theme_retro', this._getLang()) },
                  { value: "trenitalia", label: window.myTrenoT('theme_trenitalia', this._getLang()) }
                ]
              }
            }}
            .value=${this._config.theme || "default"}
            @value-changed=${e => this._updateConfig("theme", e.detail.value)}
          ></ha-selector>
        </div>
      </div>`;
  }

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .editor-block {
      margin-top: 1rem;
    }
  `;
}

customElements.define("my-treno-card-tracking-editor", MyTrenoCardTrackingEditor);

class MyTrenoTrackingCard extends HTMLElement {
  constructor() {
    super();
    this._lastAttributes = null;
    this._lastState = null;
    this._expanded = false;
  }
  _getLang() {
    if (!this._hass) return 'en';
    return (this._hass.selectedLanguage || this._hass.language || 'en').substring(0,2);
  }
  setConfig(config) {
    if (!config.sensor) throw new Error(window.myTrenoT('missing_sensor', this._getLang()));
    this._sensor = config.sensor;
    this._theme = config.theme || "default";
    this._config = config;
  }

  static getConfigElement() {
    return document.createElement("my-treno-card-tracking-editor");
  }

  set hass(hass) {
    if (!this._sensor || !hass.states[this._sensor]) return;
    const entity = hass.states[this._sensor];
    const newState = entity.state;
    const newAttrs = entity.attributes;
    const stateChanged = this._lastState !== newState;
    const attrsChanged = JSON.stringify(this._lastAttributes) !== JSON.stringify(newAttrs);
    if (!stateChanged && !attrsChanged) return;
    this._lastState = newState;
    this._lastAttributes = newAttrs;
    this._hass = hass;
    // Procedi con il render
    const data = newAttrs;
    const fermate = Array.isArray(data.fermate) ? data.fermate : [];
    const prossima = data.prossima_stazione || "-";
    const orario = (data.orario_previsto_prossima || "").substring(11, 16) || "--";
    const titolo = this._config.title || `${window.myTrenoT('train', this._getLang())} ${data.train_number || "??"}`;
    const ritardo = (typeof newState === 'number' || !isNaN(parseInt(newState))) ? `${newState} ${window.myTrenoT('min', this._getLang())}` : window.myTrenoT('not_available', this._getLang());
    const fermateHTML = `
      <div class="tracking-treno-timeline-scroll">
        <div class="tracking-treno-timeline">
          ${fermate.map(f => `
            <div class="tracking-treno-stop ${f.arrivato ? 'done' : ''} ${prossima === f.stazione ? 'next' : ''}">
              <div class="label">${f.stazione}</div>
              <div class="dot"></div>
              <div class="info">
                <span>${(f.programmata || "").substring(11, 16) || "--"}</span>
                ${f.binario ? `<span>bin ${f.binario}</span>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    this.innerHTML = "";
    const style = document.createElement("style");
    style.textContent = this._getPopupStyles();
    this.appendChild(style);
    const card = document.createElement("ha-card");
    card.className = `tracking-treno-popup theme-${this._theme}`;
    card.innerHTML = `
      <div class="tracking-treno-popup-content">
        ${this._config.title ? `<p class="treno-custom-title">${this._config.title}</p>` : ""}
        <h3>${titolo}</h3>
        <p><strong>${window.myTrenoT('delay', this._getLang())}:</strong> ${ritardo}</p>
        <p><strong>${window.myTrenoT('next', this._getLang())}:</strong> ${prossima} (${orario})</p>
        <div class="tracking-percorso-toggle">
          <span>${window.myTrenoT('show_route', this._getLang())}</span>
          <ha-icon icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="tracking-fermate collapsed">${fermateHTML}</div>
      </div>
    `;
    this.appendChild(card);
    requestAnimationFrame(() => {
      const scrollContainer = this.querySelector(".tracking-treno-timeline-scroll");
      const nextStop = this.querySelector(".tracking-treno-stop.next");
      const toggle = this.querySelector(".tracking-percorso-toggle");
      const timelineWrapper = this.querySelector(".tracking-fermate");
      if (scrollContainer && nextStop) {
        const offsetLeft = nextStop.offsetLeft - scrollContainer.offsetWidth / 2 + nextStop.offsetWidth / 2;
        scrollContainer.scrollTo({ left: offsetLeft });
      }
      if (toggle && timelineWrapper) {
        toggle.addEventListener("click", () => {
          this._expanded = !this._expanded;
          timelineWrapper.classList.toggle("expanded", this._expanded);
          timelineWrapper.classList.toggle("collapsed", !this._expanded);
          toggle.querySelector("ha-icon").setAttribute(
            "icon",
            this._expanded ? "mdi:chevron-up" : "mdi:chevron-down"
          );
        });
      }
    });
  }

  _getPopupStyles() {
    return `
      .tracking-percorso-toggle {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0 20px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        color: var(--mytreno-title-color, #edbd00);
        margin-bottom: 0.75rem; /* 👈 evita che si sovrapponga alla timeline */
      }

      .tracking-fermate.collapsed {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: max-height 0.3s ease, opacity 0.3s ease;
      }

      .tracking-fermate.expanded {
        max-height: 1000px;
        overflow: visible;
        opacity: 1;
      }
      .tracking-fermate {
        margin: 0;
        padding: 0;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition: max-height 0.5s ease, opacity 0.3s ease;
      }
      .tracking-fermate.expanded {
        max-height: 1000px; /* abbastanza grande per stare tranquilli */
        opacity: 1;
      }

      .tracking-fermate.collapsed {
        max-height: 0;
        opacity: 0;
      }
      .tracking-fermate li { line-height:1.4em; }
      .tracking-fermate li.done { opacity:.4; text-decoration:line-through; }
      .bin { font-size:.8em; opacity:.7; }
      .tracking-treno-popup-content p {
        margin: 0.75rem 0;
        line-height: 1.4;
      	padding-top: 0.5rem;
      	padding-left: 1.5rem;
      }
      .tracking-treno-timeline-scroll {
        overflow-x: auto;
        overflow-y: visible;
        padding-left: 20px;
        padding-right: 20px;
        margin-top: -1rem;
        position: relative;
        scrollbar-width: thin;
        scrollbar-color: #999 transparent;
      }
      .tracking-treno-timeline-scroll::-webkit-scrollbar {
        height: 6px;
      }
      .tracking-treno-timeline-scroll::-webkit-scrollbar-thumb {
        background-color: #999;
        border-radius: 10px;
      }
      .tracking-treno-timeline {
        display: flex;
        position: relative;
        flex-direction: row;
        min-height: 200px;
        width: fit-content;
        align-items: end;
        gap: 0;
        justify-content: center;
        margin-bottom: 20px;
      }
      .tracking-treno-timeline::before {
        content: '';
        position: absolute;
        top: 77.5%;
        transform: translateY(-50%);
        left: 0;
        width: var(--timeline-line-width, 100%);
        height: 8px;
        background: #0010ff;
        z-index: 0;
      }
      .tracking-treno-stop {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
        max-width: 80px;
        min-height: 100px;
        max-height: 100px;
      }
      .tracking-treno-stop .label {
        transform: rotate(-35deg);
        transform-origin: bottom left;
        font-size: 0.7rem;
        font-weight: 800;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: visible;
        max-width: 70px;
        margin-bottom: 1.2rem;
        height: 2rem;
        line-height: 8;
        text-align: left;
        color: var(--mytreno-text-color, #ffffff);
        margin-left: 50px;
      }
      .tracking-treno-stop .dot {
        width: 16px;
        height: 16px;
        background: #ccc;
        border-radius: 50%;
        position: relative;
        z-index: 1;
        border: 2px solid #fff;
        transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
      }
      .tracking-treno-stop:hover .dot {
        transform: scale(1.2);
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
      }
      .tracking-treno-stop.done .dot {
        background: #4caf50;
        opacity: 0.4;
      }
      .tracking-treno-stop.next .dot {
        background: #ff9800;
        box-shadow: 0 0 6px #ff9800, 0 0 12px rgba(255, 152, 0, 0.4);
        animation: pulse-dot 1.5s infinite;
      }
      @keyframes pulse-dot {
        0% { box-shadow: 0 0 0 0 rgba(255,152,0,0.6); }
        70% { box-shadow: 0 0 0 10px rgba(255,152,0,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,152,0,0); }
      }
      .tracking-treno-stop .info {
        font-size: 0.8rem;
        margin-top: 0.6rem;
        color: var(--mytreno-info-color, #ffffff);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        text-align: center;
        line-height: 1.2;
      }
      .tracking-treno-stop .info span:first-child {
        font-weight: 600;
      }
      .tracking-treno-stop .info span:last-child {
        font-style: italic;
        font-size: 0.75rem;
        opacity: 0.8;
      }
      .tracking-treno-popup.theme-default {
        --mytreno-title-color: #edbd00;
      }

      .tracking-treno-popup.theme-light {
        --mytreno-title-color: #007aff;
      }

      .tracking-treno-popup.theme-neon {
        --mytreno-title-color: #ff00cc;
      }

      .tracking-treno-popup.theme-retro {
        --mytreno-title-color: #ffcc00;
      }
      .tracking-treno-popup.theme-light {
        --mytreno-text-color: #000;
        --mytreno-info-color: #000;
        background: #fff;
        color: #111;
        --mytreno-title-color: #007aff;
        font-family: 'Inter', sans-serif;
      }
      .tracking-treno-popup.theme-retro .tracking-treno-timeline::before {
        background: #d00000;
      }
      .tracking-treno-popup.theme-neon .tracking-treno-timeline::before {
        background: #e0e2ff;
        box-shadow: 15px 0px 17px #1af4ff, 0 0 20px #2060f6;
        border-radius: 36px;
      }
      .tracking-treno-popup.theme-light .tracking-treno-timeline::before {
        background: #5679ff;
      }
      .tracking-treno-popup.theme-light h3 {
        color: #007aff;
      }
      .tracking-treno-popup.theme-light .close-btn {
        color: #000;
      }
      .tracking-treno-popup.theme-light .tracking-treno-popup-content strong {
        color: #444;
      }
      .tracking-treno-popup.theme-neon {
        --mytreno-text-color: #66ffe0;
        --mytreno-info-color: #ff00cc;
        background: #0f0f23;
        color: #00ffcc;
        --mytreno-title-color: #ff00cc;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 0 20px #00ffcc55;
      }
      .tracking-treno-popup.theme-neon h3 {
        color: #ff00cc;
      }
      .tracking-treno-popup.theme-neon .close-btn {
        color: #00ffcc;
      }
      .tracking-treno-popup.theme-neon .tracking-treno-popup-content strong {
        color: #66ffe0;
      }
      .tracking-treno-popup.theme-retro {
        --mytreno-text-color: #ffffff;
        --mytreno-info-color: #ffffff;
        background: #202020;
        color: #ffcc00;
        --mytreno-title-color: #ffcc00;
        font-family: 'Press Start 2P', monospace;
        border: 2px solid #333;
        box-shadow: inset 0 0 6px #111;
      }
      .tracking-treno-popup.theme-retro h3 {
        color: #ffffff;
        font-size: 0.85rem;
      }
      .tracking-treno-popup.theme-retro .close-btn {
        color: #ffcc00;
      }
      .tracking-treno-popup.theme-retro .tracking-treno-popup-content strong {
        color: #ffcc00;
      }
      .tracking-treno-popup-content h3 {
      	margin: 0px 20px 0.5rem;
      	font-size: 1.2rem;
      	font-weight: bold;
      	color: var(--mytreno-title-color, #edbd00);
      }
      .tracking-treno-popup-content h4 {
      	margin: 1rem 20px 0.5rem;
      	font-size: 1rem;
      	font-weight: 600;
      	color: var(--mytreno-title-color, #edbd00);
      }

      .treno-custom-title {
      	font-size: 1.5rem;
        padding-left: 20px;
        padding-top: 20px;
      	font-weight: bold;
      	color: var(--mytreno-title-color, #ffffff);
      }
    `;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define("my-treno-tracking-card", MyTrenoTrackingCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "my-treno-tracking-card",
  name: "MyTreno Tracking Card",
  description: "Visualizza i dettagli di un treno come card fissa"
});
