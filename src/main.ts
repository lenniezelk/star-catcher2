import RiveCanvas, { type File } from '@rive-app/canvas-advanced-single';
import './style.css';
import Player from './player';

async function main() {
  // Load the Rive WASM file
  const rive = await RiveCanvas();
  // Get the canvas element
  const canvas = document.getElementById('canvas')! as HTMLCanvasElement;

  // Create a renderer
  const renderer = rive.makeRenderer(canvas);
  // Fetch the Rive animation file
  const bytes = await (await fetch('/star-catcher.riv')).arrayBuffer();
  // Load the file
  const file = (await rive.load(new Uint8Array(bytes))) as File;

  // Utility function to resize the canvas to the window size
  function computeSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.onresize = computeSize;
  computeSize();

  // Get the background artboard, state machine and create a state machine instance
  const bgArtboard = file.artboardByName('bg')!;
  const bgStateMachine = bgArtboard.stateMachineByName('bg')!;
  const bgStateMachineInstance = new rive.StateMachineInstance(
    bgStateMachine,
    bgArtboard,
  );

  const player = new Player(canvas, rive, file);

  const keyPresses = new Set<string>();

  document.addEventListener('keydown', (event) => {
    keyPresses.add(event.key);
    player.handleKeyPress(keyPresses);
  });

  document.addEventListener('keyup', (event) => {
    keyPresses.delete(event.key);
    player.handleKeyPress(keyPresses);
  });

  let lastTime = 0;

  function renderLoop(time: number) {
    if (!lastTime) {
      lastTime = time;
    }
    const elapsedTimeMs = time - lastTime;
    const elapsedTimeSec = elapsedTimeMs / 1000;
    lastTime = time;

    renderer.clear();

    // Advance the background state machine instance and the artboard
    bgStateMachineInstance.advance(elapsedTimeSec);
    bgArtboard.advance(elapsedTimeSec);

    // Align and draw the background artboard
    renderer.save();
    renderer.align(
      rive.Fit.cover,
      rive.Alignment.center,
      {
        minX: 0,
        minY: 0,
        maxX: canvas.width,
        maxY: canvas.height,
      },
      bgArtboard.bounds,
    );
    bgArtboard.draw(renderer);
    renderer.restore();

    player.update(elapsedTimeSec);
    player.draw(renderer);

    rive.requestAnimationFrame(renderLoop);
  }

  rive.requestAnimationFrame(renderLoop);
}

main();
