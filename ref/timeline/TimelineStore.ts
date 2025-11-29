import { model, Model, modelAction, prop, idProp } from "mobx-keystone";
import { ManualUndoManager, manualUndoMiddleware } from "../middleware/manualUndoMiddleware";
import { SequencesStore } from "./collections/SequencesStore";
import { observable } from "mobx";

// Define a UI state using mobx-keystone with simple primitives via prop
@model("UIStore")
export class UIStore extends Model({
  zoomLevel: prop<number>(1)
}) {
  @observable
  playheadPosition = 0;
  
  @modelAction
  setPlayheadPosition(position: number) {
    this.playheadPosition = position;
  }

  @modelAction
  movePlayheadPosition(position: number) {
    this.playheadPosition = position;
  }
}

@model("TimelineStore")
export class TimelineStore extends Model({
  id: idProp,
  name: prop<string>(""),
  duration: prop<number>(0),
  sequences: prop(() => new SequencesStore({})),
  ui: prop(() => new UIStore({}))
}) {
  undoManager?: ManualUndoManager;

  onInit() {
    this.undoManager = manualUndoMiddleware(this);
  }

  @modelAction
  setZoomLevel(level: number) {
    this.ui.zoomLevel = level;
  }

  @modelAction
  setDuration(duration: number) {
    this.duration = duration;
  }

  @modelAction
  setName(name: string) {
    this.name = name;
  }

  // @modelAction
  // setFromObject(data: TimelineStoreData) {
  //   // Set basic store properties
  //   this.id = data.id;
  //   this.name = data.name;
  //   this.duration = data.duration;

  //   // Create sequences from data
  //   data.sequences.items.forEach(sequenceData => {
  //     const sequence = this.sequences.add({
  //       id: sequenceData.id,
  //       name: sequenceData.name,
  //       duration: sequenceData.duration
  //     });

  //     // Add elements and their properties
  //     sequenceData.elements.items.forEach(elementData => {
  //       const element = sequence.elements.add({
  //         id: elementData.id,
  //         name: elementData.name
  //       });

  //       elementData.properties.items.forEach(propertyData => {
  //         const property = element.properties.add({
  //           id: propertyData.id,
  //           name: propertyData.name,
  //           type: propertyData.type,
  //           value: propertyData.value
  //         });

  //         propertyData.keyframes.items.forEach(keyframeData => {
  //           property.keyframes.add({
  //             id: keyframeData.id,
  //             position: keyframeData.position,
  //             value: keyframeData.value,
  //             easing: {
  //               type: keyframeData.easing.type,
  //               transition: keyframeData.easing.transition,
  //               config: keyframeData.easing.config
  //             }
  //           });
  //         });
  //       });
  //     });
  //   });

  //   // Set UI state
  //   if (data.ui) {
  //     this.ui.playheadPosition = data.ui.playheadPosition;
  //     this.ui.zoomLevel = data.ui.zoomLevel;
  //   }

  //   // Set the first sequence as current if exists
  //   if (this.sequences.items.length > 0) {
  //     this.sequences.setCurrentSequence(this.sequences.items[0]);
  //   }

  //   return this;
  // }

  // Undo/redo functionality (if needed) can be added using mobx-keystone's patch recorder.
}