import RiveCanvas from '@rive-app/canvas-advanced-single';
import type { File } from '@rive-app/canvas-advanced-single';
import './style.css';
import Player from './player';
import { LargeStar, SmallStar, SpecialStar, type Star } from './star';
import Score from './score';

async function main() {
  // Load the Rive WASM file
  const rive = await RiveCanvas();
  // Get the canvas element
  const canvas = document.getElementById('canvas')! as HTMLCanvasElement;

  // Load the background music and sound effects
  let hasUserInteracted = false;

  const bgMusic = document.getElementById(
    'backgroundMusic',
  ) as HTMLAudioElement;

  bgMusic.addEventListener('canplaythrough', () => {
    if (hasUserInteracted) {
      bgMusic.play();
    }
  });

  bgMusic.addEventListener('error', () => {
    console.error('Error loading bg music');
  });

  document.addEventListener('click', () => {
    hasUserInteracted = true;
    bgMusic.play();
  });

  const starPickSound = document.getElementById(
    'starPickupSound',
  ) as HTMLAudioElement;

  starPickSound.addEventListener('error', () => {
    console.error('Error loading star pickup sound');
  });

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
  const score = new Score(canvas, rive, file);

  const keyPresses = new Set<string>();

  document.addEventListener('keydown', (event) => {
    keyPresses.add(event.key);
    player.handleKeyPress(keyPresses);
  });

  document.addEventListener('keyup', (event) => {
    keyPresses.delete(event.key);
    player.handleKeyPress(keyPresses);
  });

  // Create an array to hold the stars
  let stars: Star[] = [];

  // Generate stars

  function generateStars() {
    const random = Math.random();

    if (random < 0.001) {
      const star = new SpecialStar(canvas, rive, file);
      stars.push(star);
    } else if (random < 0.005) {
      const star = new LargeStar(canvas, rive, file);
      stars.push(star);
    } else if (random < 0.01) {
      const star = new SmallStar(canvas, rive, file);
      stars.push(star);
    }
  }

  let lastTime = 0;

  function renderLoop(time: number) {
    if (!lastTime) {
      lastTime = time;
    }
    const elapsedTimeMs = time - lastTime;
    const elapsedTimeSec = elapsedTimeMs / 1000;
    lastTime = time;

    renderer.clear();

    generateStars();

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

    score.update(elapsedTimeSec);
    score.draw(renderer);

    // Update and draw stars
    stars.forEach((star) => {
      star.update(elapsedTimeSec);
      star.draw(renderer);
    });

    // Remove off-screen stars
    const toDelete: Star[] = [];

    stars.forEach((star) => {
      if (star.position.x < -200) {
        toDelete.push(star);
      }
    });

    stars = stars.filter((star) => !toDelete.includes(star));

    toDelete.forEach((star) => star.destroy());

    // Check for collisions
    const collidedStars: Star[] = [];

    function checkCollisions() {
      stars
        .filter((star) => !star.isPicked && !star.isDestroyed)
        .forEach((star) => {
          if (
            player.bounds.minX < star.bounds.maxX &&
            player.bounds.maxX > star.bounds.minX &&
            player.bounds.minY < star.bounds.maxY &&
            player.bounds.maxY > star.bounds.minY
          ) {
            collidedStars.push(star);
          }
        });
    }

    checkCollisions();

    collidedStars.forEach((star) => {
      star.pick();
      if (hasUserInteracted) {
        starPickSound.play();
      }
    });

    stars.forEach((star) => {
      if (star.isDestroyed) {
        star.destroy();
      }
    });

    stars = stars.filter((star) => !star.isDestroyed);

    collidedStars.forEach((star) => {
      score.score += star.value;
    });

    rive.requestAnimationFrame(renderLoop);
  }

  rive.requestAnimationFrame(renderLoop);
}

main();
