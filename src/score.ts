import {
  Artboard,
  File,
  RiveCanvas,
  StateMachineInstance,
  WrappedRenderer,
  TextValueRun,
} from '@rive-app/canvas-advanced-single';

export default class Score {
  private artboard: Artboard;
  private stateMachine: StateMachineInstance;
  private _score = 0;
  private _textRun: TextValueRun;

  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    file: File,
  ) {
    this.artboard = file.artboardByName('score')!;
    const stateMachine = this.artboard.stateMachineByName('State Machine 1')!;
    this.stateMachine = new rive.StateMachineInstance(
      stateMachine,
      this.artboard,
    );
    this._textRun = this.artboard.textRun('score');
  }

  update(elapsedTimeSec: number) {
    this.artboard.advance(elapsedTimeSec);
    this.stateMachine.advance(elapsedTimeSec);
  }

  draw(renderer: WrappedRenderer) {
    renderer.save();
    renderer.align(
      this.rive.Fit.none,
      this.rive.Alignment.topLeft,
      {
        minX: 10,
        minY: 10,
        maxX: this.canvas.width,
        maxY: this.canvas.height,
      },
      this.artboard.bounds,
    );
    this.artboard.draw(renderer);
    renderer.restore();
  }

  destroy() {
    this.artboard.delete();
    this.stateMachine.delete();
  }

  get score() {
    return this._score;
  }

  set score(value: number) {
    this._score = value;
    this._textRun.text = value.toString();
  }
}
