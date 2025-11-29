import { model, Model, modelAction, prop, idProp, arrayActions } from "mobx-keystone";
import type { Element } from '../../types';
import { ElementStore } from '../ElementStore';
import { computed } from "mobx";
import { PropertiesStore } from './PropertiesStore';

@model("ElementsStore")
export class ElementsStore extends Model({
  id: idProp,
  items: prop<ElementStore[]>(() => []),
}) {
  @computed
  get all() {
    return this.items;
  }

  @computed
  get selected() {
    return this.items.find(element => element.selected) || null;
  }

  @modelAction
  setSelected(id?: string) {
    this.items.forEach(element => {
      element.id === id ? element.setSelected(true) : element.setSelected(false);
    });
  }

  getById(id: string) {
    return this.items.find(element => element.id === id) || null;
  }

  @modelAction
  add(elementData: Partial<Omit<Element, "properties">>) {
    if(!elementData.name) {
      throw new Error("Element name is required");
    }
    const element = new ElementStore({
      type: elementData.type || 'element',
      name: elementData.name,
      properties: new PropertiesStore({})
    });
    arrayActions.push(this.items, element);
    return element;
  }

  @modelAction
  remove(id: string) {
    const index = this.items.findIndex(element => element.id === id);
    if (index !== -1) {
      arrayActions.splice(this.items, index, 1);
      return true;
    }
    return false;
  }

  @modelAction
  reorder(sourceIndex: number, targetIndex: number) {
    if (sourceIndex >= 0 && sourceIndex < this.items.length && 
        targetIndex >= 0 && targetIndex < this.items.length) {
      const [element] = arrayActions.splice(this.items, sourceIndex, 1);
      arrayActions.splice(this.items, targetIndex, 0, element);
    }
  }
} 