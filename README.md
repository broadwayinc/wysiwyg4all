# Wysiwyg4All

[Getting started](#getting-started) | [Default settings](#default-settings) | [List of Wysiwyg4All commands](#list-of-wysiwyg4all-commands) | [License](#license) </br> 

**Wysiwyg4All** is a free opensource minimal WYSIWYG editor for your website. It is highly expandable and customizable.

You can easily build your own full fledged WYSIWYG application with your own css design with this library.

<br />

## Getting started

These following steps show basic demonstration of how to install **Wysiwyg4All**.

1. Inside HTML **&lt;head>** add below:
    ```html
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/wysiwyg4all@latest/dist/wysiwyg4all.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/wysiwyg4all@latest/wysiwyg4all.css" />
    ```

    If you are working on webpack based projects:

    ```bash
    npm i wysiwyg4all
    ```

    Then, import the library from your project main file:

    ```js
    import { Wysiwyg4All } from 'wysiwyg4all';
    import 'wysiwyg4all/css';
    ```


2. Inside  **&lt;body>**, create **&lt;div>** with an id ('myeditor' ,for example) and give custom css style. Buttons can be created to actuate wysiwyg functionality. We added a button which will change text size to **'h1'** at the **'onclick'** event using `wysiwyg.command('h1')` function. Diverse command options can be selected, which are listed in below [List of Wysiwyg4All commands](#List-of-Wysiwyg4All-commands). Of course, the button design can be customized by your own taste. 

    <br />

    <u>**_Example 1_**</u>

    ```html
    <div id="myeditor" style="width: 512px; padding:1rem; border: solid 1px teal"></div>
    <button onclick="wysiwyg.command('h1')">
        H1
    </button>
    ```
    <br />

## Default settings

In **Wysiwyg4All** function, you shuold set default properties for element id, placeholder string, spell check, highlight color, last line blank, hash-tag and URL link, log mutation. Add Wysiwyg4All default setting script inside your **&lt;script**&gt;. The **&lt;script>** tag should come after closing the **&lt;/body**&gt; tag. Following script is an example for setting some of the default properties. **Wysiwyg4All** function will be created under the name of **wysiwyg** in the entire examples.

<br />

<u>**_Example 2_**</u>

```js
let wysiwyg = new Wysiwyg4All({
    //set ID of target <DIV>.
    elementId: 'myeditor',

    // Add placeholder string.
    placeholder: 'Build your custom wysiwyg',

    // Set spellcheck to true/false.
    spellcheck: false, 

    // Set color scheme of wysiwyg (HTML color name | hex | rgb | hsl).
    highlightColor: 'teal',

    // When set to true, blank line will always be added on the last line of text area.
    lastLineBlank: false,

    // When set to true, wysiwyg will auto detect hashtag strings.
    hashtag: true,

    // When set to true, wysiwyg will auto detect url strings
    urllink: true,

    // When set to true, wysiwyg will output DOM mutation data via callback function.
    logMutation: false,

    // font size for each display
    fontSize: {
        desktop: 18, // Can be css value: '18px', '2em'... etc. When number is given, it normalizes to 'px'
        tablet: 16, // (max-width: 899px) Optional, if not given, inherits from desktop size.
        phone: 14, // (max-width: 599px) Optional, if not given, inherits from tablet size.
        
        // header sizes below -
        h1: 4.2, // Can be css value: '18px', '2em'... etc. When number is given, it normalizes to 'em'
        h2: 3.56,
        h3: 2.92,
        h4: 2.28,
        h5: 1.64,
        h6: 1.15,
        small: 0.8,
    },
})
```
<br />

### Command tracker

Callback function is used to log properties of **command tracker**, **images**, **hashtags**, **URL links**, **caret position** and **log mutation**. Include callback function inside your **&lt;script>**.
<br/>
Following code example shows default setting of `.commandTracker`, which shows current status of the text style in the console log.

<br />

<u>**_Example 3_**</u>

```js
let wysiwyg = new Wysiwyg4All({
    callback: c => {
        if (c.commandTracker) {
            let ct = c.commandTracker;
            console.log(ct)
            if (typeof ct.color === 'string')
            // change the color wheel input value based on the position of the caret
            document.getElementById('colorInput').value = ct.color;
            else
            // If color output is true(boolean), the current color is the highlight color
            document.getElementById('colorInput').value = ct.color ? wysiwyg.highlightColor : wysiwyg.defaultFontColor;
        }
        return c;
    }
})
```
<br />

### Image style

Image style can be pre-processed in `.image`. Following code example shows setting default width size of image by 8rem with border of red color, border width of 2px and triggering 'image clicked' message pop-up alert on the 'onclick' event. 

<br />

<u>**_Example 4_**</u>

```js
    let wysiwyg = new Wysiwyg4All({
        callback: c => {
            if (c.image) {
                // you can modify image element before it gets loaded
                console.log({image: c.image});
                for (let img of c.image) {
                       img.style = {
                           width: '20rem',
                           border: 'solid 2px red'
                       };
    
                       img.onclick = () => {
                           alert(`image clicked!`);
                       };
                }
            }
            return c;
        }
    })
```
<br />

### Hashtag style

Default hashtag properties can be modified in `.hashtag `. Following code example shows setting default color of hashtag as red and giving message pop-up alert, whenever clicking hashtag string. 

<br />

<u>**_Example 5_**</u>

```js
    let wysiwyg = new Wysiwyg4All({
        callback: c => {
            if (c.hashtag) {
                console.log({hashtag: c.hashtag});
                for (let h of c.hashtag) {
    
                       h.style = {
                           color: 'red'
                       };
    
                       h.onclick = () => {
                           alert(`${h.tag} clicked!`);
                       };
                }
            }
            return c;
        }
    })
```
<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/hashtag.gif" width="500">

<br />

### URL style

Default URL link properties can be modified in `.urllink`.  Following code example shows setting default color of URL link as red and displaying message pop-up alert, whenever clicking URL string. 

<br />

<u>**_Example 6_**</u>

```js
let wysiwyg = new Wysiwyg4All({
    callback: c => {
        if (c.urllink) {
            console.log({urllink: c.urllink});
            for (let u of c.urllink) {
                   u.style = {
                       color: 'red'
                   };
                u.onclick = () => {
                    alert(`${u.url} clicked!`);
                };
            }
        }
        return c;
})
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/url%20link.gif" width="500">

<br />

### Caret position

Default caret position properties can be modified in `.caratPosition` . Copy and paste the following code example. Specific details can be referred in API manual.

<br />

<u>**_Example 7_**</u>

```js
let wysiwyg = new Wysiwyg4All({
    callback: c => {
        if (c.caratPosition) {
            // Tracks carat position
            // Make carat to be always within the viewport
            let viewPortHeight = Math.min(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            let minusWhenOutOfView = viewPortHeight - c.caratPosition.top;
            if (minusWhenOutOfView < 0)
                window.scrollBy(0, -minusWhenOutOfView);
        }
        return c;
    }
})
```

<br />

### Log mutation

Default log mutation properties can be modified in `.mutation` . Copy and paste the following code example. Specific details can be referred in API manual.

<br />

<u>**_Example 8_**</u>

```js
    let wysiwyg = new Wysiwyg4All({
        callback: c => {
            if (c.mutation) {
                // outputs dom mutation information
                console.log({mutation: c.mutation});
            }
            return c;
        }
    })
```


<br />


### Custom element type

HTML string or node element can be assigned in `wysiwyg.command()` element value. In the following example code, smile emoji (😀) is loaded in the custom element that would be added inline, whenever `customElement()` function is called such as by using customElement [command button](#Custom-element-insertion). Following code should be included in **&lt;script>**.

<br />

<u>**_Example 9_**</u>

```js
let customElement = () => {
    // add smile emoji. This can be html string (ex - <div>Hello</div>) or node element (ex - document.createElement('div'))
    wysiwyg.command({
        element: '&#128512;'
    });
};
```

<br />

### Export data

`wysiwyg.export()` should be included in **&lt;script>**. It exports brief summary of Document Object Model(DOM) including HTML element.

<br />

<u>**_Example 10_**</u>

```js
let export_data = () => {
    wysiwyg.export(pre => {
        console.log(pre);
    }).then(e => {
        console.log(e);
    });
};
```

<br />

# List of Wysiwyg4All commands

The Wysiwyg can edit text styles and text input field in diverse manners by using `wysiwyg.command()` function. Buttons can be created inside your **&lt;body>** as shown in the [Getting started](#getting-started) example, and to activate commands on 'onclick' event. The list of the command inputs is shown in the following. 

### Text style

`wysiwyg.command('bold' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'small' | 'italic' | 'underline' | 'strike')` changes the text style by bold, heading level (h1 ~ h6), small letter, italic, underline or strike.

<br />

<u>**_Example 11_**</u>

```html
<button onclick="wysiwyg.command('h1')">
    H1
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/txt%20style.gif" width="500">

### ⚠️ Warning

When executing wysiwyg commands, the text selection in wysiwyg should be present.

For some browsers, wysiwyg text selection can be disabled the moment the user clicks on the command button.
To prevent this, it might be a good idea to prevent default on command buttons:

```html
<button onmousedown="event.preventDefault()" onclick="wysiwyg.command('h1')">
    H1
</button>
```

<br />

### **Text color**
`wysiwyg.command('color')` changes the text color ('black') to **wysiwyg** default highlight color ('teal' in this example). 

<br />

<u>**_Example 12_**</u>

```html
<button onclick="wysiwyg.command('color')">
    Color
</button>
```

<br />

Other color choice can be provided to user by creating HTML color picker. It is important to restore the last selected text on 'onblur' action (whenever losing focus in the input field) by using `wysiwyg.restoreLastSelection()` to change the text color in color picker.

<br />

<u>**_Example 13_**</u>

```html
<input id='colorInput' type='color' onchange="wysiwyg.command(event.target.value)"
       onblur="wysiwyg.restoreLastSelection()"/>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/txtcolor.gif" width="500">

<br />

### **Divider**
`wysiwyg.command('divider')`adds horizontal line below the current text position.

<br />

<u>**_Example 14_**</u>

```html
<button onclick="wysiwyg.command('divider')">
    Divider
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Divider.PNG" width="500">

<br />

### **Quote**

`wysiwyg.command('quote')`adds block quote on the selected line. Note that the default highlight color is applied on the block quote.

<br />

<u>**_Example 15_**</u>

```html
<button onclick="wysiwyg.command('Quote')">
    Quote
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Quote.PNG" width="500">

<br />

### **List**

`wysiwyg.command('unorderedList')` adds unordered list and`wysiwyg.command('orderedList')`adds ordered list on the selected line.  Following code shows creating command button to add unorderedList.

<br />

<u>**_Example 16_**</u>

```html
<button onclick="wysiwyg.command('unorderedList')">
    Unordered list
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/unordered%20list.gif" width="500">

<br />

### **Text alignment**

`wysiwyg.command('alignLeft')` , `wysiwyg.command('alignCenter')`  or `wysiwyg.command('alignRight')`aligns selected text to the left, center or to the right. Following code shows creating command button for aligning text to the center of the text area. Clicking the command button again restore to the initial alignment.

<br />

<u>**_Example 17_**</u>

```html
<button onclick="wysiwyg.command('alignCenter')">
    Align center
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/text%20alignment.gif" width="500">

<br />

### Image insertion

`wysiwyg.command('image')` adds image below selected line. By clicking the 'image' command button, directory panel pops up and opening the image will make insertion into the text input field.

<br />

<u>**_Example 18_**</u>

```html
<button onclick="wysiwyg.command('image')">
    Image
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Image%20insertion.gif" width="500">

<br />

### Custom element insertion

`customElement()` adds pre-loaded HTML string or node elements inside a line. Smile emoji will be inserted whenever 'Smile' button is clicked in the following example as it was pre-loaded in the [default setting](#Custom-element-type) custom element example.

<br />

<u>**_Example 19_**</u>

```html
<button onclick="customElement()">
  Smile
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/emoji.gif" width="500">

<br />

## License

This project is licensed under the terms of the [MIT license](https://github.com/broadwayinc/colormangle/blob/main/LICENSE).

