import type {
  Artboard,
  File,
  RiveCanvas,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';

import type { Position } from './types';
import { getRandomInt } from './utils';

export default class Star {
  private _position: Position;
  private artboard: Artboard;
  private stateMachine: StateMachineInstance;

  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    file: File,
  ) {
    this.artboard = file.artboardByName('star')!;
    const stateMachine = this.artboard.stateMachineByName('State Machine 1')!;
    this.stateMachine = new rive.StateMachineInstance(
      stateMachine,
      this.artboard,
    );

    this._position = {
      x: canvas.width + 10,
      y: getRandomInt(200, canvas.height - 200),
    };
  }

  update(elapsedTimeSec: number) {
    this.artboard.advance(elapsedTimeSec);
    this.stateMachine.advance(elapsedTimeSec);
    this._position.x -= 200 * elapsedTimeSec;
  }

  draw(renderer: WrappedRenderer) {
    renderer.save();
    renderer.translate(this._position.x, this._position.y);
    this.artboard.draw(renderer);
    renderer.restore();
  }

  get position() {
    return this._position;
  }

  destroy() {
    this.artboard.delete();
    this.stateMachine.delete();
  }

  get bounds() {
    return {
      minX: this._position.x + 50,
      minY: this._position.y + 50,
      maxX: this._position.x + this.artboard.bounds.maxX - 50,
      maxY: this._position.y + this.artboard.bounds.maxY - 50,
    };
  }
}
