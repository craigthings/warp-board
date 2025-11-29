import { model, Model, modelAction, prop, getRoot, idProp, getParent } from "mobx-keystone";
import type { Property } from '../types';
import { KeyframesStore } from './collections/KeyframesStore';
import { computed } from "mobx";
import { PropertiesStore } from "./collections/PropertiesStore";

@model("PropertyStore")
export class PropertyStore extends Model({
  id: idProp,
  name: prop<string>(),
  type: prop<string>(),
  value: prop<any>(),
  options: prop<Record<string, any>>(() => ({})),
  keyframes: prop(() => new KeyframesStore({}))
}) {
  @computed
  get parent() {
    return getParent<PropertiesStore>(getParent<any>(this));
  }

  @modelAction
  setValues({ name, type, value }: Omit<Property, 'keyframes'>) {
    this.name = name;
    this.type = type;
    this.value = value;
  }

  @computed
  get playheadPosition(): number {
    const rootStore = getRoot<any>(this);
    if (!rootStore?.ui) {
      throw new Error("UIStore not found in the root context");
    }
    return rootStore.ui.playheadPosition;
  }

  @computed
  get currentTweenValue() {
    const position = this.playheadPosition;
    const nextKeyframe = this.keyframes.getNearestNext(position);
    const prevKeyframe = this.keyframes.getNearestPrev(position);
    
    if (nextKeyframe && prevKeyframe && nextKeyframe.position === prevKeyframe.position) {
      return nextKeyframe.value;
    }
    
    if (nextKeyframe && prevKeyframe) {
      const duration = nextKeyframe.position - prevKeyframe.position;
      const progress = (position - prevKeyframe.position) / duration;
      return prevKeyframe.value + 
        (nextKeyframe.value - prevKeyframe.value) * 
        nextKeyframe.easingFunction(progress);
    }
    
    return nextKeyframe?.value ?? prevKeyframe?.value ?? this.value;
  }

  @modelAction
  addKeyframe(position: number, value: number) {
    return this.keyframes.add({ position, value });
  }

  @modelAction
  setName(name: string) {
    this.name = name;
  }

  @modelAction
  setType(type: string) {
    this.type = type;
  }

  @modelAction
  setValue(value: any) {
    this.value = value;
  }

  @modelAction
  remove() {
    this.parent?.remove(this.id);
  }

  @computed
  get currentTweenValuesObject() {
    if (this.type !== 'group') {
      return this.currentTweenValue;
    }

    return (this.value as Property[]).reduce((tweenValues, propItem) => {
      const manager = new PropertyStore({
        name: propItem.name,
        type: propItem.type,
        value: propItem.value,
        keyframes: new KeyframesStore({})
      });
      
      tweenValues[propItem.name] = propItem.type === 'group' 
        ? manager.currentTweenValuesObject()
        : manager.currentTweenValue;
        
      return tweenValues;
    }, {} as Record<string, any>);
  }
} 