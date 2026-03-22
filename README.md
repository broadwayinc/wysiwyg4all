# Wysiwyg4All

[Getting started](#getting-started) | [Configuration](#configuration) | [Callback payload](#callback-payload) | [Commands](#commands) | [License](#license)

Wysiwyg4All is a lightweight, extensible WYSIWYG editor for web apps.

## Getting started

### CDN usage

Add the bundle and stylesheet inside `<head>`:

```html
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<script src="https://cdn.jsdelivr.net/npm/wysiwyg4all@latest/dist/wysiwyg4all.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/wysiwyg4all@latest/dist/wysiwyg4all.css" />
```

### Bundler usage

```bash
npm i wysiwyg4all
```

```js
import { Wysiwyg4All } from "wysiwyg4all";
import "wysiwyg4all/css";
```

### Quick example

```html
<div id="myeditor" style="width: 512px; padding: 1rem; border: solid 1px teal"></div>

<button onclick="wysiwyg.command('h1')">H1</button>
<button onclick="wysiwyg.command('bold')">Bold</button>
<button onclick="wysiwyg.command('color')">Highlight Color</button>
<input id="colorInput" type="color" oninput="wysiwyg.command({ color: this.value })" />
<input id="bgInput" type="color" oninput="wysiwyg.command({ backgroundColor: this.value })" />

<script>
  const wysiwyg = new Wysiwyg4All({
    elementId: "myeditor"
  });
</script>
```

## Configuration

```js
const wysiwyg = new Wysiwyg4All({
  elementId: "myeditor",
  editable: true,
  placeholder: "Build your custom WYSIWYG",
  spellcheck: false,
  highlightColor: "teal", // color string or CSS variable map object
  html: "<p>Initial content</p>",
  hashtag: true,
  urllink: true,
  fontSize: {
    desktop: 18, // px when number is passed
    tablet: 16,
    phone: 14,
    h1: 4.2, // em when number is passed
    h2: 3.56,
    h3: 2.92,
    h4: 2.28,
    h5: 1.64,
    h6: 1.15,
    small: 0.8
  },
  extensions: [],
  callback: (payload) => payload
});
```

Notes:
- `lastLineBlank` and `logMutation` are not active options in the current version.
- `highlightColor` can be a color string (`"#0d9488"`, `"teal"`, `"rgb(...)"`) or a color scheme object.

## Callback payload

The callback can receive updates for:
- `commandTracker`
- `range`
- `caratPosition`
- `loading`
- `image`
- `hashtag`
- `urllink`

Example:

```js
const colorInput = document.getElementById("colorInput");
const bgInput = document.getElementById("bgInput");

const wysiwyg = new Wysiwyg4All({
  elementId: "myeditor",
  callback: (c) => {
    if (c.commandTracker) {
      const ct = c.commandTracker;
      console.log("commandTrackerColor", ct.color, "commandTrackerBg", ct.backgroundColor);

      // Keep pickers in sync with caret position style.
      if (colorInput && typeof ct.color === "string" && ct.color) {
        colorInput.value = ct.color;
      }
      if (bgInput && typeof ct.backgroundColor === "string" && ct.backgroundColor) {
        bgInput.value = ct.backgroundColor;
      }
    }

    return c;
  }
});
```

`commandTracker.color` and `commandTracker.backgroundColor` are strings in hex form when resolvable (for example `#0d9488`).

## Commands

Use `wysiwyg.command(...)`.

### Inline style commands

```js
wysiwyg.command("bold");
wysiwyg.command("italic");
wysiwyg.command("underline");
wysiwyg.command("strike");
wysiwyg.command("h1");
wysiwyg.command("h2");
wysiwyg.command("h3");
wysiwyg.command("h4");
wysiwyg.command("h5");
wysiwyg.command("h6");
wysiwyg.command("small");
```

Behavior:
- These commands toggle on/off when applied to selected text.
- For collapsed caret selections, style is applied to the next typed characters.

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/txt%20style.gif" width="500">

### Text color and background color

```js
// Uses current highlightColor
wysiwyg.command("color");

// Explicit text color
wysiwyg.command({ color: "#ef4444" });

// Explicit background color
wysiwyg.command({ backgroundColor: "#fef08a" });

// Color string shortcut is also supported
wysiwyg.command("#3b82f6");
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/txtcolor.gif" width="500">

### Layout and block commands

```js
wysiwyg.command("alignLeft");
wysiwyg.command("alignCenter");
wysiwyg.command("alignRight");
wysiwyg.command("quote");
wysiwyg.command("unorderedList");
wysiwyg.command("orderedList");
wysiwyg.command("divider");
wysiwyg.command("image");
```

Alignment preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/text%20alignment.gif" width="500">

Quote preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Quote.PNG" width="500">

List preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/unordered%20list.gif" width="500">

Divider preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Divider.PNG" width="500">

Image insertion preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Image%20insertion.gif" width="500">

### Custom insertion

```js
// Text node insertion
wysiwyg.command({ element: "Hello" });

// HTMLElement insertion
const badge = document.createElement("span");
badge.textContent = "NEW";
badge.style.background = "#111827";
badge.style.color = "#fff";
badge.style.padding = "2px 6px";
badge.style.borderRadius = "999px";

wysiwyg.command({
  element: badge,
  elementId: "custom_badge",
  style: {
    marginLeft: "8px"
  }
});
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/emoji.gif" width="500">

## Image, hashtag, and URL decorators

Use callback payloads to decorate generated tokens and uploaded images.

```js
const wysiwyg = new Wysiwyg4All({
  elementId: "myeditor",
  hashtag: true,
  urllink: true,
  callback: (c) => {
    if (c.image) {
      for (const img of c.image) {
        img.style = {
          width: "20rem",
          border: "solid 2px red"
        };
      }
    }

    if (c.hashtag) {
      for (const h of c.hashtag) {
        h.style = { color: "red" };
      }
    }

    if (c.urllink) {
      for (const u of c.urllink) {
        u.style = { color: "red" };
      }
    }

    return c;
  }
});
```

Hashtag preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/hashtag.gif" width="500">

URL preview:

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/url%20link.gif" width="500">

## Loading and exporting

```js
await wysiwyg.loadHTML("<p>Hello world</p>", true);

const exported = await wysiwyg.export((setup) => {
  // optional preprocessing before export
  return setup;
});

console.log(exported.html);
console.log(exported.text);
console.log(exported.title);
```

## License

This project is licensed under the terms of the [MIT license](https://github.com/broadwayinc/wysiwyg4all/blob/main/LICENSE).
