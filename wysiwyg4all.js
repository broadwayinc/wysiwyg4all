import { ColorMangle } from "colormangle";
import { adjustSelection, nodeCrawler, climbUpToEldestParent } from "./selectors.js";
import { regexr, generateId } from "./util.js";
// Add debouncing for frequent operations like selection changes
class Wysiwyg4All {
  constructor(option) {
    let {
      elementId = "",
      editable = true,
      placeholder = "",
      spellcheck = false,
      highlightColor = "teal",
      html = "",
      callback,
      fontSize = {
        desktop: "18px",
        tablet: "16px",
        phone: "14px",

        h1: 4.2,
        h2: 3.56,
        h3: 2.92,
        h4: 2.28,
        h5: 1.64,
        h6: 1.15,
        small: 0.8,
      },
      lastLineBlank = false,
      hashtag = false,
      urllink = false,
      logMutation = false,
      logExecution = false,
    } = option;

    this.hashtag = hashtag;
    this.urllink = urllink;
    this.logMutation = logMutation;
    this.logExecution = logExecution;
    this.fontSizeCssVariable = {};

    if (typeof fontSize === "number")
      this.fontSizeCssVariable = {
        "--wysiwyg-font-desktop": `${fontSize}`,
        "--wysiwyg-font-tablet": `${fontSize}`,
        "--wysiwyg-font-phone": `${fontSize}`,
      };
    else if (typeof fontSize === "object" && Object.keys(fontSize).length) {
      let hold;
      let keyArr = ["desktop", "tablet", "phone"];

      for (let k of keyArr) {
        if (fontSize[k]) {
          hold = fontSize[k];
          if (typeof hold === "number") hold = `${hold}px`;
        }
        this.fontSizeCssVariable[`--wysiwyg-font-${k}`] = `${hold}`;
      }
    }

    if (!elementId || typeof elementId !== "string")
      throw new Error("The wysiwyg element should have an ID");
    elementId = elementId[0] === "#" ? elementId.substring(1) : elementId;

    this.html = html;
    this.elementId = elementId[0] === "#" ? elementId.substring(1) : elementId;
    this.placeholder = placeholder;
    this.spellcheck = spellcheck;
    this.lastLineBlank = lastLineBlank;

    if (typeof highlightColor === "string")
      highlightColor = new ColorMangle(highlightColor).color;

    this.colorScheme = highlightColor;
    this.callback = callback || null;

    this.image_array = [];
    this.hashtag_array = [];
    this.urllink_array = [];
    this.custom_array = [];

    this.blockElement_queryArray = [
      "HR",
      "BLOCKQUOTE",
      "UL",
      "OL",
      "._media_",
      "._custom_",
    ];
    this.specialTextElement_queryArray = ["._hashtag_", "._urllink_"];
    this.restrictedElement_queryArray = ["._media_", "._custom_"];
    this.textAreaElement_queryArray = ["BLOCKQUOTE", "LI"];
    this.textBlockElement_queryArray = ["P", "LI", "TD", "TH"]; //, "TD", "TH", '._color', '._small', '._h1`', '._h2', '._h3', '._h4', '._h5', '._h6', '._b', '._i', '._u', '._del'
    this.ceilingElement_queryArray = [
      "UL",
      "OL",
      "BLOCKQUOTE",
      `#${elementId}`,
      "TD",
      "TH",
    ];
    this.unSelectable_queryArray = [
      "._media_",
      "._custom_",
      "._hashtag_",
      "._urllink_",
      "HR",
    ];
    this.styleAllowedElement_queryArray = [
      "._color",
      `#${elementId}`,
      "._hashtag_",
      "._urllink_",
      "TD",
      "TH",
    ]; // ALLOWED ELEMENTS FOR STYLE ATTRIBUTE <... style="...">
    this.alignClass = ["_alignCenter_", "_alignRight_"];

    this.hashtag_flag = false;
    this.urllink_flag = false;
    this.range_backup = null;

    this.commandTracker = {};
    this.range = null;
    this.isRangeDirectionForward = true;
    this.insertTabPending_tabString = "";
    this.removeSandwichedLine_array = [];
    this.lastKey = null;

    //  setup div
    this.element = document.getElementById(this.elementId);
    if (!this.element) throw `element #${this.elementId} is null`;

    this.element.innerHTML = "";

    this.cssVariable = new ColorMangle().colorScheme(this.colorScheme);
    Object.assign(this.cssVariable, this.fontSizeCssVariable);

    for (const v in this.cssVariable)
      this.element.style.setProperty(v, this.cssVariable[v]);

    this.elementComputedStyle = window.getComputedStyle(this.element);
    this.defaultFontColor = new ColorMangle(
      this.cssVariable["--content-text"]
    ).hex();
    this.highlightColor = new ColorMangle(
      this.cssVariable["--content-focus"]
    ).hex();

    if (!this.element.classList.contains("_wysiwyg4all"))
      this.element.classList.add("_wysiwyg4all");

    this.setPlaceholder(this.placeholder);
    this.setSpellcheck(this.spellcheck);

    //  re-adjust min-height depending on padding
    let paddingB = this.elementComputedStyle.paddingBottom;
    let paddingT = this.elementComputedStyle.paddingTop;
    let borderT = this.elementComputedStyle.borderTopWidth;
    let borderB = this.elementComputedStyle.borderBottomWidth;

    this.element.style.minHeight = `calc(${paddingB} + ${paddingT} + ${borderT} + ${borderB} + 1.6em)`;

    //  command style tag
    const command = {
      //  [<targetClassName>, <cssProperty>, [<string: counter tag | class name>]]
      h1: ["_h1", "fontSize", ["_small", "_h2", "_h3", "_h4", "_h5", "_h6"]],
      h2: ["_h2", "fontSize", ["_small", "_h1", "_h3", "_h4", "_h5", "_h6"]],
      h3: ["_h3", "fontSize", ["_small", "_h1", "_h2", "_h4", "_h5", "_h6"]],
      h4: ["_h4", "fontSize", ["_small", "_h1", "_h2", "_h3", "_h5", "_h6"]],
      h5: ["_h5", "fontSize", ["_small", "_h1", "_h2", "_h3", "_h4", "_h6"]],
      h6: ["_h6", "fontSize", ["_small", "_h1", "_h2", "_h3", "_h4", "_h5"]],
      italic: ["_i", "fontStyle"],
      small: [
        "_small",
        "fontSize",
        ["_h1", "_h2", "_h3", "_h4", "_h5", "_h6", "_b"],
      ],
      bold: ["_b", "fontWeight", ["_small"]],
      underline: ["_u", "textDecoration", ["_del"]],
      strike: ["_del", "textDecoration", ["_u"]],
      color: ["_color", "color"],
    };

    const fontSizeRatio = {
      //  should always be the same em value as css
      h1: fontSize.h1 || 4.2,
      h2: fontSize.h2 || 3.56,
      h3: fontSize.h3 || 2.92,
      h4: fontSize.h4 || 2.28,
      h5: fontSize.h5 || 1.64,
      h6: fontSize.h6 || 1.15,
      small: fontSize.small || 0.8,
    };

    // // font size variables
    // --wysiwyg-h1: calc(var(--wysiwyg-font) * 4.2);
    // --wysiwyg-h2: calc(var(--wysiwyg-font) * 3.56);
    // --wysiwyg-h3: calc(var(--wysiwyg-font) * 2.92);
    // --wysiwyg-h4: calc(var(--wysiwyg-font) * 2.28);
    // --wysiwyg-h5: calc(var(--wysiwyg-font) * 1.64);
    // --wysiwyg-h6: calc(var(--wysiwyg-font) * 1.15);
    // --wysiwyg-small: calc(var(--wysiwyg-font) * 0.8);
    for (const [tag, ratio] of Object.entries(fontSizeRatio)) {
      if (typeof ratio === "number") {
        this.element.style.setProperty(
          `--wysiwyg-${tag}`,
          `calc(var(--wysiwyg-font) * ${ratio})`
        );
      } else if (typeof ratio === "string") {
        if (ratio.includes("px")) {
          this.element.style.setProperty(`--wysiwyg-${tag}`, ratio);
        } else if (ratio.includes("em") || ratio.includes("rem")) {
          let emSize = parseFloat(ratio);
          if (emSize > 0) {
            this.element.style.setProperty(
              `--wysiwyg-${tag}`,
              `calc(var(--wysiwyg-font) * ${emSize})`
            );
          }
        }
      }
    }

    this.styleTagOfCommand = {};
    this.counterTagOf = {};
    this.cssPropertyOf = {};
    this.cssPropertyChecker = {
      textDecoration: (v) => {
        //  v = <string: value from computedStyle>
        if (v.includes("underline")) return "underline";
        else if (v.includes("line-through")) return "strike";

        return false;
      },
      fontSize: (v) => {
        //  v = <string: value from computedStyle>
        let documentFontSize = parseFloat(this.elementComputedStyle.fontSize);
        let nodeFontSize = parseFloat(v);
        for (let tag in fontSizeRatio) {
          let f_size = fontSizeRatio[tag];

          if (typeof f_size === "number") {
            //  precision
            let compare_size = documentFontSize * f_size;
            let f_size_high = compare_size + 0.01;
            let f_size_low = compare_size - 0.01;
            if (f_size_high > nodeFontSize && f_size_low < nodeFontSize)
              return tag;
          } else if (typeof f_size === "string") {
            if (f_size.includes("px")) {
              if (v === f_size) return tag;
            } else if (f_size.includes("em") || f_size.includes("rem")) {
              let emSize = parseFloat(f_size);
              if (emSize > 0) {
                let compare_size = documentFontSize * emSize;
                let f_size_high = compare_size + 0.01;
                let f_size_low = compare_size - 0.01;
                if (f_size_high > nodeFontSize && f_size_low < nodeFontSize)
                  return tag;
              }
            }
          }
        }
        return false;
      },
      fontStyle: (v) => {
        //  v = <string: value from computedStyle>
        if (v.includes("italic")) return "italic";
        return false;
      },
    };

    for (let c in command) {
      this.commandTracker[c] = false;
      this.styleTagOfCommand[c] = command[c][0];
      this.cssPropertyOf[command[c][0]] = command[c][1];
      if (!this.cssPropertyChecker.hasOwnProperty(command[c][1]))
        this.cssPropertyChecker[command[c][1]] = c;
      if (command[c][2]) this.counterTagOf[command[c][0]] = command[c][2];
    }

    /**
         this.styleTagOfCommand = {
            [commandKey]: <targetClassName>
         };

         this.cssPropertyChecker = {
            [cssPropertyKey]: <commandKey | function(<cssValue>)>
         };

         this.cssPropertyOf = {
            [targetClassName]: <cssPropertyKey>
         };

         this.counterTagOf = {
            [targetClassName]: [<counterClassName>]
         };

         this.commandTracker = {
            [commandKey]: <boolean>
         };

         console.log({
            styleTagOfCommand: this.styleTagOfCommand,
            cssPropertyChecker: this.cssPropertyChecker,
            cssPropertyOf: this.cssPropertyOf,
            counterTagOf: this.counterTagOf,
            commandTracker: this.commandTracker
         });
         */

    this.loadHTML(this.html, editable).catch((err) => {
      throw err;
    });
  }

  _wrapNode(node, wrapper, appendWhole = false) {
    if (this.logExecution)
      console.log("_wrapNode()", { node, wrapper, appendWhole });
    if (!(node instanceof Node)) return;

    if (!node.parentNode) throw new Error("can't unwrap document fragment");

    // save current range
    let sel = window.getSelection();
    let range = sel.getRangeAt(0);
    let start = null;
    let startOffset = range.startOffset;
    let end = null;
    let endOffset = range.endOffset;

    const withinRange = (n) => {
      if (range.startContainer === n) {
        start = n;
      }
      if (range.endContainer === n) {
        end = n;
      }
    };

    if (node.nodeType === 1) {
      nodeCrawler(
        (n) => {
          withinRange(n);
          return n;
        },
        { node }
      );
    } else withinRange(node);

    if (wrapper) {
      // place the wrapper
      node.parentNode.insertBefore(wrapper, node);
    }

    // append node
    if (node.nodeType === 3) {
      if (wrapper) wrapper.append(node);
      else throw new Error("no wrapper for text content");
    } else if (appendWhole) wrapper.append(node);
    else
      while (node.childNodes[0]) {
        let child = node.childNodes[0];
        if (wrapper) wrapper.append(child);
        else node.parentNode.insertBefore(child, node);
      }

    let stripped;
    if (node.nodeType === 1 && !appendWhole) {
      let n = wrapper || node;
      let p = n.parentNode;
      stripped = node.previousSibling;
      p.removeChild(node);
    }

    // restore range
    if ((stripped || node).textContent && (start || end)) {
      if (start && start === end && startOffset === endOffset)
        range = adjustSelection({
          node: stripped || node,
          position: startOffset,
        }, this.ceilingElement_queryArray);
      else
        range = adjustSelection({
          node: [start, end],
          position: [startOffset, endOffset],
        }, this.ceilingElement_queryArray);
    }

    this.range = range;
    return { node: stripped || node, range };
  }

  _getStartEndLine(
    range = this.range,
    element = this.element,
    getInbetween = false
  ) {
    if (this.logExecution)
      console.log("_getStartEndLine()", { range, element });
    if (!range) return [null, null, null];

    let startLine = climbUpToEldestParent(range.startContainer, element);
    let endLine = climbUpToEldestParent(range.endContainer, element);

    let inBetween = [];
    if (getInbetween) {
      // collect all the lines in between startLine and endLine. line is a block element
      let currentLine = startLine.nextSibling;
      while (currentLine && currentLine !== endLine) {
        if (
          currentLine.nodeType === 1 &&
          this.blockElement_queryArray.some((q) =>
            currentLine.matches(this._classNameToQuery(q))
          )
        ) {
          inBetween.push(currentLine);
        }
        currentLine = currentLine.nextSibling;
      }
    }

    return [startLine, endLine, inBetween];
  }

  _isThereContentEditableOverMyHead(node, element = this.element) {
    if (node && node !== this.element) {
      let flyup = node;
      while (flyup && this.element !== flyup) {
        if (flyup.getAttribute("contenteditable") === "true") return true;

        flyup = flyup.parentNode;
      }
    }
    return false;
  }

  // Add browser-specific normalization
  _normalizeBrowserQuirks() {
    // Handle Firefox's extra <br> tags
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      nodeCrawler((node) => {
        if (node.nodeName === 'BR' &&
          (!node.nextSibling || node.nextSibling.nodeName === 'BR')) {
          node.remove();
        }
        return node;
      }, { node: this.element });
    }

    // Handle Safari's selection quirks
    if (navigator.userAgent.toLowerCase().indexOf('safari') > -1) {
      // Safari-specific fixes
    }
  }

  _isSelectionTrespassRestrictedRange(
    range = this.range,
    element = this.element
  ) {
    if (!range) {
      if (this.logExecution)
        console.log("_isSelectionTrespassRestrictedRange():true", {
          range,
          element,
        });
      return true;
    }

    let { commonAncestorContainer, startContainer, endContainer, startLine, endLine, inBetween } = range;
    let restrict = this.restrictedElement_queryArray;

    if (startLine === endLine) {
      commonAncestorContainer =
        commonAncestorContainer.nodeType === 3
          ? commonAncestorContainer.parentNode
          : commonAncestorContainer;
      for (let r of restrict) {
        let cl = commonAncestorContainer.closest(this._classNameToQuery(r));
        if (cl) {
          let isThere = this._isThereContentEditableOverMyHead(
            commonAncestorContainer,
            element
          );
          if (!isThere) {
            return true;
          }
        }
      }
    } else if (inBetween?.length) {
      for (let i = 0; i < inBetween.length; i++) {
        for (let r of restrict) {
          if (inBetween[i].closest(this._classNameToQuery(r))) {
            let isThere = this._isThereContentEditableOverMyHead(inBetween[i]);
            if (!isThere) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  _classNameToQuery(q) {
    if (this.logExecution) console.log("_classNameToQuery()", { q });
    if (q.includes("_stop") && q[0] !== ".") return "." + q;
    return q[0] === "_" ? "." + q : q;
  }

  _createEmptyParagraph(append) {
    if (this.logExecution) console.log("_createEmptyParagraph()", { append });
    let p = document.createElement("p");

    if (append && typeof append === "string")
      append = document.createTextNode(append);

    p.append(append || document.createTextNode(""));

    if (!append) p.append(document.createElement("br"));

    return p;
  }

  _trackStyle(n, cls) {
    if (this.logExecution) console.log("_trackStyle()", { n, cls });
    let commandTracker = {};
    let style = window.getComputedStyle(n);

    for (let c of this.alignClass) {
      if (n.closest("." + c))
        commandTracker[c.substring(1, c.length - 1)] = true;
    }

    let checker = (sp) => {
      let key = this.cssPropertyChecker[sp];
      if (typeof key === "function") {
        key = key(style[sp]);
        if (key) {
          if (cls) return key;
          commandTracker[key] = true;
        }
      } else if (sp === "color" && style[sp]) {
        let col =
          style[sp][0] === "#" ? style[sp] : new ColorMangle(style[sp]).hex();

        if (col !== this.defaultFontColor) {
          if (cls) return col;
          commandTracker[key] = col;
        }
      } else if (
        style[sp] !== this.elementComputedStyle[sp] &&
        this._isTextElement(n)
      ) {
        if (cls) return true;
        commandTracker[key] = true;
      }
      return false;
    };

    if (cls) return checker(this.cssPropertyOf[cls.toLowerCase()]);

    for (let sp in this.cssPropertyChecker) {
      checker(sp);
    }

    return commandTracker;
  }

  _lastLineBlank(force) {
    if (this.logExecution) console.log("_lastLineBlank()", { force });
    if (this.lastLineBlank || force) {
      let lastLine = this.element.lastChild;
      if (
        lastLine.nodeName !== "P" ||
        (lastLine.nodeName === "P" &&
          lastLine.textContent &&
          lastLine.textContent !== "\u200B")
      ) {
        this.element.append(this._createEmptyParagraph());
      }
    }
  }

  _selectionchange = () => {
    let sel = window.getSelection();

    let anchorElement =
      sel.anchorNode?.nodeType === 3
        ? sel.anchorNode.parentNode
        : sel.anchorNode;

    let focusElement =
      sel.focusNode?.nodeType === 3
        ? sel.focusNode.parentNode
        : sel.focusNode;

    if (anchorElement.closest(`#${this.elementId}`) && focusElement.closest(`#${this.elementId}`)) {
      let lastChild = this.element.lastChild;
      if (!lastChild) {
        // Wysiwyg is empty
        lastChild = this._createEmptyParagraph();
        this.element.appendChild(lastChild);

        // Adjust selection
        this.range = adjustSelection({
          node: lastChild,
          position: true,
        }, this.ceilingElement_queryArray);
      }
      else {
        this.range = adjustSelection(null);
      }
    }
    else {
      this.range = null;
      this.commandTracker = {};
      return;
    }

    //  track commandTracker
    let commandTracker = {};
    for (let style in this.styleTagOfCommand) {
      commandTracker[style] = false;
    }

    let [startLine, endLine, inBetween] = this._getStartEndLine(
      this.range,
      this.element,
      true
    );
    this.range.startLine = startLine;
    this.range.endLine = endLine;
    this.range.inBetween = inBetween;

    let restricted = this.restrictedElement_queryArray.concat(
      this.specialTextElement_queryArray
    );

    let crawlResult = nodeCrawler(
      (node) => {
        if (
          (node.nodeType === 1 && node.closest("blockquote")) ||
          (node.nodeType === 3 && node.parentNode.closest("blockquote"))
        )
          commandTracker.quote = true;


        for (let c of restricted) {
          if (node.nodeType === 3
            ? node.parentNode.closest(c)
            : node.nodeType === 1
              ? node.closest(c)
              : !(node instanceof Node)) {
            return node;
          }
        }

        if (
          node.nodeType === 3 ||
          node.nodeName === "BR" ||
          (node.nodeType === 1 &&
            node.childNodes.length === 1 &&
            (node.childNodes[0].nodeName === "BR" ||
              node.childNodes[0].nodeType === 3))
        ) {
          let n =
            node.nodeType === 3 || node.nodeName === "BR"
              ? node.parentNode
              : node;

          let comm = this._trackStyle(n);
          for (let c in comm) commandTracker[c] = comm[c];
        }
        return node;
      },
      { node: this.range, parentNode: this.element }
    );

    if (!crawlResult.node.length) {
      let comm = this._trackStyle(this.range.startContainer);
      for (let c in comm) commandTracker[c] = comm[c];
    }

    this.commandTracker = commandTracker;
    let caratPosition;
    let caratEl = this.range.endContainer || this.range.startContainer;

    if (caratEl.nodeType === 3)
      caratPosition = this.range.getBoundingClientRect();
    else if (caratEl.nodeType === 1)
      caratPosition = caratEl.getBoundingClientRect();

    this._callback({
      commandTracker,
      range: this.range,
      caratPosition,
    }).catch((err) => console.error(err));
    this._lastLineBlank();
  }

  _setEventListener(listen) {
    if (this.logExecution) console.log("_setEventListener()", { listen });
    /**
     * keydown -> observer(dom change) -> selection change -> click | keyup
     */

    document.removeEventListener("selectionchange", this._selectionchange);
    this.imgInput = null;
    if (this.element) {
      this.element.removeEventListener("keydown", this._keydown);
      this.element.removeEventListener("mousedown", this._normalize);
      window.removeEventListener("mousedown", this._normalize);
      this.element.removeEventListener("paste", this._paste);
      this.element.removeEventListener("keyup", this._keyup);
    }

    if (!listen) return;

    //  image selector
    let imgInput = document.createElement("input");
    for (const [key, value] of Object.entries({
      id: generateId("imageInput"),
      type: "file",
      accept: "image/gif,image/png,image/jpeg,image/webp",
      hidden: true,
      multiple: true,
    })) {
      imgInput.setAttribute(key, value);
    }

    this.imgInput = imgInput;
    this.imgInput.addEventListener("change", (e) => {
      this._imageSelected(e).catch((err) => {
        console.error(err);
      });
    });

    this._keydown = function (e) {
      // if (this._isSelectionTrespassRestrictedRange()) {
      //   e.preventDefault();
      //   return;
      // };

      if (!this.range) return;
      let { startContainer, startOffset, collapsed, startLine, endLine, inBetween } =
        this.range;

      let key = e.key.toUpperCase();
      let shift = e.shiftKey;

      this.lastKey = key;

      if (key === "ENTER" && e.shiftKey) {
        // prevent shift+enter
        if (!this.range.endLine.closest("LI")) e.preventDefault();
        return;
      }

      // delete key
      if (["BACKSPACE", "DELETE"].includes(key)) {
        if (
          (!this.element.textContent &&
            this.element.childNodes.length <= 1 &&
            this._isTextElement(this.element.childNodes[0]) &&
            this.element.childNodes[0] === startLine)
          ||
          this.element.childNodes.length === 0
        ) {
          if (this.logExecution) console.log("nothing to delete");
          // there is nothing to delete
          e.preventDefault();
          return;
        }

        if (startLine === this.element || endLine === this.element) {
          e.preventDefault();
          return;
        }

        let stc = this.range.startContainer;
        if (this.range.collapsed) {
          if (this.logExecution) console.log("range is collapsed");
          let block = (stc.nodeType === 3 ? stc.parentNode : stc).closest(
            "blockquote"
          );
          if (
            block &&
            block.childNodes[0] === climbUpToEldestParent(stc, block) &&
            this.range.startOffset === 0
          ) {
            // if the block is empty and the cursor is on the first offset position within the blockquote
            // cursor is on the first offset position within the blockquote

            if (this.logExecution)
              console.log(
                "block is empty and the cursor is on the first offset position within the blockquote"
              );
            e.preventDefault();

            this.command("quote");
            return;
          }

          if (this.range.startOffset === 0 || this.range.startOffset === 1 && (stc.textContent[0] === "\u200B" || stc.textContent.length === 0)) {
            let prevsib = this.range.startLine.previousSibling;
            for (let cl of this.unSelectable_queryArray) {
              // check if startLine element has a class name cl
              // if cl starts with . then it's a class name
              if (cl[0] === ".") {
                cl = cl.substring(1);
                if (prevsib && prevsib.classList.contains(cl))
                  prevsib.remove();
              }
              else {
                if (prevsib && prevsib.tagName === cl)
                  prevsib.remove();
              }
            }
          }
        }
        if (startLine !== endLine) {
          for (let cl of this.unSelectable_queryArray) {
            // check if startLine element has a class name cl
            // if cl starts with . then it's a class name
            if (cl[0] === ".") {
              cl = cl.substring(1);
              if (startLine.classList.contains(cl))
                startLine.remove();
              if (endLine.classList.contains(cl))
                endLine.remove();
            }
            else {
              if (startLine.tagName === cl)
                startLine.remove();
              if (endLine.tagName === cl)
                endLine.remove();
            }
          }
        }
        return;
      }

      //  hashtag flag
      if (key === "#" && !this.hashtag_flag) {
        this.hashtag_flag = true;
        return;
      }

      //  url flag
      if ([":", "/", "."].includes(key) && !this.urllink_flag) {
        this.urllink_flag = true;
        return;
      }

      // insert hashtag | urllink
      if (
        (this.hashtag_flag || this.urllink_flag) &&
        ([" ", "ENTER", "TAB"].includes(key) || key.includes("ARROW"))
      ) {
        this._replaceText();
        // return;
      }

      if (key === "TAB") {
        e.preventDefault();
        let sweep_array = [];

        if (!collapsed) {
          let sweep = startLine;
          while (sweep && sweep !== endLine) {
            sweep_array.push(sweep);
            sweep = sweep.nextSibling;
          }
          sweep_array.push(endLine);
        }

        if (shift) {
          // delete indent
          let hasIndent = false;
          let diveAndRemoveTab = (n) => {
            while (n.childNodes[0]) {
              n = n.childNodes[0];

              while (n.nodeType === 3 && !n.textContent) n = n.nextSibling;

              if (n.nodeType === 3 && n.textContent[0] === "\t") {
                hasIndent = true;
                n.textContent = n.textContent.substring(1);
                break;
              }
            }
          };
          if (sweep_array.length) {
            for (let n of sweep_array) {
              if (n.textContent[0] === "\t") diveAndRemoveTab(n);
            }
            if (hasIndent)
              adjustSelection({
                node: [startLine, endLine],
                position: [true, false],
              }, this.ceilingElement_queryArray);
          } else if (startLine.textContent[0] === "\t") {
            let lineOffset = (line, container, containerOffset) => {
              if (line === container) return containerOffset;

              nodeCrawler(
                (n) => {
                  if (container === n) return "BREAK";

                  if (n.nodeType === 3 && n.textContent.length)
                    containerOffset += n.textContent.length;

                  return n;
                },
                { node: line }
              );
              return containerOffset;
            };

            let offset =
              lineOffset(startLine, startContainer, startOffset) - 1;
            offset = offset < 0 ? 0 : offset;

            diveAndRemoveTab(startLine);
            if (hasIndent)
              adjustSelection({ node: startLine, position: offset }, this.ceilingElement_queryArray);
          }
        } else {
          // indent
          if (sweep_array.length) {
            let hasIndent = false;
            for (let n of sweep_array) {
              hasIndent = true;
              let tab = document.createTextNode("\t");
              n.insertBefore(tab, n.childNodes[0]);
            }
            if (hasIndent)
              adjustSelection({
                node: [startLine, endLine],
                position: [true, false],
              }, this.ceilingElement_queryArray);
          } else {
            let tab = document.createTextNode("\t");
            this.range.insertNode(tab);
            adjustSelection({ node: tab, position: false }, this.ceilingElement_queryArray);
          }
        }
        return;
      }

      if (key === "ENTER") {
        //  remove zero space
        if (
          collapsed &&
          (startContainer.textContent.includes("\u200B") ||
            !startContainer.textContent)
        ) {
          nodeCrawler(
            (n) => {
              if (
                n.nodeType === 3 &&
                (n.textContent === "\u200B" || !n.textContent)
              ) {
                n.remove();
              }

              return n;
            },
            {
              node:
                startContainer.nodeType === 3
                  ? startContainer.parentNode
                  : startContainer,
            }
          );
        }

        if (endLine.textContent[0] === "\t") {
          for (let s of endLine.textContent) {
            if (s === "\t") this.insertTabPending_tabString += "\t";
            else break;
          }
        }
      }
    }.bind(this);

    this._normalize = function (e) {

      e.stopPropagation();
      // if (this._isSelectionTrespassRestrictedRange()) return;
      this.restoreLastSelection();
      this._normalizeDocument();
      // this.range_backup = this.range.cloneRange();
      this._replaceText(true);
    }.bind(this);

    this._backupSelection = function (e) { 
      // e.stopPropagation();
      if (this.logExecution) console.log("_backupSelection()");
      if (this.range) {
        this.range_backup = this.range.cloneRange();
      }
    }

    this._paste = function (e) {
      e.preventDefault();
      if (this._isSelectionTrespassRestrictedRange()) return;
      if (this.range) {
        if (this._isSelectionTrespassRestrictedRange()) return;
        let doc = document.createDocumentFragment();
        doc.textContent = e.clipboardData
          .getData("text/plain")
          .replace(/\n\n/g, "\n");

        if (doc.textContent.includes("#")) {
          this.hashtag_flag = true;
        }

        //  url flag
        for (let u of [":", "/", "."]) {
          doc.textContent.includes(u);
          this.urllink_flag = true;
        }

        if (!this.range.collapsed) this.range.extractContents();
        this.range.insertNode(doc);
      }
    }.bind(this);
    this._keyup = function () {
      if (this.removeSandwichedLine_array.length)
        while (this.removeSandwichedLine_array.length)
          this.removeSandwichedLine_array.pop().remove();
    }.bind(this);

    document.addEventListener("selectionchange", this._selectionchange);
    this.element.addEventListener("keydown", this._keydown);
    this.element.addEventListener("mouseup", this._normalize);
    // this.element.addEventListener('blur', this._normalize);
    // fuck safari, firefox
    window.addEventListener("mousedown", this._backupSelection);
    this.element.addEventListener("paste", this._paste);
    this.element.addEventListener("keyup", this._keyup);
  }

  // Current code doesn't properly clean up event listeners
  destroy() {
    this.observer.disconnect();
    document.removeEventListener("selectionchange", this._selectionchange);
    this.element.removeEventListener("keydown", this._keydown);
    this.element.removeEventListener("mouseup", this._normalize);
    window.removeEventListener("mousedown", this._backupSelection);
    this.element.removeEventListener("paste", this._paste);
    this.element.removeEventListener("keyup", this._keyup);
  }

  _observeMutation(track) {
    if (this.observer) this.observer.disconnect();

    this.observer = null;

    if (!track) return;

    this._elementRemovalObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
          if (removedNode === this.element) {
            // Element was removed from DOM
            if (this.logExecution) console.log("wysiwyg element removed from DOM");
            this.destroy(); // Clean up listeners, observers, etc.
            // Optionally, emit a callback or event here
          }
        }
      }
    });

    this._elementRemovalObserver.observe(this.element.parentNode, {
      childList: true,
    });

    this.observer = new MutationObserver((mutation_array) => {
      if (this.logMutation) {
        let monitor = mutation_array.map((m) => {
          return {
            target: m.target.cloneNode(true),
            type: m.type,
            name: m.attributeName,
            added: (() => {
              let clones = [];
              for (let a of m.addedNodes) {
                if (a.nodeType === 3) clones.push(a.textContent);
                else clones.push(a.cloneNode(true));
              }
              return clones;
            })(),
            removed: (() => {
              let clones = [];
              for (let r of m.removedNodes) {
                if (r.nodeType === 3) clones.push(r.textContent);
                else clones.push(r.cloneNode(true));
              }
              return clones;
            })(),
          };
        });

        let mutate = [];
        for (let m of monitor) {
          if (m.type === "childList" || m.attributeName === "class")
            mutate.push(m);
        }

        if (mutate.length)
          this._callback({ mutation: mutate }).catch((err) => err);
      }

      for (const mutation of mutation_array) {
        /** changes in attributes */
        if (mutation.type === "attributes") {
          const { target, attributeName } = mutation;
          if (attributeName === "class") {
            if (
              target.parentNode &&
              !target.classList.length &&
              !(
                this._isTextBlockElement(target) ||
                this._isBlockElement(target) ||
                target.nodeName === "P"
              )
            ) {
              // this._unwrapElement(target);
              this._wrapNode(target);
            }
            if (!target.classList.length) target.removeAttribute("class");
          }
          //  prevent style attributes
          if (attributeName === "style" && !this._isStyleAllowedElement(target))
            target.removeAttribute("style");
          continue;
        }

        /** changes in node */
        if (mutation.type === "childList") {
          let mutationTarget = mutation.target;

          /** removed nodes */
          if (mutation.removedNodes.length) {
            for (let m of mutation.removedNodes) {
              /**
               *  CAUTION!
               *  changing the order of if statements below can lead to critical flaw
               *  _custom_ class should always be checked after _urllink_ and _hashtag_
               */

              let callbackRemoved = (what, m) => {
                if (!m.id) return;

                let arrIdx = this[`${what}_array`].length;
                let removed;

                while (arrIdx--) {
                  let got = this[`${what}_array`][arrIdx];
                  if (got.elementId === m.id) {
                    removed = this[`${what}_array`].splice(arrIdx, 1);
                    break;
                  }
                }

                if (removed) {
                  this._callback({ removed: { [what]: removed } });
                }
              };

              if (m?.classList?.contains("_media_")) {
                // let child = m.childNodes;
                // let childIdx = child.length;
                // while (childIdx--) {
                // let c = child[childIdx];

                // switch (c.nodeName) {
                switch (m.nodeName) {
                  case "IMG":
                    // callbackRemoved("image", c);
                    callbackRemoved("image", m);
                    break;
                }
                // }
                continue;
              }

              let toBreak = false;
              for (let t of ["hashtag", "urllink", "custom"]) {
                if (m?.id?.includes(t)) {
                  callbackRemoved(t, m);
                  toBreak = true;
                  break;
                }
              }

              toBreak = false;

              if (
                this._isCeilingElement(mutationTarget) &&
                (() => {
                  let idx = mutationTarget.childNodes.length;
                  if (idx)
                    while (idx--) {
                      let node = mutationTarget.childNodes[idx];
                      if (node.nodeType === 1 || node.textContent) {
                        return false;
                      }
                    }
                  return true;
                })()
              ) {
                mutationTarget.remove();
                continue;
              }

              if (
                this._isTextBlockElement(mutationTarget) &&
                mutationTarget.childNodes.length === 1 &&
                this._isUnSelectableElement(mutationTarget.childNodes[0])
              )
                mutationTarget.append(document.createTextNode(""));
            }
          }

          /** added nodes */
          if (mutation.addedNodes.length)
            for (let i of mutation.addedNodes) {
              let getBr = (n) => {
                let idx = n?.childNodes?.length;
                let br = [];
                while (idx--) {
                  let c = n.childNodes[idx];
                  if (c.nodeName === "BR") br.push(c);
                }
                return br;
              };

              if (i.nodeType === 3) {
                // wrap all eldest text node
                if (this._isCeilingElement(mutationTarget))
                  this._wrapNode(i, document.createElement("p"));
                // remove <br> when there is text
                else if (i.textContent && i.textContent !== "\u200B") {
                  // prevent br added to line
                  let br = getBr(mutationTarget);
                  if (br.length) for (let b of br) b.remove();
                }

                continue;
              }

              if (i.nodeType === 1) {
                if (i.childNodes.length > 0 && i.firstChild.tagName !== "BR") {
                  let br = getBr(mutationTarget);
                  if (br.length) for (let b of br) b.remove();
                }

                let node = (() => {
                  let isWysiwygChild =
                    i.closest(`#${this.elementId}`) && i.id !== this.elementId;
                  let isWysiwygEldestChild = (() => {
                    if (!isWysiwygChild) return false;

                    return this._isCeilingElement(mutationTarget);
                  })();

                  let ceiling = (() => {
                    for (let c of this.ceilingElement_queryArray) {
                      let clo = i.closest(c);
                      if (clo) return clo;
                    }
                    return null;
                  })();

                  let line = isWysiwygEldestChild
                    ? i
                    : isWysiwygChild &&
                    (() => {
                      let m = i;
                      while (m && !this._isCeilingElement(m.parentNode)) {
                        m = m.parentNode;
                      }
                      return m;
                    })();

                  return {
                    isWysiwygChild,
                    isWysiwygEldestChild,
                    isMediaElement: i.closest("._media_"),
                    isBlockQuoteElement: i.closest("blockquote"),
                    isCustomElement: i.closest("._custom_"),
                    isHashtagElement: i.closest("._hashtag_"),
                    isUrlLinkElement: i.closest("._urllink_"),
                    ceiling,
                    line,
                  };
                })();

                if (!node.isWysiwygChild) continue; // bypass

                if (
                  node.isCustomElement ||
                  node.isMediaElement ||
                  node.isHashtagElement ||
                  node.isUrlLinkElement
                ) {
                  // make sure un-editable element is secure
                  let el =
                    node.isCustomElement ||
                    node.isMediaElement ||
                    node.isHashtagElement ||
                    node.isUrlLinkElement;

                  // check if el has a value of contenteditable
                  if (el.getAttribute("contenteditable") !== "true")
                    el.setAttribute("contenteditable", "false");

                  continue;
                }

                if (
                  !(
                    node.isWysiwygEldestChild &&
                    (this._isBlockElement(i) || this._isTextBlockElement(i))
                  ) &&
                  i.nodeName !== "BR" &&
                  !i.classList.length
                ) {
                  // unwrap anything that does not have class and is not block level text
                  this._wrapNode(i);
                  continue;
                }

                if (
                  (() => {
                    if (this._isStyleAllowedElement(i)) return false;

                    for (let sa of this.restrictedElement_queryArray) {
                      if (i.closest(sa)) return false;
                    }

                    return true;
                  })()
                )
                  //  remove style attribute if not allowed
                  i.removeAttribute("style");

                if (
                  node.isWysiwygEldestChild &&
                  !(this._isBlockElement(i) || this._isTextBlockElement(i))
                ) {
                  //  wrap eldest non text block element to p
                  if (i.nodeName === "BR") i.remove();
                  else this._wrapNode(i, document.createElement("p"), true);
                  continue;
                }

                if (
                  mutationTarget.textContent &&
                  mutationTarget.textContent !== "\u200B"
                ) {
                  // prevent br added to line
                  let br = getBr(mutationTarget);
                  let doContinue = false;
                  if (br.length)
                    for (let b of br) {
                      if (b === i) doContinue = true;
                      b.remove();
                    }
                  if (doContinue) continue;
                }

                if (node.isWysiwygEldestChild && !this._isCeilingElement(i)) {
                  // add tab on new line created by pressing enter
                  if (this.insertTabPending_tabString) {
                    let tab = document.createTextNode(
                      this.insertTabPending_tabString
                    );
                    node.line.insertBefore(tab, node.line.childNodes[0]);
                    this.insertTabPending_tabString = "";
                    adjustSelection({ node: tab, position: false }, this.ceilingElement_queryArray);
                  }

                  // if empty text block is added add br
                  if (
                    !node.line.textContent ||
                    node.line.textContent === "\u200B"
                  ) {
                    let addBr = true;
                    nodeCrawler(
                      (n) => {
                        if (n.nodeName === "BR") {
                          addBr = false;
                          return "BREAK";
                        }
                        return n;
                      },
                      { node: node.line }
                    );

                    if (addBr) node.line.append(document.createElement("br"));
                  }

                  continue;
                }

                let classSet = (c) => {
                  let counter = this.counterTagOf[c] || [];

                  if (counter.length)
                    counter = counter.concat(
                      counter.map((m) => {
                        return m + "_stop";
                      })
                    );

                  return [
                    c,
                    c.includes("_stop") ? c.replace("_stop", "") : c + "_stop",
                  ].concat(counter);
                };

                let toUnwrap = [];

                if (i.classList.length) {
                  climbUpToEldestParent(i, node.ceiling, true, (n) => {
                    let cIdx = i.classList.length;
                    while (cIdx--) {
                      if (
                        (() => {
                          let set = classSet(i.classList[cIdx]);
                          for (let s of set) {
                            if (n.classList.contains(s)) return true;
                          }
                          return false;
                        })()
                      )
                        toUnwrap.push(n);
                    }

                    return n;
                  });
                }

                let idx = toUnwrap.length;

                while (idx--) {
                  // unwrap unnecessary counter parents
                  this._wrapNode(toUnwrap[idx]);
                }

                let class_idx = i.classList.length;
                while (class_idx--) {
                  let className = i.classList[class_idx];
                  let curSt = this._trackStyle(
                    i,
                    className.replace("_stop", "")
                  );
                  let parSt = this._trackStyle(
                    i.parentNode,
                    className.replace("_stop", "")
                  );

                  if (curSt === parSt)
                    // remove style class if parent shares the same style
                    i.classList.remove(className);
                }

                if (!i.classList.length) {
                  // remove style attribute if there is no class
                  i.removeAttribute("class");
                }

                if (
                  this._isTextBlockElement(mutationTarget) &&
                  mutationTarget.childNodes.length === 1 &&
                  this._isUnSelectableElement(mutationTarget.childNodes[0])
                )
                  mutationTarget.append(document.createTextNode(""));
              }
            }
        }
      }
    });
    this.observer.observe(this.element, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  _append(i, insertAfter, wrap = false, focusElement) {
    if (this.logExecution)
      console.log("_append", { i, insertAfter, wrap, focusElement });

    if (!this.range) {
      this.restoreLastSelection();
      if (!this.range) return;
    }

    let common = climbUpToEldestParent(
      this.range.commonAncestorContainer,
      this.element
    );
    let startLine = this.range.startLine;
    let endLine = this.range.endLine;
    let insertRestricted = ["HR", "UL", "LI"]; //["HR", "UL", "LI", "._media_", "._custom_"];

    let append = (node) => {
      if (node === this.element)
        node = this.element.childNodes[this.element.childNodes.length - 1];

      let next = node.nextSibling;
      if (insertAfter) node.parentNode.insertBefore(insertAfter, next);

      node.parentNode.insertBefore(i, insertAfter || next);
      if (
        this._isTextElement(node) &&
        !node.textContent &&
        this.element.lastChild !== node
      )
        node.remove();
    };

    if (wrap) {
      let nodeToUnwrap = {};
      let restricted = false;

      let checker = (tag, el) => {
        if (
          el &&
          (!nodeToUnwrap[tag] ||
            (() => {
              for (let u in nodeToUnwrap) {
                if (nodeToUnwrap[u] === el) return false;
              }
              return true;
            })())
        )
          nodeToUnwrap[tag] = el;
      };

      if (this.range.collapsed) {
        checker(i.nodeName, startLine.closest(i.nodeName));

        let idx = i.classList.length;
        while (idx--) {
          let className = i.classList[idx];
          checker(className, startLine.closest("." + className));
        }
      } else
        nodeCrawler(
          (n) => {
            let chk = n.nodeType === 3 ? n.parentNode : n;
            if (chk.nodeType !== 1) {
              restricted = true;
              return "BREAK";
            }

            if (n.nodeType === 1) {
              for (let notAllowed of insertRestricted)
                if (n.nodeName === notAllowed || n.closest(notAllowed)) {
                  restricted = true;
                  return "BREAK";
                }
            }

            checker(i.nodeName, chk.closest(i.nodeName));

            let idx = i.classList.length;
            while (idx--) {
              let className = i.classList[idx];
              checker(className, chk.closest("." + className));
            }

            if (n === this.range.endContainer) return "BREAK";

            return n;
          },
          { node: common, startNode: this.range.startContainer }
        );

      if (restricted) return;

      if (Object.keys(nodeToUnwrap).length) {
        for (let u in nodeToUnwrap) this._wrapNode(nodeToUnwrap[u]);
      } else {
        append(endLine);

        let extract = this.range.extractContents();

        if (extract.childNodes[0]) {
          while (extract.childNodes[0]) {
            let t = extract.childNodes[0];
            if (!t.textContent) t.remove();
            else i.append(t);
          }
        } else i.append(this._createEmptyParagraph());

        this.range = adjustSelection({
          node: focusElement || i,
          position: false,
        }, this.ceilingElement_queryArray);

        let fc = i.previousSibling;

        if (fc) {
          fc = fc.nodeType === 3 ? fc.parentNode : fc;

          if (
            this._isTextElement(fc) &&
            (!fc.textContent || fc.textContent === "\u200B")
          )
            fc.remove();
        }
      }

      return;
    }

    for (let r of insertRestricted) {
      if (endLine.closest(r)) endLine = endLine.closest(r);
    }

    append(endLine);

    if (insertAfter)
      this.range = adjustSelection({ node: focusElement || insertAfter }, this.ceilingElement_queryArray);
  }

  async _callback(data) {
    if (typeof this.callback === "function") {
      let cb = this.callback(data) || data;
      if (cb instanceof Promise) {
        cb = await cb;
      }
      return cb || data;
    }
    return data;
  }

  async _imageSelected(e) {
    if (this.logExecution) console.log("_imageSelected", { e });
    let files = e.target.files;

    const prepareForCallback = { image: [] };
    let readFile = new FileReader();

    const load = (file) => {
      return new Promise((res) => {
        readFile.onload = (f) => {
          const { lastModified, name, size, type } = file;
          const source = f.target.result;

          let img = new Image();
          img.onload = () => {
            res({
              dimension: {
                width: img.width,
                height: img.height,
              },
              lastModified,
              filename: name,
              fileSize: size,
              fileType: type,
              source,
              elementId: generateId("img"),
            });
          };
          img.src = source;
        };
        readFile.readAsDataURL(file);
      });
    };

    this.callback({ loading: true });
    for (let idx = 0; files.length > idx; idx++) {
      prepareForCallback.image[idx] = await load(files[idx]);
    }
    this.callback({ loading: false });

    //  reset image input
    this.imgInput.value = "";

    let feedback = await this._callback(prepareForCallback);

    if (!this.range) {
      this.restoreLastSelection();
    }

    if (
      !this.range ||
      (() => {
        let c = this.range.commonAncestorContainer;
        c = c.nodeType === 3 ? c.parentNode : c;
        return !c.closest("#" + this.elementId);
      })()
    )
      this.element.focus();

    if (!this.range) return;

    if (feedback.image.length === 0) return;

    // reverse the order of images
    feedback.image.reverse();
    let lasttxt = this._createEmptyParagraph();
    this.element.insertBefore(lasttxt, this.range.endLine.nextSibling);
    for (let i = 0; i < feedback.image.length; i++) {
      let img = feedback.image[i];
      let media = this._loadImage(img);
      this.range.insertNode(media);
      if (i === feedback.image.length - 1) {
        this.range = adjustSelection({ node: lasttxt, position: true }, this.ceilingElement_queryArray);
      }
    }

    this.setSafeLine();
  }

  _loadImage(i) {
    /**
         elementId: "img_uniqueId"
         element: HTML
         fileSize: 0
         fileType: "image/jpeg"
         source: "file.jpg | http://url.com/file.jpg | s3 filename | base 64 string"
         lastModified: 0000000000000
         filename: "selectedLocalFilename.jpg"
         */

    let image = i?.element instanceof Node ? i.element : null;

    if (image) {
      if (image.id) i.elementId = image.id;
      else image.id = i.elementId;
    }

    if (!image) {
      image = document.createElement("img");
      i.element = image;

      let classname =
        "_img_" +
        i.source
          .substring(i.source.length - 128)
          .replace(/[/:."'\\@#$%\?= \{\}\|&*`!<>+]/g, "");
      if (image.classList.contains(classname)) image.classList.add(classname);

      if (Array.isArray(i.class)) {
        for (let cl of i.class) image.classList.add(cl);
      }

      if (image.tagName === "IMG") image.setAttribute("src", i.source);

      if (typeof i.onclick === "function") {
        image.addEventListener("click", i.onclick);
        image.classList.add("_hover_");
      }

      if (
        i.style &&
        typeof i.style === "object" &&
        Object.keys(i.style).length
      ) {
        for (let st in i.style) {
          image.style.setProperty(st, i.style[st]);
        }
      }
    }

    // wrapper.setAttribute("contenteditable", "false");
    // wrapper.append(image);

    if (!image.classList.contains("_media_"))
      image.classList.add("_media_");


    let pushArray = true;

    for (let chk of this.image_array)
      if (chk.elementId === i.elementId) {
        pushArray = false;
        break;
      }

    if (pushArray) this.image_array.push(i);


    // return wrapper;
    return image;
  }

  _getAnchorOffsetFromLine(line) {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return 0;

    let anchorNode = sel.anchorNode;
    let anchorOffset = sel.anchorOffset;

    // If anchorNode is not inside line, return 0
    if (!line.contains(anchorNode) && line !== anchorNode) return 0;

    let offset = 0;
    let found = false;

    function traverse(node) {
      if (found) return;
      if (node === anchorNode) {
        offset += anchorOffset;
        found = true;
        return;
      }
      if (node.nodeType === 3) {
        offset += node.textContent.length;
      } else {
        for (let child of node.childNodes) {
          traverse(child);
          if (found) break;
        }
      }
    }

    traverse(line);
    return offset;
  }
  _getFocusOffsetFromLine(line) {
    const sel = window.getSelection();
    if (!sel || !sel.focusNode) return 0;

    let focusNode = sel.focusNode;
    let focusOffset = sel.focusOffset;

    // If focusNode is not inside line, return 0
    if (!line.contains(focusNode) && line !== focusNode) return 0;

    let offset = 0;
    let found = false;

    function traverse(node) {
      if (found) return;
      if (node === focusNode) {
        offset += focusOffset;
        found = true;
        return;
      }
      if (node.nodeType === 3) {
        offset += node.textContent.length;
      } else {
        for (let child of node.childNodes) {
          traverse(child);
          if (found) break;
        }
      }
    }

    traverse(line);
    return offset;
  }

  _normalizeDocument() {
    nodeCrawler(
      (n) => {
        if (n.nodeType === 3 && n.textContent.includes("\u200B")) {
          //!n.textContent ||
          n.textContent = n.textContent.replace("\u200B", "");

          if (!n.textContent) {
            let cel;
            for (let c of this.ceilingElement_queryArray)
              if (n.parentNode.closest(c)) {
                cel = n.parentNode.closest(c);
                break;
              }

            let el = climbUpToEldestParent(n, cel, true);

            let par = el.parentNode;
            if (
              !this._isCeilingElement(par) &&
              !el.textContent &&
              this.element.lastChild !== el
            ) {
              par.removeChild(el);
              n = par;
            }
            return n;
          }
        } else if (n.nodeType === 1 && n.nodeName !== "BR") {
          console.log("normalize", n);  
          if (n.childNodes.length === 0 || n.childNodes.length === 1 && n.childNodes[0].nodeType === 3 && n.childNodes[0].textContent === "") {
            let st = this.range.startContainer;
            if(st.nodeType === 3) {
              st = st.parentNode;
            }
            console.log({st, n});
            if (st !== n) {
              n.remove();
            }
            return n;
          }
          n.normalize();
        }

        return n;
      },
      { node: this.element }
    );
  }

  _replaceText(wholeDocument = false) {
    if (this.logExecution) console.log("_replaceText", { wholeDocument });
    const process = (typeName, setData) => {
      if (!this[typeName]) return;

      let regex = regexr[typeName] || null;

      if (regex === null) throw new Error("no regex to process");

      if (typeof setData !== "function")
        throw new Error("setData should be returning function");

      let node = wholeDocument
        ? this.element
        : this.range?.commonAncestorContainer;

      if (!node) return;

      if (node.nodeType === 3) node = node.parentNode;

      let res = (() => {
        let className = `_${typeName}_`;
        let element = [];
        let collected = [];

        let textNodes = [];
        nodeCrawler(
          (n) => {
            if (n.nodeType === 3 && n.textContent) {
              if (
                n.nextSibling?.nodeType === 3 &&
                n.nextSibling.textContent &&
                n.nextSibling.textContent !== "\u200B"
              ) {
                let par = n.parentNode;
                par.normalize();
                n = par;
              } else if (
                n.textContent !== "\u200B" &&
                !n.parentNode.closest("." + className)
              )
                textNodes.push(n);
            }

            return n;
          },
          { node }
        );

        textNodes.forEach((node) => {
          replaceTextNode(node, regex, function (matched) {
            if (matched.length > 1) {
              return {
                name: "span",
                attrs: { class: `${className} ${className}${matched}` },
                content: matched,
              };
            }
          });
        });

        function replaceTextNode(node, regex, handler) {
          let par = node.parentNode,
            nxt = node.nextSibling,
            doc = node.ownerDocument,
            hits;

          if (regex.global) {
            while (node && (hits = regex.exec(node.nodeValue))) {
              regex.lastIndex = 0;
              node = handleResult(node, hits, handler.apply(this, hits));
            }
          } else if ((hits = regex.exec(node.nodeValue)))
            handleResult(node, hits, handler.apply(this, hits));

          function handleResult(node, hits, results) {
            let orig = node.nodeValue;
            node.nodeValue = orig.slice(0, hits.index);
            [].concat(create(par, results)).forEach(function (n) {
              let res = par.insertBefore(n, nxt);
              element.push(res);
            });
            let rest = orig.slice(hits.index + hits[0].length);
            if (rest) {
              let text = doc.createTextNode(rest);
              return par.insertBefore(text, nxt);
            }
          }

          function create(el, o) {
            if (o.map)
              return o.map(function (v) {
                return create(el, v);
              });
            else if (typeof o === "object") {
              let e = doc.createElementNS(
                o.namespaceURI || el.namespaceURI,
                o.name
              );
              if (o.attrs) for (let a in o.attrs) e.setAttribute(a, o.attrs[a]);
              if (o.content)
                [].concat(create(e, o.content)).forEach(e.appendChild, e);
              if (typeof o.content === "string") collected.push(o.content);
              e.contentEditable = "false";
              return e;
            } else return doc.createTextNode(o + "");
          }
        }

        let anchorText;
        if (element.length) {
          for (let el of element) {
            anchorText = node.ownerDocument.createTextNode("");
            el.parentNode.insertBefore(anchorText, el.nextSibling);
          }
        }
        return { collected, element, anchorText };
      })();

      let textEl = res.element;

      if (!wholeDocument) {
        this.range = adjustSelection({
          node: res.anchorText,
          position: false,
        }, this.ceilingElement_queryArray);
      }

      let toCallback = [];
      let collectId = [];

      if (textEl[0])
        for (let el of textEl) {
          let elementId = generateId(typeName);
          el.setAttribute("id", elementId);
          let tc = setData(el) || {};
          tc.elementId = el.id;
          tc.element = el;

          el.removeAttribute("style");
          collectId.push(el.id);
          toCallback.push(tc);
        }

      if (toCallback.length) {
        this._callback({ [typeName]: toCallback })
          .then((e) => {
            for (let idx = 0; collectId.length > idx; idx++) {
              //  elementId is read only
              e[typeName][idx].elementId = collectId[idx];
            }

            if (Array.isArray(e[typeName]) && e[typeName].length)
              for (let h of e[typeName]) {
                let dom = document.getElementById(h.elementId);

                dom.setAttribute("id", h.elementId);
                dom.setAttribute("contenteditable", "false");

                if (typeof h.onclick === "function") {
                  dom.addEventListener("click", h.onclick);
                  dom.classList.add("_hover_");
                }

                if (
                  h.style &&
                  typeof h.style === "object" &&
                  Object.keys(h.style).length
                ) {
                  for (let s in h.style) dom.style.setProperty(s, h.style[s]);
                }

                this[`${typeName}_array`].push(h);
              }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    };

    if (this.urllink_flag) {
      process("urllink", (url) => {
        let u = url.textContent;
        url.addEventListener("click", function () {
          if (!u.match(/^https?:\/\//i)) {
            u = "http://" + u;
          }
          window.open(u, "_blank");
        });

        return { url: u };
      });
    }

    if (this.hashtag_flag) {
      process("hashtag", (tag) => {
        let t = tag.textContent;
        return { tag: t[0] === "#" ? t.substring(1) : t };
      });
    }

    this.hashtag_flag = false;
    this.urllink_flag = false;
  }

  _checkElement(node, chkArr, closest, exp) {
    /**
     * parentNode when node is a text node
     * chkArr is an array of class names or tag names
     * closest is a boolean to check if the element is closest to the node
     */
    if (this.logExecution)
      console.log("_checkElement", { node, chkArr, closest, exp });
    if (node && node.nodeType === 1)
      for (let c of chkArr) {
        if (closest) {
          let clo = node.closest(c);
          if (clo) {
            if (exp && exp[c]) {
              if (c === "._custom_") {
                let flyup = node;
                let gotTheMatch = false;
                if (node !== this.element) {
                  while ((flyup && this.element !== flyup) || !gotTheMatch) {
                    gotTheMatch =
                      flyup.getAttribute(exp[c].attr) === exp[c].value;
                    if (gotTheMatch) return false;

                    flyup = flyup.parentNode;
                  }
                }
              } else
                return clo.getAttribute(exp[c].attr) === exp[c].value
                  ? false
                  : clo;
            }

            return clo;
          }
        } else if (
          c[0] === "#"
            ? node.id === c.substring(1)
            : c[0] === "."
              ? node.classList.contains(c.substring(1))
              : node.nodeName === c
        )
          return true;
      }
    return false;
  }

  _isUnSelectableElement(node) {
    if (this.logExecution) console.log("_isUnSelectableElement", { node });
    node = node?.nodeType === 3 ? node.parentNode : node;
    let exceptions = {
      "._custom_": { attr: "contenteditable", value: "true" },
    };
    return this._checkElement(
      node,
      this.unSelectable_queryArray,
      true,
      exceptions
    );
  }

  _isStyleAllowedElement(node) {
    if (this.logExecution) console.log("_isStyleAllowedElement", { node });
    return this._checkElement(node, this.styleAllowedElement_queryArray);
  }

  _isCeilingElement(node) {
    if (this.logExecution) console.log("_isCeilingElement", { node });
    return this._checkElement(node, this.ceilingElement_queryArray);
  }

  _isBlockElement(node) {
    if (this.logExecution) console.log("_isBlockElement", { node });
    return this._checkElement(node, this.blockElement_queryArray);
  }

  _isTextAreaElement(node) {
    if (this.logExecution) console.log("_isTextAreaElement", { node });
    return this._checkElement(node, this.textAreaElement_queryArray);
  }

  _isTextBlockElement(node) {
    if (this.logExecution) console.log("_isTextBlockElement", { node });
    node = node?.nodeType === 3 ? node.parentNode : node;
    return this._checkElement(node, this.textBlockElement_queryArray);
  }

  _isSpecialTextElement(node) {
    if (this.logExecution) console.log("_isSpecialTextElement", { node });
    node = node?.nodeType === 3 ? node.parentNode : node;
    return this._checkElement(node, this.specialTextElement_queryArray);
  }

  _isTextElement(node) {
    if (this.logExecution) console.log("_isTextElement", { node });
    node = node?.nodeType === 3 ? node.parentNode : node;
    return (
      (this._isTextBlockElement(node) || node.nodeName === "SPAN") &&
      !this._isSpecialTextElement(node)
    );
  }
  setSafeLine() {
    let firstChild = this.element.firstChild;
    let lastChild = this.element.lastChild;
    console.log({ firstChild, lastChild });
    this.unSelectable_queryArray.forEach((cl) => {
      if (cl[0] === ".") {
        cl = cl.substring(1);
        if (firstChild && firstChild.nodeType === 1 && firstChild.classList.contains(cl))
          this.element.insertBefore(
            this._createEmptyParagraph(),
            firstChild
          );
        if (lastChild && lastChild.nodeType === 1 && lastChild.classList.contains(cl))
          this.element.appendChild(this._createEmptyParagraph());
      }
      else {
        if (firstChild && firstChild?.tagName === cl)
          this.element.insertBefore(
            this._createEmptyParagraph(),
            firstChild
          );
        if (lastChild && lastChild?.tagName === cl)
          this.element.appendChild(this._createEmptyParagraph());
      }
    });
  }
  /**
   * List of command for editing wysiwyg text.
   * @param {'quote'} action - Add blockquote below selected line.
   * @also
   * @param {'unorderedList'} action - Add unordered list below selected line.
   * @also
   * @param {'orderedList'} action - Add ordered list below selected line.
   * @also
   * @param {'divider'} action - Add HR below selected line.
   * @also
   * @param {'image'} action - Add image below selected line.
   * @also
   * @param {'alignLeft'} action - Align selected line to left.
   * @also
   * @param {'alignCenter'} action - Align selected line to center.
   * @also
   * @param {'alignRight'} action - Align selected line to right.
   * @also
   * @param {'color' | 'hex | rgb string | hsl string'} action - Apply color to selected text. If 'color' is given, the default focus color is applied to the text.
   * @also
   * @param {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'small' | 'bold' | 'italic' | 'underline' | 'strike'} action - Apply style to selection.
   * @also
   * @param {object} action - Custom element object
   * @param {object | string} action.element - Custom element can be node objects | html string | string
   * @param {string} action.elementId - Set custom elements parent id. Otherwise auto generated
   * @param {object} action.style - Set custom elements parent css style
   * @param {boolean} action.insert - Set custom element insert mode. If true, inserts element at carat position, otherwise appends on next line
   */
  command(action) {
    if (!action) return;

    if (!this.range) this.restoreLastSelection();

    switch (action) {
      case "quote": {
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        let p = this._createEmptyParagraph();
        let bq = document.createElement("blockquote");
        this._append(bq, p, true);
        break;
      }
      case "unorderedList": {
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        let p = this._createEmptyParagraph();
        let li = document.createElement("li"),
          ul = document.createElement("ul");
        ul.append(li);
        this._append(ul, p, false, li);
        break;
      }
      case "orderedList": {
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        let p = this._createEmptyParagraph();
        let li = document.createElement("li"),
          ul = document.createElement("ol");
        ul.append(li);
        this._append(ul, p, false, li);
        break;
      }
      case "divider": {
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        // let p = this._createEmptyParagraph(),
        let hr = document.createElement("hr");
        hr.setAttribute("contenteditable", "false");
        // this._append(hr, p, false);
        this._append(hr, null, false);
        this.setSafeLine();
        break;
      }
      case "image":
        this.imgInput.click();
        break;
      case "alignLeft":
      case "alignCenter":
      case "alignRight":
        if (!this.range) return;
        let startLine = this.range.startLine;
        let endLine = this.range.endLine;

        let collectLines = [];
        collectLines.push(startLine);

        while (collectLines[collectLines.length - 1] !== endLine) {
          let nextLine = collectLines[collectLines.length - 1].nextSibling;

          while (nextLine && !this._isTextBlockElement(nextLine)) {
            if (
              this._isCeilingElement(nextLine) &&
              nextLine.firstChild &&
              this._isTextBlockElement(nextLine.firstChild)
            ) {
              nextLine = nextLine.firstChild;
              break;
            }
            nextLine = nextLine.nextSibling;
          }

          if (
            !nextLine &&
            this._isCeilingElement(
              collectLines[collectLines.length - 1].parentNode
            )
          )
            nextLine =
              collectLines[collectLines.length - 1].parentNode.nextSibling;

          if (nextLine) collectLines.push(nextLine);
          else break;
        }

        let commandTracker = Object.assign({}, this.commandTracker);

        for (let l of collectLines) {
          for (let c of this.alignClass) {
            if (l.classList.contains(c)) l.classList.remove(c);
            commandTracker[c.substring(1, c.length - 1)] = false;
          }

          if (action !== "alignLeft" && !this.commandTracker[action]) {
            for (let c of this.alignClass) {
              if (c.includes(action)) l.classList.add(c);
            }
            commandTracker[action] = true;
          }
        }

        this.commandTracker = commandTracker;

        this._callback({
          commandTracker,
          range: this.range,
        }).catch((err) => err);
        break;
    }

    let isColor;
    try {
      isColor = new ColorMangle(action).hex();
      action = "color";
    } catch { }

    //  style command
    if (this.styleTagOfCommand[action]) {
      let wrapper,
        query = this.styleTagOfCommand[action],
        stopperMode = false;

      let counter = this.counterTagOf[query]
        ? this.counterTagOf[query].map((c) => this._classNameToQuery(c))
        : [];
      if (counter.length)
        counter = counter.concat(counter.map((c) => c + "_stop"));

      //  setup query
      query = this._classNameToQuery(query);

      if (this.commandTracker[action]) {
        let pass;

        if (action === "color") {
          pass =
            isColor === this.commandTracker[action] ||
            (isColor === undefined &&
              this.commandTracker[action] ===
              this.cssVariable["--content-text_focus"]);
        } else pass = true;

        if (pass) {
          query = this._classNameToQuery(query + "_stop");
          stopperMode = true;
        }
      }

      //  setup wrapper element
      if (query[0] === ".") {
        wrapper = document.createElement("SPAN");
        wrapper.classList.add(query.substring(1));
      } else wrapper = document.createElement(query);

      if (isColor && !stopperMode) wrapper.style.color = isColor;

      let restrictedClass = this._isSelectionTrespassRestrictedRange();
      if (this.range.collapsed) {
        if (restrictedClass) return;

        let text = document.createTextNode("");
        // let text = document.createTextNode("\u200B");
        wrapper.append(text);

        if (this.range.startContainer.nodeName === "BR")
          this.range.startContainer.parentNode.insertBefore(
            wrapper,
            this.range.startContainer
          );
        else this.range.insertNode(wrapper);
        
        console.log('setrange')
        this.range = adjustSelection({ node: text, position: false }, this.ceilingElement_queryArray);
      }
      else {
        if (restrictedClass) {
          this.range = adjustSelection({
            node: this.range.endContainer,
            position: this.range.endOffset,
          }, this.ceilingElement_queryArray);
          return;
        }
        //  selection has range
        let extract = this.range.extractContents();
        let span = document.createElement("span");

        while (extract.childNodes[0]) span.append(extract.childNodes[0]);

        nodeCrawler(
          (n) => {
            let res = restrictedClass
              ? this._classNameToQuery(restrictedClass)
              : null;
            let par = n.nodeType === 3 ? n.parentNode : n;
            let restricted =
              res && par.hasOwnProperty("closest") ? par.closest(res) : false;

            if (n.nodeType === 3 && !restricted)
              n.textContent = n.textContent.replaceAll("\t", "");

            return n;
          },
          { node: span, startFromEldestChild: true, parentNode: this.element }
        );

        while (span.childNodes[0]) extract.append(span.childNodes[0]);

        //  unwrap duplicates and stopper | counter
        let unwrapTarget = [query];

        //  add countering | opposite tag to unwrap
        if (stopperMode) {
          let rev = query.replace("_stop", "").substring(1);
          rev = rev[0] === "_" ? "." + rev : rev;
          unwrapTarget.push(rev);
        } else {
          let rev = query + "_stop";
          rev = rev[0] === "." ? rev : "." + rev;
          unwrapTarget.push(rev);
        }

        unwrapTarget = unwrapTarget.concat(counter);
        let del = extract.querySelectorAll(unwrapTarget.join());
        let idx = del.length;
        if (idx) while (idx--) this._wrapNode(del[idx]);

        //  split wrapper
        let wrapperSplit = [wrapper.cloneNode(true)];

        while (extract.childNodes[0]) {
          let child = extract.childNodes[0];

          if (child.nodeType === 1 && this._isBlockElement(child)) {
            let nest = this._isTextAreaElement(child);

            if (nest) {
              for (let idx = 0; child.childNodes.length > idx; idx++) {
                let text = child.childNodes[idx];

                if (this._isTextElement(text)) {
                  let nestedWrapper = wrapper.cloneNode(true);
                  while (text.childNodes[0]) {
                    if (text.childNodes[0].textContent)
                      nestedWrapper.append(text.childNodes[0]);
                    else text.childNodes[0].remove();
                  }
                  text.append(nestedWrapper);
                }
              }

              if (!child.textContent) {
                child.remove();
                continue;
              }
            }

            let doc = document.createDocumentFragment();
            doc.append(child);
            wrapperSplit.push(doc);
          } else {
            if (child.nodeType === 1 && this._isTextBlockElement(child)) {
              let nestedWrapper = wrapper.cloneNode(true);

              while (child.childNodes[0])
                nestedWrapper.append(child.childNodes[0]);

              if (
                nestedWrapper.childNodes.length === 1 &&
                nestedWrapper.childNodes[0].nodeName !== "BR" &&
                !nestedWrapper.textContent.length
              ) {
                child.remove();
                continue;
              }

              child.append(nestedWrapper);
              let doc = document.createDocumentFragment();
              doc.append(child);
              wrapperSplit.push(doc);
            } else wrapperSplit[wrapperSplit.length - 1].append(child);
          }
        }

        let output = document.createDocumentFragment();
        for (let ws of wrapperSplit) output.append(ws);

        let fc = output.firstChild;
        let lc = output.lastChild;

        if (this._isTextElement(fc) && !fc.textContent) {
          let fn = fc.nextSibling;
          fc.remove();
          fc = fn;
        }
        if (this._isTextElement(lc) && !fc.textContent) {
          let lp = lc.nextSibling;
          lc.remove();
          lc = lp;
        }

        this.range.insertNode(output);
        this.range = adjustSelection({
          node: [fc, lc],
          position: [true, false],
        }, this.ceilingElement_queryArray);

        //  remove garbage node
        fc = fc.nodeType === 3 ? fc.parentNode : fc;
        lc = lc.nodeType === 3 ? lc.parentNode : lc;

        let next = lc.nextSibling;
        if (
          this._isTextElement(next) &&
          (!next.textContent || next.textContent === "\u200B")
        )
          next.remove();

        let prev = fc.previousSibling;
        if (
          (this._isTextElement(prev) && !prev.textContent) ||
          prev.textContent === "\u200B"
        )
          prev.remove();
      }
      // this._normalizeDocument();
      return;
    }

    //  custom component
    if (typeof action === "object") {
      /**
        action = {
          elementId: <string: generated parent element id>,
          element: <HTMLElement>,
          style: {<css style object for parent element>},
          insert: true | false,
          contenteditable: false,
        }
      */

      //  setup wrapper
      let custom = null;

      if (action.style)
        for (let s in action.style) custom.style[s] = action.style[s];

      action.elementId = action.elementId || generateId("custom");

      if (typeof action.element === "string") {
        custom = document.createTextNode(action.element);
        action.insert = true;
      }
      else if (action.element instanceof HTMLElement) {
        custom = action.element;
        custom.id = action.elementId;
        custom.classList.add("_custom_");
      }
      if (!this.range) this.element.focus();

      this.custom_array.push(action);

      this._callback({ custom: action }).then((_) => {

        let txt = document.createTextNode("");
        if (action.insert) {
          this.range.insertNode(txt); // when inserted in range, it will push the next el back
          this.range.insertNode(custom);
        } else {
          this._append(custom, txt, false);
        }
        this.range = adjustSelection({
          node: txt,
          position: false,
        }, this.ceilingElement_queryArray);

        this.setSafeLine();
      });
    }

  }

  /**
   * Restores the last selection range
   */
  restoreLastSelection() {
    if (this.logExecution)
      console.log("restoreLastSelection", { range_backup: this.range_backup });
    if (this.range_backup) {
      this.range = adjustSelection({
        node: [
          this.range_backup.startContainer,
          this.range_backup.endContainer,
        ],
        position: [this.range_backup.startOffset, this.range_backup.endOffset],
      }, this.ceilingElement_queryArray);
      let sel = window.getSelection();
      let range = document.createRange();
      range.setStart(this.range.startContainer, this.range.startOffset);
      range.setEnd(this.range.endContainer, this.range.endOffset);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Load html string to wysiwyg
   * @param {string} html - HTML string to load.
   * @param {boolean} [editable=false] - Set editable mode.
   */
  async loadHTML(html = this.html, editable = false) {
    if (typeof html !== "string") {
      throw new Error("html should be a string");
    }

    this.setEditable(false);
    this.html = html || "";
    const div = document.createElement("div");
    div.innerHTML = html;

    // image
    const img = div.querySelectorAll("img");
    const imgCallback = [];
    if (img.length)
      for (let i of img) {
        // const imageParent = i.closest("._media_");

        // if (imageParent) {
        const source = i.getAttribute("src");
        let imgId = i.id || generateId("img");
        i.setAttribute("id", imgId);

        imgCallback.push({
          source,
          elementId: imgId,
          element: i,
        });
        // }

        this.image_array = JSON.parse(JSON.stringify(imgCallback));
      }

    // hashtag
    const hashtag = div.querySelectorAll("._hashtag_");
    const hashtagCallback = [];
    if (hashtag.length)
      for (let i of hashtag) {
        let clIdx = i.classList.length;
        let tag,
          elementId = i.id || generateId("hashtag");
        while (clIdx--) {
          let cls = i.classList[clIdx];
          if (cls.replace("_hashtag_", "")[0] === "#") {
            tag = cls.replace("_hashtag_", "");
          }
        }
        tag = tag?.[0] === "#" ? tag.substring(1) : tag;
        if (tag) hashtagCallback.push({ tag, elementId, element: i });
      }

    // urllink
    const urllink = div.querySelectorAll("._urllink_");
    const urllinkCallback = [];
    if (urllink.length)
      for (let i of urllink) {
        let elementId = i.id || generateId("urllink");
        let url;

        let clIdx = i.classList.length;
        while (clIdx--) {
          let cls = i.classList[clIdx];
          if (cls.includes("_urllink_").length) {
            url = cls.replace("_urllink_", "");
          }
        }
        if (url) urllinkCallback.push({ url, elementId, element: i });
      }

    const custom = div.querySelectorAll("._custom_");
    const customCallback = [];
    if (custom.length)
      for (let i of custom) {
        let elementId = i.id || generateId("custom");
        customCallback.push({ elementId, element: i });
      }

    let fb = await this._callback({
      image: imgCallback,
      hashtag: hashtagCallback,
      urllink: urllinkCallback,
      custom: customCallback,
    });

    // callback
    for (let f in fb) {
      if (f === "image") {
        let img = fb[f];
        for (let i of img) {
          // let imgEl = div.querySelector("#" + i.elementId);
          // const imageParent = imgEl.closest("._media_");
          this._loadImage(i);
        }
      } else this[f + "_array"] = fb[f];
    }

    this.element.innerHTML = "";

    while (div.childNodes[0]) this.element.append(div.childNodes[0]);

    if (editable) this.setEditable(true);
  }

  /**
   * Load html string to wysiwyg
   * @param {function} [pre=(p)=>{return p}] - Pre processing callback before export.
   * @return {object} - Exported wysiwyg data object
   */
  async export(pre) {
    this._normalizeDocument();
    const dom = this.element.cloneNode(true);

    const { hashtag_array, image_array, urllink_array, custom_array } = this;
    let title = "";
    let text = "";

    let setup = {
      dom,
      urllink: this.urllink ? urllink_array : undefined,
      hashtag: this.hashtag ? hashtag_array : undefined,
      image: image_array,
      custom: custom_array,
    };

    if (typeof pre === "function") {
      let promiseOrNot = pre(setup);

      if (promiseOrNot instanceof Promise)
        setup = (await promiseOrNot) || setup;
      else setup = promiseOrNot || setup;

      if (this.hashtag) this.hashtag_array = setup.hashtag;
      if (this.urllink) this.urllink_array = setup.urllink;

      this.image_array = setup.image;
      this.custom_array = setup.custom;
      title = setup.title || "";
    }

    const strip = setup.dom.querySelectorAll(":scope > *");

    //  Loop through eldest child element in document
    for (let sid = 0; sid < strip.length; sid++) {
      let child = strip[sid];
      if (child.textContent.length) {
        //  set title and text information
        let inputText = child.textContent;
        if (!title) {
          let titleSearchRegex = /([^\s^.]{2,}[^\s]+[.][^\s^.]{2,})/g;
          let urlArray = inputText.match(titleSearchRegex);

          // We are replacing the urls with a special text here.
          // Then we split the sentences by the dots.
          // Then we replace the url with the special text and identify the title and body text

          let split;
          if (urlArray) {
            for (let i = 0; i < urlArray.length; i++) {
              inputText = inputText.replace(
                urlArray[i].replace(/\.+$/, ""),
                "[§url§]" + i + "[/§url§]"
              );
            }

            split = inputText.split(".");

            for (let i = 0; i < split.length; i++) {
              for (let j = 0; j < urlArray.length; j++) {
                split[i] = split[i].replace(
                  "[§url§]" + j + "[/§url§]",
                  urlArray[j].replace(/\.+$/, "")
                );
              }
            }
          } else split = inputText.split(".");

          title = split[0];
          if (title.length > 200) {
            text += title.substring(200) + ".";
            title = title.substring(0, 200);
          }

          split.shift();
          inputText = split.join(".").replace(/\s\s+/g, " ");
          text += inputText + " ";
        } else text += `${inputText}\n`;
      }

      if (child.classList.contains("_media_")) {
        let idx = child.childNodes.length;
        while (idx--) {
          let c = child.childNodes[idx];
          if (c.nodeName === "IMG") {
            for (const f of this.image_array) {
              if (f.elementId === c.id && f.source !== c.getAttribute("src")) {
                c.setAttribute("src", f.source);
                let cIdx = c.classList.length;
                while (cIdx--) {
                  if (
                    c.classList[cIdx].includes("_img_") &&
                    c.classList[cIdx].length > 5
                  ) {
                    c.classList.remove(c.classList[cIdx]);
                    let splitUrl = f.source.split("/");
                    let splitTail = splitUrl[splitUrl.length - 1];
                    let splitTail_length = splitTail.length - 64;
                    const sourceClip = splitUrl[splitUrl.length - 1].substring(
                      splitTail_length > 0 ? splitTail : 0
                    );
                    c.classList.add("_img_" + sourceClip);
                  }
                }
              }
            }
          }
        }
      }
    }

    return {
      html: setup.dom.innerHTML,
      title: title.trim(),
      text: text.trim(),
      urllink: this.urllink ? this.urllink_array : undefined,
      hashtag: this.hashtag ? this.hashtag_array : undefined,
      image: this.image_array,
      custom: this.custom_array,
    };
  }

  /**
   * Set placeholder string
   * @param {string} p - Set placeholder string.
   */
  setPlaceholder(p) {
    if (this.logExecution) console.log("setPlaceholder", { p });
    if (this.element) {
      if (p && typeof p === "string")
        this.element.setAttribute("placeholder", p);
      else this.element.removeAttribute("placeholder");
    }
  }

  /**
   * Set spellcheck mode
   * @param {boolean} bool - Set spellcheck mode.
   */
  setSpellcheck(bool) {
    if (this.logExecution) console.log("setSpellcheck", { bool });
    if (this.element)
      this.element.setAttribute("spellcheck", bool ? "on" : "off");
  }

  /**
   * Set edit mode
   * @param {boolean} bool - Set wysiwyg to editable when true.
   */
  setEditable(bool) {
    if (this.logExecution) console.log("setEditable", { bool });
    bool = this.element ? bool : false;

    if (this.element)
      this.element.setAttribute("contenteditable", bool ? "true" : "false");

    this._setEventListener(bool);
    this._observeMutation(bool);
  }
}

export { Wysiwyg4All };
