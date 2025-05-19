import { ColorMangle } from "colormangle";

class Wysiwyg4All {
  /**
   * Wysiwyg4All is a simple framework for building a text editor for your website.
   * Focused on expandability and customizations.
   * Additional library ColorMangle is required for text colors.
   * @param {{}} option - Options
   * @param {string} option.elementId - ID of target <DIV>.
   * @param {boolean} [option.editable=true] - When set to false, Wysiwyg will not be editable. By doing this, it can be used as readonly.
   * @param {string} [option.placeholder=''] - Add placeholder string.
   * @param {boolean} [option.spellcheck=false] - Set spellcheck to true/false.
   * @param {string | object} [option.highlightColor='teal'] - Sets the highlight color of the wysiwyg (web color name | hex | rgb | hsl). Or can provide custom color scheme object (more details in api doc).
   * @param {string} [option.html=''] - HTML string to load on initialization.
   * @param {function} [option.callback=(cb)=>{return cb}] - Setup callback function. Callback argument contains array of information such as current text style, added images, hashtags, urllinks, selected range... etc.
   * @param {{} | number} [option.fontSize={desktop:18, tablet: 16, phone: 14}] - Set default font size of each screen size in px. If number is given all screen size will share the same give font size.
   * @param {boolean} [option.lastLineBlank=false] - When set to true, Blank line will always be added on the last line of wysiwyg.
   * @param {boolean} [option.hashtag=false] - When set to true, wysiwyg will auto detect hashtag strings.
   * @param {boolean} [option.urllink=false] - When set to true, wysiwyg will auto detect url strings.
   * @param {boolean} [option.logMutation=false] - When set to true, wysiwyg will output dom mutation data via callback function.
   */
  constructor(option) {
    this.hashtag_regex =
      /#[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\w-]+(?:\+[\w-]+)*/g;
    this.hashtag_stopper_regex =
      /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\w-]/g;
    this.urllink_regex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

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
      // h1: 4.2,
      // h2: 3.56,
      // h3: 2.92,
      // h4: 2.28,
      // h5: 1.64,
      // h6: 1.15,
      // small: 0.8,
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

  _adjustSelection(
    target,
    ceilingElement_query = this.ceilingElement_queryArray
  ) {
    if (this.logExecution)
      console.log("_adjustSelection()", { target, ceilingElement_query });

    let toArray = (v, allowObject = false) => {
      if (Array.isArray(v)) return v;
      else if (
        (typeof v === "string" && v) ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        (allowObject && typeof v === "object")
      )
        return [v];
      else return [];
    };

    let setRange = !!target;

    let { node = null, position = true } = target || {};

    let sel = window.getSelection();
    if (!sel) return null;

    let range;
    try {
      range = sel.getRangeAt(0);
    } catch (err) {
      if (setRange) range = document.createRange();
    }

    if (setRange) {
      node = toArray(node, true);
      position = toArray(position, true);

      for (let p of position)
        if (typeof p !== "number" && typeof p !== "boolean" && p !== null)
          throw "INVALID_POSITION";

      for (let n of node) {
        if (!(n instanceof Node) && n !== null) {
          if (n === false) return;
          throw "INVALID_NODE";
        }
      }

      const setTarget = (node, position) => {
        if (node instanceof Node) {
          if (node.nodeType === 1) {
            if (typeof position === "boolean")
              while (position === false ? node.lastChild : node.firstChild)
                node = position === false ? node.lastChild : node.firstChild;
            else if (typeof position === "number") {
              let textLength = 0;
              this._nodeCrawler(
                (n) => {
                  if (n.nodeType === 3 && n.textContent.length) {
                    let length = n.textContent.length;
                    if (
                      n.parentNode.getAttribute("contenteditable") === "false"
                    ) {
                      if (position - (textLength + length) >= 0)
                        textLength += length;
                      else {
                        position = length;
                        return "BREAK";
                      }
                      return n;
                    } else {
                      node = n;

                      if (position - (textLength + length) >= 0) {
                        textLength += length;
                      } else {
                        position -= textLength;
                        return "BREAK";
                      }
                    }
                  }
                  return n;
                },
                {
                  node,
                }
              );
              if (node.nodeType === 1) {
                let text = document.createTextNode("\u200B");
                node.insertBefore(text, node.childNodes[0]);
                node = text;
                position = 0;
              }
            }

            if (node.nodeName === "BR" && node.parentNode.childNodes.length > 1)
              node = node.previousSibling || node;
          }
          if (typeof position === "boolean")
            position = position ? 0 : node.textContent.length;
          else
            position =
              position > node.textContent.length
                ? node.textContent.length
                : position;

          return { node, position };
        }
      };

      let doCollapse = false,
        setEnd,
        setStart = (() => {
          node[0] = node[0] === null ? range.startContainer : node[0];
          position[0] = position[0] === null ? range.startOffset : position[0];
          return setTarget(node[0], position[0]);
        })();
      range.setStart(setStart.node, setStart.position);

      if (position.length > 1)
        setEnd = setTarget(
          (node[1] === null ? range.endContainer : node[1]) || node[0],
          position[1] === null ? range.endOffset : position[1]
        );
      else {
        setEnd = setStart;
        doCollapse = true;
      }

      range.setEnd(setEnd.node, setEnd.position);

      if (doCollapse) range.collapse(true);

      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (ceilingElement_query && range) {
      let startLine, endLine;
      for (let q of ceilingElement_query) {
        let e =
          range.endContainer.nodeType === 3
            ? range.endContainer.parentNode
            : range.endContainer;
        let s =
          range.startContainer.nodeType === 3
            ? range.startContainer.parentNode
            : range.startContainer;

        if (!startLine && s.closest(q))
          startLine = this._climbUpToEldestParent(s, s.closest(q));
        if (!endLine && e.closest(q))
          endLine = this._climbUpToEldestParent(e, e.closest(q));
      }

      range.startLine = startLine;
      range.endLine = endLine;
    }

    return range;
  }

  _generateId(option) {
    if (this.logExecution) console.log("_generateId()", { option });
    let limit = 12;
    let prefix = "";

    if (typeof option === "number") limit = option;
    else if (typeof option === "string") prefix = `${option}_`;

    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let text = "";
    for (let i = 0; i < limit - 6; i++)
      text += possible.charAt(
        Math.floor(Math.random() * (possible.length - 1))
      );

    const numb = new Date().getTime().toString().substring(7, 13); // SECOND, MILLISECOND

    // const shuffleArray = (array) => {
    //     let currentIndex = array.length;
    //     let temporaryValue, randomIndex;
    //     while (0 !== currentIndex) {
    //         randomIndex = Math.floor(Math.random() * currentIndex);
    //         currentIndex -= 1;
    //         temporaryValue = array[currentIndex];
    //         array[currentIndex] = array[randomIndex];
    //         array[randomIndex] = temporaryValue;
    //     }
    //     return array;
    // };

    // const letter_array = shuffleArray((text + numb).split(''));

    // let output = '';
    // for (let i = 0; i < limit; i++) output += letter_array[i];

    return prefix + numb + text;
  }

  _nodeCrawler(run, option) {
    if (this.logExecution) console.log("_nodeCrawler()", { run, option });
    const { parentNode, node, startFromEldestChild, startNode } = option;

    if (startFromEldestChild && !parentNode)
      throw new Error("Need parentNode to crawl up single child");

    if (!node || !(node instanceof Node || node?.commonAncestorContainer))
      throw new Error("No node to crawl");

    let outputNodes = [],
      nodeIsRange = !!node.commonAncestorContainer,
      commonContainer = null,
      parentAnchor;

    if (parentNode && parentNode instanceof Node && parentNode?.nodeType === 1)
      parentAnchor = parentNode;

    if (nodeIsRange) {
      commonContainer = node.commonAncestorContainer;
      commonContainer =
        commonContainer.nodeType === 3
          ? commonContainer.parentNode || commonContainer
          : commonContainer;
    } else commonContainer = node;

    if (startFromEldestChild)
      commonContainer = this._climbUpToEldestParent(
        commonContainer,
        parentNode,
        true
      );

    if (parentAnchor) {
      while (
        commonContainer.nodeType === 3 ||
        (commonContainer !== parentAnchor &&
          commonContainer.parentNode &&
          commonContainer.parentNode !== parentAnchor)
      )
        commonContainer = commonContainer.parentNode;
    }

    /** crawl order below (outputs node on the way)
     *  If 'BREAK' is returned, the node is not saved in outputNode
     *
     *  start   ->  [                   end
     *                  |               ^ (finish)
     *                  v               | (outputNode)
     *              outputNode  ->  outputNode
     *
     *  NOTE: Will not crawl when node is textNode
     */

    if (commonContainer.nodeType === 3) {
      outputNodes.push(run(commonContainer));

      return { nodes: outputNodes, commonContainer };
    }

    let id, uniqueId;
    if (commonContainer.nodeType === 1) {
      uniqueId =
        commonContainer.id ||
        (() => {
          id = this._generateId("crawl");
          commonContainer.id = id;
          return id;
        })();
    }

    let crawl =
      (startNode instanceof Node ? startNode : null) ||
      (nodeIsRange ? node.startContainer : commonContainer.childNodes[0]);
    let endNode = nodeIsRange
      ? node.endContainer
      : commonContainer.childNodes[
          commonContainer.childNodes.length
            ? commonContainer.childNodes.length - 1
            : 0
        ];

    let withInRange = (cwl) => {
      if (!cwl || !(cwl instanceof Node)) return false;
      if (cwl.nodeType === 1)
        return cwl.id !== uniqueId && cwl.parentNode?.closest("#" + uniqueId);
      else return true;
    };

    while (withInRange(crawl)) {
      if (crawl.nodeType === 1 && crawl.childNodes.length) {
        // dive down to deepest child's first crawl
        crawl = crawl.childNodes[0];
      } else if (crawl) {
        // entering the deepest elements first child.

        if (typeof run === "function") crawl = run(crawl);
        if (crawl === "BREAK" || !withInRange(crawl)) break;

        outputNodes.push(crawl);

        // break out if the crawl hits the end
        if (crawl === endNode) break;

        /**
         * Climb up the node if the node doesn't have any next siblings
         * Stop when it hits the commonContainer
         */
        let breakOut = false;
        while (
          !crawl.nextSibling &&
          crawl.parentNode &&
          withInRange(crawl.parentNode)
        ) {
          crawl = crawl.parentNode;
          if (crawl) {
            if (typeof run === "function") crawl = run(crawl);

            if (crawl === "BREAK" || !withInRange(crawl)) {
              breakOut = true;
              break;
            }

            if (crawl) outputNodes.push(crawl);
          }
        }

        if (breakOut) break;

        // move on to next crawl
        crawl = crawl.nextSibling;
      }
    }

    if (id) commonContainer.removeAttribute("id");

    return { node: outputNodes, commonContainer };
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
      this._nodeCrawler(
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
        range = this._adjustSelection({
          node: stripped || node,
          position: startOffset,
        });
      else
        range = this._adjustSelection({
          node: [start, end],
          position: [startOffset, endOffset],
        });
    }

    this.range = range;
    return { node: stripped || node, range };
  }

  _climbUpToEldestParent(node, wrapper, singleChildParent = false, callback) {
    if (this.logExecution)
      console.log("_climbUpToEldestParent()", {
        node,
        wrapper,
        singleChildParent,
        callback,
      });
    callback =
      callback ||
      ((n) => {
        return n;
      });

    if (!(wrapper instanceof Node) || wrapper?.nodeType === 3)
      throw new Error("invalid wrapper node");

    let id;
    let uniqueId =
      wrapper.id ||
      (() => {
        id = this._generateId("eldest");
        wrapper.id = id;
        return id;
      })();
    // on single parent mode climb up if parent has only 1 child or 2 child with zero space text
    function _isSingleChildParent(n) {
      if (!n || n.nodeType === 3) return false;

      let childrenCount = n?.children?.length;
      return (
        childrenCount === 0 ||
        (() => {
          let sweep = n.childNodes.length;
          let divCount = 0;
          let iHaveText = false;

          while (sweep--) {
            let s = n.childNodes[sweep];

            if (
              s.nodeType === 3 &&
              s.textContent.length > 0 &&
              s.textContent !== "\u200B"
            )
              iHaveText = true;
            else if (s.nodeType === 1 && s.nodeName !== "BR") divCount++;

            // if (divCount > 1 || divCount && iHaveText)
            if ((divCount > 1 && !iHaveText) || (divCount && iHaveText))
              return false;
          }

          return true;
        })()
      );
    }
    while (
      node?.id !== uniqueId &&
      node.parentNode &&
      node.parentNode.closest("#" + uniqueId) &&
      node.parentNode.id !== uniqueId &&
      (singleChildParent ? _isSingleChildParent(node?.parentNode) : true)
    ) {
      let cb = callback(node.parentNode);

      if (!cb || cb === "BREAK") break;

      node = cb;
    }

    if (id) wrapper.removeAttribute("id");

    return node;
  }

  _getStartEndLine(
    range = this.range,
    element = this.element,
    getInbetween = false
  ) {
    if (this.logExecution)
      console.log("_getStartEndLine()", { range, element });
    if (!range) return [null, null, null];

    let startLine = this._climbUpToEldestParent(range.startContainer, element);
    let endLine = this._climbUpToEldestParent(range.endContainer, element);

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
    if (this.logExecution)
      console.log("startLine | endLine", { startLine, endLine, inBetween });

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

  _isSelectionWithinRestrictedRange(
    range = this.range,
    element = this.element
  ) {
    if (!range) {
      if (this.logExecution)
        console.log("_isSelectionWithinRestrictedRange():true", {
          range,
          element,
        });
      return true;
    }

    let { commonAncestorContainer, startContainer, endContainer } = range;
    let restrict = this.restrictedElement_queryArray;
    // let startLine = this._climbUpToEldestParent(startContainer, element);
    // let endLine = this._climbUpToEldestParent(endContainer, element);

    // if (this.logExecution) console.log('startLine | endLine', {startLine, endLine});
    let [startLine, endLine, inBetween] = this._getStartEndLine(
      range,
      element,
      true
    );
    if (startLine === endLine) {
      commonAncestorContainer =
        commonAncestorContainer.nodeType === 3
          ? commonAncestorContainer.parentNode
          : commonAncestorContainer;
      for (let r of restrict) {
        let cl = commonAncestorContainer.closest(this._classNameToQuery(r));
        if (cl) {
          // if (cl.getAttribute('contenteditable') !== 'true') {
          //     return r;
          // }
          let isThere = this._isThereContentEditableOverMyHead(
            commonAncestorContainer,
            element
          );
          if (!isThere) {
            return true;
          }
        }
        // let cl = commonAncestorContainer.closest(this._classNameToQuery(r));
        // if (cl)
        //     return r;
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
      // while (startLine && startLine !== endLine) {
      //     startLine = startLine.nextSibling;
      //     if (startLine) {
      //         if (startLine.nodeType === 1)
      //             for (let r of restrict) {
      //                 if (startLine.classList.contains(r)) {
      //                     if (startLine.getAttribute('contenteditable') !== 'true') {
      //                         return r;
      //                     }
      //                 }
      //                 // if (startLine.classList.contains(r))
      //                 //     return r;
      //             }
      //     } else
      //         break;
      // }
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
      id: this._generateId("imageInput"),
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

    this._selectionchange = function () {
      this._modifySelection(() => {
        let isForward =
          !(this.lastKey === "DELETE" || this.lastKey === "BACKSPACE") ||
          this.isRangeDirectionForward;

        let rangeHeader = isForward
          ? this.range.endContainer
          : this.range.startContainer;
        this.lastKey = null;

        //  nudge range in-case carat is within non selectables
        let unSel = this._isUnSelectableElement(rangeHeader);
        if (unSel) {
          let selNext = isForward ? unSel.nextSibling : unSel.previousSibling;
          
          if(this.logExecution) console.log('nudging range', {unSel, selNext, isForward});
          
          if (!selNext && !isForward) {
            selNext = document.createTextNode("\u200B");
            unSel.parentNode.insertBefore(
              selNext,
              isForward ? unSel.nextSibling : unSel
            );
          }
          if (selNext)
            this.range = this._adjustSelection({
              node: this.range.collapsed
                ? selNext
                : isForward
                ? [null, selNext]
                : [selNext, null],
              position: this.range.collapsed
                ? isForward
                  ? 0
                  : selNext.textContent.length
                : isForward
                ? [null, 0]
                : [0, null],
            });
        }

        //  track commandTracker
        let commandTracker = {};
        for (let style in this.styleTagOfCommand) {
          commandTracker[style] = false;
        }

        if (this._isSelectionWithinRestrictedRange()) {
          this.commandTracker = commandTracker;
          return;
        }

        let skipTrack = this.restrictedElement_queryArray.concat(
          this.specialTextElement_queryArray
        );
        let crawlResult = this._nodeCrawler(
          (node) => {
            if (
              (node.nodeType === 1 && node.closest("blockquote")) ||
              (node.nodeType === 3 && node.parentNode.closest("blockquote"))
            )
              commandTracker.quote = true;

            let styleRestrictedParents = (c) => {
              return node.nodeType === 3
                ? node.parentNode.closest(c)
                : node.nodeType === 1
                ? node.closest(c)
                : !(node instanceof Node);
            };

            for (let p of skipTrack) {
              let chk = styleRestrictedParents(p);
              if (chk) return node;
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
        let caratEl = this.isRangeDirectionForward
          ? this.range.endContainer
          : this.range.startContainer;

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
      });
    }.bind(this);

    this._keydown = function (e) {
      if (this._isSelectionWithinRestrictedRange()) return;

      this._modifySelection(() => {
        if (!this.range) return;
        let { startContainer, startOffset, collapsed, startLine, endLine } =
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
          this.isRangeDirectionForward = true;

          // if (
          //     this.element.childNodes.length === 1 &&
          //     this._isTextBlockElement(this.element.childNodes[0]) &&
          //     this.element.childNodes[0].textContent.length === 0
          // ) {
          //     if(this.logExecution) console.log('dead end');
          //     e.preventDefault();
          //     // Optionally, reset to a blank paragraph
          //     // this.element.childNodes[0].innerHTML = '<br>';
          //     // this.range = this._adjustSelection({ node: this.element.childNodes[0], position: 0 });
          //     this._lastLineBlank(true);
          // }

          if (
            !this.element.textContent &&
            this.element.childNodes.length <= 1 &&
            this._isTextElement(this.element.childNodes[0]) &&
            this.element.childNodes[0] === startLine
          ) {
            if(this.logExecution) console.log('nothing to delete');
            // there is nothing to delete
            e.preventDefault();
          } else {
            let stc = this.range.startContainer;
            if (this.range.collapsed) {
              let block = (stc.nodeType === 3 ? stc.parentNode : stc).closest(
                "blockquote"
              );
              if (
                block &&
                block.childNodes[0] ===
                  this._climbUpToEldestParent(stc, block) &&
                this.range.startOffset === 0
              ) {
                // if the block is empty and the cursor is on the first offset position within the blockquote
                // cursor is on the first offset position within the blockquote
                e.preventDefault();
                this.command("quote");
              }

              if(this.range.startOffset === 0) {
                let ceil = this._climbUpToEldestParent(stc, this.element).previousSibling;
                for(let cl of this.restrictedElement_queryArray) {
                  if(ceil && ceil.closest(cl)) {
                    // remove the element
                    this.element.removeChild(ceil);
                    e.preventDefault();
                    return;
                  }
                }
              }
            }

            let commonAncestorContainer = this.range.commonAncestorContainer;
            // check if commonAncestorContainer is the only element in this.element

            // e.preventDefault();
            if (
              !this.range.startOffset &&
              ((this.element.childNodes.length === 1 &&
              commonAncestorContainer === this.element.childNodes[0]) ||
              (commonAncestorContainer === this.element && this.element.childNodes.length === 0))
            ) {
              // if the element is empty and the cursor is on the first offset position within the block
              // let t = document.createTextNode("\u200B");
              // let stcEl = stc.nodeType === 3 ? stc.parentNode : stc;
              // stcEl.insertBefore(t, stcEl[0]);
              e.preventDefault();
              return;
            }

            // // Not sure what this is meant to do...
            // if (stc.nodeType === 1 && this._isTextBlockElement(stc) && !this.range.startOffset) {
            //     let t = document.createTextNode('\u200B');
            //     stc.insertBefore(t, stc.childNodes[0]);
            //     this.range = this._adjustSelection({
            //         node: t,
            //         position: 0
            //     });
            // }
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

        // when user press shift + arrows to expand the selection range,
        // this.isRangeDirectionForward is responsible of setting direction to expand
        // when set to true, the endOffset will change when using shift + arrow
        if (shift) {
          if (key === "PAGEUP" || key === "HOME") {
            this.isRangeDirectionForward = false;
            return;
          }

          if (key === "PAGEDOWN" || key === "END") {
            this.isRangeDirectionForward = true;
            return;
          }
        }

        if (key.includes("ARROW")) {
          this._setArrow(e);
          return;
        }

        if (key === "TAB") {
          this.isRangeDirectionForward = true;

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
                this._adjustSelection({
                  node: [startLine, endLine],
                  position: [true, false],
                });
            } else if (startLine.textContent[0] === "\t") {
              let lineOffset = (line, container, containerOffset) => {
                if (line === container) return containerOffset;

                this._nodeCrawler(
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
                this._adjustSelection({ node: startLine, position: offset });
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
                this._adjustSelection({
                  node: [startLine, endLine],
                  position: [true, false],
                });
            } else {
              let tab = document.createTextNode("\t");
              this.range.insertNode(tab);
              this._adjustSelection({ node: tab, position: false });
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
            this._nodeCrawler(
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

        this.isRangeDirectionForward = true;
      });
    }.bind(this);

    this._normalize = function (e) {
      e.stopPropagation();
      this._modifySelection(() => {
        if (this._isSelectionWithinRestrictedRange()) return;
        this._normalizeDocument(true);
        this.range_backup = this.range.cloneRange();
        this._replaceText(true);
      });
    }.bind(this);
    this._paste = function (e) {
      e.preventDefault();
      if (this._isSelectionWithinRestrictedRange()) return;
      this._modifySelection(() => {
        if (this.range) {
          if (this._isSelectionWithinRestrictedRange()) return;
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
      });
    }.bind(this);
    this._keyup = function () {
      if (this.removeSandwichedLine_array.length)
        while (this.removeSandwichedLine_array.length)
          this.removeSandwichedLine_array.pop().remove();
    }.bind(this);

    document.addEventListener("selectionchange", this._selectionchange);
    this.element.addEventListener("keydown", this._keydown);
    this.element.addEventListener("mousedown", this._normalize);
    // this.element.addEventListener('blur', this._normalize);
    // fuck safari, firefox
    window.addEventListener("mousedown", this._normalize);
    this.element.addEventListener("paste", this._paste);
    this.element.addEventListener("keyup", this._keyup);
  }

  _observeMutation(track) {
    if (this.observer) this.observer.disconnect();

    this.observer = null;

    if (!track) return;

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
                let child = m.childNodes;
                let childIdx = child.length;
                while (childIdx--) {
                  let c = child[childIdx];
                  switch (c.nodeName) {
                    case "IMG":
                      callbackRemoved("image", c);
                      break;
                  }
                }
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
                    this._adjustSelection({ node: tab, position: false });
                  }

                  // if empty text block is added add br
                  if (
                    !node.line.textContent ||
                    node.line.textContent === "\u200B"
                  ) {
                    let addBr = true;
                    this._nodeCrawler(
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
                  this._climbUpToEldestParent(i, node.ceiling, true, (n) => {
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

  _setArrow(e) {
    if (this.logExecution) console.log("_setArrow", { e });
    if (!this.range || !e?.key) return;

    let endContainer,
      endOffset,
      startContainer,
      startOffset,
      collapsed,
      startLine,
      endLine,
      isAllRangeOnSameLine,
      currentLine,
      caratElement,
      arrowDirection;

    let key = e.key.toUpperCase();
    let shift = e?.shiftKey || false;
    let metaKey = e?.ctrlKey || e?.metaKey || false;
    let rangeSetup = () => {
      endContainer = this.range?.endContainer;
      endOffset = this.range?.endOffset;
      startContainer = this.range?.startContainer;
      startOffset = this.range?.startOffset;
      collapsed = this.range?.collapsed;
      startLine = this.range?.startLine;
      endLine = this.range?.endLine;
      isAllRangeOnSameLine = startLine === endLine;
      currentLine = this.isRangeDirectionForward ? endLine : startLine;
      caratElement = this.isRangeDirectionForward
        ? endContainer
        : startContainer;
      caratElement =
        caratElement?.nodeType === 3 ? caratElement?.parentNode : caratElement;
    };

    let preventDefault = () => {
      try {
        e.preventDefault();
      } catch (err) {}
    };

    let removeZeroSpace = () => {
      let targetContainer = this.isRangeDirectionForward
        ? endContainer
        : startContainer;
      let nudged = false;

      if (
        collapsed &&
        (targetContainer.textContent.includes("\u200B") ||
          !targetContainer.textContent)
      ) {
        this._nodeCrawler(
          (n) => {
            if (
              n.nodeType === 3 &&
              (n.textContent === "\u200B" || !n.textContent)
            ) {
              let r = n.nextSibling || n.parentNode;
              let siblingDirection = this.isRangeDirectionForward
                ? "nextSibling"
                : "previousSibling";

              if (
                n === targetContainer ||
                (() => {
                  // fuck safari
                  if (targetContainer.nodeType === 1) {
                    let idx = targetContainer.childNodes.length;
                    while (idx--) {
                      if (targetContainer.childNodes[idx] === n) return true;
                    }
                    return false;
                  }
                })()
              ) {
                let run = r;
                if (run.nodeType === 1 && n.parentNode === run) {
                  if (run[siblingDirection]) nudged = run[siblingDirection];
                } else nudged = r;

                n.remove();

                this.range = this._adjustSelection({
                  node: !collapsed
                    ? this.isRangeDirectionForward
                      ? [null, nudged || r]
                      : [nudged || r, null]
                    : nudged,
                  position: !collapsed
                    ? this.isRangeDirectionForward
                      ? [null, nudged]
                      : [!nudged, null]
                    : this.isRangeDirectionForward,
                });

                rangeSetup();
                preventDefault();
                return "BREAK";
              }
            }
            return n;
          },
          { node: targetContainer }
        );
      }
      return !!nudged;
    };

    let isCaratOnMultiLine = (el) => {
      // check if carat is on the first / last line of multi wrapped line

      let posTarget = arrowDirection === "DOWN" ? "bottom" : "top";
      let caratViewPortPosition = this.range.getBoundingClientRect();
      let elPosition = el.getBoundingClientRect()[posTarget];
      let phoneTextSize = parseInt(
        this.fontSizeCssVariable["--wysiwyg-font-phone"]
      );

      if (caratViewPortPosition.height) {
        let isLastLine =
          (posTarget === "bottom"
            ? elPosition - caratViewPortPosition[posTarget]
            : caratViewPortPosition[posTarget] - elPosition) < phoneTextSize;
        return !isLastLine;
      }

      return false;
    };

    let nudgeRangeToInlineElement = () => {
      let rem = removeZeroSpace();

      if (
        !rem &&
        window.getComputedStyle(caratElement).display === "inline-block"
      ) {
        let _caratElement =
          caratElement.nodeType === 3 ? caratElement.parentNode : caratElement;
        while (
          window.getComputedStyle(_caratElement).display === "inline-block"
        ) {
          _caratElement = _caratElement.parentNode;
        }

        let siblingDirection =
          arrowDirection === "UP" ? "previousSibling" : "nextSibling";
        let nextEl = _caratElement[siblingDirection];

        if (!nextEl) {
          let t = document.createTextNode("");
          _caratElement.parentNode.insertBefore(
            t,
            siblingDirection === "previousSibling" ? _caratElement : nextEl
          );
        }

        _caratElement = _caratElement[siblingDirection];

        if (_caratElement) {
          let setDirection = (() => {
            return arrowDirection === "DOWN";
          })();

          this.range = this._adjustSelection({
            node: shift
              ? this.isRangeDirectionForward
                ? [null, _caratElement]
                : [_caratElement, null]
              : _caratElement,
            position: shift
              ? this.isRangeDirectionForward
                ? [null, setDirection]
                : [setDirection, null]
              : setDirection,
          });

          rangeSetup();

          return true;
        }
      }
      return false;
    };

    rangeSetup();

    switch (key) {
      case "ARROWLEFT":
        arrowDirection = "LEFT";
      case "ARROWRIGHT":
        arrowDirection = arrowDirection || "RIGHT";

        if (metaKey || (collapsed && shift)) {
          this.isRangeDirectionForward = arrowDirection === "RIGHT";
          rangeSetup();
        }

        let caratOnSingleLine = !isCaratOnMultiLine(caratElement);

        let nudged;
        if (caratOnSingleLine) {
          if (metaKey && arrowDirection === "RIGHT")
            nudged = nudgeRangeToInlineElement();
        }

        if (!nudged) removeZeroSpace();

        break;

      case "ARROWUP":
        arrowDirection = "UP";
      case "ARROWDOWN":
        arrowDirection = arrowDirection || "DOWN";

        if (!collapsed && !shift) {
          preventDefault();
          let adj =
            arrowDirection === "UP"
              ? [startContainer, startOffset]
              : [endContainer, endOffset];
          this.range = this._adjustSelection({
            node: adj[0],
            position: adj[1],
          });
          break;
        }

        if (collapsed || isAllRangeOnSameLine) {
          this.isRangeDirectionForward = arrowDirection === "DOWN";
          rangeSetup();
        }

        if (isCaratOnMultiLine(caratElement)) break;

        let iNudged = nudgeRangeToInlineElement();

        if (iNudged) break;
        else removeZeroSpace();

        let isMultiLine = isCaratOnMultiLine(currentLine);
        if (isMultiLine) break;

        let eldestParentOfCurrentLine = this._climbUpToEldestParent(
          currentLine,
          this.element
        );

        let isCurrentLineInsideSubCeiling =
          eldestParentOfCurrentLine.id !== this.elementId &&
          this._isCeilingElement(eldestParentOfCurrentLine);

        // break out if current line is inside the sub ceiling and it's not on the last line
        if (
          isCurrentLineInsideSubCeiling &&
          ((arrowDirection === "UP" &&
            eldestParentOfCurrentLine.firstChild !== currentLine) ||
            (arrowDirection === "DOWN" &&
              eldestParentOfCurrentLine.lastChild !== currentLine))
        )
          break;

        let siblingSet = [
          isCurrentLineInsideSubCeiling
            ? eldestParentOfCurrentLine.previousSibling
            : currentLine.previousSibling,
          isCurrentLineInsideSubCeiling
            ? eldestParentOfCurrentLine.nextSibling
            : currentLine.nextSibling,
        ];

        if (arrowDirection === "UP") siblingSet.reverse();

        let [backwardNode, forwardNode] = siblingSet;

        // if current line is on last line of sub ceiling set forward node to sub ceiling
        let _forwardNode = isCurrentLineInsideSubCeiling
          ? eldestParentOfCurrentLine
          : forwardNode;
        if (_forwardNode) {
          if (this._isBlockElement(_forwardNode) && !shift) {
            preventDefault();

            let leap =
              arrowDirection === "UP"
                ? _forwardNode.previousSibling
                : _forwardNode.nextSibling;

            if (!leap || this._isBlockElement(leap)) {
              let p = this._createEmptyParagraph();
              _forwardNode.parentNode.insertBefore(
                p,
                arrowDirection === "UP" ? _forwardNode : leap
              );
              _forwardNode = p;
            } else _forwardNode = leap;

            this.range = this._adjustSelection({
              node: _forwardNode,
              position: arrowDirection === "DOWN",
            });

            if (
              !shift &&
              !currentLine.textContent &&
              (this._isBlockElement(backwardNode) ||
                (!backwardNode && currentLine === this.element.firstChild))
            )
              this.removeSandwichedLine_array.push(currentLine);
          } else if (!isMultiLine && arrowDirection === "DOWN") {
            preventDefault();
            let collectOffset = 0;
            let currentOffset = this.isRangeDirectionForward
              ? endOffset
              : startOffset;
            this._nodeCrawler(
              (n) => {
                if (n === endContainer) return "BREAK";
                else if (n.nodeType === 3 && n.textContent)
                  collectOffset += n.textContent.length;
                return n;
              },
              {
                node: currentLine,
              }
            );
            collectOffset += currentOffset;
            this.range = this._adjustSelection({
              node: collapsed
                ? forwardNode
                : this.isRangeDirectionForward
                ? [null, forwardNode]
                : [forwardNode, null],
              position: collapsed
                ? collectOffset
                : this.isRangeDirectionForward
                ? [null, collectOffset]
                : [collectOffset, null],
            });
          }
        } else preventDefault();
    }
  }

  _append(i, insertAfter, wrap = false, focusElement) {
    if (this.logExecution)
      console.log("_append", { i, insertAfter, wrap, focusElement });
    let common = this._climbUpToEldestParent(
      this.range.commonAncestorContainer,
      this.element
    );
    let [startLine, endLine] = this._getStartEndLine();
    // let startLine = this._climbUpToEldestParent(this.range.startContainer, this.element);
    // let endLine = this._climbUpToEldestParent(this.range.endContainer, this.element);
    let insertRestricted = ["HR", "UL", "LI", "._media_", "._custom_"];

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
        this._nodeCrawler(
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

        this.range = this._adjustSelection({
          node: focusElement || i,
          position: false,
        });

        //  remove garbage node
        let fc = i.previousSibling;
        // let lc = i.nextSibling;

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
      this.range = this._adjustSelection({ node: focusElement || insertAfter });
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
              elementId: this._generateId("img"),
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

    this._modifySelection(() => {
      for (let img of feedback.image) {
        let media = this._loadImage(img, document.createElement("div"));
        this._append(media, this._createEmptyParagraph());
      }
    });
  }

  _loadImage(imageObject, wrapper) {
    if (this.logExecution) console.log("_loadImage", { imageObject, wrapper });
    /**
         elementId: "img_uniqueId"
         element: HTML
         fileSize: 0
         fileType: "image/jpeg"
         source: "file.jpg | http://url.com/file.jpg | s3 filename | base 64 string"
         lastModified: 0000000000000
         filename: "selectedLocalFilename.jpg"
         */

    if (wrapper instanceof Node) {
      if (!wrapper.classList.contains("_media_"))
        wrapper.classList.add("_media_");

      if (wrapper.getAttribute("contenteditable") !== "false")
        wrapper.setAttribute("contenteditable", "false");
    } else throw "image needs _media_ wrapper";

    let process = (i) => {
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
            wrapper.style.setProperty(st, i.style[st]);
          }
        }
      }

      wrapper.setAttribute("contenteditable", "false");
      wrapper.append(image);

      let pushArray = true;

      for (let chk of this.image_array)
        if (chk.elementId === i.elementId) {
          pushArray = false;
          break;
        }

      if (pushArray) this.image_array.push(i);
    };

    process(imageObject);

    return wrapper;
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
  _modifySelection(run, lineByLine) {
    if (this.logExecution) console.log("_modifySelection", { run });
    let sel = window.getSelection();
    let doSingleLine = (sel) => {
      let anchorElement =
        sel.anchorNode?.nodeType === 3
          ? sel.anchorNode.parentNode
          : sel.anchorNode;
      if (anchorElement && anchorElement.closest(`#${this.elementId}`)) {
        if (anchorElement.id === this.elementId) {
          // In case selection is the wysiwyg element itself
          let lastChild = this.element.lastChild;
          if (!lastChild) {
            // Wysiwyg is empty
            lastChild = this._createEmptyParagraph();
            this.element.appendChild(lastChild);

            // Adjust selection
            this.range = this._adjustSelection({
              node: lastChild,
              position: true,
            });
          }
        } else this.range = this._adjustSelection(null);

        if (typeof run === "function") run();
        return;
      }
    };

    // if (lineByLine) { // TODO: line by line
    //   let [startLine, endLine, inBetween] = this._getStartEndLine(
    //     this.range,
    //     this.element,
    //     true
    //   );

    //   if (this.logExecution) console.log({ startLine, endLine, inBetween });

    //   if (startLine === endLine) {
    //     return doSingleLine(sel);
    //   } else {
    //     this.range_backup = this.range.cloneRange();
    //     this.range = this._adjustSelection({
    //       node: startLine,
    //       position: [this._getAnchorOffsetFromLine(startLine), false],
    //     });
    //     if (typeof run === "function") run();

    //     if (inBetween?.length) {
    //       for (let i of inBetween) {
    //         this.range = this._adjustSelection({
    //           node: inBetween[i],
    //           position: [true, false],
    //         });

    //         if (typeof run === "function") run();
    //       }
    //     }

    //     this.range = this._adjustSelection({
    //       node: endLine,
    //       position: [true, this._getFocusOffsetFromLine(endLine)],
    //     });

    //     if (typeof run === "function") run();

    //     this.restoreLastSelection();
    //     return;
    //   }
    // } else if (sel) {
    return doSingleLine(sel);
    // }

    this.range = null;
    this.commandTracker = {};
  }

  _normalizeDocument(normalize) {
    if (this.logExecution) console.log("_normalizeDocument", { normalize });
    if (!normalize) return;

    this._nodeCrawler(
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

            let el = this._climbUpToEldestParent(n, cel, true);

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
        } else if (n.nodeType === 1) n.normalize();

        return n;
      },
      { node: this.element }
    );
  }

  _replaceText(wholeDocument = false) {
    if (this.logExecution) console.log("_replaceText", { wholeDocument });
    const process = (typeName, setData) => {
      if (!this[typeName]) return;

      let regex = this[`${typeName}_regex`] || null;

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
        this._nodeCrawler(
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
        this.range = this._adjustSelection({
          node: res.anchorText,
          position: false,
        });
      }

      let toCallback = [];
      let collectId = [];

      if (textEl[0])
        for (let el of textEl) {
          let elementId = this._generateId(typeName);
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
      case "quote":
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        this._modifySelection(() => {
          let p = this._createEmptyParagraph(),
            bq = document.createElement("blockquote");
          this._append(bq, p, true);
        });
        return;
      case "unorderedList":
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        this._modifySelection(() => {
          let p = this._createEmptyParagraph(),
            li = document.createElement("li"),
            ul = document.createElement("ul");
          ul.append(li);
          this._append(ul, p, false, li);
        });

        return;
      case "orderedList":
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        this._modifySelection(() => {
          let p = this._createEmptyParagraph(),
            li = document.createElement("li"),
            ul = document.createElement("ol");
          ul.append(li);
          this._append(ul, p, false, li);
        });

        return;
      case "divider":
        if (
          !this.range ||
          (() => {
            let c = this.range.commonAncestorContainer;
            c = c.nodeType === 3 ? c.parentNode : c;
            return !c.closest("#" + this.elementId);
          })()
        )
          this.element.focus();

        this._modifySelection(() => {
          let p = this._createEmptyParagraph(),
            hr = document.createElement("hr");
          hr.setAttribute("contenteditable", "false");
          this._append(hr, p, false);
        });
        return;
      case "image":
        this.imgInput.click();
        return;
      case "alignLeft":
      case "alignCenter":
      case "alignRight":
        if (!this.range) return;

        this._modifySelection(() => {
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
        });
        return;

      default:
        break;
    }

    let isColor;
    try {
      isColor = new ColorMangle(action).hex();
      action = "color";
    } catch {}

    //  style command
    if (this.styleTagOfCommand[action]) {
      this._modifySelection(() => {
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
                  this.cssVariable["--content-focus"]);
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

        let restrictedClass = this._isSelectionWithinRestrictedRange();
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

          this.range = this._adjustSelection({ node: text, position: false });
        } else {
          if (restrictedClass) {
            this.range = this._adjustSelection({
              node: this.range.endContainer,
              position: this.range.endOffset,
            });
            return;
          }
          //  selection has range
          let extract = this.range.extractContents();
          let span = document.createElement("span");

          while (extract.childNodes[0]) span.append(extract.childNodes[0]);

          this._nodeCrawler(
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
          this.range = this._adjustSelection({
            node: [fc, lc],
            position: [true, false],
          });

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
      }, true);

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

      this._modifySelection(() => {
        //  setup wrapper
        let custom = document.createElement("div");
        custom.classList.add("_custom_");
        custom.setAttribute(
          "contenteditable",
          (!!action?.contenteditable).toString()
        );

        if (action.style)
          for (let s in action.style) custom.style[s] = action.style[s];

        action.elementId = action.elementId || this._generateId("custom");
        custom.id = action.elementId;

        if (typeof action.element === "string")
          custom.innerHTML = action.element;
        else if (action.element instanceof HTMLElement)
          custom.append(action.element);

        if (!custom.children.length) action.insert = true; // insert if only text node

        if (!this.range) this.element.focus();

        this.custom_array.push(action);

        this._callback({ custom: action }).then((_) => {
          if (action.insert) {
            let txt = document.createTextNode("");
            this.range.insertNode(txt); // when inserted in range, it will push the next el back
            this.range.insertNode(custom);
            this.range = this._adjustSelection({
              node: txt,
              position: false,
            });
          } else this._append(custom, this._createEmptyParagraph(), false);
        });
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
      this.range = this._adjustSelection({
        node: [
          this.range_backup.startContainer,
          this.range_backup.endContainer,
        ],
        position: [this.range_backup.startOffset, this.range_backup.endOffset],
      });
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
        const imageParent = i.closest("._media_");

        if (imageParent) {
          const source = i.getAttribute("src");
          let imgId = i.id || this._generateId("img");
          i.setAttribute("id", imgId);

          imgCallback.push({
            source,
            elementId: imgId,
            element: i,
          });
        }

        this.image_array = JSON.parse(JSON.stringify(imgCallback));
      }

    // hashtag
    const hashtag = div.querySelectorAll("._hashtag_");
    const hashtagCallback = [];
    if (hashtag.length)
      for (let i of hashtag) {
        let clIdx = i.classList.length;
        let tag,
          elementId = i.id || this._generateId("hashtag");
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
        let elementId = i.id || this._generateId("urllink");
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
        let elementId = i.id || this._generateId("custom");
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
          let imgEl = div.querySelector("#" + i.elementId);
          const imageParent = imgEl.closest("._media_");
          this._loadImage(i, imageParent);
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
    this._normalizeDocument(true);
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
