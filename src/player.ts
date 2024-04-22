import type {
  Artboard,
  File,
  RiveCanvas,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';

interface Position {
  x: number;
  y: number;
}

export default class Player {
  private position: Position;
  private artboard: Artboard;
  private stateMachine: StateMachineInstance;
  private _xSpeed = 0;
  private _ySpeed = 0;

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
    if (keyPresses.has('ArrowUp')) {
      this._ySpeed = -300;
    }
    if (keyPresses.has('ArrowDown')) {
      this._ySpeed = 300;
    }
  }
}
