---
title: AI til commitmeldinger er supert
author: august
published: 2026-06-03
tags:
  - metodikk
description: Når en LLM vet alt om en endring, kan den også skrive gode commit-meldinger!
---

## Diff er ikke kontekst

Dersom all konteksten LLM-en din har er en `git diff`, kan du like gjerne skrive commit-meldingen selv.

Hvis jeg har lyst til at GPT 5.5 skal oppsummere en diff, kan jeg bare gjørra det sjøl, både nå, og i all fremtid. Diffen er jo der.

Ingen verdi er tilført. Hvis noe, er masse verdi mistet. All konteksten utvikleren eventuelt hadde i hodet når de ba LLM-en om å skrive en commit-melding, er forsvunnet. 

Denne konteksten er gull verdt! Jeg vet ikke _hvor_ mange ganger jeg har sett på en commit-melding og ønsket meg noen avsnitt, eller kanskje tilogmed et lite essay, om tankene bak endringen.

## Kontekst er kontekst

Når man derimot gjør kodingen med en agent, er man ikke så langt unna en full match mellom konteksten til LLM-en, og konteksten til utvikleren.

Særlig når vi bruker skills som "grill me":

```markdown
---
name: grill-me
description: Interview the user relentlessly about a plan or design 
  until reaching shared understanding, resolving each branch of the 
  decision tree. Use when user wants to stress-test a plan, get 
  grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we 
reach a shared understanding. Walk down each branch of the design 
tree, resolving dependencies between decisions one-by-one. For each 
question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore 
the codebase instead.
```

Dette blir nærmest en slags parprogrammeringsøvelse hvor LLM-en stiller mange titalls spørsmål (rekorden så langt er 83) og graver i tankene bak en endring, diverse tradeoffs, grensetilfeller, og annet snacks.

Denne konteksten LLM-en bygger opp er også gull verdt.

Og denne konteksten er LLM-en særdeles god til å lage gode commit-meldinger ut ifra!

## Førstelinjesupport

Jeg liker riktignok at den første linjen i commit-meldingen er skrevet av et menneske.

Den aller første linjen i commit-meldingen er kanskje den viktigste. Det er den du ser når du skumleser git-loggen, når du sjekker `git blame` i en fil, når du åpner repoet på github.com, osv osv.

Første linjen i committen er liksom sånn vi utviklerene snakker sammen. Her vil jeg at et menneskes intensjoner skal være dypt innbakt og innsydd i innholdet. Hva som står der og hvorfor har et veldig menneskelig aspekt ved seg.

## Prompt engineering

Etter første linje, liker jeg å skrive en punktliste med diverse kontekst rundt endringen.

Her er prompten jeg bruker i en LLM-agent for og få den til å lage en punktliste jeg putter etter første oppsummerende linje.

> Write a bullet point summary for future readers of a git commit. Include only information that explains how the system should behave, why the design is this way, or what future code changes must preserve. Every bullet should still be useful if the reader has no knowledge of this branch, review discussion, rollout sequence, or what was already deployed. Exclude anything that merely describes how the change was packaged, staged, verified, or coordinated. Do not mention diff-obvious facts.

Kvaliteten på punktlisten man får ut av denne prompten, korrelerer så godt som 1:1 med kvaliteten på konteksten LLM-en har bygget opp.

Denne punktlisten blir som regel full av viktige poenger som man ikke kan utlede fra selve kode-endringen i git.

I praksis kan det også være en god del jobb å formulere disse meldingene. Så vi sparer en del tid på og få LLM-en til å dumpe dem ut.

## Man vs. machine

Det er ikke det at menneske-skrevete meldinger i git-loggen er verdiløse, men når LLM-en vet så mye som den gjør, blir resultatet ofte både bedre og utført raskere enn at vi skal sitte og bruke masse tid og krefter på og forfatte commit-meldinger for hånden.

Men hvis det er noen trøst, for de som ikke er så glad i LLM-er, kan vi ihvertfall garantere at allt innholdet du leser her på fagbloggen vår er skrevet 100% for hånd! 

Noe må vi da gjøre sjøl.