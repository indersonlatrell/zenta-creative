/* ============================================================
   Zenta Creative — Meta Pixel + CAPI Lead tracking (single source)
   PIXEL_ID and CAPI_ENDPOINT are set below.
   Browser pixel + server (CAPI) both fire each event with a shared
   event_id, so Meta de-duplicates them automatically.
   ============================================================ */
(function () {
  var PIXEL_ID     = "965321093221156";
  var CAPI_ENDPOINT = "https://zenta-capi.indersonlatrell7.workers.dev";

  // --- Base pixel -------------------------------------------------------
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  // --- Helpers ----------------------------------------------------------
  function uuid() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'e' + Date.now() + Math.random().toString(16).slice(2);
  }
  function cookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }
  function sendCapi(eventName, eventId, custom, fields) {
    if (!CAPI_ENDPOINT || CAPI_ENDPOINT.indexOf('__') === 0) return;
    var body = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: location.href,
      fbp: cookie('_fbp'),
      fbc: cookie('_fbc'),
      contact: (fields && fields.contact) || '',
      first_name: (fields && fields.first_name) || '',
      custom_data: custom || {}
    };
    try {
      fetch(CAPI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true
      });
    } catch (e) {}
  }
  function fireLead(source, fields) {
    var id = uuid();
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', { content_name: source }, { eventID: id });
    }
    sendCapi('Lead', id, { content_name: source }, fields);
  }

  // --- Lead events ------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    var forms = [
      { id: 'contactForm', name: 'contactName', contact: 'contactDetails' },
      { id: 'projectForm', name: 'name',        contact: 'contact' }
    ];
    forms.forEach(function (cfg) {
      var form = document.getElementById(cfg.id);
      if (!form) return;
      form.addEventListener('submit', function () {
        if (!form.checkValidity()) return;
        var nameEl = document.getElementById(cfg.name);
        var contactEl = document.getElementById(cfg.contact);
        fireLead('Contact form - ' + cfg.id, {
          first_name: nameEl ? nameEl.value.trim() : '',
          contact: contactEl ? contactEl.value.trim() : ''
        });
      });
    });

    document.querySelectorAll(
      'a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp://"]'
    ).forEach(function (el) {
      el.addEventListener('click', function () { fireLead('WhatsApp click', null); });
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
      el.addEventListener('click', function () {
        var addr = (el.getAttribute('href') || '').replace(/^mailto:/i, '').split('?')[0];
        fireLead('Email click', { contact: addr });
      });
    });
  });
})();
