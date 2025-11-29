import { model, Model, modelAction, prop, arrayActions } from "mobx-keystone";
import type { Sequence } from '../../types';
import { computed } from "mobx";
import { ElementsStore } from "./ElementsStore";
import { SequenceStore } from "../SequenceStore";

@model("SequencesStore")
export class SequencesStore extends Model({
  items: prop<SequenceStore[]>(() => []),
  currentId: prop<string | null>(null)
}) {
  @computed
  get all() {
    return this.items;
  }

  @computed
  get current() {
    return this.items.find(item => item.id === this.currentId) || null;
  }

  @modelAction
  setCurrent(sequence: SequenceStore) {
    this.currentId = sequence.id;
    return this.current;
  }

  @modelAction
  setCurrentById(id: string) {
    this.currentId = id;
    return this.current;
  }

  @modelAction
  setCurrentByName(name: string) {
    this.currentId = this.items.find(item => item.name === name)?.id || null;
    return this.current;
  }

  @modelAction
  setCurrentByIndex(index: number) {
    this.currentId = this.items[index]?.id || null;
    return this.current;
  }

  getByName(name: string) {
    const property = this.items.find(propItem => propItem.name === name);
    return property || null;
  }

  @modelAction
  add(sequenceData: Omit<Sequence, "elements">) {
    const sequence = new SequenceStore({
      id: Math.random().toString(),
      name: sequenceData.name,
      duration: sequenceData.duration,
      elements: new ElementsStore({})
    });
    
    arrayActions.push(this.items, sequence);
    return sequence;
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
} 