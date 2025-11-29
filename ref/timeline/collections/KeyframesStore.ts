import { model, Model, modelAction, prop, arrayActions } from "mobx-keystone";
import type { Keyframe } from '../../types';
import { KeyframeStore } from '../KeyframeStore';
import { computed } from "mobx";
import { EasingStore } from '../EasingStore';

@model("KeyframesStore")
export class KeyframesStore extends Model({
  items: prop<KeyframeStore[]>(() => [])
}) {
  @computed
  get all() {
    return this.items;
  }

  @computed
  get sortedKeyframes() {
    return [...this.items].sort((a, b) => a.position - b.position);
  }

  @computed
  get selected() {
    // return all keyframes that are selected
    return this.items.filter(k => k.selected);
  }

  @modelAction
  selectAll() {
    this.items.forEach(k => k.setSelected(true));
  }

  @modelAction
  deselectAll() {
    this.items.forEach(k => k.setSelected(false));
  }

  getByIndex(index: number) {
    return this.items[index];
  }

  getAtPosition(position: number) {
    return this.items.find(k => k.position === position) || null;
  }

  @modelAction
  add(keyframeData: Omit<Keyframe, 'easing' | 'id'>, index?: number) {
    const keyframe = new KeyframeStore({
      position: keyframeData.position,
      value: keyframeData.value,
      easing: new EasingStore({
        type: 'sine',
        transition: 'easeInOut',
        config: []
      })
    });
    
    if (index !== undefined) {
      arrayActions.splice(this.items, index, 0, keyframe);
      return keyframe;
    }
    
    const insertIndex = this.sortedKeyframes.findIndex(k => k.position > keyframe.position);
    arrayActions.splice(
      this.items, 
      insertIndex === -1 ? this.items.length : insertIndex, 
      0, 
      keyframe
    );
    return keyframe;
  }

  @modelAction
  remove(index: number) {
    if (index >= 0 && index < this.items.length) {
      arrayActions.splice(this.items, index, 1);
      return true;
    }
    return false;
  }

  getInRange(start: number, end: number) {
    return this.sortedKeyframes.filter(k => k.position >= start && k.position <= end);
  }

  getNearestNext(position: number): KeyframeStore | null {
    return this.sortedKeyframes.find(k => k.position > position) || null;
  }

  getNearestPrev(position: number): KeyframeStore | null {
    return [...this.sortedKeyframes].reverse().find(k => k.position <= position) || null;
  }
} 