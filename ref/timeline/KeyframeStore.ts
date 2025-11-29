import { model, Model, modelAction, prop, idProp, getParent } from "mobx-keystone";
import type { EasingType, EasingTransition } from '../types';
import { EasingStore } from './EasingStore';
import type { KeyframesStore } from "./collections/KeyframesStore";
import { computed } from "mobx";

@model("KeyframeStore")
export class KeyframeStore extends Model({
  id: idProp,
  position: prop<number>(),
  value: prop<number>(),
  selected: prop<boolean>(false),
  easing: prop(() => new EasingStore({
    type: 'sine',
    transition: 'easeInOut',
    config: []
  }))
}) {
  onInit() {
    // Any initialization logic can go here
  }

  @computed
  get parent() {
    return getParent<KeyframesStore>(getParent<any>(this));
  }

  @modelAction
  setValue(value: number) {
    console.log('setValue', value);
    this.value = value;
  }

  @modelAction
  setPosition(position: number) {
    this.position = position;
  }

  @modelAction
  setEasing(type: EasingType, transition: EasingTransition, config: any[] = []) {
    this.easing.setAll(type, transition, config);
  }

  @modelAction
  setSelected(selected: boolean) {
    this.selected = selected;
  }

  @computed
  get easingFunction() {
    return this.easing.easingFunction;
  }

  @computed
  get duration() {
    if (!this.parent) throw new Error("KeyframesStore not found");
    const nextKeyframe = this.parent.getNearestNext(this.position);
    return nextKeyframe ? nextKeyframe.position - this.position : 0;
  }

  @computed
  get previousKeyframe() {
    if (!this.parent) throw new Error("KeyframesStore not found");
    return this.parent.getNearestPrev(this.position);
  }

  @computed
  get nextKeyframe() {
    if (!this.parent) throw new Error("KeyframesStore not found");
    return this.parent.getNearestNext(this.position);
  }

  @modelAction
  remove() {
    if (!this.parent) throw new Error("KeyframesStore not found");
    return this.parent.remove(this.parent.items.indexOf(this));
  }
} 