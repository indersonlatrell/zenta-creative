/* Zenta Creative — Google Analytics 4 + lead event tracking */
(function () {
  "use strict";

  var MEASUREMENT_ID = "G-TB841JZ03T";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: true
  });

  var loader = document.createElement("script");
  loader.async = true;
  loader.src = "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(loader);

  function track(eventName, parameters) {
    window.gtag("event", eventName, parameters || {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function () {
        if (!form.checkValidity()) return;

        track("generate_lead", {
          lead_source: "website_form",
          form_id: form.id || "unnamed_form",
          page_path: window.location.pathname
        });
      });
    });

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link) return;

      var href = link.getAttribute("href") || "";
      var destination = link.href || href;

      if (/wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) {
        track("whatsapp_click", {
          link_url: destination,
          page_path: window.location.pathname
        });
      } else if (/^mailto:/i.test(href)) {
        track("email_click", {
          link_url: destination,
          page_path: window.location.pathname
        });
      } else if (/^tel:/i.test(href)) {
        track("phone_click", {
          link_url: destination,
          page_path: window.location.pathname
        });
      }
    });
  });
})();
