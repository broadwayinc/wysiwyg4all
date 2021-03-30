<img alt="APM" src="https://img.shields.io/apm/l/vim-mode"> ![Github All Releases](https://img.shields.io/github/downloads/broadwayinc/wysiwyg4all/total.svg)

# Wysiwyg4all

[Getting started](#getting-started) | [Default settings](#default-settings) | [List of Wysiwyg4all commands](#list-of-wysiwyg4all-commands) | [License](#license) </br> 

**Wysiwyg4all** ('what you see is what you get for all') is a simple framework for building a text editor for your website. It is highly expandable and customizable.

<br />

## Getting started

These following two-steps show basic demonstration of how **Wysiwyg4all** works out.

1. Inside HTML **&lt;head>** add below:
```
<script src="https://broadwayinc.dev/jslib/wysiwyg4all/0.1.0/wysiwyg4all.js"></script>
<link rel="stylesheet" type="text/css" href="https://broadwayinc.dev/jslib/wysiwyg4all/0.1.0/wysiwyg4all.css" />
```
<br />

2. Inside  **&lt;body>**, create **&lt;div>** with an id ('myeditor' ,for example) and give custom css style. Buttons can be created to actuate wysiwyg functionality. We added a button which will change text size to **'h1'** at the **'onclick'** event using `wysiwyg.command('h1')` function. Diverse command options can be selected, which are listed in below [List of Wysiwyg4all commands](#List-of-Wysiwyg4all-commands). Of course, the button design can be customized by your own taste. 

<br />

<u>**_Example 1_**</u>

```
<div id="myeditor" style="width: 512px; padding:1rem; border: solid 1px teal"></div>
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('h1')">
    H1
</button>
```
<br />

## Default settings

In **Wysiwyg4all** function, you shuold set default properties for element id, placeholder string, spell check, highlight color, last line blank, hash-tag and URL link, log mutation. Add Wysiwyg4all default setting script inside your **&lt;script**&gt;. The **&lt;script>** tag should come after closing the **&lt;/body**&gt; tag. Following script is an example for setting some of the default properties. **Wysiwyg4all** function will be created under the name of **wysiwyg** in the entire examples.

<br />

<u>**_Example 2_**</u>

```
let wysiwyg = new Wysiwyg4all({
    //set ID of target <DIV>.
    elementId : 'myeditor',

    // Add placeholder string.
    placeholder : 'Build your custom wysiwyg',

    // Set spellcheck to true/false.
    spellcheck : false, 

    // Set color scheme of wysiwyg (HTML color name | hex | rgb | hsl).
    highlightColor : 'teal',

    // When set to true, blank line will always be added on the last line of text area.
    lastLineBlank = false,

    // When set to true, wysiwyg will auto detect hashtag strings.
    hashtag = true,

    // When set to true, wysiwyg will auto detect url strings
    urllink = true,

    // When set to true, wysiwyg will output DOM mutation data via callback function.
    logMutation = false
})
```
<br />

### Command track
Callback function is used to set default properties of **command tracker**, **images**, **hashtags**, **URL links**, **caret position** and **log mutation**. Include callback function inside your **&lt;script>**. Keep in mind that callback parameter ('c' in the following example code) should be returned.
<br/>
Following code example shows default setting of `.commandTracker`.

<br />

<u>**_Example 3_**</u>

    let wysiwyg = new Wysiwyg4all({
        callback: async c => {
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
<br />

### Image style

Image style can be pre-processed in `.image`. Following code example shows setting default width size of image by 8rem with border of red color, border width of 2px and triggering 'image clicked' message pop-up alert on the 'onclick' event. 

<br />

<u>**_Example 4_**</u>

    let wysiwyg = new Wysiwyg4all({
        callback: async c => {
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

<br />

### Hashtag style

Default hashtag properties can be modified in `.hashtag `. Following code example shows setting default color of hashtag as red and giving message pop-up alert, whenever clicking hashtag string. 

<br />

<u>**_Example 5_**</u>

    let wysiwyg = new Wysiwyg4all({
        callback: async c => {
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
<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/hashtag.gif" width="500">

<br />

### URL style

Default URL link properties can be modified in `.urllink`.  Following code example shows setting default color of URL link as red and displaying message pop-up alert, whenever clicking URL string. 

<br />

<u>**_Example 6_**</u>

```
let wysiwyg = new Wysiwyg4all({
    callback: async c => {
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

```
let wysiwyg = new Wysiwyg4all({
    callback: async c => {
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

```
    let wysiwyg = new Wysiwyg4all({
        callback: async c => {
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

```
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

```
let export_data = () => {
    wysiwyg.export(pre => {
        console.log(pre);
    }).then(e => {
        console.log(e);
    });
};
```

<br />

# List of Wysiwyg4all commands

The Wysiwyg can edit text styles and text input field in diverse manners by using `wysiwyg.command()` function. Buttons can be created inside your **&lt;body>** as shown in the [Getting started](#getting-started) example, and to activate commands on 'onclick' event. The list of the command inputs is shown in the following. 

### Text style

`wysiwyg.command('bold' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'small' | 'italic' | 'underline' | 'strike')` changes the text style by bold, heading level (h1 ~ h6), small letter, italic, underline or strike.

<br />

<u>**_Example 11_**</u>

```
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('h1')">
    H1
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/txt%20style.gif" width="500">

<br />

### **Text color**
`wysiwyg.command('color')` changes the text color ('black') to **wysiwyg** default highlight color ('teal' in this example). 

<br />

<u>**_Example 12_**</u>

```
<button onclick="wysiwyg.command('color')">
    Color
</button>
```

<br />

Other color choice can be provided to user by creating HTML color picker. It is important to restore the last selected text on 'onblur' action (whenever losing focus in the input field) by using `wysiwyg.restoreLastSelection()` to change the text color in color picker.

<br />

<u>**_Example 13_**</u>

```
<input id='colorInput' type='color' onchange="(function(event){wysiwyg.command(event.target.value)})(event)"
       onblur="(function(){wysiwyg.restoreLastSelection()})()"/>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/txtcolor.gif" width="500">

<br />

### **Divider**
`wysiwyg.command('divider')`adds horizontal line below the current text position.

<br />

<u>**_Example 14_**</u>

```
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('divider')">
    Divider
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Divider.PNG" width="500">

<br />

### **Quote**

`wysiwyg.command('quote')`adds block quote on the selected line. Note that the default highlight color is applied on the block quote.

<br />

<u>**_Example 15_**</u>

```
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('Quote')">
    Quote
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Quote.PNG" width="500">

<br />

### **List**

`wysiwyg.command('unorderedList')` adds unordered list and`wysiwyg.command('orderedList')`adds ordered list on the selected line.  Following code shows creating command button to add unorderedList.

<br />

<u>**_Example 16_**</u>

```
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('unorderedList')">
    Unordered list
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/unordered%20list.gif" width="500">

<br />

### **Text alignment**

`wysiwyg.command('alignLeft')` , `wysiwyg.command('alignCenter')`  or `wysiwyg.command('alignRight')`aligns selected text to the left, center or to the right. Following code shows creating command button for aligning text to the center of the text area. Clicking the command button again restore to the initial alignment.

<br />

<u>**_Example 17_**</u>

```
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('alignCenter')">
    Align center
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/text%20alignment.gif" width="500">

<br />

### Image insertion

`wysiwyg.command('image')` adds image below selected line. By clicking the 'image' command button, directory panel pops up and opening the image will make insertion into the text input field.

<br />

<u>**_Example 18_**</u>

```
<button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('image')">
    Image
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/Image%20insertion.gif" width="500">

<br />

### Custom element insertion

`customElement()` adds pre-loaded HTML string or node elements inside a line. Smile emoji will be inserted whenever 'Smile' button is clicked in the following example as it was pre-loaded in the [default setting](#Custom-element-type) custom element example.

<br />

<u>**_Example 19_**</u>

```
<button onclick="customElement()">
  Smile
</button>
```

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/Manual%20figures/emoji.gif" width="500">

<br />

## License

This project is licensed under the terms of the [MIT license](https://github.com/broadwayinc/colormangle/blob/main/LICENSE).

