// Small, original SVG icons. No icon font or runtime library required.
const paths = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  north: '<path d="M6 18 18 6M6 6h12v12"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  page: '<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  code: '<path d="m7 6-6 6 6 6m10-12 6 6-6 6M14 3l-4 18"/>',
  shield:
    '<path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Z"/><path d="m8 11 3 3 5-6"/>',
  server:
    '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h1m-1 11h1m6-11h4m-4 11h4"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  monitor:
    '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  phone:
    '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
};
export const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
export function mountIcons() {
  document.querySelectorAll("[data-icon]").forEach((element) => {
    element.outerHTML = icon(element.dataset.icon);
  });
}
