# ⚠️ Fork non ufficiale

Questo repository è un **fork** di [lotablet/mytreno-card](https://github.com/lotablet/mytreno-card), il cui progetto originale **non è più mantenuto** dall'autore.

Il fork nasce per mantenere la card funzionante insieme all'integrazione [HotBlaster/mytreno](https://github.com/HotBlaster/mytreno) con le versioni recenti di Home Assistant.

> **Nota:** la manutenzione è svolta **con l'aiuto dell'intelligenza artificiale**.
> Gli aggiornamenti potrebbero essere **lenti**.

Tutto il merito del progetto originale va a [@lotablet](https://github.com/lotablet).

# MyTreno Card

![version](https://img.shields.io/badge/version-2.3.0-blue)
![hacs](https://img.shields.io/badge/HACS-custom-orange)

> Card Lovelace per visualizzare partenze e arrivi dei treni usando ViaggiaTreno.
---
<p align="center">
  <img src="https://github.com/lotablet/mytreno-card/blob/main/image/sample_card.gif" alt="sample_card" />
</p>

## 📦 Installazione via HACS (Custom repositories)

1. Se hai già installato la *MyTreno Card* originale (lotablet), rimuovila: **HACS → MyTreno Card → ⋮ → Rimuovi**
2. Vai in **HACS → Menu ⋮ (in alto a destra) → Custom repositories** (*Archivi digitali personalizzati*)
3. Compila i campi:
   - **Repository:**
     ```
     https://github.com/HotBlaster/mytreno-card
     ```
   - **Tipo:** `Dashboard` (nelle versioni meno recenti di HACS: `Lovelace` / `Plugin`)
4. Clicca **Aggiungi**, poi cerca **MyTreno Card** in HACS e clicca **Scarica**
5. Ricarica la pagina del browser (svuota la cache se la card non compare)
6. Aggiungi questa card nella dashboard:

```
type: custom:my-treno-card
sensor: sensor.mytreno_la_spezia_centrale
extra_sensor: sensor.mytreno_selected_train #OBBLIGATORIO PER IL TRACKING
theme: default   # default - neon - light - retro - trenitalia
```
Puoi anche usare card mod per "aggiustare" le dimensioni della card

```
type: custom:my-treno-card
sensor: sensor.mytreno_la_spezia_centrale
extra_sensor: sensor.mytreno_selected_train
theme: default
card_mod:
  style: |
    ha-card {
      height: 400px;
      width: 450px;
    }
```
