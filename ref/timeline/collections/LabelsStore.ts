import { model, Model, modelAction, prop, arrayActions } from "mobx-keystone";
import { LabelStore } from "../LabelStore";
import { computed } from "mobx";

@model("LabelsStore")
export class LabelsStore extends Model({
  items: prop<LabelStore[]>(() => [])
}) {
  @computed
  get all() {
    return this.items;
  }

  @computed
  get sortedLabels() {
    return [...this.items].sort((a, b) => a.position - b.position);
  }

  getByName(name: string) {
    return this.items.find(label => label.name === name) || null;
  }

  getAtPosition(position: number) {
    return this.items.find(l => l.position === position) || null;
  }

  @modelAction
  add(labelData: { name: string; position: number; action?: string }) {
    const label = new LabelStore({
      name: labelData.name,
      position: labelData.position,
      action: labelData.action || ""
    });
    
    const insertIndex = this.sortedLabels.findIndex(l => l.position > label.position);
    arrayActions.splice(
      this.items, 
      insertIndex === -1 ? this.items.length : insertIndex, 
      0, 
      label
    );
    return label;
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
    return this.sortedLabels.filter(l => l.position >= start && l.position <= end);
  }

  getNearestNext(position: number): LabelStore | null {
    return this.sortedLabels.find(l => l.position > position) || null;
  }

  getNearestPrev(position: number): LabelStore | null {
    return [...this.sortedLabels].reverse().find(l => l.position <= position) || null;
  }
} 