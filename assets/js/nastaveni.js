/* =========================================================
   NASTAVENÍ WEBU · vše, co se bude měnit, je tady.
   ========================================================= */
window.VIR = {
  kontakt: {
    jmeno: "Vladimír Novotný",
    telefon: "+420 777 669 200",          // K POTVRZENÍ se Soňou
    email: "ulicamarina@seznam.cz",
    adresa: "Marina IV 21, 23234 Vir, Chorvatsko"
  },

  /* Napojení na Google Kalendář (Apps Script web app).
     Dokud je prázdné, web ukazuje ukázkovou obsazenost.
     Očekávaný formát odpovědi (JSON):
     { "1": [["2027-07-03","2027-07-17"]], "2": [...], "3": [...] }
     Datum "od" = den příjezdu, "do" = den odjezdu (obojí sobota). */
  kalendarUrl: "https://script.google.com/macros/s/AKfycbzV2wZeN2gw8gAXLJjWYGkP4KzOYxuB3aGHFnkGmVn4mHjlIn9dwhsBLk_az_1Un0yo/exec",

  /* Kam se odesílá poptávka (Apps Script web app).
     Dokud je prázdné, otevře se návštěvníkovi předvyplněný e-mail. */
  poptavkaUrl: "https://script.google.com/macros/s/AKfycbzV2wZeN2gw8gAXLJjWYGkP4KzOYxuB3aGHFnkGmVn4mHjlIn9dwhsBLk_az_1Un0yo/exec",

  /* Google Analytics 4: ID měření (G-XXXXXXXXXX).
     Načte se jen po souhlasu návštěvníka na liště cookies. Prázdné = vypnuto. */
  ga4Id: "",

  /* Kalendář a poptávka: od aktuálního měsíce do konce roku uvedeného níže.
     Prázdné "do" = automaticky do konce příštího roku. */
  rozsah: { do: "" },

  /* Rok léta, jehož týdny ukazují karty apartmánů na úvodní stránce */
  letniSezona: 2027,

  /* Ceny za týden (sobota až sobota), Kč. null = na dotaz */
  ceny: {
    1: { cervenZari: 18500, cervenecSrpen: 23700 },
    2: { cervenZari: 18500, cervenecSrpen: 23700 },
    3: { cervenZari: 25000, cervenecSrpen: 30000 }
  },

  apartmany: {
    1: { nazev: "Apartmán 1", osob: 4, url: "apartman-1" },
    2: { nazev: "Apartmán 2", osob: 4, url: "apartman-2" },
    3: { nazev: "Apartmán 3", osob: 6, url: "apartman-3" }
  },

  /* UKÁZKOVÁ OBSAZENOST · jen pro náhled vzhledu, po napojení kalendáře se nepoužije */
  ukazkoveRezervace: {
    1: [["2027-07-03", "2027-07-17"], ["2027-08-07", "2027-08-21"]],
    2: [["2027-07-10", "2027-07-24"], ["2027-08-14", "2027-08-28"]],
    3: [["2027-06-26", "2027-07-10"], ["2027-07-31", "2027-08-14"]]
  }
};
