import type {
  Artboard,
  File,
  RiveCanvas,
  SMIInput,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';
import { Position } from './types';

export default class Player {
  private position: Position;
  private artboard: Artboard;
  private stateMachine: StateMachineInstance;
  private _xSpeed = 0;
  private _ySpeed = 0;
  private _direction: SMIInput | undefined;

  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    file: File,
  ) {
    this.artboard = file.artboardByName('player')!;
    const stateMachine = this.artboard.stateMachineByName('State Machine 1')!;
    this.stateMachine = new rive.StateMachineInstance(
      stateMachine,
      this.artboard,
    );

    this.position = {
      x: 50,
      y: canvas.height / 2 - this.artboard.bounds.maxY / 2,
    };

    for (let i = 0; i < this.stateMachine.inputCount(); i++) {
      const input = this.stateMachine.input(i);
      if (input.name === 'direction') {
        this._direction = input.asNumber();
        break;
      }
    }
  }

  update(elapsedTimeSec: number) {
    this.stateMachine.advance(elapsedTimeSec);
    this.artboard.advance(elapsedTimeSec);
    this.position.x += this._xSpeed * elapsedTimeSec;
    this.position.y += this._ySpeed * elapsedTimeSec;
  }

  draw(renderer: WrappedRenderer) {
    renderer.save();
    renderer.translate(this.position.x, this.position.y);
    this.artboard.draw(renderer);
    renderer.restore();
  }

  handleKeyPress(keyPresses: Set<string>) {
    this._ySpeed = 0;
    let direction = 0;

    if (keyPresses.has('ArrowUp')) {
      this._ySpeed = -300;
      direction = 1;
    }

    if (keyPresses.has('ArrowDown')) {
      this._ySpeed = 300;
      direction = 2;
    }

    if (this._direction) {
      this._direction.value = direction;
    }
  }

  get bounds() {
    return {
      minX: this.position.x + 30,
      minY: this.position.y + 30,
      maxX: this.position.x + this.artboard.bounds.maxX - 30,
      maxY: this.position.y + this.artboard.bounds.maxY - 30,
    };
  }
}
