---
title: Bare én branch
published: 2025-07-25
author: august
description: |
    Vi driver ikke med feature branching. I stedet for å integrere daglig eller ukentlig med pull requests, integrerer vi kontinuerlig.
---

## Én kodebase, kontinuerlig integrert

Kontinuerlig integrasjon = Continous integration = CI. Mange assosierer nok CI/CD med automatiserte bygg som ruller ut ny kode til produksjonsmiljøet. Det er en del av pakka, men CI er mere enn bare automatisering. CI er å integrere alle komponentene i systemet sitt, kontinuerlig.

Dersom du bruker pull requests, *integrerer* du en feature branch mot hoved-branchen når du merger pull requestet. Det kan dermed ikke kalles kontinuerlig integrering.

Og jo lengere en branch får leve, jo sjeldnere integrerer du, og jo flere "kopier" av kodebasen din må du forholde deg til.

Feature brancher deler ikke kode seg imellom. Hvis feature branch A har noe nyttig util-kode i seg som feature branch B trenger, må man smøre seg med tålmodighet - branchene er ikke integrert. I praksis sitter man igjen med `1 + antall brancher` versjoner av kodebasen.

Det samme gjelder om man bare unngår å pushe. Alle commits som ikke er pushet, er ikke integrert. Holder man på lenge nok, får man merge-konflikter. Det hjelper om utvikleren integrerer kontinuerlig *lokalt* mot main, med hyppig rebasing. Men alt snackset i den lokale branchen er usynlig for resten av teamet - det er ikke integrert.

## Uferdig kode i produksjon

Men hvordan jobber vi da med funksjonalitet som tar dagesvis eller ukesvis å få produksjonsklart?

Vi løser det med *feature flags*.

Rundt regnet alle kodebaser i produksjon har en eller annen form for konfigurasjon. Det er jo ingen naturlov som sier at det ikke er lov å ha uferdige ting i produksjonsmiljøet. Og da har du egentlig alt du trenger for å få til feature flags, som i praksis bare er et fænsi navn på muligheten til å skru ting av og på.

(Hvis du har en applikasjon i et produksjonsmiljø i 2025 uten at den er konfigurerbar på et eller annet vis, ta kontakt, så får du en eske konfekt av meg.)

## Hemmelige nyheter

Helt ny funksjonalitet er lett å skjule ved å rett og slett ikke gjøre den tilgjengelig med navigasjonen i systemet ditt. 

Lager du en webapp, kan du gjøre noe så enkelt som å ha et flagg i konfigurasjonen din som skjuler linker til den nye funksjonaliteten. I utviklingsmiljøet er linken synlig, men ikke i produksjonsmiljøet. Da har du ødelagt nøyaktig ingenting ved å produksjonssette den uferdige og usynlige delen av systemet ditt.

Du kan eventuelt selektivt vise navigasjon til ny funksonalitet. Konfigurasjonsfilene dine kan ha en liste med ID-er til de intern-brukerner som skal få tilgang til å teste ny funksonalitet, eller på annet vis lage et flagg på selve bruker-entiteten din. Vær kreativ!

## Gammel og ny versjon av koden, side om side

Hva om du trenger å gjøre drastiske endringer i funksonalitet som allerede er i produksjon?

Dette løser vi med varierende grad av - avhengig av størrelsen på endringene - at gammel og ny versjon av funksjonalitet lever side om side.

På sett og vis er dette ekstrem-versjonen av blue/green deployments. I dag er det vanlig at utrulling og produksjonssetting av ny kode starter opp en ny instans, peker produksjonsmiljøet på den nye instansen, og tar så ned den gamle når den nye har tatt over. Dette betyr at ny og gammel kode lever side om side i produksjon i noen sekunder eller minutter, mens byttet skjer.

Kostnaden med denne måten å jobbe på, er at man blir nødt til å gjøre ting stykkevis og delt. Det koster jo litt ekstra å vedlikeholde ny og gammel kode. Fordelen, er at du slipper en svær og skummel prodsetting hvor en hel haug med kode havner i produksjon for første gang, og som i praksis er helt utestet i produksjonsmiljøet.

## Gradvis utrulling av ny funksonalitet

En av de beste måtene å drifte stabile systemer på, er å rulle ut ny funksjonalitet til et lite segment av brukerne dine, følge med på feilratene, og fortsette utrullingen om alt ser ut til å gå bra. Du kan teste og verifisere så mye du vil utenfor produksjonsmiljøet ditt, men du [risikerer likevel å ikke ha tenkt på alt](https://x.com/TimSweeneyEpic/status/1190383627340783618).

I dag bruker vi ikke noe fancy verktøy eller tredjepartsbibliotek for å få dette til. Enn så lenge er det kun config-filer som styrer hva som er skrudd av og på, pluss noen enkle sjekker på at admin-brukere alltid skal få se enkelte features.

Men vi er rigget for det! Når ny og gammel kode kan leve side om side, og vi kan skru på ny kode med feature flagg, betyr det at vi kan skru *av* ny kode også, dersom det viste seg å ikke fungere så bra som vi håpet.

Lykke til å rulle tilbake med `git revert`. Det går an, men det er ikke spesielt hyggelig.

## Parprogrammering (synkront) vs. pull requests (asynkront)

I en liten startup går det unna. Vi sitter som regel på kontoret og jobber sammen. Whiteboardet brukes flittig. I denne flyten passer pull requests egentlig ganske dårlig.

Pull request gjør at du får feedback først når du er ferdig. Hvorfor jobbe i timesvis eller dagesvis, og så få feedback helt til slutt om at du har vært på villspor fra første øyeblikk?

Med parprogrammering får du feedback med en gang, før og mens du skriver koden.

Parprogrammering løser alle problemene pull requests prøver å løse, uten problemene som pull requests fører med seg. Så lenge alle har dusjet, og ikke plager andre og er grei og snill, kan du parprogrammere så mye som du vil!

## Best for små teams

Vi i SnowBee er et lite team, og måten vi jobber på er tilpasset det. Har du hundrevis av utviklere som jobber på samme kodebase, vil jeg tippe at disse rådene ikke fungerer *litt* engang.

## Se også

Denne bloggposten er nesten en slags oppsummering av Christian Johansen (Mattilsynet) sin presentasjon fra JavaZone 2024, [Slik leverer du kontinuerlig](https://2024.javazone.no/program/944da7b7-9c3f-414a-8368-e0d21be9aba3), som sier mye av det samme som oss. Chritsian demonstrerer hvordan man jobber på denne måten, med praktiske eksempler. Løp og se!