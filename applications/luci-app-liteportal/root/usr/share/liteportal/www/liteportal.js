/*
 * Turn the appearance percentages from links.json - the very values the LuCI
 * sliders write - into the custom properties liteportal.css consumes. They go on
 * <html> rather than into inline styles because the scrim and the photo are
 * pseudo-elements, and an inline style on body cannot reach either of them.
 *
 * A value that is missing or unparsable falls back to what the stylesheet
 * hard-coded before these options existed, so an upgraded portal whose uci has
 * none of them renders exactly as it did before.
 */
function clamp(value, lo, hi, fallback) {
  var n = parseFloat(value);

  if (isNaN(n))
    return fallback;

  return Math.min(hi, Math.max(lo, n));
}

function apply_appearance(d) {
  var root = document.documentElement.style;
  var blur = clamp(d.bg_blur, 0, 100, 0);

  root.setProperty('--bg-veil', String(clamp(d.bg_veil, 0, 100, 78) / 100));

  /* Percent of the maximum (20px), so the slider and the CSS share one scale. */
  root.setProperty('--bg-blur', (blur * 0.2).toFixed(1) + 'px');

  /* The slider is labelled "transparency", the alpha channel is opacity. */
  root.setProperty('--card-alpha',
    String((100 - clamp(d.card_transparency, 0, 100, 45)) / 100));
}

/*
 * The search box, built only when links.json carries a template for it.
 *
 * The page is static, so a search is an ordinary GET form submitted straight
 * to the engine - there is nothing to ask the backend, and no engine knowledge
 * here beyond the template it was handed. Results open in a new tab: the portal
 * stays where it is, which is what a navigation page is for.
 *
 * A missing or null `search` (the switch off, or a template that failed
 * validation in the backend) leaves no trace in the DOM, so a portal without
 * the feature renders exactly as it did before.
 *
 * The box is hidden until the space bar calls it up. The portal is a page of
 * links, and an input sitting there permanently competes with them for
 * attention - so the element exists from the start (a class swap, not a
 * rebuild, stands between the two states) and stays out of the way.
 */
function setup_search(cfg) {
  if (!cfg || !cfg.template)
    return;

  var template = cfg.template;

  var form = document.createElement('form');
  form.className = 'search';
  form.setAttribute('autocomplete', 'off');

  var input = document.createElement('input');
  input.type = 'text';
  input.name = 'q';
  input.placeholder = 'Search…';
  form.appendChild(input);

  document.querySelector('.wrap').insertBefore(form, document.getElementById('grid'));

  function show() {
    form.classList.add('open');
    input.focus();
  }

  function hide() {
    form.classList.remove('open');
    input.blur();
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    var q = input.value.trim();

    if (!q) {
      input.focus();
      return;
    }

    /* The first %s is the keyword; whatever follows it (a fixed &lang=zh,
     * say) stays as configured. encodeURIComponent keeps a keyword with
     * spaces or & from breaking out of the query. */
    window.open(template.replace('%s', encodeURIComponent(q)), '_blank', 'noopener');

    /* The results are in the other tab; the portal goes back to being a
     * page of links, with nothing of the query left behind. */
    input.value = '';
    hide();
  });

  document.addEventListener('keydown', function (ev) {
    /*
     * An input method turns the space bar into "commit the candidate":
     * while one is composing, that keystroke belongs to the IME, not to us.
     * Not checking would hide the box in the middle of typing Chinese -
     * the single most likely way this feature gets used on this router.
     */
    if (ev.isComposing || ev.ctrlKey || ev.metaKey || ev.altKey)
      return;

    if (ev.key === 'Escape') {
      hide();
      return;
    }

    if (ev.key !== ' ')
      return;

    if (ev.target === input) {
      /* Only an empty box hides on space; with text in it the keystroke is
       * a space the user meant to type. */
      if (input.value === '') {
        ev.preventDefault();
        hide();
      }
      return;
    }

    /* Any other text field on the page keeps its own space bar. */
    var t = ev.target;

    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable))
      return;

    ev.preventDefault();
    show();
  });
}

/*
 * `cache: 'no-store'` is not an optimisation to remove.
 *
 * links.json is rewritten every time the configuration changes, but it is still
 * a static file: uhttpd answers it with Last-Modified and ETag only, and no
 * Cache-Control. With no explicit freshness lifetime a browser falls back to
 * heuristic caching - roughly 10% of the file's age - so a portal left untouched
 * for a day is considered fresh for over two hours. Editing an appearance slider
 * then saving leaves the page reading the cached copy, and all three sliders look
 * like they do nothing until a hard reload. The file is a few hundred bytes, so
 * asking for it every time costs nothing that matters.
 */
fetch('links.json', { cache: 'no-store' })
  .then(function (r) {
    /*
     * A 404 is not a fetch error - fetch() resolves it and r.json() then
     * chokes on the HTML error page the server answered with, so both end
     * up in the same catch(). Reporting the status here is what tells an
     * unwritten links.json ("HTTP 404") apart from a malformed one.
     */
    if (!r.ok)
      throw new Error('HTTP ' + r.status);

    return r.json();
  })
  .then(function (d) {
    apply_appearance(d);
    setup_search(d.search);

    if (d.title) {
      document.getElementById('title').textContent = d.title;
      document.title = d.title;
    }
    if (d.background) {
      if (/^#|^rgb/.test(d.background)) {
        document.body.style.background = d.background;
      } else {
        /*
         * The path comes out of the backend rooted ("/bg/x.jpg"). Without the
         * leading slash the browser would resolve it against the page's own
         * path, which is not what the document root means.
         */
        var url = d.background.replace(/^([^\/])/, '/$1');

        /*
         * Replacing the background leaves the name untouched, so the browser
         * would serve the cached copy and a plain reload would keep showing
         * the old image. The version the backend reports (modification time
         * plus size) makes the URL change whenever the file does.
         */
        if (d.background_v)
          url += '?v=' + encodeURIComponent(d.background_v);

        /*
         * The photo lives on the pseudo-element that also carries the blur, so
         * a custom property is the only way to point at it: body itself has to
         * stay unblurred for the text on top to remain crisp. The colour set
         * above stays as the fallback layer, which is why nothing is cleared
         * when the image fails to load.
         */
        document.documentElement.style.setProperty('--bg-image', 'url("' + url + '")');
      }
    }
    var grid = document.getElementById('grid');
    (d.links || []).forEach(function (l) {
      if (!l.url) return;
      var a = document.createElement('a');
      a.className = 'card';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener';

      var ico = document.createElement('div');
      ico.className = 'ico';
      if (l.icon) {
        if (/^https?:\/\//.test(l.icon) || l.icon.indexOf('/') >= 0) {
          var img = document.createElement('img');
          img.src = l.icon;
          ico.appendChild(img);
        } else {
          ico.textContent = l.icon;
        }
      }

      var nm = document.createElement('div');
      nm.className = 'name';
      nm.textContent = l.name || l.url;

      a.appendChild(ico);
      a.appendChild(nm);
      grid.appendChild(a);
    });
  })
  .catch(function (err) {
    document.getElementById('grid').textContent =
      'Failed to load links.json: ' + ((err && err.message) || err);
  });
