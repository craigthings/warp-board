import { model, Model, modelAction, prop, idProp } from "mobx-keystone";
import type { Element } from "../types";
import { ElementsStore } from "./collections/ElementsStore";
import { computed, reaction } from "mobx";
import { LabelsStore } from "./collections/LabelsStore";
import { createRelay } from "../../utils/relay/Relay";

@model("SequenceStore")
export class SequenceStore extends Model({
  id: idProp,
  name: prop<string>(),
  duration: prop<number>(0),
  elements: prop(() => new ElementsStore({})),
  labels: prop(() => new LabelsStore({}))
}) {
  onTweenUpdate = createRelay<Record<string, Record<string, any>>>();

  @computed
  get all() {
    return this.elements.all;
  }

  @computed
  get currentTweenValues() {
    return this.elements.all.reduce((elementValues, element) => {
      elementValues[element.name] = element.properties.currentTweenValues;
      return elementValues;
    }, {} as Record<string, Record<string, any>>);
  }

  onInit() {
    reaction(() => this.currentTweenValues, (values) => {
      this.onTweenUpdate.dispatch(values);
    });
  }

  @modelAction
  setName(name: string) {
    this.name = name;
  }

  @modelAction
  setDuration(duration: number) {
    this.duration = duration;
  }

  getElementById(id: string) {
    return this.elements.getById(id);
  }

  @modelAction
  addElement(elementData: Omit<Element, "properties">) {
    return this.elements.add(elementData);
  }

  @modelAction
  removeElement(id: string) {
    return this.elements.remove(id);
  }

  @modelAction
  reorderElements(sourceIndex: number, targetIndex: number) {
    return this.elements.reorder(sourceIndex, targetIndex);
  }

  @modelAction
  addLabel(labelData: { name: string; position: number; action?: string }) {
    return this.labels.add(labelData);
  }

  @modelAction
  removeLabel(id: string) {
    return this.labels.remove(id);
  }

  getLabelByName(name: string) {
    return this.labels.getByName(name);
  }

  getLabelsInRange(start: number, end: number) {
    return this.labels.getInRange(start, end);
  }

  getState() {
    return {
      id: this.id,
      name: this.name,
      elements: this.all
    };
  }
}