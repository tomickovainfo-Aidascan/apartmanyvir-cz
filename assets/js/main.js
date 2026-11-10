/* =========================================================
   Apartmány Vir · chování webu
   ========================================================= */
(function () {
  "use strict";
  var V = window.VIR || {};
  var malePohyby = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var usek = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };

  /* ---------- Data a pomocné funkce pro termíny ---------- */
  function d(s) { var x = s.split("-"); return new Date(+x[0], +x[1] - 1, +x[2]); }
  function iso(dt) { return dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2); }
  function plusDny(dt, n) { var x = new Date(dt); x.setDate(x.getDate() + n); return x; }
  function kratce(dt) { return dt.getDate() + ". " + (dt.getMonth() + 1) + "."; }
  function dlouze(dt) { return dt.getDate() + ". " + (dt.getMonth() + 1) + ". " + dt.getFullYear(); }
  function kc(n) { return n.toLocaleString("cs-CZ").replace(/\s/g, " ") + " Kč"; }
  function soboty(od, doo) {
    var x = d(od), konec = d(doo), out = [];
    while (x.getDay() !== 6) x = plusDny(x, 1);
    while (x <= konec) { out.push(new Date(x)); x = plusDny(x, 7); }
    return out;
  }
  function cenaTydne(apt, sobota) {
    var m = sobota.getMonth() + 1, c = (V.ceny || {})[apt];
    if (!c) return null;
    if (m === 7 || m === 8) return c.cervenecSrpen;
    if (m === 6 || m === 9) return c.cervenZari;
    return null; // květen, říjen: na dotaz
  }

  var rezervace = null;
  function nactiRezervace() {
    if (rezervace) return Promise.resolve(rezervace);
    if (!V.kalendarUrl) {
      rezervace = V.ukazkoveRezervace || {};
      document.documentElement.classList.add("je-ukazka");
      return Promise.resolve(rezervace);
    }
    return fetch(V.kalendarUrl).then(function (r) { return r.json(); })
      .then(function (j) { rezervace = j; return j; })
      .catch(function () { rezervace = {}; return rezervace; });
  }
  function obsazenaNoc(apt, den) { // noc ze dne "den" na další den
    var r = (rezervace && rezervace[apt]) || [];
    for (var i = 0; i < r.length; i++) {
      if (den >= d(r[i][0]) && den < d(r[i][1])) return true;
    }
    return false;
  }
  function tydenObsazeny(apt, sobota) {
    for (var i = 0; i < 7; i++) if (obsazenaNoc(apt, plusDny(sobota, i))) return true;
    return false;
  }

  /* ---------- Hlavička a menu ---------- */
  var hlavicka = $(".hlavicka");
  var prohlidka = $(".prohlidka");
  var aptHero = $(".apt-hero");
  var burger = $(".burger"), menu = $(".menu");
  function stavHlavicky() {
    if (!hlavicka || hlavicka.classList.contains("je-svetla")) return;
    var hranice = 60;
    if (prohlidka) hranice = prohlidka.offsetTop + prohlidka.offsetHeight - 80;
    else if (aptHero) hranice = aptHero.offsetHeight - 80;
    var za = window.scrollY > hranice;
    hlavicka.classList.toggle("je-plna", za || (menu && menu.classList.contains("je-otevrene")));
    document.body.classList.toggle("po-prohlidce", za);
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var o = menu.classList.toggle("je-otevrene");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
      if (o) hlavicka.classList.add("je-plna"); else stavHlavicky();
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("je-otevrene"); burger.setAttribute("aria-expanded", "false"); }); });
  }

  /* ---------- PROHLÍDKA řízená scrollem ---------- */
  var tour = null;
  if (prohlidka && !malePohyby) {
    tour = {
      snimky: $$(".prohlidka__snimek", prohlidka),
      kapitoly: $$(".kapitola", prohlidka),
      postup: $$(".prohlidka__postup li", prohlidka),
      zablesk: $(".prohlidka__zablesk", prohlidka),
      lista: $(".prohlidka__lista", prohlidka),
      napoveda: $(".scroll-napoveda", prohlidka),
      zavoj: $(".prohlidka__zavoj", prohlidka),
      cil: 0, ted: 0
    };
    // časové úseky kapitol [začátek, konec] v rámci celé prohlídky 0-1
    tour.useky = [[-1, 0.10], [0.17, 0.30], [0.44, 0.58], [0.72, 0.84], [0.89, 2]];
    tour.znacky = [0, 0.16, 0.40, 0.66, 0.87];
  }
  function vykresliProhlidku(p) {
    var s = tour.snimky;
    // 1) Večerní dvůr: přiblížení ke dveřím přízemí
    var a = ease(usek(p, 0, 0.40));
    var o0 = 1 - usek(p, 0.33, 0.41);
    s[0].style.transform = "scale(" + (1 + a * 1.6).toFixed(4) + ")";
    s[0].style.opacity = o0.toFixed(3);
    s[0].style.filter = "blur(" + (usek(p, 0.30, 0.41) * 6).toFixed(2) + "px)";
    // záblesk světla při vstupu dovnitř
    var z = usek(p, 0.31, 0.37) - usek(p, 0.37, 0.45);
    tour.zablesk.style.opacity = (Math.max(0, z) * 0.55).toFixed(3);
    // 2) Obývací pokoj apartmánu 3: z chodby do místnosti
    var b = ease(usek(p, 0.34, 0.60));
    var o1 = usek(p, 0.34, 0.41) * (1 - usek(p, 0.64, 0.71));
    var sc1 = 1.55 - b * 0.55 + usek(p, 0.62, 0.71) * 0.12;
    s[1].style.transform = "scale(" + sc1.toFixed(4) + ") translateX(" + ((1 - b) * -3).toFixed(2) + "%)";
    s[1].style.opacity = o1.toFixed(3);
    s[1].style.filter = "blur(" + ((1 - usek(p, 0.36, 0.44)) * 5 + usek(p, 0.65, 0.71) * 4).toFixed(2) + "px)";
    // 3) Jídelna a dveře na terasu
    var c = usek(p, 0.64, 0.80), e = ease(usek(p, 0.80, 1));
    var o2 = usek(p, 0.64, 0.71);
    s[2].style.transform = "scale(" + (1.18 - ease(c) * 0.18 + e * 0.32).toFixed(4) + ")";
    s[2].style.opacity = o2.toFixed(3);
    s[2].style.filter = "blur(" + ((1 - usek(p, 0.66, 0.73)) * 5).toFixed(2) + "px)";
    // texty
    tour.kapitoly.forEach(function (k, i) {
      var u = tour.useky[i];
      var op = usek(p, u[0] - 0.04, u[0]) * (1 - usek(p, u[1], u[1] + 0.04));
      if (i === 0) op = 1 - usek(p, u[1], u[1] + 0.06);
      k.style.opacity = op.toFixed(3);
      var posun = (1 - op) * 30;
      k.style.transform = (k.classList.contains("kapitola--hero") ? "translateY(calc(-50% + " : "translateY(calc(0% + ") + posun.toFixed(1) + "px))";
      k.classList.toggle("je-videt", op > 0.5);
    });
    // ukazatel postupu
    var akt = 0;
    tour.znacky.forEach(function (m, i) { if (p >= m) akt = i; });
    tour.postup.forEach(function (li, i) { li.classList.toggle("aktivni", i === akt); });
    tour.lista.style.width = (p * 100).toFixed(2) + "%";
    tour.zavoj.style.setProperty("--tma", (0.6 * (1 - usek(p, 0.08, 0.18))).toFixed(3));
    tour.napoveda.style.opacity = (1 - usek(p, 0.01, 0.05)).toFixed(3);
  }
  function cilProhlidky() {
    var r = prohlidka.getBoundingClientRect();
    var delka = prohlidka.offsetHeight - window.innerHeight;
    tour.cil = clamp(-r.top / delka, 0, 1);
  }

  /* ---------- Paralaxa ---------- */
  var paralaxy = malePohyby ? [] : $$("[data-parallax]");
  function vykresliParalaxy() {
    var vh = window.innerHeight;
    paralaxy.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var k = parseFloat(el.getAttribute("data-parallax")) || 0.12;
      var stred = r.top + r.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (-stred * k).toFixed(1) + "px,0)" + (el.tagName === "IMG" ? " scale(1.12)" : "");
    });
  }

  /* ---------- Prezentace řízená scrollem (cesta k moři) ---------- */
  var prez = malePohyby ? null : $("[data-prezentace]");
  var prezSnimky = prez ? $$(".prezentace img", prez) : [];
  var prezPopis = prez ? $(".prezentace figcaption", prez) : null;
  var prezTecky = prez ? $$(".prezentace__tecky i", prez) : [];
  var prezAkt = -1;
  function vykresliPrezentaci() {
    if (!prez || !prezSnimky.length) return;
    var vh = window.innerHeight, r = prez.getBoundingClientRect(), p;
    if (r.height > vh * 1.5) p = clamp(-r.top / (r.height - vh), 0, 1);
    else { var f = $(".prezentace", prez).getBoundingClientRect(); p = clamp((vh - f.top) / (vh + f.height), 0, 1); }
    var n = prezSnimky.length, poz = p * (n - 1), akt = Math.min(n - 1, Math.floor(poz + 0.2));
    prezSnimky.forEach(function (img, i) {
      // každý další snímek leží nad předchozím a najede v posledních 40 % jeho úseku
      var op = i === 0 ? 1 : clamp((poz - (i - 1) - 0.6) / 0.4, 0, 1);
      var lokal = clamp((poz - i + 1) / 2, 0, 1);  // 0 při příchodu, 1 při odchodu
      img.style.opacity = op.toFixed(3);
      img.style.transform = "scale(" + (1.02 + lokal * 0.16).toFixed(4) + ")";
    });
    if (akt !== prezAkt) {
      prezAkt = akt;
      if (prezPopis) prezPopis.textContent = prezSnimky[akt].getAttribute("data-popisek");
      prezTecky.forEach(function (t, i) { t.classList.toggle("aktivni", i === akt); });
    }
  }

  /* ---------- Hlavní smyčka ---------- */
  var bezi = false;
  function snimek() {
    bezi = false;
    if (tour) {
      tour.ted += (tour.cil - tour.ted) * 0.14;
      if (Math.abs(tour.cil - tour.ted) < 0.0005) tour.ted = tour.cil;
      vykresliProhlidku(tour.ted);
      if (tour.ted !== tour.cil) pozadej();
    }
    vykresliParalaxy();
    vykresliPrezentaci();
  }
  function pozadej() { if (!bezi) { bezi = true; requestAnimationFrame(snimek); } }
  function priScrollu() { if (tour) cilProhlidky(); stavHlavicky(); pozadej(); }
  window.addEventListener("scroll", priScrollu, { passive: true });
  window.addEventListener("resize", priScrollu);
  if (tour) { cilProhlidky(); tour.ted = tour.cil; vykresliProhlidku(tour.ted); }
  stavHlavicky(); pozadej();

  /* ---------- Objevování a mizení obsahu ---------- */
  var reveal = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !malePohyby) {
    var io = new IntersectionObserver(function (zaznamy) {
      zaznamy.forEach(function (z) { z.target.classList.toggle("is-in", z.isIntersecting); });
    }, { rootMargin: "-8% 0px -8% 0px", threshold: 0.12 });
    reveal.forEach(function (el) { io.observe(el); });

    // Ostrov Vir: střídání obrázků podle aktivního kroku
    var kroky = $$(".krok"), obrazy = $$(".ostrov__obrazy img");
    if (kroky.length) {
      var io2 = new IntersectionObserver(function (zaznamy) {
        zaznamy.forEach(function (z) {
          if (!z.isIntersecting) return;
          var i = kroky.indexOf(z.target);
          kroky.forEach(function (k, j) { k.classList.toggle("aktivni", j === i); });
          obrazy.forEach(function (o, j) { o.classList.toggle("aktivni", j === i); });
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      kroky.forEach(function (k) { io2.observe(k); });
    }
  } else {
    reveal.forEach(function (el) { el.classList.add("is-in"); });
    $$(".krok").forEach(function (k) { k.classList.add("aktivni"); });
    var o1 = $(".ostrov__obrazy img"); if (o1) o1.classList.add("aktivni");
  }

  /* ---------- Týdny na kartách apartmánů ---------- */
  var radky = $$("[data-tydny]");
  if (radky.length) {
    nactiRezervace().then(function () {
      radky.forEach(function (radek) {
        var apt = radek.getAttribute("data-tydny");
        var rok = V.sezona.od.slice(0, 4);
        var dnesIso = iso(new Date());
        var start = dnesIso > rok + "-06-01" ? dnesIso : rok + "-06-01";
        var tydny = soboty(start, rok + "-09-24");
        radek.innerHTML = "";
        tydny.forEach(function (s) {
          var obs = tydenObsazeny(apt, s);
          var b = document.createElement(obs ? "span" : "a");
          b.className = "tyden " + (obs ? "tyden--obsazeno" : "tyden--volno");
          b.textContent = kratce(s);
          var cena = cenaTydne(apt, s);
          b.title = dlouze(s) + " až " + dlouze(plusDny(s, 7)) + (obs ? " · obsazeno" : " · volno" + (cena ? " · " + kc(cena) : ""));
          if (!obs) b.href = "index.html?apt=" + apt + "&od=" + iso(s) + "#poptavka";
          radek.appendChild(b);
        });
      });
    });
  }

  /* ---------- Poptávkový formulář ---------- */
  var form = $("#poptavka-form");
  if (form) {
    var selPrijezd = $("#f-prijezd", form), selApt = $("#f-apt", form), selTydny = $("#f-tydny", form);
    soboty(V.sezona.od, V.sezona.do).forEach(function (s) {
      var o = document.createElement("option");
      o.value = iso(s);
      o.textContent = "sobota " + dlouze(s);
      selPrijezd.appendChild(o);
    });
    var odjezdInfo = $("#f-odjezd-info", form);
    function prepocti() {
      if (!selPrijezd.value) { odjezdInfo.textContent = "Odjezd vždy v sobotu."; return; }
      var t = +selTydny.value || 1, s = d(selPrijezd.value), konec = plusDny(s, 7 * t);
      var apt = selApt.value, suma = 0, naDotaz = false;
      for (var i = 0; i < t; i++) { var c = cenaTydne(apt, plusDny(s, 7 * i)); if (c) suma += c; else naDotaz = true; }
      var txt = "Odjezd v sobotu " + dlouze(konec) + ".";
      if (apt && suma && !naDotaz) txt += " Orientační cena: " + kc(suma) + ".";
      else if (apt && naDotaz) txt += " Cena v tomto termínu na dotaz.";
      odjezdInfo.textContent = txt;
    }
    [selPrijezd, selApt, selTydny].forEach(function (el) { el.addEventListener("change", prepocti); });
    // předvyplnění z odkazu (?apt=1&od=2027-06-05)
    var q = new URLSearchParams(window.location.search);
    if (q.get("apt")) selApt.value = q.get("apt");
    if (q.get("od")) selPrijezd.value = q.get("od");
    prepocti();

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var hl = $(".formular__hlaska", form);
      hl.className = "formular__hlaska";
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data.web) return; // pole proti robotům
      data.odjezd = iso(plusDny(d(data.prijezd), 7 * (+data.tydny || 1)));
      var aptNazev = data.apartman ? V.apartmany[data.apartman].nazev : "Je mi to jedno, poraďte";
      if (V.poptavkaUrl) {
        fetch(V.poptavkaUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) })
          .then(function () {
            hl.classList.add("ok");
            hl.textContent = "Děkujeme, poptávka odešla. Ozveme se vám e-mailem nebo telefonem. Termín platí až po našem potvrzení.";
            form.reset(); prepocti();
          })
          .catch(function () {
            hl.classList.add("chyba");
            hl.textContent = "Poptávku se nepodařilo odeslat. Napište nám prosím na " + V.kontakt.email + ".";
          });
      } else {
        var radky = [
          "Nezávazná poptávka z webu apartmanyvir.cz", "",
          "Apartmán: " + aptNazev,
          "Příjezd: " + dlouze(d(data.prijezd)) + " (sobota)",
          "Odjezd: " + dlouze(d(data.odjezd)) + " (sobota)",
          "Dospělí: " + data.dospeli + ", děti: " + (data.deti || 0) + (data.vek_deti ? " (věk: " + data.vek_deti + ")" : ""),
          "Domácí mazlíček: " + (data.mazlicek ? "ano" : "ne"),
          "Odvoz z letiště: " + (data.odvoz ? "ano" : "ne"),
          "Předpokládaný čas příjezdu: " + (data.cas_prijezdu || "-"), "",
          "Jméno: " + data.jmeno, "E-mail: " + data.email, "Telefon: " + (data.telefon || "-"), "",
          data.zprava || ""
        ];
        window.location.href = "mailto:" + V.kontakt.email + "?subject=" + encodeURIComponent("Poptávka " + aptNazev + " od " + dlouze(d(data.prijezd))) + "&body=" + encodeURIComponent(radky.join("\n"));
        hl.classList.add("ok");
        hl.textContent = "Otevřeli jsme vám předvyplněný e-mail. Stačí ho odeslat.";
      }
    });
  }

  /* ---------- Cookies a mapa ---------- */
  var KLIC = "vir-souhlas";
  function ulozeno() { try { return localStorage.getItem(KLIC); } catch (e) { return null; } }
  function uloz(v) { try { localStorage.setItem(KLIC, v); } catch (e) {} }
  var lista = $(".cookies");
  function nactiMapu() {
    var r = $(".mapa__ramec");
    if (!r || $("iframe", r)) return;
    var f = document.createElement("iframe");
    f.title = "Mapa: Marina IV 21, Vir";
    f.loading = "lazy";
    f.src = "https://www.openstreetmap.org/export/embed.html?bbox=15.0765%2C44.3050%2C15.0945%2C44.3135&layer=mapnik&marker=44.30928%2C15.085458";
    r.appendChild(f);
    var n = $(".mapa__nacist", r); if (n) n.remove();
  }
  function spustAnalytiku() {
    var id = V.ga4Id;
    if (!id || window.__gaNacteno) return;
    window["ga-disable-" + id] = false;
    window.__gaNacteno = true;
    var sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(sc);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  function vypniAnalytiku() {
    if (!V.ga4Id) return;
    window["ga-disable-" + V.ga4Id] = true;
    var domena = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n.indexOf("_ga") === 0) {
        ["", "; domain=" + domena, "; domain=." + domena].forEach(function (d) {
          document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }
  if (lista && !ulozeno()) lista.classList.add("je-videt");
  if (ulozeno() === "ano") { nactiMapu(); spustAnalytiku(); }
  $$("[data-souhlas]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-souhlas");
      uloz(v); if (lista) lista.classList.remove("je-videt");
      if (v === "ano") { nactiMapu(); spustAnalytiku(); } else vypniAnalytiku();
    });
  });
  $$("[data-nacist-mapu]").forEach(function (b) { b.addEventListener("click", nactiMapu); });
  $$("[data-cookies-nastaveni]").forEach(function (b) { b.addEventListener("click", function () { if (lista) lista.classList.add("je-videt"); }); });

  /* ---------- Galerie (lightbox) ---------- */
  var odkazy = $$(".galerie a");
  if (odkazy.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = '<img alt=""><p></p><button class="lb-zavrit" aria-label="Zavřít">×</button><button class="lb-pred" aria-label="Předchozí">‹</button><button class="lb-dal" aria-label="Další">›</button>';
    document.body.appendChild(lb);
    var idx = 0, img = $("img", lb), pop = $("p", lb);
    function ukaz(i) {
      idx = (i + odkazy.length) % odkazy.length;
      var a = odkazy[idx], m = $("img", a);
      img.src = a.href; img.alt = m.alt; pop.textContent = m.alt;
      lb.classList.add("je-videt");
    }
    odkazy.forEach(function (a, i) { a.addEventListener("click", function (ev) { ev.preventDefault(); ukaz(i); }); });
    $(".lb-zavrit", lb).addEventListener("click", function () { lb.classList.remove("je-videt"); });
    $(".lb-pred", lb).addEventListener("click", function () { ukaz(idx - 1); });
    $(".lb-dal", lb).addEventListener("click", function () { ukaz(idx + 1); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) lb.classList.remove("je-videt"); });
    document.addEventListener("keydown", function (ev) {
      if (!lb.classList.contains("je-videt")) return;
      if (ev.key === "Escape") lb.classList.remove("je-videt");
      if (ev.key === "ArrowLeft") ukaz(idx - 1);
      if (ev.key === "ArrowRight") ukaz(idx + 1);
    });
  }

  /* ---------- Kalendář apartmánu (půlené soboty) ---------- */
  var kal = $("[data-kalendar]");
  if (kal) {
    var apt = kal.getAttribute("data-kalendar");
    var mesice = [];
    var x = d(V.sezona.od); x.setDate(1);
    while (x <= d(V.sezona.do)) { mesice.push(new Date(x)); x.setMonth(x.getMonth() + 1); }
    var posun = 0, naraz = window.innerWidth < 900 ? 1 : 2;
    var obal = $(".kalendare", kal), pred = $("[data-kal-pred]", kal), dal = $("[data-kal-dal]", kal), titul = $("[data-kal-titul]", kal);
    // začít měsícem s první cenou (červen), aby návštěvník hned viděl hlavní sezónu
    for (var mi = 0; mi < mesice.length; mi++) if (mesice[mi].getMonth() === 5) { posun = mi; break; }
    var DNY = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
    var dnes = new Date(); dnes.setHours(0, 0, 0, 0);
    var sezOd = d(V.sezona.od), sezDo = d(V.sezona.do);
    function mesic(m) {
      var el = document.createElement("div"); el.className = "mesic";
      var nazev = m.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
      el.innerHTML = "<h3>" + nazev + "</h3>";
      var g = document.createElement("div"); g.className = "mesic__mriz";
      DNY.forEach(function (n) { g.insertAdjacentHTML("beforeend", '<div class="dn">' + n + "</div>"); });
      var prvni = (m.getDay() + 6) % 7;
      for (var i = 0; i < prvni; i++) g.insertAdjacentHTML("beforeend", '<div class="den den--prazdny"></div>');
      var dni = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      for (var den = 1; den <= dni; den++) {
        var dt = new Date(m.getFullYear(), m.getMonth(), den);
        var tato = obsazenaNoc(apt, dt), predchozi = obsazenaNoc(apt, plusDny(dt, -1));
        var t = "volno", popis = "volno";
        if (dt < sezOd || dt > sezDo) { t = "mimo"; popis = "mimo sezónu"; }
        else if (tato && predchozi) {
          // výměna hostů ve stejný den = odjezd + příjezd
          var r = rezervace[apt] || [], vymena = r.some(function (x) { return x[0] === iso(dt); });
          t = vymena ? "vymena" : "obsazeno"; popis = vymena ? "výměna hostů, obsazeno" : "obsazeno";
        }
        else if (tato) { t = "prijezd"; popis = "dopoledne volno, od odpoledne obsazeno (příjezd)"; }
        else if (predchozi) { t = "odjezd"; popis = "do dopoledne obsazeno (odjezd), pak volno"; }
        var cl = "den den--" + t + (dt < dnes ? " den--minulost" : "");
        g.insertAdjacentHTML("beforeend", '<div class="' + cl + '" title="' + dlouze(dt) + ": " + popis + '"><span>' + den + "</span></div>");
      }
      el.appendChild(g);
      return el;
    }
    function vykresli() {
      obal.innerHTML = "";
      for (var i = 0; i < naraz && posun + i < mesice.length; i++) obal.appendChild(mesic(mesice[posun + i]));
      pred.disabled = posun <= 0;
      dal.disabled = posun + naraz >= mesice.length;
      if (titul) titul.textContent = "Sezóna " + mesice[0].getFullYear();
    }
    pred.addEventListener("click", function () { posun = Math.max(0, posun - 1); vykresli(); });
    dal.addEventListener("click", function () { posun = Math.min(mesice.length - naraz, posun + 1); vykresli(); });
    nactiRezervace().then(vykresli);
  }

  /* ---------- Kontaktní údaje z nastavení ---------- */
  $$("[data-tel]").forEach(function (a) { a.textContent = V.kontakt.telefon; a.href = "tel:" + V.kontakt.telefon.replace(/\s/g, ""); });
  $$("[data-mail]").forEach(function (a) { a.textContent = V.kontakt.email; a.href = "mailto:" + V.kontakt.email; });

  /* ---------- Ukázkový štítek ---------- */
  nactiRezervace().then(function () {
    if (!V.kalendarUrl) $$("[data-ukazka]").forEach(function (el) { el.hidden = false; });
  });
})();
