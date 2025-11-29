import { model, Model, modelAction, prop, idProp, getParent, arrayActions } from "mobx-keystone";
import type { Property } from '../types';
import { PropertiesStore } from './collections/PropertiesStore';
import { computed } from "mobx";

@model("ElementStore")
export class ElementStore extends Model({
  id: idProp,
  name: prop<string>(),
  type: prop<string>("element"),
  properties: prop(() => new PropertiesStore({})),
  metadata: prop<Record<string, any>>(() => ({})),
  selected: prop<boolean>(false),
  children: prop<ElementStore[]>(() => [])
}) {
  @modelAction
  setName(name: string) {
    this.name = name;
  }

  @computed
  get parent(): ElementStore | null {
    const parent = getParent<ElementStore>(getParent<any>(this));
    return parent instanceof ElementStore ? parent : null;
  }

  @computed
  get selectedChildren(): ElementStore[] {
    return this.children.filter(child => child.selected);
  }

  @modelAction
  setMetadata(metadata: Record<string, any>) {
    this.metadata = metadata;
  }

  @modelAction
  setSelected(selected: boolean) {
    this.selected = selected;
  }

  @modelAction
  select() {
    if (this.parent) {
      // Deselect siblings
      this.parent.children.forEach(child => {
        child.setSelected(child.id === this.id);
      });
    }
  }

  @modelAction
  deselect() {
    this.setSelected(false);
  }

  @modelAction
  remove() {
    if (this.parent) {
      const index = this.parent.children.findIndex(child => child.id === this.id);
      if (index !== -1) {
        arrayActions.splice(this.parent.children, index, 1);
      }
    }
  }

  @computed
  get propertyList() {
    return this.properties.all;
  }

  getPropertyByName(name: string) {
    return this.properties.getByName(name);
  }

  @modelAction
  addProperty(propertyData: Omit<Property, 'keyframes'>) {
    return this.properties.add(propertyData);
  }

  @computed
  get currentTweenValues() {
    return this.properties.currentTweenValues;
  }

  // Methods for managing child elements
  @computed
  get allChildren() {
    return this.children;
  }

  @computed
  get selectedChild(): ElementStore | null {
    return this.children.find(element => element.selected) || null;
  }

  @modelAction
  setSelectedChild(id?: string) {
    this.children.forEach(element => {
      element.setSelected(element.id === id);
    });
  }

  getChildById(id: string) {
    return this.children.find(element => element.id === id) || null;
  }

  @modelAction
  addChild(elementData: Partial<Omit<ElementStore, "properties">>) {
    if(!elementData.name) {
      throw new Error("Element name is required");
    }
    
    const element = new ElementStore({
      type: elementData.type || 'element',
      name: elementData.name,
      properties: new PropertiesStore({})
    });
    
    arrayActions.push(this.children, element);
    return element;
  }

  @modelAction
  removeChild(id: string) {
    const index = this.children.findIndex(element => element.id === id);
    if (index !== -1) {
      arrayActions.splice(this.children, index, 1);
      return true;
    }
    return false;
  }

  @modelAction
  reorderChildren(sourceIndex: number, targetIndex: number) {
    if (sourceIndex >= 0 && sourceIndex < this.children.length && 
        targetIndex >= 0 && targetIndex < this.children.length) {
      const [element] = arrayActions.splice(this.children, sourceIndex, 1);
      arrayActions.splice(this.children, targetIndex, 0, element);
    }
  }
} 