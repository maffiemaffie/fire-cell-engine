/**
 * Maffie Cohen
 * Cool Project
 * Do shit
 */

"use strict"; //catch some common coding errors

/* Global variables */

let model;
let noise;

const script = document.currentScript;

/**
 * setup :
 */
function setup() {
   var canvas = createCanvas(400, 400);
   canvas.parent(script.parentElement);
   fill(0);

   noise = new OctaveNoise(3, 4, 6);
   model = new Model(5, 40, 5, 25);

   // const NOISE_SCALE = new Slider('Noise Scale', 0.5, 4, 0.1, 2.5, 'NOISE_SCALE');
   // const TIME_SCALE = new Slider('Time Scale', 0.01, 0.07, 0.01, 0.04, 'TIME_SCALE');
   // const FIRE_SIZE = new Slider('Fire Size', 1, 5, 0.25, 3, 'FIRE_SIZE');
   // const FIRE_SPEED = new Slider('Fire Speed', 0, 2, 0.1, 1, 'FIRE_SPEED');
   const NOISE_SCALE = new Slider('Noise Scale', 0.5, 4, 0.1, 2.5, 'NOISE_SCALE');
   const TIME_SCALE = new Slider('Time Scale', 0, 0.05, 0.005, 0.025, 'TIME_SCALE');
   const FIRE_SIZE = new Slider('Fire Size', 0.5, 2, 0.125, 1.125, 'FIRE_SIZE');
   const FIRE_SPEED = new Slider('Fire Speed', 0, 0.1, 0.01, 0.05, 'FIRE_SPEED');
   
   model.addControl(NOISE_SCALE);
   model.addControl(TIME_SCALE);
   model.addControl(FIRE_SIZE);
   model.addControl(FIRE_SPEED);

   model.setDraw(drawFire);
}

/**
 * draw :
 */
function draw() {
   blendMode(BLEND);
   background(0);
   blendMode(ADD);

   model.draw();
}

function drawFire(x, y, data) {
   const FIRE_SIZE = data.FIRE_SIZE;
   const FIRE_SPEED = data.FIRE_SPEED;
   const NOISE_SCALE = data.NOISE_SCALE;
   const TIME_SCALE = data.TIME_SCALE;
      
   // get noise from x and y position; fire rises
   const NOISE_VAL = noise.get(x * NOISE_SCALE - 500, (y + FIRE_SPEED * frameCount) * NOISE_SCALE, frameCount * TIME_SCALE);

   // squares shrink as they rise
   const HEIGHT_FACTOR = max(map(y, -1, 1, 0, 5), 0);
   
   // squares are larger closer to the center
   const WIDTH_FACTOR = max(map(abs(x), 0, 0.5, 1.5, 0.5), 0);
   
   // define size of each square according to its position
   const SQUARE_SIZE = map(NOISE_VAL, 0, 1, -1, 1) * FIRE_SIZE * HEIGHT_FACTOR * WIDTH_FACTOR;
   
   // Brightness is controlled by the same factors as scale
   const RED = 220;
   const GREEN = NOISE_VAL * map(y, -1, 1, 0, 150);
   const BLUE = NOISE_VAL * map(y, -1, 1, 0, 50);
   const ALPHA = NOISE_VAL * map(y, -1, 1, 0, 500)
   
   stroke(RED, GREEN, BLUE, ALPHA);
   
   line(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
}
