// Lista de pistas con sliders de volumen, pan y botones mute/solo.

import type { Runtime } from "../engine/runtime.ts";
import { t } from "./i18n.ts";

export class Mixer {
  constructor(private readonly el: HTMLElement, private readonly runtime: Runtime) {}

  refresh(): void {
    const session = this.runtime.getSession();
    this.el.innerHTML = "";
    if (!session) return;
    for (const t0 of session.tracks) {
      this.el.appendChild(this.row(t0.name, t0.volume, t0.pan, t0.muted, t0.soloed));
    }
  }

  private row(name: string, vol: number, pan: number, muted: boolean, soloed: boolean): HTMLElement {
    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("span");
    label.className = "name";
    label.textContent = name;

    const volSlider = document.createElement("input");
    volSlider.type = "range";
    volSlider.min = "0";
    volSlider.max = "1.5";
    volSlider.step = "0.01";
    volSlider.value = String(vol);
    volSlider.addEventListener("input", () => this.runtime.setVolume(name, parseFloat(volSlider.value)));

    const panSlider = document.createElement("input");
    panSlider.type = "range";
    panSlider.min = "-1";
    panSlider.max = "1";
    panSlider.step = "0.05";
    panSlider.value = String(pan);
    const panVal = document.createElement("span");
    panVal.className = "pan-val";
    panVal.textContent = formatPan(pan);
    panSlider.addEventListener("input", () => {
      const p = parseFloat(panSlider.value);
      this.runtime.setPan(name, p);
      panVal.textContent = formatPan(p);
    });
    const panWrap = document.createElement("span");
    panWrap.style.display = "flex";
    panWrap.style.flexDirection = "column";
    panWrap.appendChild(panSlider);
    panWrap.appendChild(panVal);

    const muteBtn = document.createElement("button");
    muteBtn.className = "toggle" + (muted ? " on" : "");
    muteBtn.textContent = t("mute");
    muteBtn.addEventListener("click", () => {
      const next = !muteBtn.classList.contains("on");
      muteBtn.classList.toggle("on", next);
      this.runtime.setMute(name, next);
    });

    const soloBtn = document.createElement("button");
    soloBtn.className = "toggle solo" + (soloed ? " on" : "");
    soloBtn.textContent = t("solo");
    soloBtn.addEventListener("click", () => {
      const next = !soloBtn.classList.contains("on");
      soloBtn.classList.toggle("on", next);
      this.runtime.setSolo(name, next);
    });

    row.append(label, volSlider, panWrap, muteBtn, soloBtn);
    return row;
  }
}

function formatPan(p: number): string {
  if (Math.abs(p) < 0.05) return "C";
  return p < 0 ? `L${Math.round(-p * 100)}` : `R${Math.round(p * 100)}`;
}
