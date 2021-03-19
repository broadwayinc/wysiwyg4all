<img alt="APM" src="https://img.shields.io/apm/l/vim-mode"> ![Github All Releases](https://img.shields.io/github/downloads/broadwayinc/wysiwyg4all/total.svg)

# Wysiwyg4all

[Getting started](#getting-started) | [Text style editing](#text-style-editing) | [Text color](#text-color-editing) | [Divider](#divider) | [Quote](#quote) | [List](#list) | [Image insertion](#image-insertion) | [Text alignment](#text-alignment) | [Restore cursor position](#restore-cursor-position) | [Default setting parameters](#default-setting-parameters) | [License](#license) </br> 

**Wysiwyg4all** ('what you see is what you get for all') is a simple framework for building a text editor for your website. It is highly expandable and customizable.

<br />

## Getting started

Additional library **ColorMangle** is required for text colors.

<br />


## API

### Wysiwyg4all()

**Wysiwyg4all** is an object with option parameters as properties and command funcitons. 

<br />

#### Example for creating text editor####
<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/default%20options.png" style="zoom:100%;" />



##### An example of HTML code for generating text area and 'H1' command button

```
<body>

<div id="sample" style="width: 500px; margin:1rem auto; padding:1rem; border: solid 1px rgb(34, 168, 168)"></div>
<div style="width: 500px; margin:1rem auto;">

    <button onmousedown="(function(event){event.preventDefault()})(event)" onclick="wysiwyg.command('h1')">
    H1
    </button>
    
</div>
</body>
```

The command function edit text styles or perform diverse functions. The list of the command inputs is shown in the following.



### List of Wysiwyg commands

#### Text style editing (H1-H6/ small/ bold/ italic/ underline/ strike)

`wysiwyg.command('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'small' | 'bold' | 'italic' | 'underline' | 'strike')` changes the text style by heading level, small letter, bold, italic, underline or strike.



<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/style3.gif" style="zoom:100%;" />



#### **Text color editing**

`wysiwyg.command('color')` changes the text color ('black') to **wysiwyg** color scheme ('teal'). If you want to use other colors, HTML color name string can be given by input typing.



```
let input_color_string = () => {
	let color = prompt("Input Color String");
	wysiwyg.command(color);
}
```

<img src="C:\Users\슈퍼맨\Documents\figure for MD\wysiwyg\color_resized.gif" style="zoom:100%;" />



#### **Divider**

`wysiwyg.command('divider')`adds horizontal line below .

![](https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/divider.gif)



#### **Quote**

`wysiwyg.command('quote')`adds block quote on the selected line.

![](https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/Quote.gif)



#### **List (Unordered/ Ordered)**

`wysiwyg.command('unorderedList')` adds unordered list and`wysiwyg.command('orderedList')`adds ordered list one the selected line.

![](https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/listing.gif)



#### Image insertion

`wysiwyg.command('image')` adds image below selected line. By clicking the 'photo' command button, directory panel pops up and if the image file opened, the image is inserted into the text area.

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/photo%20add%20screen.png" style="zoom:10%;" />


<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/img%20%EC%97%B4%EA%B8%B0.PNG" style="zoom:10%;" />


<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/img%20inserted.PNG" style="zoom:10%;" />





#### **Text alignment**

`wysiwyg.command('alignLeft')` , `wysiwyg.command('alignCenter')`  or `wysiwyg.command('alignRight')`aligns selected text to the left, center or to the right.

![](https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/alignment.gif)



#### **Restore cursor position**

`wysiwyg.restoreLastSelection()` restores the last caret position or  the last selection range after losing focus.

![](https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/Restore.gif)



### 

```
@param {{}} action - Custom element object.
@param {{}} action.element - Custom element DOM.
@param {string} [action.elementId] - Set custom element parent id. Otherwise auto generated.
@param {{}} [action.style] - Set custom element parent css style.
@param {'append' | 'inline'} [action.insertMode='append'] - Set custom element insert mode. When 'append' the custom element is added as block element. Otherwise as inline element.
```



### Default setting parameters for wysiwyg

```
let wysiwyg = new Wysiwyg4all({

	//set ID of target <DIV>.
	elementId : 'sample',
	
	// When set to false, wysiwyg will not be editable but read only.
	editable : true, 
	
	// The default font size of wysiwyg is desktop:18, tablet: 16 and phone: 14.
	// If the value is given, all the screen will share the given font size. 
	fontSize:20
	
	// Add placeholder string.
	placeholder : 'HELLO',
	
	// Set spellcheck to true/false.
	spellcheck : false, 
	
	// Set color scheme of wysiwyg (HTML color name | hex | rgb | hsl).
	colorScheme : 'teal', 
	
	// HTML string to load on initialization.
	html : '<p>Hello html<p>',  
	
	// When set to true, Blank line will always be added on the last line of text area.
    lastLineBlank = false,
    
    // When set to true, wysiwyg will auto detect hashtag strings.
    hashtag = true,
    
    // When set to true, wysiwyg will auto detect url strings
    urllink = true,
    
    // When set to true, wysiwyg will output DOM mutation data via callback function.
    logMutation = false
    
    // Callback for attaching image. Callback argument contains array of information such as current text
    style, added images, hashtags, urllinks, selected range... etc.
    
    callback: async c => {
        if (c.image) {
            let img = c.image;
            if (Array.isArray(img))
                for (let h of img) {
                    h.onclick = (e) => {
                        console.log({e});
                    };
                    h.class = ['sample'];
                    h.style = {};
                    h.style.width = '50%';
                    h.style.margin = 'auto';
                }
        }
        
		 // Auto-detect hashtag letters
        if (c.hashtag) {
            let ht = c.hashtag;
            if (Array.isArray(ht))
                for (let h of ht) {
                    h.onclick = (e) => {
                        console.log({e});
                    };
                    h.class = ['sample'];
                }
        }
         // Auto-detect url string
         if (c.urllink) {
                let ht = c.urllink;
                if (Array.isArray(ht))
                    for (let h of ht) {
                        h.onclick = (e) => {
                            console.log({e});
                        };
                        h.class = ['sample'];
                   }
           }
       
        // tracking cursor position
        if (c.caratPosition) {
            let viewPortHeight = Math.min(document.documentElement.clientHeight||0, window.innerHeight||0);
            let minusWhenOutOfView = viewPortHeight - c.caratPosition.top;
            if (minusWhenOutOfView < 0)
                window.scrollBy(0, -minusWhenOutOfView);
        }
        return c; 
        console.log(c) //test probe
    }
})

// Export data
let export_data = () => {
    wysiwyg.export(pre => {
        console.log(pre);
    }).then(e => {
        console.log(e);
    });
};
```







<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/carat position text area.PNG" style="zoom:50%;" />

`c.caratPosition`  automatically tracks the cursor position. In the console panel, cursor position in the above text area can be viewed under commandTracker/ caratPosition.

<img src="https://github.com/broadwayinc/wysiwyg4all/blob/main/figure%20for%20MD/wysiwyg/cursor position.PNG" style="zoom:50%;" />



## License

This project is licensed under the terms of the [MIT license](https://github.com/broadwayinc/colormangle/blob/main/LICENSE).

