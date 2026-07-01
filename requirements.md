# Requirements: Lokale Bildvergleichs- und Voting-Webapplikation

## Ziel

Es soll eine kleine Webapplikation entwickelt werden, die lokal auf dem Rechner gestartet wird.

Die Anwendung dient dazu, Bilder aus einem lokalen Ordner zu laden, anhand ihres Dateinamens zu gruppieren und pro Bildgruppe eine Bewertung durchzuführen.

Der Hauptanwendungsfall ist ein möglichst neutraler visueller Vergleich mehrerer Bildvarianten. Der Nutzer sieht jeweils alle Bilder mit derselben ID gleichzeitig und stimmt ab, welches Bild ihm am besten gefällt.

Am Ende zeigt die Anwendung eine Ergebnisübersicht, wie oft jede Kategorie gewonnen hat.

## Grundprinzip

Die Bilder in einem ausgewählten Ordner folgen diesem Namensschema:

```text
[Kategorie]_[ID].[Dateiendung]
```

Beispiele:

```text
KreaNoLora_1.png
KreaLoraA_1.png
KreaLoraB_1.png
KreaNoLora_2.png
KreaLoraA_2.png
KreaLoraB_2.png
```

Dabei gilt:

- `Kategorie` beschreibt die Variante oder Quelle des Bildes
- `ID` beschreibt die zusammengehörige Bildgruppe
- alle Bilder mit derselben `ID` gehören zusammen
- die Dateiendung kann z. B. `.png`, `.jpg`, `.jpeg` oder `.webp` sein

## Lokaler Betrieb

Die Anwendung muss nur lokal funktionieren.

Eine Veröffentlichung im Internet ist nicht vorgesehen.

Die Anwendung kann zum Beispiel bestehen aus:

- einem lokalen Backend
- einem lokalen Frontend
- einer einfachen Weboberfläche im Browser

Die Anwendung soll lokal gestartet werden können und dann im Browser nutzbar sein.

## Ordnerauswahl

Der Nutzer kann in der Weboberfläche einen lokalen Ordner auswählen oder einen lokalen Ordnerpfad angeben.

Nach Auswahl des Ordners durchsucht die Anwendung diesen Ordner nach Bilddateien.

Es müssen nur Bilder direkt in diesem Ordner berücksichtigt werden. Unterordner müssen zunächst nicht durchsucht werden.

## Unterstützte Bildformate

Die Anwendung soll mindestens folgende Bildformate erkennen:

- PNG
- JPG
- JPEG
- WEBP

Groß- und Kleinschreibung der Dateiendung soll ignoriert werden.

Beispiele:

```text
bild.png
bild.PNG
bild.jpg
bild.JPG
```

## Dateinamen-Parsing

Die Anwendung liest aus jedem gültigen Bilddateinamen die Kategorie und die ID aus.

Das erwartete Format ist:

```text
Kategorie_ID
```

Beispiele:

```text
KreaNoLora_1.png
KreaLoraA_1.png
KreaLoraB_1.png
```

Daraus ergeben sich:

```text
Kategorie: KreaNoLora
ID: 1
```

```text
Kategorie: KreaLoraA
ID: 1
```

```text
Kategorie: KreaLoraB
ID: 1
```

Bilder mit derselben ID werden zu einer Gruppe zusammengefasst.

## Umgang mit Unterstrichen im Dateinamen

Die ID soll aus dem Teil nach dem letzten Unterstrich gelesen werden.

Dadurch sind auch Kategorien mit Unterstrichen möglich.

Beispiel:

```text
Krea_Lora_A_15.png
```

ergibt:

```text
Kategorie: Krea_Lora_A
ID: 15
```

## Anzeige der Bildgruppen

Nach dem Laden des Ordners zeigt die Anwendung immer eine Bildgruppe auf einmal an.

Eine Bildgruppe besteht aus allen Bildern, die dieselbe ID besitzen.

Beispiel für ID `1`:

```text
KreaNoLora_1.png
KreaLoraA_1.png
KreaLoraB_1.png
```

Diese Bilder werden gleichzeitig angezeigt.

## Zufällige Bildreihenfolge

Die Bilder innerhalb einer Gruppe müssen in zufälliger Reihenfolge angezeigt werden.

Dadurch soll verhindert werden, dass der Nutzer durch die Position der Bilder erkennt, welche Kategorie gerade wo steht.

Wichtig:

- Die sichtbare Reihenfolge der Bilder wird pro Gruppe zufällig gemischt.
- Die Kategorie darf während des Votings nicht sichtbar sein.
- Intern muss trotzdem gespeichert bleiben, welches Bild zu welcher Kategorie gehört.
- Die Abstimmung muss immer korrekt der Kategorie des gewählten Bildes zugeordnet werden.

Die zufällige Reihenfolge soll beim Start einer Voting-Session einmalig festgelegt werden.

Falls später ein Zurückspringen zu bereits bewerteten Gruppen unterstützt wird, soll die Reihenfolge für diese Session gleich bleiben.

## Blind-Voting

Der Nutzer stimmt pro Bildgruppe ab, welches Bild ihm am besten gefällt.

Für jedes angezeigte Bild gibt es eine eindeutige Abstimm-Möglichkeit.

Mögliche Interaktionen:

- Klick auf das Bild
- Button unter dem Bild: `Dieses Bild wählen`
- Tastaturkürzel wie `1`, `2`, `3`

Nach der Abstimmung:

1. Die Stimme wird für die Kategorie des gewählten Bildes gespeichert.
2. Die Anwendung springt automatisch zur nächsten Bildgruppe.
3. Der Nutzer muss keinen zusätzlichen Weiter-Button drücken.

## Verdeckte Kategorien während des Votings

Während des Votings sollen die Kategorien der Bilder nicht angezeigt werden.

Nicht anzeigen:

```text
KreaNoLora
KreaLoraA
KreaLoraB
```

Stattdessen können neutrale Labels angezeigt werden:

```text
Bild 1
Bild 2
Bild 3
```

oder:

```text
Variante A
Variante B
Variante C
```

Diese Labels beziehen sich nur auf die zufällige Anzeigeposition und nicht auf die echte Kategorie.

## Ablauf einer Voting-Session

Der Ablauf soll wie folgt sein:

1. Nutzer startet die Anwendung lokal.
2. Nutzer wählt einen Ordner aus oder gibt einen Ordnerpfad ein.
3. Anwendung scannt den Ordner.
4. Anwendung gruppiert die Bilder nach ID.
5. Anwendung mischt die Bildreihenfolge innerhalb jeder Gruppe zufällig.
6. Anwendung zeigt die erste Bildgruppe an.
7. Nutzer wählt das beste Bild aus.
8. Anwendung speichert die Stimme.
9. Anwendung zeigt automatisch die nächste Bildgruppe an.
10. Dieser Ablauf wiederholt sich, bis alle Gruppen bewertet wurden.
11. Am Ende zeigt die Anwendung eine Ergebnisübersicht.

## Ergebnisübersicht

Nach der letzten Abstimmung zeigt die Anwendung eine Auswertung.

Die Auswertung zeigt mindestens:

- Kategorie
- Anzahl der Stimmen
- prozentualer Anteil an allen Stimmen

Beispiel:

```text
Ergebnis

KreaLoraA     42 Stimmen   52,5 %
KreaLoraB     25 Stimmen   31,3 %
KreaNoLora    13 Stimmen   16,2 %
```

Die Kategorien sollen nach Anzahl der Stimmen absteigend sortiert werden.

Die Kategorie mit den meisten Stimmen soll klar als Gewinner erkennbar sein.

## Ergebnisdetails

Optional kann zusätzlich angezeigt werden:

- Welche Kategorie bei welcher ID gewonnen hat
- Gesamtzahl der bewerteten Gruppen
- Anzahl übersprungener oder unvollständiger Gruppen
- CSV-Export der Ergebnisse

Beispiel Detailansicht:

```text
ID 1: KreaLoraA
ID 2: KreaNoLora
ID 3: KreaLoraB
```

## Sortierung der Gruppen

Die Gruppen sollen nach ID sortiert werden.

Wenn die ID numerisch ist, soll numerisch sortiert werden.

Beispiel:

```text
1
2
3
10
11
```

Nicht so:

```text
1
10
11
2
3
```

Wenn IDs nicht numerisch sind, kann alphabetisch sortiert werden.

## Navigation während des Votings

Der primäre Ablauf ist linear.

Nach jeder Abstimmung springt die Anwendung automatisch zur nächsten Gruppe.

Erforderlich:

- Anzeige der aktuellen Position
- Anzeige der Gesamtanzahl der Gruppen

Beispiel:

```text
Gruppe 12 von 84
```

Optional:

- vorherige Gruppe
- Abstimmung ändern
- Gruppe überspringen
- Voting neu starten

Für die erste Version reicht ein linearer Ablauf ohne Zurückspringen.

## Grundlayout

Die Weboberfläche soll einfach und übersichtlich sein.

Vorgeschlagenes Layout während des Votings:

```text
------------------------------------------------
Bildvergleich                  Gruppe 12 von 84
------------------------------------------------

Welche Variante gefällt dir am besten?

[ Variante A ]   [ Variante B ]   [ Variante C ]
[    Bild    ]   [    Bild    ]   [    Bild    ]
[ Auswählen ]   [ Auswählen ]   [ Auswählen ]

------------------------------------------------
```

Wichtig:

- Die echte Kategorie wird während des Votings nicht angezeigt.
- Die Bilder stehen nebeneinander, sofern genug Platz vorhanden ist.
- Auf kleineren Bildschirmen dürfen die Bilder untereinander angezeigt werden.
- Der Fokus liegt auf schnellem Vergleichen und Abstimmen.

## Bildanzeige

Die Bilder sollen möglichst groß angezeigt werden.

Wenn mehrere Bilder gleichzeitig angezeigt werden, sollen sie gleichmäßig auf die verfügbare Breite verteilt werden.

Die Bilder sollen vollständig sichtbar sein, ohne abgeschnitten zu werden.

Die Darstellung soll das Seitenverhältnis der Bilder beibehalten.

Alle Bilder einer Gruppe sollen möglichst vergleichbar groß dargestellt werden.

## Abstimmung per Klick

Ein Klick auf ein Bild soll als Stimme für dieses Bild zählen.

Zusätzlich kann unter jedem Bild ein Button angezeigt werden.

Wenn sowohl Bildklick als auch Button unterstützt werden, sollen beide dieselbe Aktion auslösen.

## Tastaturbedienung

Optional, aber wünschenswert:

Der Nutzer kann per Tastatur abstimmen.

Beispiel:

- Taste `1` wählt das erste sichtbare Bild
- Taste `2` wählt das zweite sichtbare Bild
- Taste `3` wählt das dritte sichtbare Bild

Die Tastaturkürzel beziehen sich auf die sichtbare Reihenfolge, nicht auf die Kategorie.

## Fehlerhafte oder nicht passende Dateien

Dateien, die nicht dem erwarteten Namensschema entsprechen, sollen ignoriert werden.

Die Anwendung soll anzeigen, wie viele Dateien ignoriert wurden.

Beispiel:

```text
84 Bildgruppen geladen
3 Dateien ignoriert
```

Ungültige Dateien dürfen die Anwendung nicht zum Absturz bringen.

## Unvollständige Gruppen

Es kann vorkommen, dass zu einer ID nicht alle Kategorien vorhanden sind.

Beispiel:

```text
KreaNoLora_5.png
KreaLoraA_5.png
```

aber kein:

```text
KreaLoraB_5.png
```

Für die erste Version sollen unvollständige Gruppen trotzdem angezeigt werden, sofern mindestens zwei Bilder in der Gruppe vorhanden sind.

Gruppen mit nur einem Bild sollen nicht bewertet werden, da kein Vergleich möglich ist.

Die Anwendung soll anzeigen können, wie viele Gruppen wegen zu weniger Bilder übersprungen wurden.

## Kategorien-Erkennung

Die Anwendung soll alle vorhandenen Kategorien automatisch aus den Dateinamen erkennen.

Es muss keine feste Kategorienliste konfiguriert werden.

Beispiel:

```text
KreaNoLora_1.png
KreaLoraA_1.png
KreaLoraB_1.png
```

erkannte Kategorien:

```text
KreaNoLora
KreaLoraA
KreaLoraB
```

## Speicherung der Stimmen

Die Stimmen müssen mindestens während der aktuellen Session im Arbeitsspeicher gehalten werden.

Eine dauerhafte Speicherung ist für die erste Version nicht erforderlich.

Optional kann später ergänzt werden:

- Speicherung als JSON-Datei
- Export als CSV
- Wiederaufnahme einer unterbrochenen Session
- Speicherung im Browser Local Storage

## Datenschutz und Sicherheit

Die Anwendung läuft lokal.

Es sollen keine Bilder hochgeladen werden.

Es sollen keine Daten an externe Server gesendet werden.

Die Anwendung soll ausschließlich auf Dateien zugreifen, die der Nutzer explizit über die Ordnerauswahl oder den Ordnerpfad angegeben hat.

## Nicht-Ziele

Die Anwendung muss zunächst nicht:

- Bilder bearbeiten
- Bilder löschen
- Bilder umbenennen
- Bilder dauerhaft bewerten
- Benutzerkonten unterstützen
- online verfügbar sein
- mobil optimiert sein
- mehrere Nutzer gleichzeitig unterstützen
- komplexe Statistiken erstellen
- KI-Modelle ausführen

## Technische Anforderungen

Die Anwendung soll einfach lokal startbar sein.

Bevorzugt wird eine möglichst einfache Projektstruktur.

Die konkrete Technologie kann von Claude Code vorgeschlagen werden, solange folgende Bedingungen erfüllt sind:

- lokal startbar
- einfache Installation
- Ordnerauswahl oder Ordnerpfad-Eingabe möglich
- Bilder können aus dem lokalen Dateisystem geladen werden
- moderne Browseroberfläche
- schneller Wechsel nach Abstimmung
- zufällige Anzeige-Reihenfolge je Gruppe
- Blind-Voting ohne sichtbare Kategorie
- gut wartbarer Code

## Akzeptanzkriterien

Die Anwendung gilt als funktionsfähig, wenn:

1. Der Nutzer einen lokalen Ordner auswählen oder angeben kann.
2. Die Anwendung Bilddateien im Ordner erkennt.
3. Die Anwendung Kategorie und ID aus den Dateinamen extrahiert.
4. Bilder mit derselben ID gemeinsam gruppiert werden.
5. Gruppen mit mindestens zwei Bildern bewertet werden können.
6. Immer eine ID-Gruppe gleichzeitig angezeigt wird.
7. Alle Bilder einer ID-Gruppe gleichzeitig sichtbar sind.
8. Die Bilder innerhalb einer Gruppe in zufälliger Reihenfolge angezeigt werden.
9. Die echten Kategorien sind während des Votings nicht sichtbar.
10. Der Nutzer kann ein Bild als beste Variante auswählen.
11. Nach einer Abstimmung springt die Anwendung automatisch zur nächsten Gruppe.
12. Die Stimme wird der korrekten Kategorie zugeordnet.
13. Nach der letzten Gruppe wird eine Ergebnisübersicht angezeigt.
14. Die Ergebnisübersicht zeigt pro Kategorie die Anzahl der Stimmen.
15. Die Ergebnisübersicht zeigt pro Kategorie den prozentualen Anteil.
16. Die Kategorien werden im Ergebnis nach Stimmen absteigend sortiert.
17. Dateien mit ungültigem Namen bringen die Anwendung nicht zum Absturz.
18. Die Anwendung läuft lokal und lädt keine Daten auf externe Server hoch.
