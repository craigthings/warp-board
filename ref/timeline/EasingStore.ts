import { idProp, model, Model, modelAction, prop } from "mobx-keystone";
import type { EasingType, EasingTransition } from "../types";
import { EasingTypes } from "../Easing/EasingFunctions";
import type { EasingFunction } from "../Easing/EasingFunctions";
import { computed } from "mobx";

@model("EasingStore")
export class EasingStore extends Model({
  id: idProp,
  type: prop<EasingType>("sine"),
  transition: prop<EasingTransition>("easeInOut"),
  config: prop<any[]>(() => [])
}) {
  @modelAction
  setType(type: EasingType) {
    this.type = type;
  }

  @modelAction
  setTransition(transition: EasingTransition) {
    this.transition = transition;
  }

  @modelAction
  setConfig(config: any[]) {
    this.config = [...config];
  }

  @modelAction
  setAll(type: EasingType, transition: EasingTransition, config: any[] = []) {
    this.type = type;
    this.transition = transition;
    this.config = [...config];
  }

  @computed
  get easingFunction(): EasingFunction {
    if (this.transition === "config") {
      const configFn = EasingTypes[this.type][this.transition];
      return configFn ? configFn(this.config) : 
        (() => { throw new Error(`Config function not found for easing type: ${this.type}`); })();
    }
    return EasingTypes[this.type][this.transition];
  }

  getState() {
    return {
      type: this.type,
      transition: this.transition,
      config: [...this.config]
    };
  }
} 