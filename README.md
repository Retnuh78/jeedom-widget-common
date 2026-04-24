# jeedom-widget-common

Bibliothèque partagée CSS + JS pour les widgets HTML Jeedom custom.

## Fichiers

| Fichier | Description |
|---------|-------------|
| `jeedom-widget-common.css` | Palette, tokens CSS, composants de base (`jw-`) |
| `jeedom-widget-common.js` | Helpers JS — expose l'objet global `JW` |

## Installation sur Jeedom

Déposer les deux fichiers dans `/data/customjs/` sur le serveur Jeedom, puis référencer dans chaque widget :

```html
<link rel="stylesheet" href="/data/customjs/jeedom-widget-common.css">
<script src="/data/customjs/jeedom-widget-common.js"></script>
```

## API JS — objet `JW`

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `JW.readCmd` | `(id, cb)` | Lit une commande Jeedom via `jeedom.cmd.execute`, callback `cb(valeur)` |
| `JW.fmt` | `(val, decimals)` | Formate un nombre avec N décimales |
| `JW.clamp` | `(val, min, max)` | Plafonne une valeur entre min et max |
| `JW.tempColor` | `(temp)` | Retourne une couleur CSS selon la température |

## Conventions CSS

- Préfixe de classe : `jw-`
- Variable de scale responsive : `--jw-scale` (piloté par `ResizeObserver`)
- Tokens disponibles : `--bg0`, `--bg1`, `--accent`, `--text`, `--text-muted`, etc.

## Widgets utilisant cette lib

- [jeedom-jacuzzi-widget](https://github.com/Retnuh78/jeedom-jacuzzi-widget) — grand écran 1280×690 px
- [jeedom-jacuzzi-home-widget](https://github.com/Retnuh78/jeedom-jacuzzi-home-widget) — téléphone 285×190 px
