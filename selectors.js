function adjustSelection(
    target,
    ceilingElement_query
) {
    // Adjusts the selection range in the document
    // target: { node: [Node], position: [number] }
    // ceilingElement_query: [string] (CSS selector)
    // Returns: { startLine: Node, endLine: Node }
    // If target is null, it will not set the selection range
    // If ceilingElement_query is null, it will not set the startLine and endLine

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

    let range = null;
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
                        nodeCrawler(
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
                startLine = climbUpToEldestParent(s, s.closest(q));
            if (!endLine && e.closest(q))
                endLine = climbUpToEldestParent(e, e.closest(q));

            if (startLine && endLine) break;
        }

        range.startLine = startLine;
        range.endLine = endLine;
    }

    return range;
}

function nodeCrawler(run, option) {
    const { parentNode, node, startFromEldestChild, startNode } = option;
    // const options = {
    //   node: document.getElementById('content'),
    //   parentNode: document.body,
    //   startFromEldestChild: true
    //   startNode: document.getElementById('start') // optional
    // };

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
    } else commonContainer = node;

    commonContainer =
        commonContainer.nodeType === 3
            ? commonContainer?.parentNode || commonContainer
            : commonContainer;

    if (startFromEldestChild)
        commonContainer = climbUpToEldestParent(
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
                id = generateId("crawl");
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
        else if (cwl.nodeType === 3)
            return cwl.parentNode && cwl.parentNode?.closest("#" + uniqueId);
        else return false;
    };
    let diving = false;
    while (withInRange(crawl)) {
        if (!diving && crawl.nodeType === 1 && crawl.childNodes.length) {
            // dive down to deepest child's first crawl
            crawl = crawl.childNodes[0];
        } else if (crawl) {
            diving = true;
            // entering the deepest elements first child.

            if (crawl.nodeType === 3) {
                crawl = crawl.nextSibling || crawl.parentNode;
                continue;
            }

            if (typeof run === "function") crawl = run(crawl);
            if (crawl === "BREAK") break;

            if (withInRange(crawl))
                outputNodes.push(crawl);

            /**
             * Climb up the node if the node doesn't have any next siblings
             * Stop when it hits the commonContainer
             */
            if (
                crawl.nextSibling
            ) {
                crawl = crawl.nextSibling;
            } else if (crawl.parentNode) {
                if (crawl.parentNode === commonContainer) {
                    crawl = crawl.nextSibling;
                    diving = false;
                }
                else {
                    crawl = crawl.parentNode;
                }
            }
            else {
                break;
            }
        }
    }

    if (id) commonContainer.removeAttribute("id");

    return { node: outputNodes, commonContainer };
}

function generateId(option) {
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

    return prefix + numb + text;
}

function climbUpToEldestParent(node, wrapper, singleChildParent = false, callback) {
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
            id = generateId("eldest");
            wrapper.id = id;
            return id;
        })();
    // on single parent mode climb up if parent has only 1 child or 2 child with zero space text
    function isSingleChildParent(n) {
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
        (singleChildParent ? isSingleChildParent(node?.parentNode) : true)
    ) {
        let cb = callback(node.parentNode);

        if (!cb || cb === "BREAK") break;

        node = cb;
    }

    if (id) wrapper.removeAttribute("id");

    return node;
}

export { adjustSelection, nodeCrawler, generateId, climbUpToEldestParent };