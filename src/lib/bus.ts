// Shared state between the DOM (which owns scrolling and hover) and the 3D scene.
// Plain mutable values: the render loop reads them every frame without re-rendering React.
export const STOPS = 10; // hero, about, 5 journey stations, projects, skills, contact

export const bus = {
  stop: 0, // Scroll position in stop units, 0 to STOPS - 1
  project: -1, // Hovered project index
  skill: 0, // Open skill crystal index
  pointerActive: false,
  replayRequest: 0,
  wake: () => {}, // Requests a frame when the scene only renders on demand
};
