// Vanilla JS only – runs as-is on GitHub Pages
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // Theme toggle (remembers choice, otherwise follows the OS)
  // ---------------------------------------------------------------------------
  var themeToggle = document.getElementById("themeToggle");
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  themeToggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------------------------------------------------------------------------
  // Language switch (English is the text in the HTML, German comes from i18n.js)
  // ---------------------------------------------------------------------------
  var langToggle = document.getElementById("langToggle");
  var translatable = document.querySelectorAll("[data-i18n]");
  var strings = { en: {}, de: window.I18N_DE || {} };
  translatable.forEach(function (el) { strings.en[el.dataset.i18n] = el.innerHTML; });

  var head = {
    en: { title: document.title, description: document.querySelector('meta[name="description"]').content },
    de: {
      title: "Tomy Huy Le · Junior Researcher am DFKI",
      description: "Tomy Huy Le – Junior Researcher am Institut für Wirtschaftsinformatik (IWi) im DFKI und Masterstudent in Information Systems an der Universität des Saarlandes."
    }
  };

  function setLanguage(lang) {
    var dict = strings[lang];
    var nerWasOn = !!document.querySelector("#nerText mark.is-on");
    translatable.forEach(function (el) {
      var text = dict[el.dataset.i18n];
      if (text != null) el.innerHTML = text;
    });
    if (nerWasOn) document.querySelectorAll("#nerText mark").forEach(function (m) { m.classList.add("is-on"); });

    root.lang = lang;
    document.title = head[lang].title;
    document.querySelector('meta[name="description"]').content = head[lang].description;

    var other = lang === "de" ? "en" : "de";
    langToggle.textContent = other.toUpperCase();
    langToggle.lang = other;
    langToggle.setAttribute("aria-label", other === "de" ? "Auf Deutsch umschalten" : "Switch to English");
  }

  function initialLanguage() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "de" || fromUrl === "en") return fromUrl;
    try {
      var saved = localStorage.getItem("lang");
      if (saved === "de" || saved === "en") return saved;
    } catch (e) {}
    return (navigator.language || "").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  }

  setLanguage(initialLanguage());
  langToggle.addEventListener("click", function () {
    var next = root.lang === "de" ? "en" : "de";
    setLanguage(next);
    try { localStorage.setItem("lang", next); } catch (e) {}
    var url = new URL(window.location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", next);
      history.replaceState(null, "", url);
    }
  });

  // ---------------------------------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------------------------------
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  function setMenu(open) {
    navLinks.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuToggle.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("is-open"));
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // ---------------------------------------------------------------------------
  // Navbar background once the page is scrolled
  // ---------------------------------------------------------------------------
  var nav = document.getElementById("nav");
  var ticking = false;
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---------------------------------------------------------------------------
  // Active section highlighting in the nav
  // ---------------------------------------------------------------------------
  var links = Array.prototype.slice.call(navLinks.querySelectorAll("a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---------------------------------------------------------------------------
  // Reveal on scroll (staggered within each group)
  // ---------------------------------------------------------------------------
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.classList.contains("reveal");
      });
      el.style.setProperty("--d", Math.min(siblings.indexOf(el), 5) * 0.07 + "s");
    });
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealer.observe(el); });
  }

  // ---------------------------------------------------------------------------
  // NER illustration: highlight entities one after another
  // ---------------------------------------------------------------------------
  var nerText = document.getElementById("nerText");
  var nerReplay = document.getElementById("nerReplay");
  var timers = [];

  function runExtraction() {
    // Queried on each run because switching language replaces the sentence
    var marks = nerText.querySelectorAll("mark");
    timers.forEach(clearTimeout);
    timers = [];
    marks.forEach(function (m) { m.classList.remove("is-on"); });
    if (reduceMotion) {
      marks.forEach(function (m) { m.classList.add("is-on"); });
      return;
    }
    nerReplay.disabled = true;
    marks.forEach(function (m, i) {
      timers.push(setTimeout(function () { m.classList.add("is-on"); }, 400 + i * 450));
    });
    timers.push(setTimeout(function () { nerReplay.disabled = false; }, 400 + marks.length * 450));
  }
  nerReplay.addEventListener("click", runExtraction);

  if ("IntersectionObserver" in window) {
    var nerObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        runExtraction();
        nerObserver.disconnect();
      }
    }, { threshold: 0.5 });
    nerObserver.observe(nerText);
  } else {
    runExtraction();
  }

  // ---------------------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------------------
  document.getElementById("year").textContent = new Date().getFullYear();
})();
