import { model, Model, modelAction, prop, arrayActions } from "mobx-keystone";
import type { Property } from '../../types';
import { PropertyStore } from '../PropertyStore';
import { KeyframesStore } from './KeyframesStore';
import { computed } from "mobx";

@model("PropertiesStore")
export class PropertiesStore extends Model({
  items: prop<PropertyStore[]>(() => [])
}) {
  @computed
  get all() {
    return this.items;
  }

  getByName(name: string) {
    const property = this.items.find(propItem => propItem.name === name);
    return property || null;
  }

  @modelAction
  add(propertyData: Omit<Property, "keyframes">) {
    const property = new PropertyStore({
      id: Math.random().toString(),
      name: propertyData.name,
      type: propertyData.type,
      value: propertyData.value,
      keyframes: new KeyframesStore({})
    });
    
    arrayActions.push(this.items, property);
    return property;
  }

  @modelAction
  remove(name: string) {
    const index = this.items.findIndex(propItem => propItem.name === name);
    if (index !== -1) {
      arrayActions.splice(this.items, index, 1);
      return true;
    }
    return false;
  }

  @computed
  get currentTweenValues() {
    return this.items.reduce((values, property) => {
      values[property.name] = property.type === "group" 
        ? property.currentTweenValuesObject()
        : property.currentTweenValue;
      return values;
    }, {} as Record<string, any>);
  }
} 