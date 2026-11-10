# Web Apartmány Vir (apartmanyvir.cz)

Statický web pro GitHub Pages. Žádná instalace, stačí otevřít `index.html` v prohlížeči.

## Co kde je
- `index.html` hlavní stránka: prohlídka domu řízená scrollováním (od brány až do apartmánu 3), karty apartmánů, vybavení zdarma, pláž, ostrov Vir, ceník, příjezd, recenze, otázky, poptávka, mapa
- `apartman-1.html`, `apartman-2.html`, `apartman-3.html` stránky apartmánů (galerie, vybavení, kalendář s půlenými sobotami)
- `ochrana-udaju.html` ochrana osobních údajů a cookies (návrh, nechat zkontrolovat)
- `assets/js/nastaveni.js` **vše, co se mění**: telefon, e-mail, ceny, sezóna, adresa napojení na Google Kalendář a na odesílání poptávky
- `assets/js/main.js` chování webu (prohlídka, animace, kalendář, formulář, cookies)
- `assets/css/style.css` vzhled
- `img/` fotky (velké `.jpg` a zmenšené `-m.jpg`)
- `robots.txt`, `sitemap.xml`, `llms.txt` pro vyhledávače a AI vyhledávání
- `CNAME` doména pro GitHub Pages

## Napojení kalendáře a poptávky
V `nastaveni.js` vyplnit `kalendarUrl` a `poptavkaUrl` (Google Apps Script web app).
Dokud jsou prázdné, web ukazuje ukázkovou obsazenost (se štítkem „ukázka“) a poptávka otevře předvyplněný e-mail.

Formát dat z kalendáře:
```json
{ "1": [["2027-07-03","2027-07-17"]], "2": [], "3": [] }
```
Datum „od“ je den příjezdu, „do“ den odjezdu.
