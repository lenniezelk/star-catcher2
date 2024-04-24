import type {
  Artboard,
  File,
  RiveCanvas,
  SMIInput,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';

import type { Position, StarStates } from './types';
import { getRandomInt } from './utils';

export abstract class Star {
  private _position: Position;
  private artboard: Artboard;
  private stateMachine: StateMachineInstance;
  protected _value = 100;
  protected _speed = 200;
  protected _margin = 50;
  protected _color = 0;
  protected _size = 0;
  protected _colorInput: SMIInput | undefined;
  protected _sizeInput: SMIInput | undefined;
  private _state: StarStates = 'idle';
  private _pickedInput: SMIInput | undefined;

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

    for (let i = 0; i < this.stateMachine.inputCount(); i++) {
      const input = this.stateMachine.input(i);
      if (input.name === 'size') {
        this._sizeInput = input.asNumber();
        break;
      }
    }

    if (this._sizeInput) {
      this._sizeInput.value = this._size;
    }

    for (let i = 0; i < this.stateMachine.inputCount(); i++) {
      const input = this.stateMachine.input(i);
      if (input.name === 'color') {
        this._colorInput = input.asNumber();
        break;
      }
    }

    if (this._colorInput) {
      this._colorInput.value = this._color;
    }

    for (let i = 0; i < this.stateMachine.inputCount(); i++) {
      const input = this.stateMachine.input(i);
      if (input.name === 'picked') {
        this._pickedInput = input.asBool();
      }
    }
  }

  update(elapsedTimeSec: number) {
    this.artboard.advance(elapsedTimeSec);
    this.stateMachine.advance(elapsedTimeSec);
    this._position.x -= this._speed * elapsedTimeSec;

    if (this.isPicked) {
      for (let i = 0; i < this.stateMachine.reportedEventCount(); i++) {
        const event = this.stateMachine.reportedEventAt(i);
        if (event?.name === 'picked end') {
          this._state = 'destroyed';
        }
      }
    }
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
      minX: this._position.x + this._margin,
      minY: this._position.y + this._margin,
      maxX: this._position.x + this.artboard.bounds.maxX - this._margin,
      maxY: this._position.y + this.artboard.bounds.maxY - this._margin,
    };
  }

  get value() {
    return this._value;
  }

  pick() {
    this._state = 'picked';

    if (this._pickedInput) {
      this._pickedInput.value = true;
    }
  }

  get isDestroyed() {
    return this._state === 'destroyed';
  }

  get isPicked() {
    return this._state === 'picked';
  }
}

export class SmallStar extends Star {
  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    file: File,
  ) {
    super(canvas, rive, file);
    this._speed = 300;
  }
}

export class LargeStar extends Star {
  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    file: File,
  ) {
    super(canvas, rive, file);
    this._size = 1;
    this._margin = 10;
    this._value = 200;

    if (this._sizeInput) {
      this._sizeInput.value = this._size;
    }
  }
}

export class SpecialStar extends Star {
  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    file: File,
  ) {
    super(canvas, rive, file);
    this._margin = 10;
    this._color = 1;
    this._size = 1;
    this._speed = 500;

    if (this._sizeInput) {
      this._sizeInput.value = this._size;
    }

    if (this._colorInput) {
      this._colorInput.value = this._color;
    }
  }
}
