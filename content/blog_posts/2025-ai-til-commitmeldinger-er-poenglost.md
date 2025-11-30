---
title: AI til commitmeldinger er poengløst
author: august
published: 2025-11-30
tags:
  - metodikk
description: Vi bruker AI så det ljomer i veggene. Men akkurat når det kommer til commit-meldinger, er jeg en ekte luditt.
---

## Et eksempel på en håndskrevet og ubrukelig commit-melding

Mens jeg søkte rundt i kodebasen vår for å finne kilden til noe uønsket oppførsel, kom jeg over følgende commit-melding:

> Fix issue where undefined and false was treated as different in dirty checking

Aha! Det var jo akkurat problemet jeg forsøkte å finne opphavet til.

Kode-endringen fra skjermbildet under er en sjekk på at dersom vi går fra `undefined` til `false`, eller `false` til `undefined`, anser vi ikke det som et "dirty" felt i logikken som sjekker om vi har noen endringer som ikke er lagret til serveren enda.


![Skjermbilde av GitHub og en commit hvor commit-meldinga i teksten over er med, og en diff som er lik den beskrevet ovenfor.](/images/2025-ai-til-commitmeldinger-er-poenglost/github_commit.png)

Men.... hvorfor?

Denne. commit-meldinga beskriver jo bare koden. Jeg kan selv se i diffen at vi gjør akkurat som beskrevet. Men når jeg nå har en bug som følge av denne oppførselen, skulle jeg veldig ønske at jeg var litt fremtidsrettet og at commit-meldinga mi beskrev tanken bak denne kode-endringen.

## Alt en AI kan gjøre er å beskrive en diff

Og dette er grunnen til at AI er et ubrukelig verktøy når det kommer til å skrive commit-meldinger.

En commit-melding kan og bør si noe om den mentale modellen og tilstanden i hodet til utvikleren som var opphavet til at endringen ble committet inn i utgangspunktet. Det er da commit-meldinger blir virkelig nyttige - de gir utvidet kontekst til selve kode-endringen, og forklarer noe man ikke kan lese ut fra selve koden.

Å bruke AI til å oppsummere en diff,  kan jeg gjøre selv når jeg har lyst til det.


NB: jeg liker å bruke tankestrek når jeg skriver. Null AI ble brukt til å skrive dette innlegget.

NBB: dette ble en kort bloggpost. Men vi skal da sørenmeg klare å få ut ihvertfall en bloggpost i måneden!