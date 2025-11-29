import { model, Model, modelAction, prop, idProp, getParent } from "mobx-keystone";
import { LabelsStore } from "./collections/LabelsStore";
import { computed } from "mobx";

@model("LabelStore")
export class LabelStore extends Model({
  id: idProp,
  name: prop<string>(""),
  position: prop<number>(0),
  action: prop<string>("")
}) {
  @computed
  get parent() {
    return getParent<LabelsStore>(getParent<any>(this));
  }

  @modelAction
  setName(name: string) {
    this.name = name;
  }

  @modelAction
  setPosition(position: number) {
    this.position = position;
  }

  @modelAction
  setAction(action: string) {
    this.action = action;
  }

  @computed
  get previousLabel() {
    return this.parent?.getNearestPrev(this.position);
  }

  @computed
  get nextLabel() {
    return this.parent?.getNearestNext(this.position);
  }

  @modelAction
  remove() {
    return this.parent?.remove(this.id);
  }
} 