/**
 * ThemeScript — injected before first paint to avoid flash.
 * Reads localStorage "theme" or falls back to system preference.
 */
export default function ThemeScript() {
  const script = `
(function(){
  try {
    var t = localStorage.getItem('digiroute-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e){}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
