type EditorFontSize = {
	desktop?: number | string;
	tablet?: number | string;
	phone?: number | string;
	h1?: number | string;
	h2?: number | string;
	h3?: number | string;
	h4?: number | string;
	h5?: number | string;
	h6?: number | string;
	small?: number | string;
};

type ColorScheme = Record<string, string>;

type BuiltInCommand =
	| "quote"
	| "unorderedList"
	| "orderedList"
	| "divider"
	| "image"
	| "alignLeft"
	| "alignCenter"
	| "alignRight"
	| "h1"
	| "h2"
	| "h3"
	| "h4"
	| "h5"
	| "h6"
	| "small"
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "color";

type InlineClassCommand =
	| "h1"
	| "h2"
	| "h3"
	| "h4"
	| "h5"
	| "h6"
	| "small"
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "color"
	| "backgroundColor";

type AlignCommand = "alignLeft" | "alignCenter" | "alignRight";

type CommandObject = {
	element?: HTMLElement | string;
	elementId?: string;
	style?: Partial<CSSStyleDeclaration> & Record<string, string>;
	insert?: boolean;
	backgroundColor?: string;
	color?: string;
};

type CommandInput = BuiltInCommand | CommandObject | string;

type TrackerValue = boolean | string;

type CommandTracker = Record<string, TrackerValue>;

type ImageData = {
	elementId: string;
	source: string;
	filename?: string;
	fileType?: string;
	fileSize?: number;
	lastModified?: number;
	dimension?: { width: number; height: number };
	element?: HTMLImageElement;
	class?: string[];
	style?: Record<string, string>;
	onclick?: (ev: MouseEvent) => void;
};

type HashtagData = {
	elementId: string;
	tag: string;
	element?: HTMLSpanElement;
	style?: Record<string, string>;
	onclick?: (ev: MouseEvent) => void;
};

type UrlData = {
	elementId: string;
	url: string;
	element?: HTMLSpanElement;
	style?: Record<string, string>;
	onclick?: (ev: MouseEvent) => void;
};

type CustomData = {
	elementId: string;
	element: HTMLElement;
};

type CallbackPayload = {
	commandTracker?: CommandTracker;
	range?: Range | null;
	caratPosition?: DOMRect | null;
	mutation?: unknown[];
	loading?: boolean;
	image?: ImageData[];
	hashtag?: HashtagData[];
	urllink?: UrlData[];
	custom?: CustomData[];
	removed?: Record<string, unknown[]>;
	paste?: ClipboardEvent;
};

type ExportPayload = {
	html: string;
	title: string;
	text: string;
	urllink?: UrlData[];
	hashtag?: HashtagData[];
	image: ImageData[];
	custom: CustomData[];
};

type ExtensionApi = {
	registerCommand: (name: string, handler: (editor: Wysiwyg4All, action: CommandInput) => void | Promise<void>) => void;
	on: (eventName: string, handler: (...args: unknown[]) => void) => () => void;
	editor: Wysiwyg4All;
};

type ExtensionFactory = (api: ExtensionApi) => void;

type ExportSetup = {
	dom: HTMLElement;
	urllink?: UrlData[];
	hashtag?: HashtagData[];
	image: ImageData[];
	custom: CustomData[];
	title?: string;
};

export type Wysiwyg4AllOptions = {
	elementId: string;
	editable?: boolean;
	placeholder?: string;
	spellcheck?: boolean;
	highlightColor?: string | ColorScheme;
	html?: string;
	callback?: (payload: CallbackPayload) => CallbackPayload | Promise<CallbackPayload>;
	fontSize?: EditorFontSize | number;
	// lastLineBlank?: boolean;
	hashtag?: boolean;
	urllink?: boolean;
	logMutation?: boolean;
	logExecution?: boolean;
	logNormalizeRemoval?: boolean;
	extensions?: ExtensionFactory[];
};

const CLASS_BY_COMMAND: Record<InlineClassCommand, string> = {
	h1: "_h1",
	h2: "_h2",
	h3: "_h3",
	h4: "_h4",
	h5: "_h5",
	h6: "_h6",
	small: "_small",
	bold: "_b",
	italic: "_i",
	underline: "_u",
	strike: "_del",
	color: "_color",
	backgroundColor: "_backgroundColor",
};

const COUNTER_CLASSES: Partial<Record<InlineClassCommand, string[]>> = {
	h1: ["_small", "_h2", "_h3", "_h4", "_h5", "_h6"],
	h2: ["_small", "_h1", "_h3", "_h4", "_h5", "_h6"],
	h3: ["_small", "_h1", "_h2", "_h4", "_h5", "_h6"],
	h4: ["_small", "_h1", "_h2", "_h3", "_h5", "_h6"],
	h5: ["_small", "_h1", "_h2", "_h3", "_h4", "_h6"],
	h6: ["_small", "_h1", "_h2", "_h3", "_h4", "_h5"],
	small: ["_h1", "_h2", "_h3", "_h4", "_h5", "_h6", "_b"],
	bold: ["_small"],
	underline: ["_del"],
	strike: ["_u"],
};

const ALIGN_CLASSES = ["_alignCenter_", "_alignRight_"];

const FONT_SIZE_CLASSES = ["_h1", "_h2", "_h3", "_h4", "_h5", "_h6", "_small"] as const;
const FONT_SIZE_CLASS_SET = new Set<string>(FONT_SIZE_CLASSES);

const BLOCK_TAGS = new Set(["P", "LI", "BLOCKQUOTE", "UL", "OL", "HR", "DIV"]);

// Tokenize only after the user types a breakout whitespace.
const HASHTAG_REGEX = /(^|\s)(#[\p{L}\p{N}_-]{1,80})(?=\s)/gu;
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)(?=\s)/gi;

function clampNumber(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function toPx(value: number | string | undefined, fallback: string): string {
	if (typeof value === "number") return `${value}px`;
	if (typeof value === "string" && value.trim()) return value;
	return fallback;
}

function isHTMLElement(value: unknown): value is HTMLElement {
	return value instanceof HTMLElement;
}

function isNode(value: unknown): value is Node {
	return value instanceof Node;
}

function createUid(prefix: string): string {
	const rand = Math.random().toString(36).slice(2, 8);
	const ts = Date.now().toString().slice(-6);
	return `${prefix}_${ts}${rand}`;
}

function tryNormalizeColor(input: string): string | null {
	const test = document.createElement("span");
	test.style.color = "";
	test.style.color = input;
	if (!test.style.color) return null;
	document.body.appendChild(test);
	const computed = getComputedStyle(test).color;
	test.remove();
	const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
	if (!match) return null;
	const [, r, g, b] = match;
	const hex = [r, g, b]
		.map((v) => clampNumber(Number(v), 0, 255).toString(16).padStart(2, "0"))
		.join("");
	return `#${hex}`;
}

function buildDefaultScheme(highlightColor: string): ColorScheme {
	const focus = tryNormalizeColor(highlightColor) || "#0d9488";
	return {
		"--content": "#ffffff",
		"--content-text": "#111827",
		"--content-focus": focus,
		"--focus": `${focus}33`,
		"--placeholder": "#9ca3af",
	};
}

export class Wysiwyg4All {
	private readonly option: Wysiwyg4AllOptions;
	private readonly element: HTMLElement;
	private readonly styleTagOfCommand: Record<InlineClassCommand, string>;
	private readonly customCommandHandlers = new Map<string, (editor: Wysiwyg4All, action: CommandInput) => void | Promise<void>>();
	private readonly eventBus = new Map<string, Set<(...args: unknown[]) => void>>();
	private readonly imageInput: HTMLInputElement;
	private observer: MutationObserver | null = null;
	private range: Range | null = null;
	private rangeBackup: Range | null = null;
	private callback: Wysiwyg4AllOptions["callback"];
	private readonly hashtagEnabled: boolean;
	private readonly urlEnabled: boolean;
	private readonly logExecution: boolean;
	private readonly logMutation: boolean;
	private readonly logNormalizeRemoval: boolean;
	private lastKey: string | null = null;
	private suspendSelectionCaptureForColorPicker = false;
	private colorCommandDebounceTimer: number | null = null;
	private pendingColorCommand: { color?: string; backgroundColor?: string } | null = null;
	private pendingColorSelectionSnapshot: { start: number; end: number } | null = null;

	public highlightColor: string;
	public defaultFontColor = "#111827";
	public defaultBackgroundColor = "#ffffff";
	public image_array: ImageData[] = [];
	public hashtag_array: HashtagData[] = [];
	public urllink_array: UrlData[] = [];
	public custom_array: CustomData[] = [];
	public commandTracker: CommandTracker = {};
	// public lastLineBlank: boolean;

	constructor(option: Wysiwyg4AllOptions) {
		if (!option || typeof option !== "object") {
			throw new Error("Wysiwyg4All option is required");
		}
		if (!option.elementId || typeof option.elementId !== "string") {
			throw new Error("The wysiwyg element should have an ID");
		}

		const elementId = option.elementId.startsWith("#")
			? option.elementId.slice(1)
			: option.elementId;
		const element = document.getElementById(elementId);
		if (!element) {
			throw new Error(`element #${elementId} is null`);
		}

		this.option = { ...option, elementId };
		this.element = element;
		this.callback = option.callback;
		this.hashtagEnabled = !!option.hashtag;
		this.urlEnabled = !!option.urllink;
		this.logExecution = !!option.logExecution;
		this.logMutation = !!option.logMutation;
		this.logNormalizeRemoval = !!option.logNormalizeRemoval;
		// this.lastLineBlank = !!option.lastLineBlank;

		this.styleTagOfCommand = { ...CLASS_BY_COMMAND };
		this.highlightColor = tryNormalizeColor(
			typeof option.highlightColor === "string" ? option.highlightColor : "#0d9488"
		) || "#0d9488";

		this.applyTheme(option.highlightColor);
		this.applyFontSize(option.fontSize);

		this.element.classList.add("_wysiwyg4all");
		this.element.innerHTML = "";
		this.setPlaceholder(option.placeholder || "");
		this.setSpellcheck(!!option.spellcheck);

		this.imageInput = document.createElement("input");
		this.imageInput.type = "file";
		this.imageInput.accept = "image/gif,image/png,image/jpeg,image/webp";
		this.imageInput.multiple = true;
		this.imageInput.hidden = true;
		this.imageInput.addEventListener("change", (ev) => {
			void this.onImageSelected(ev).catch((err) => console.error(err));
		});

		this.initializeCommandTracker();
		this.bindCoreEvents();
		this.bootstrapExtensions(option.extensions || []);

		void this.loadHTML(option.html || "", option.editable ?? true).catch((err) => {
			console.error(err);
		});
	}

	private log(message: string, data?: unknown): void {
		if (this.logExecution) {
			if (data === undefined) console.log(message);
			else console.log(message, data);
		}
	}

	private initializeCommandTracker(): void {
		const baseKeys = [
			"quote",
			"unorderedList",
			"orderedList",
			"alignLeft",
			"alignCenter",
			"alignRight",
			...Object.keys(this.styleTagOfCommand),
		];
		for (const key of baseKeys) {
			this.commandTracker[key] = false;
		}
	}

	private applyTheme(highlightColor?: string | ColorScheme): void {
		const scheme: ColorScheme =
			typeof highlightColor === "object" && highlightColor
				? highlightColor
				: buildDefaultScheme(typeof highlightColor === "string" ? highlightColor : "#0d9488");
		for (const [key, value] of Object.entries(scheme)) {
			this.element.style.setProperty(key, value);
		}
		const computed = getComputedStyle(this.element);
		const contentText = computed.getPropertyValue("--content-text").trim();
		const contentBg = computed.getPropertyValue("--content").trim();
		const contentFocus = computed.getPropertyValue("--content-focus").trim();
		this.defaultFontColor = tryNormalizeColor(contentText) || "#111827";
		this.defaultBackgroundColor = tryNormalizeColor(contentBg) || "#ffffff";
		this.highlightColor = tryNormalizeColor(contentFocus) || this.highlightColor;
	}

	private applyFontSize(fontSize?: EditorFontSize | number): void {
		const fs =
			typeof fontSize === "number"
				? { desktop: fontSize, tablet: fontSize, phone: fontSize }
				: fontSize || {};

		const desktop = toPx(fs.desktop, "18px");
		const tablet = toPx(fs.tablet ?? fs.desktop, desktop);
		const phone = toPx(fs.phone ?? fs.tablet ?? fs.desktop, tablet);
		this.element.style.setProperty("--wysiwyg-font-desktop", desktop);
		this.element.style.setProperty("--wysiwyg-font-tablet", tablet);
		this.element.style.setProperty("--wysiwyg-font-phone", phone);

		const ratioDefaults: Record<string, string | number> = {
			h1: 4.2,
			h2: 3.56,
			h3: 2.92,
			h4: 2.28,
			h5: 1.64,
			h6: 1.15,
			small: 0.8,
		};

		for (const [tag, fallback] of Object.entries(ratioDefaults)) {
			const raw = (fs as EditorFontSize)[tag as keyof EditorFontSize] ?? fallback;
			if (typeof raw === "number") {
				this.element.style.setProperty(`--wysiwyg-${tag}`, `calc(var(--wysiwyg-font) * ${raw})`);
			} else {
				const normalized = raw.trim();
				if (normalized.endsWith("px")) {
					this.element.style.setProperty(`--wysiwyg-${tag}`, normalized);
				} else {
					const parsed = Number.parseFloat(normalized);
					if (Number.isFinite(parsed) && parsed > 0) {
						this.element.style.setProperty(`--wysiwyg-${tag}`, `calc(var(--wysiwyg-font) * ${parsed})`);
					}
				}
			}
		}
	}

	private bindCoreEvents(): void {
		document.addEventListener("selectionchange", this.onSelectionChange);
		this.element.addEventListener("keydown", this.onKeyDown);
		this.element.addEventListener("paste", this.onPaste);
		window.addEventListener("mousedown", this.onWindowMouseDown);
	}

	private unbindCoreEvents(): void {
		document.removeEventListener("selectionchange", this.onSelectionChange);
		this.element.removeEventListener("keydown", this.onKeyDown);
		this.element.removeEventListener("paste", this.onPaste);
		window.removeEventListener("mousedown", this.onWindowMouseDown);
	}

	private bootstrapExtensions(extensions: ExtensionFactory[]): void {
		const api: ExtensionApi = {
			registerCommand: (name, handler) => {
				this.customCommandHandlers.set(name, handler);
			},
			on: (eventName, handler) => {
				if (!this.eventBus.has(eventName)) this.eventBus.set(eventName, new Set());
				this.eventBus.get(eventName)?.add(handler);
				return () => {
					this.eventBus.get(eventName)?.delete(handler);
				};
			},
			editor: this,
		};

		for (const createExtension of extensions) {
			try {
				createExtension(api);
			} catch (err) {
				console.error("extension bootstrap failed", err);
			}
		}
	}

	private emit(eventName: string, ...args: unknown[]): void {
		const handlers = this.eventBus.get(eventName);
		if (!handlers) return;
		for (const handler of handlers) {
			try {
				handler(...args);
			} catch (err) {
				console.error(err);
			}
		}
	}

	private onWindowMouseDown = (ev: MouseEvent): void => {
		if (isNode(ev.target) && this.isUnSelectableElement(ev.target)) {
			return;
		}

		const active = document.activeElement;
		const colorPickerActive = active instanceof HTMLInputElement && active.type === "color";
		if (colorPickerActive && isNode(ev.target) && this.element.contains(ev.target)) {
			// Clicking inside editor to close color picker can collapse the live
			// selection before color command runs. Keep current backup selection.
			this.suspendSelectionCaptureForColorPicker = true;
			return;
		}

		this.suspendSelectionCaptureForColorPicker = false;
	};

	private onSelectionChange = (): void => {
		if (this.suspendSelectionCaptureForColorPicker) {
			const active = document.activeElement;
			if (!(active instanceof HTMLInputElement && active.type === "color")) {
				this.suspendSelectionCaptureForColorPicker = false;
			} else {
			return;
			}
		}
		this.captureRange();
		this.updateCommandTracker();
		// this.ensureLastLineBlank();
	};

	private onKeyDown = (ev: KeyboardEvent): void => {
		this.lastKey = ev.key.toUpperCase();
		this.captureRange();

		if (!this.range) return;

		if (["BACKSPACE", "DELETE"].includes(this.lastKey)) {
			if (!this.element.textContent?.trim() && this.element.childNodes.length <= 1) {
				ev.preventDefault();
				this.ensureRootHasSafeLine();
				return;
			}

			if (this.handleDeleteFromTrailingEmptyLine()) {
				ev.preventDefault();
				return;
			}
		}

		if (this.lastKey === "TAB") {
			ev.preventDefault();
			this.insertText("\t");
			return;
		}

		if (this.lastKey === "ENTER") {
			if (this.handleEnterFromQuoteTail()) {
				ev.preventDefault();
				return;
			}
			queueMicrotask(() => this.ensureRootHasSafeLine());
		}

		window.setTimeout(() => {
			this.normalizeDocument();
			void this.scanSpecialTokens();
		}, 0);
	};

	private onPaste = (ev: ClipboardEvent): void => {
		ev.preventDefault();
		const text = ev.clipboardData?.getData("text/plain") || "";
		this.insertText(text.replace(/\r\n?/g, "\n"));
		queueMicrotask(() => {
			this.normalizeDocument();
			void this.scanSpecialTokens();
		});
	};

	private ensureRootHasSafeLine(): void {
		if (this.element.childNodes.length === 0) {
			this.element.append(this.createEmptyParagraph());
			return;
		}
		if (this.element.childNodes.length === 1) {
			const first = this.element.firstChild;
			if (first && first.nodeType === Node.TEXT_NODE && !first.textContent) {
				first.remove();
				this.element.append(this.createEmptyParagraph());
			}
		}
	}

	// private ensureLastLineBlank(force = false): void {
	// 	if (!this.lastLineBlank && !force) return;
	// 	const last = this.element.lastElementChild;
	// 	if (!last || last.tagName !== "P" || (last.textContent || "").trim() !== "") {
	// 		this.element.append(this.createEmptyParagraph());
	// 	}
	// }

	private createEmptyParagraph(seed?: string): HTMLParagraphElement {
		const p = document.createElement("p");
		if (seed && seed.length) p.append(document.createTextNode(seed));
		else p.append(document.createElement("br"));
		return p;
	}

	private setSelectionAtStart(node: Node): void {
		const range = document.createRange();
		range.selectNodeContents(node);
		range.collapse(true);
		this.restoreLastSelection(range);
	}

	private isLineVisuallyEmpty(line: HTMLElement): boolean {
		if (!this.isLineBlockElement(line)) return false;
		if (line.querySelector("img,video,audio,table,hr,._media_,._custom_")) return false;
		const text = (line.textContent || "").split("\u200B").join("").trim();
		return text.length === 0;
	}

	private isNonTextElement(el: HTMLElement): boolean {
		if (el.classList.contains("_media_") || el.classList.contains("_custom_")) return true;
		return ["HR", "BLOCKQUOTE", "UL", "OL", "TABLE"].includes(el.tagName);
	}

	private getContainingQuote(node: Node): HTMLElement | null {
		const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
		if (!el) return null;
		const quote = el.closest("blockquote");
		return quote instanceof HTMLElement ? quote : null;
	}

	private unwrapQuote(quote: HTMLElement): void {
		const parent = quote.parentNode;
		if (!parent) return;

		const firstChild = quote.firstChild;
		while (quote.firstChild) {
			parent.insertBefore(quote.firstChild, quote);
		}
		quote.remove();

		if (firstChild) {
			const target = firstChild.nodeType === Node.TEXT_NODE ? firstChild.parentNode : firstChild;
			if (target) this.setSelectionAtStart(target as Node);
		}

		this.ensureRootHasSafeLine();
	}

	private getQuoteLineBlocks(quote: HTMLElement): HTMLElement[] {
		return Array.from(quote.querySelectorAll<HTMLElement>("p,li,td,th,tr"));
	}

	private handleEnterFromQuoteTail(): boolean {
		if (!this.range || !this.range.collapsed) return false;

		const quote = this.getContainingQuote(this.range.startContainer);
		if (!quote) return false;

		const currentLine = this.getContainingLineBlock(this.range.startContainer);
		if (!currentLine || !quote.contains(currentLine)) return false;
		if (!this.isLineVisuallyEmpty(currentLine)) return false;

		const lines = this.getQuoteLineBlocks(quote);
		if (lines.length === 0 || lines[lines.length - 1] !== currentLine) return false;

		currentLine.remove();

		const remainingLines = this.getQuoteLineBlocks(quote);
		if (remainingLines.length === 0 && !(quote.textContent || "").trim()) {
			quote.remove();
			this.ensureRootHasSafeLine();
			this.setSelectionAtStart(this.element.lastElementChild || this.element);
			return true;
		}

		const targetLine = this.ensureTrailingEditableLineAfter(quote);
		this.setSelectionAtStart(targetLine);
		return true;
	}

	private handleDeleteFromTrailingEmptyLine(): boolean {
		if (!this.range || !this.range.collapsed) return false;

		const line = this.getContainingLineBlock(this.range.startContainer);
		if (!line) return false;
		if (line !== this.element.lastElementChild) return false;
		if (!this.isLineVisuallyEmpty(line)) return false;

		const prev = line.previousElementSibling as HTMLElement | null;
		if (!prev || !this.isNonTextElement(prev)) return false;

		prev.remove();
		if (!line.isConnected) {
			this.element.append(this.createEmptyParagraph());
			this.setSelectionAtStart(this.element.lastElementChild as Node);
			return true;
		}

		this.setSelectionAtStart(line);
		return true;
	}

	private captureRange(): void {
		const sel = window.getSelection();

		// check if sel is within our editor
		if (!sel || !this.element.contains(sel.anchorNode)) {
			// this.range = null;
			return;
		}

		if (!sel || sel.rangeCount === 0) {
			this.range = null;
			return;
		}
		const normalized = this.normalizeEditorRange(sel.getRangeAt(0));
		if (!normalized) {
			this.range = null;
			return;
		}
		this.range = normalized;
		this.backupCurrentRange(normalized, { bypassNormalize: true });
	}

	private backupCurrentRange(
		source?: Selection | Range | null,
		params?: { bypassNormalize?: boolean }
	): Range | null {
		const bypassNormalize = params?.bypassNormalize ?? false;
		let candidate: Range | null = null;

		if (source instanceof Range) {
			candidate = source.cloneRange();
		} else {
			const sel = source ?? window.getSelection();
			if (!sel || sel.rangeCount === 0) return null;
			if (!this.element.contains(sel.anchorNode)) return null;
			candidate = sel.getRangeAt(0).cloneRange();
		}

		const rangeBackup = bypassNormalize ? candidate : this.normalizeEditorRange(candidate);
		if (!rangeBackup) return null;
		this.rangeBackup = rangeBackup.cloneRange();
		return this.rangeBackup;
	}

	private getTextOffsetWithinEditor(container: Node, offset: number): number | null {
		if (container !== this.element && !this.element.contains(container)) return null;

		const probe = document.createRange();
		try {
			probe.setStart(this.element, 0);
			probe.setEnd(container, offset);
		} catch {
			return null;
		}

		return probe.toString().length;
	}

	private resolveBoundaryFromTextOffset(charOffset: number): { container: Node; offset: number } | null {
		let remaining = Math.max(0, charOffset);
		const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_TEXT);
		let lastText: Text | null = null;

		while (walker.nextNode()) {
			const textNode = walker.currentNode as Text;
			const len = textNode.length;
			lastText = textNode;

			if (remaining <= len) {
				return { container: textNode, offset: remaining };
			}

			remaining -= len;
		}

		if (lastText) {
			return { container: lastText, offset: lastText.length };
		}

		const last = this.element.lastChild;
		if (!last) return null;
		return this.getDeepBoundaryPoint(last, false);
	}

	private snapshotRangeToTextOffsets(range: Range): { start: number; end: number } | null {
		const normalized = this.normalizeEditorRange(range);
		if (!normalized) return null;

		const start = this.getTextOffsetWithinEditor(normalized.startContainer, normalized.startOffset);
		const end = this.getTextOffsetWithinEditor(normalized.endContainer, normalized.endOffset);
		if (start === null || end === null) return null;

		return { start, end };
	}

	private restoreRangeFromTextOffsets(snapshot: { start: number; end: number }): Range | null {
		const start = this.resolveBoundaryFromTextOffset(snapshot.start);
		const end = this.resolveBoundaryFromTextOffset(snapshot.end);
		if (!start || !end) return null;

		const range = document.createRange();
		try {
			range.setStart(start.container, start.offset);
			range.setEnd(end.container, end.offset);
		} catch {
			return null;
		}

		return this.normalizeEditorRange(range);
	}

	private getDeepBoundaryPoint(node: Node, atStart: boolean): { container: Node; offset: number } {
		let current = node;
		while (current.nodeType !== Node.TEXT_NODE && current.childNodes.length > 0) {
			current = atStart ? current.firstChild as Node : current.lastChild as Node;
		}

		if (current.nodeType === Node.TEXT_NODE) {
			const text = current as Text;
			return { container: text, offset: atStart ? 0 : text.length };
		}

		return { container: current, offset: atStart ? 0 : current.childNodes.length };
	}

	private resolveRangeBoundaryPoint(
		container: Node,
		offset: number,
		atStart: boolean
	): { container: Node; offset: number } | null {
		if (container === this.element) {
			const { childNodes } = this.element;
			if (childNodes.length === 0) return null;

			if (atStart) {
				const target = offset < childNodes.length ? childNodes[offset] : childNodes[childNodes.length - 1];
				return this.getDeepBoundaryPoint(target, offset < childNodes.length);
			}

			const target = offset > 0 ? childNodes[offset - 1] : childNodes[0];
			return this.getDeepBoundaryPoint(target, offset === 0);
		}

		if (!this.element.contains(container)) {
			return null;
		}

		return { container, offset };
	}

	private normalizeEditorRange(range: Range): Range | null {
		const start = this.resolveRangeBoundaryPoint(range.startContainer, range.startOffset, true);
		const end = this.resolveRangeBoundaryPoint(range.endContainer, range.endOffset, false);
		if (!start || !end) return null;

		const normalized = range.cloneRange();
		try {
			normalized.setStart(start.container, start.offset);
			normalized.setEnd(end.container, end.offset);
		} catch {
			return null;
		}

		return normalized;
	}

	private restoreLastSelection(range: Range | null=this.rangeBackup): void {
		if (!range) return;
		const normalized = this.normalizeEditorRange(range);
		if (!normalized) return;
		const sel = window.getSelection();
		if (!sel) return;
		
		this.range = normalized;
		sel.removeAllRanges();
		sel.addRange(normalized);
	}

	public setPlaceholder(placeholder: string): void {
		if (placeholder && placeholder.trim()) {
			this.element.setAttribute("placeholder", placeholder);
		} else {
			this.element.removeAttribute("placeholder");
		}
	}

	public setSpellcheck(enabled: boolean): void {
		this.element.setAttribute("spellcheck", enabled ? "true" : "false");
	}

	public setEditable(enabled: boolean): void {
		this.element.setAttribute("contenteditable", enabled ? "true" : "false");
		this.observeMutation(enabled);
	}

	public destroy(): void {
		this.unbindCoreEvents();
		this.observeMutation(false);
		if (this.colorCommandDebounceTimer !== null) {
			window.clearTimeout(this.colorCommandDebounceTimer);
			this.colorCommandDebounceTimer = null;
		}
		this.imageInput.remove();
		this.eventBus.clear();
		this.customCommandHandlers.clear();
	}

	private observeMutation(track: boolean): void {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
		if (!track) return;

		this.observer = new MutationObserver((mutations) => {
			if (this.logMutation) {
				void this.safeCallback({ mutation: mutations as unknown[] });
			}

			for (const mutation of mutations) {
				if (mutation.type !== "childList") continue;
				const target = mutation.target;
				if (!(target instanceof HTMLElement)) continue;

				if (target === this.element && target.childNodes.length === 0) {
					target.append(this.createEmptyParagraph());
					continue;
				}

				if (
					this.isCeilingElement(target) &&
					target !== this.element &&
					target.childNodes.length === 0
				) {
					target.remove();
					continue;
				}

				if (
					this.isTextBlockElement(target) &&
					target.childNodes.length === 1 &&
					this.isUnSelectableElement(target.firstChild)
				) {
					target.append(document.createTextNode(""));
				}
			}
		});

		this.observer.observe(this.element, {
			attributes: true,
			childList: true,
			subtree: true,
		});
	}

	private isUnSelectableElement(node: Node | null): boolean {
		const el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
		if (!el) return false;
		return !!el.closest("._media_, ._hashtag_, ._urllink_, hr");
	}

	private isTextBlockElement(node: Node | null): boolean {
		const el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
		if (!el) return false;
		return ["P", "LI", "TD", "TH", "TR"].includes(el.tagName);
	}

	private isCeilingElement(node: Node | null): boolean {
		const el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
		if (!el) return false;
		if (el === this.element) return true;
		return ["UL", "OL", "LI", "BLOCKQUOTE"].includes(el.tagName);
	}

	private cleanupZeroWidthSpaces(): void {
		const textNodes: Text[] = [];
		const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (parent.closest("._media_, ._custom_")) return NodeFilter.FILTER_REJECT;
				return (node.textContent || "").includes("\u200B")
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			},
		});

		while (walker.nextNode()) {
			textNodes.push(walker.currentNode as Text);
		}

		for (const textNode of textNodes) {
			const nextText = (textNode.textContent || "").split("\u200B").join("");
			if (nextText === textNode.textContent) continue;
			if (nextText.length === 0) {
				textNode.remove();
				continue;
			}
			textNode.textContent = nextText;
		}

		this.element.normalize();
	}

	private normalizeDocument(): void {
		const sel = window.getSelection();
		const hasLiveSelectionInEditor = !!(
			sel &&
			sel.rangeCount > 0 &&
			this.element.contains(sel.anchorNode) &&
			this.element.contains(sel.focusNode)
		);
		const rangeSource = hasLiveSelectionInEditor
			? (this.range ?? this.rangeBackup)
			: (this.range ?? this.rangeBackup);
		const rangeSnapshot = rangeSource
			? this.snapshotRangeToTextOffsets(rangeSource)
			: null;

		this.cleanupZeroWidthSpaces();
		const toRemove: HTMLElement[] = [];
		const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
		while (walker.nextNode()) {
			const node = walker.currentNode;

			if (node.nodeType === Node.ELEMENT_NODE) {
				const el = node as HTMLElement;
				if (el.classList.contains("_static_")) continue;

				if (
					!el.classList.contains("_media_") &&
					!el.classList.contains("_custom_") &&
					!el.closest("._media_") &&
					!el.closest("._custom_") &&
					!this.isCeilingElement(el) &&
					!el.textContent &&
					el.childNodes.length === 0 &&
					el.tagName !== "BR" &&
					el.tagName !== "HR"
				) {
					if (this.logNormalizeRemoval) {
						console.log("_normalizeDocument(): queued node removal", {
							tagName: el.tagName,
							id: el.id || null,
							className: el.className || null,
							parentTagName: el.parentElement?.tagName || null,
						});
					}
					toRemove.push(el);
				}
			}
		}

		for (const node of toRemove) node.remove();
		this.redistributeInlineStylesAcrossBlocks();
		this.cleanupNestedFontSizeWrappers();
		this.cleanupRedundantTextWrappers();
		this.cleanupEmptyTextStyleElements();
		this.ensureRootHasSafeLine();

		if (hasLiveSelectionInEditor) {
			// For live in-editor selection, browser already tracks caret through DOM
			// mutations more accurately than text-offset mapping in empty blocks.
			this.captureRange();
			return;
		}

		if (rangeSnapshot) {
			const rebased = this.restoreRangeFromTextOffsets(rangeSnapshot);
			if (rebased) {
				this.range = rebased;
				this.rangeBackup = rebased.cloneRange();
			}
		}
	}

	private isLineBlockElement(el: HTMLElement): boolean {
		return ["P", "LI", "TD", "TH", "TR"].includes(el.tagName);
	}

	private cloneInlineStyleSpan(span: HTMLElement): HTMLSpanElement {
		const clone = document.createElement("span");
		clone.className = span.className;
		if (span.style.cssText.trim()) {
			clone.style.cssText = span.style.cssText;
		}
		return clone;
	}

	private getContainingLineBlock(node: Node): HTMLElement | null {
		let current: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
		while (current && current !== this.element) {
			if (current instanceof HTMLElement && this.isLineBlockElement(current)) {
				return current;
			}
			current = current.parentNode;
		}
		return null;
	}

	private getLineBlocksBetween(startLine: HTMLElement, endLine: HTMLElement): HTMLElement[] {
		const blocks = Array.from(this.element.querySelectorAll<HTMLElement>("p,li,td,th,tr"));
		const startIndex = blocks.indexOf(startLine);
		const endIndex = blocks.indexOf(endLine);
		if (startIndex < 0 || endIndex < 0) return [];
		const from = Math.min(startIndex, endIndex);
		const to = Math.max(startIndex, endIndex);
		return blocks.slice(from, to + 1);
	}

	private doesRangeIntersectElement(range: Range, el: HTMLElement): boolean {
		const nodeRange = document.createRange();
		nodeRange.selectNodeContents(el);
		const endsBefore = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) <= 0;
		const startsAfter = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) >= 0;
		return !endsBefore && !startsAfter;
	}

	private getSelectedLineBlocks(range: Range): HTMLElement[] {
		const blocks = Array.from(this.element.querySelectorAll<HTMLElement>("p,li,td,th,tr"));
		return blocks.filter((block) => this.doesRangeIntersectElement(range, block));
	}

	private createLineIntersectionRange(selectionRange: Range, line: HTMLElement): Range {
		const lineRange = document.createRange();
		lineRange.selectNodeContents(line);

		if (line.contains(selectionRange.startContainer)) {
			lineRange.setStart(selectionRange.startContainer, selectionRange.startOffset);
		}

		if (line.contains(selectionRange.endContainer)) {
			lineRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
		}

		return this.splitRangeBoundaries(lineRange);
	}

	private applyStyleToRange(
		range: Range,
		className: string,
		command: InlineClassCommand,
		cssValue?: string
	): HTMLElement | null {
		if (range.collapsed) return null;
		const fragment = range.extractContents();
		const wrapper = document.createElement("span");
		wrapper.classList.add(className);
		if (command === "color" && cssValue) wrapper.style.setProperty("color", cssValue);
		if (command === "backgroundColor" && cssValue) wrapper.style.setProperty("background-color", cssValue);
		wrapper.append(fragment);
		this.stripSameStyleFromFragment(wrapper, className, command);
		this.removeCounterClasses(wrapper, command);
		range.insertNode(wrapper);
		return wrapper;
	}

	private wrapMultilineSelectionWithClass(
		selectionRange: Range,
		className: string,
		command: InlineClassCommand,
		cssValue?: string,
		targetLines?: HTMLElement[]
	): boolean {
		const lines = targetLines || this.getSelectedLineBlocks(selectionRange);
		if (lines.length <= 1) return false;

		const ranges = lines
			.map((line) => this.createLineIntersectionRange(selectionRange, line))
			.filter((lineRange) => !lineRange.collapsed);

		if (ranges.length === 0) return false;

		let lastWrapper: HTMLElement | null = null;
		for (let i = ranges.length - 1; i >= 0; i--) {
			const wrapper = this.applyStyleToRange(ranges[i], className, command, cssValue);
			if (wrapper && !lastWrapper) lastWrapper = wrapper;
		}

		if (lastWrapper) this.setSelectionAtEnd(lastWrapper);
		this.normalizeDocument();
		this.cleanupEmptyTextStyleElements();
		return true;
	}

	private redistributeInlineStylesAcrossBlocks(): void {
		const knownStyleClasses = this.getKnownInlineStyleClassSet();
		let changed = true;

		while (changed) {
			changed = false;
			const spans = Array.from(this.element.querySelectorAll<HTMLElement>("span")).reverse();

			for (const span of spans) {
				if (!span.isConnected) continue;
				if (!this.isTextStyleWrapper(span, knownStyleClasses)) continue;
				if (this.isProtectedSpan(span)) continue;

				const children = Array.from(span.childNodes);
				const hasBlockChild = children.some(
					(node) => node instanceof HTMLElement && this.isLineBlockElement(node)
				);
				if (!hasBlockChild) continue;

				const parent = span.parentNode;
				if (!parent) continue;

				const replacement = document.createDocumentFragment();
				let pendingInlineNodes: Node[] = [];

				const flushInlineNodes = () => {
					if (pendingInlineNodes.length === 0) return;
					const inlineSpan = this.cloneInlineStyleSpan(span);
					for (const node of pendingInlineNodes) {
						inlineSpan.append(node);
					}
					replacement.append(inlineSpan);
					pendingInlineNodes = [];
				};

				for (const child of children) {
					span.removeChild(child);
					if (child instanceof HTMLElement && this.isLineBlockElement(child)) {
						flushInlineNodes();
						const line = child;
						const lineSpan = this.cloneInlineStyleSpan(span);
						while (line.firstChild) lineSpan.append(line.firstChild);
						line.append(lineSpan);
						replacement.append(line);
					} else {
						pendingInlineNodes.push(child);
					}
				}

				flushInlineNodes();
				parent.insertBefore(replacement, span);
				span.remove();
				changed = true;
			}
		}
	}

	private isFontSizeClassName(className: string): boolean {
		return FONT_SIZE_CLASS_SET.has(className);
	}

	private getElementFontSizeClass(el: HTMLElement): string | null {
		for (const cls of FONT_SIZE_CLASSES) {
			if (el.classList.contains(cls)) return cls;
		}
		return null;
	}

	private findOutermostFontSizeAncestor(node: Node): HTMLElement | null {
		let current: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
		let outermost: HTMLElement | null = null;
		while (current && current !== this.element) {
			if (current instanceof HTMLElement && this.getElementFontSizeClass(current)) {
				outermost = current;
			}
			current = current.parentNode;
		}
		return outermost;
	}

	private cleanupNestedFontSizeWrappers(): void {
		let changed = true;
		while (changed) {
			changed = false;
			const spans = Array.from(this.element.querySelectorAll<HTMLElement>("span")).reverse();

			for (const span of spans) {
				if (!span.isConnected) continue;
				if (span.closest("._media_, ._custom_")) continue;
				if (!this.getElementFontSizeClass(span)) continue;

				let parent = span.parentElement;
				let outerSizeAncestor: HTMLElement | null = null;
				while (parent && parent !== this.element) {
					if (this.getElementFontSizeClass(parent)) {
						outerSizeAncestor = parent;
					}
					parent = parent.parentElement;
				}

				if (!outerSizeAncestor) continue;
				this.breakOutFromAncestor(span, outerSizeAncestor);
				changed = true;
			}
		}
	}

	private hasMeaningfulAttributes(el: HTMLElement): boolean {
		for (const attr of Array.from(el.attributes)) {
			const name = attr.name.toLowerCase();
			const value = attr.value.trim();
			if (name === "class") {
				if (el.classList.length > 0) return true;
				continue;
			}
			if (name === "style") {
				if (el.style.length > 0 || value.length > 0) return true;
				continue;
			}
			if (name.startsWith("data-")) return true;
			if (name === "id" && value.length > 0) return true;
			if (name === "contenteditable" && value.length > 0) return true;
			if (value.length > 0) return true;
		}
		return false;
	}

	private hasNonClassStyleAttributes(el: HTMLElement): boolean {
		for (const attr of Array.from(el.attributes)) {
			const name = attr.name.toLowerCase();
			if (name === "class" || name === "style") continue;
			if (name.startsWith("data-")) return true;
			if (attr.value.trim().length > 0) return true;
		}
		return false;
	}

	private isProtectedSpan(el: HTMLElement): boolean {
		if (el.tagName !== "SPAN") return true;
		if (el.classList.contains("_hashtag_") || el.classList.contains("_urllink_")) return true;
		if (el.closest("._media_, ._custom_")) return true;
		return false;
	}

	private cleanupRedundantTextWrappers(): void {
		const knownStyleClasses = this.getKnownInlineStyleClassSet();
		let changed = true;
		while (changed) {
			changed = false;
			const spans = Array.from(this.element.querySelectorAll<HTMLElement>("span")).reverse();

			for (const span of spans) {
				if (!span.isConnected) continue;
				if (this.isProtectedSpan(span)) continue;

				const children = Array.from(span.childNodes);
				const elementChildren = children.filter((n): n is HTMLElement => n instanceof HTMLElement);

				if (elementChildren.length === 1 && children.length === 1) {
					const child = elementChildren[0];
					if (
						child.tagName === "SPAN" &&
						!this.isProtectedSpan(child) &&
						span.className.trim() === child.className.trim() &&
						span.style.cssText.trim() === child.style.cssText.trim() &&
						!this.hasNonClassStyleAttributes(span) &&
						!this.hasNonClassStyleAttributes(child)
					) {
						while (child.firstChild) span.insertBefore(child.firstChild, child);
						child.remove();
						changed = true;
					}
				}

				if (!this.hasMeaningfulAttributes(span) && !this.isTextStyleWrapper(span, knownStyleClasses)) {
					const parent = span.parentNode;
					if (!parent) continue;
					while (span.firstChild) parent.insertBefore(span.firstChild, span);
					span.remove();
					changed = true;
				}
			}
		}
	}

	private isTextStyleWrapper(el: HTMLElement, knownStyleClasses: Set<string>): boolean {
		if (el.tagName !== "SPAN") return false;
		if (el.classList.contains("_hashtag_") || el.classList.contains("_urllink_")) return false;
		for (const cls of Array.from(el.classList)) {
			if (knownStyleClasses.has(cls) || cls.endsWith("_stop")) {
				return true;
			}
		}
		return false;
	}

	private cleanupEmptyTextStyleElements(): void {
		const knownStyleClasses = this.getKnownInlineStyleClassSet();
		const protectedSelector = "br,hr,img,video,audio,table,ul,ol,li,blockquote,div,._media_,._custom_";

		let changed = true;
		while (changed) {
			changed = false;
			const spans = Array.from(this.element.querySelectorAll<HTMLElement>("span")).reverse();
			for (const span of spans) {
				if (!this.isTextStyleWrapper(span, knownStyleClasses)) continue;
				if (span.querySelector(protectedSelector)) continue;
				const text = (span.textContent || "").split("\u200B").join("").trim();
				if (text.length === 0) {
					span.remove();
					changed = true;
				}
			}
		}
	}

	private setSelectionAtEnd(node: Node): void {
		const range = document.createRange();
		range.selectNodeContents(node);
		range.collapse(false);
		this.restoreLastSelection(range);
	}

	private splitRangeBoundaries(range: Range): Range {
		if (range.startContainer.nodeType === Node.TEXT_NODE) {
			const text = range.startContainer as Text;
			if (range.startOffset > 0 && range.startOffset < text.length) {
				text.splitText(range.startOffset);
				range.setStart(text.nextSibling as Node, 0);
			}
		}
		if (range.endContainer.nodeType === Node.TEXT_NODE) {
			const text = range.endContainer as Text;
			if (range.endOffset > 0 && range.endOffset < text.length) {
				text.splitText(range.endOffset);
			}
		}
		return range;
	}

	private getKnownInlineStyleClassSet(): Set<string> {
		return new Set(Object.values(CLASS_BY_COMMAND));
	}

	private findClosestAncestorWithClass(node: Node, className: string): HTMLElement | null {
		let current: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
		while (current && current !== this.element) {
			if (current instanceof HTMLElement && current.classList.contains(className)) {
				return current;
			}
			current = current.parentNode;
		}
		return null;
	}

	private collectPreservedInlineStyles(ancestor: HTMLElement, excludeClass: string): {
		classes: string[];
		color?: string;
		backgroundColor?: string;
	} {
		const known = this.getKnownInlineStyleClassSet();
		const classes: string[] = [];
		for (const cls of Array.from(ancestor.classList)) {
			if (!known.has(cls)) continue;
			if (cls === excludeClass || cls === `${excludeClass}_stop`) continue;
			classes.push(cls);
		}

		return {
			classes,
			color: ancestor.style.color || undefined,
			backgroundColor: ancestor.style.backgroundColor || undefined,
		};
	}

	private liftNodeOneLevel(node: HTMLElement): void {
		const parent = node.parentElement;
		if (!parent) return;
		if (parent === this.element) return;
		const grand = parent.parentNode;
		if (!grand) return;
		if (grand !== this.element && !(grand instanceof HTMLElement && this.element.contains(grand))) {
			return;
		}

		const rightClone = parent.cloneNode(false) as HTMLElement;
		while (node.nextSibling) {
			rightClone.append(node.nextSibling);
		}

		grand.insertBefore(node, parent.nextSibling);
		if (rightClone.childNodes.length) {
			grand.insertBefore(rightClone, node.nextSibling);
		}

		if (parent.childNodes.length === 0) {
			parent.remove();
		}
	}

	private breakOutFromAncestor(node: HTMLElement, ancestor: HTMLElement): void {
		if (!this.element.contains(node) || !this.element.contains(ancestor)) return;

		while (node.parentElement && node.parentElement !== ancestor) {
			this.liftNodeOneLevel(node);
		}

		if (node.parentElement === ancestor && ancestor.parentElement && this.element.contains(ancestor.parentElement)) {
			this.liftNodeOneLevel(node);
		}

		if (ancestor.childNodes.length === 0) {
			ancestor.remove();
		}
	}

	private stripSameStyleFromFragment(root: HTMLElement, className: string, command: InlineClassCommand): void {
		const same = root.querySelectorAll<HTMLElement>(`.${className}`);
		for (const el of Array.from(same)) {
			el.classList.remove(className);
			if (command === "color") el.style.removeProperty("color");
			if (command === "backgroundColor") el.style.removeProperty("background-color");
		}
	}

	private wrapSelectionWithClass(className: string, command: InlineClassCommand, cssValue?: string): void {
		this.captureRange();
		if (!this.range) return;
		const range = this.splitRangeBoundaries(this.range.cloneRange());
		if (!range.collapsed) {
			const startLine = this.getContainingLineBlock(range.startContainer);
			const endLine = this.getContainingLineBlock(range.endContainer);
			if (startLine && endLine && startLine !== endLine) {
				const lines = this.getLineBlocksBetween(startLine, endLine);
				if (this.wrapMultilineSelectionWithClass(range, className, command, cssValue, lines)) {
					return;
				}
			}

			if (this.wrapMultilineSelectionWithClass(range, className, command, cssValue)) {
				return;
			}
		}
		const isFontSizeCommand = this.isFontSizeClassName(className);
		const breakoutStartAncestor = this.findClosestAncestorWithClass(range.startContainer, className);
		const breakoutEndAncestor = this.findClosestAncestorWithClass(range.endContainer, className);
		const shouldBreakout = !!breakoutStartAncestor && breakoutStartAncestor === breakoutEndAncestor;
		const sameClassBreakoutAncestor = shouldBreakout ? breakoutStartAncestor : null;
		const fontSizeStartAncestor = isFontSizeCommand ? this.findOutermostFontSizeAncestor(range.startContainer) : null;
		const fontSizeEndAncestor = isFontSizeCommand ? this.findOutermostFontSizeAncestor(range.endContainer) : null;
		const fontSizeBreakoutAncestor =
			isFontSizeCommand && fontSizeStartAncestor && fontSizeStartAncestor === fontSizeEndAncestor
				? fontSizeStartAncestor
				: null;
		const breakoutAncestor = sameClassBreakoutAncestor ?? fontSizeBreakoutAncestor;
		const inherited = sameClassBreakoutAncestor
			? this.collectPreservedInlineStyles(sameClassBreakoutAncestor, className)
			: { classes: [] as string[], color: undefined, backgroundColor: undefined };

		if (range.collapsed) {
			const span = document.createElement("span");
			span.classList.add(className);
			for (const cls of inherited.classes) span.classList.add(cls);
			if (command !== "color" && inherited.color) span.style.setProperty("color", inherited.color);
			if (command !== "backgroundColor" && inherited.backgroundColor)
				span.style.setProperty("background-color", inherited.backgroundColor);
			if (command === "color" && cssValue) {
				span.style.setProperty("color", cssValue);
			}
			if (command === "backgroundColor" && cssValue) {
				span.style.setProperty("background-color", cssValue);
			}
			span.append(document.createTextNode("\u200B"));
			range.insertNode(span);
			if (breakoutAncestor) {
				this.breakOutFromAncestor(span, breakoutAncestor);
			}
			const after = document.createRange();
			after.setStart(span.firstChild as Node, 1);
			after.collapse(true);
			this.restoreLastSelection(after);
			return;
		}

		const fragment = range.extractContents();
		const wrapper = document.createElement("span");
		wrapper.classList.add(className);
		for (const cls of inherited.classes) wrapper.classList.add(cls);
		if (command !== "color" && inherited.color) wrapper.style.setProperty("color", inherited.color);
		if (command !== "backgroundColor" && inherited.backgroundColor)
			wrapper.style.setProperty("background-color", inherited.backgroundColor);
		if (command === "color" && cssValue) wrapper.style.setProperty("color", cssValue);
		if (command === "backgroundColor" && cssValue) wrapper.style.setProperty("background-color", cssValue);
		wrapper.append(fragment);
		this.stripSameStyleFromFragment(wrapper, className, command);
		this.removeCounterClasses(wrapper, command);
		range.insertNode(wrapper);

		if (breakoutAncestor) {
			this.breakOutFromAncestor(wrapper, breakoutAncestor);
		}

		this.setSelectionAtEnd(wrapper);
		this.normalizeDocument();
		this.cleanupEmptyTextStyleElements();
	}

	private removeCounterClasses(root: HTMLElement, command: InlineClassCommand): void {
		const counters = COUNTER_CLASSES[command] || [];
		for (const c of counters) {
			root.querySelectorAll(`.${c}`).forEach((node) => node.classList.remove(c));
		}
	}

	private applyAlignment(command: AlignCommand): void {
		this.captureRange();
		if (!this.range) return;

		const line = this.getClosestLine(this.range.startContainer);
		if (!line) return;

		for (const cls of ALIGN_CLASSES) line.classList.remove(cls);
		if (command === "alignCenter") line.classList.add("_alignCenter_");
		if (command === "alignRight") line.classList.add("_alignRight_");
	}

	private getClosestLine(node: Node): HTMLElement | null {
		let current: Node | null = node;
		while (current && current !== this.element) {
			if (current instanceof HTMLElement && (BLOCK_TAGS.has(current.tagName) || current.classList.contains("_media_"))) {
				return current;
			}
			current = current.parentNode;
		}
		return this.element.lastElementChild as HTMLElement | null;
	}

	private insertNodeAtSelection(node: Node, appendOnNextLine = true): void {
		this.captureRange();
		if (!this.range) {
			this.element.append(node);
			return;
		}

		if (!appendOnNextLine) {
			this.range.insertNode(node);
			if (node.nodeType === Node.TEXT_NODE) {
				this.setSelectionAtEnd(node);
			} else {
				const after = document.createRange();
				after.setStartAfter(node);
				after.collapse(true);
				this.restoreLastSelection(after);
			}
			return;
		}

		const line = this.getClosestLine(this.range.endContainer);
		if (!line || !line.parentNode) {
			this.element.append(node);
			return;
		}

		if (line.nextSibling) line.parentNode.insertBefore(node, line.nextSibling);
		else line.parentNode.append(node);
		this.setSelectionAtEnd(node);
	}

	private ensureCaretAfterNonTextElement(inserted: HTMLElement): void {
		if (!inserted.isConnected) return;
		const parent = inserted.parentElement;
		if (!parent) return;

		let next: Element | null = inserted.nextElementSibling;
		let targetLine: HTMLElement | null = null;
		while (next) {
			if (this.isLineBlockElement(next as HTMLElement)) {
				targetLine = next as HTMLElement;
				break;
			}
			next = next.nextElementSibling;
		}

		if (!targetLine) {
			targetLine = this.createEmptyParagraph();
			parent.append(targetLine);
		}

		if (targetLine.childNodes.length === 0) {
			targetLine.append(document.createElement("br"));
		}

		this.setSelectionAtStart(targetLine);
	}

	private ensureTrailingEditableLineAfter(inserted: HTMLElement): HTMLElement {
		const parent = inserted.parentElement;
		if (!parent) return this.createEmptyParagraph();

		const immediateNext = inserted.nextElementSibling as HTMLElement | null;
		if (immediateNext && this.isLineBlockElement(immediateNext)) {
			if (immediateNext.childNodes.length === 0) immediateNext.append(document.createElement("br"));
			return immediateNext;
		}

		if (immediateNext && !this.isLineBlockElement(immediateNext)) {
			const created = this.createEmptyParagraph();
			parent.insertBefore(created, immediateNext);
			return created;
		}

		const created = this.createEmptyParagraph();
		parent.append(created);
		return created;
	}

	private insertText(text: string): void {
		this.captureRange();
		if (!this.range) return;
		this.range.deleteContents();
		const lines = text.split("\n");
		if (lines.length === 1) {
			const node = document.createTextNode(lines[0]);
			this.range.insertNode(node);
			const next = document.createRange();
			next.setStart(node, node.length);
			next.collapse(true);
			this.restoreLastSelection(next);
			return;
		}

		const frag = document.createDocumentFragment();
		for (let idx = 0; idx < lines.length; idx++) {
			if (idx > 0) frag.append(document.createElement("br"));
			frag.append(document.createTextNode(lines[idx]));
		}
		this.range.insertNode(frag);
	}

	private async onImageSelected(ev: Event): Promise<void> {
		const target = ev.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0) return;
		await this.safeCallback({ loading: true });

		const imageData: ImageData[] = [];
		for (const file of Array.from(files)) {
			const source = await this.readFileAsDataUrl(file);
			const dimension = await this.readImageDimension(source);
			imageData.push({
				elementId: createUid("img"),
				source,
				filename: file.name,
				fileType: file.type,
				fileSize: file.size,
				lastModified: file.lastModified,
				dimension,
			});
		}

		await this.safeCallback({ loading: false });
		target.value = "";

		const callbackResult = await this.safeCallback({ image: imageData });
		const images = callbackResult.image || imageData;
		let lastWrapper: HTMLElement | null = null;

		for (const data of images) {
			const wrapper = document.createElement("div");
			wrapper.classList.add("_media_");
			wrapper.setAttribute("contenteditable", "false");

			const image = data.element instanceof HTMLImageElement
				? data.element
				: document.createElement("img");
			image.id = data.elementId || createUid("img");
			image.setAttribute("src", data.source);
			image.classList.add(`_img_${data.source.slice(-64).replace(/[^a-zA-Z0-9_-]/g, "")}`);
			if (Array.isArray(data.class)) for (const cls of data.class) image.classList.add(cls);
			if (data.onclick) {
				image.addEventListener("click", data.onclick);
				image.classList.add("_hover_");
			}
			wrapper.append(image);

			if (data.style) {
				for (const [k, v] of Object.entries(data.style)) {
					wrapper.style.setProperty(k, v);
				}
			}

			this.image_array.push({ ...data, element: image, elementId: image.id });
			this.insertNodeAtSelection(wrapper, true);
			lastWrapper = wrapper;
		}

		if (lastWrapper) {
			this.ensureCaretAfterNonTextElement(lastWrapper);
		}
	}

	private readFileAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result || ""));
			reader.onerror = () => reject(reader.error || new Error("file read failed"));
			reader.readAsDataURL(file);
		});
	}

	private readImageDimension(source: string): Promise<{ width: number; height: number }> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve({ width: img.width, height: img.height });
			img.onerror = () => reject(new Error("image decode failed"));
			img.src = source;
		});
	}

	private async safeCallback(payload: CallbackPayload): Promise<CallbackPayload> {
		if (typeof this.callback !== "function") return payload;
		const next = this.callback(payload);
		const result = next instanceof Promise ? await next : next;
		return result || payload;
	}

	private resolveSpanByData(data: { element?: HTMLSpanElement; elementId?: string }): HTMLSpanElement | null {
		if (data.element instanceof HTMLSpanElement) return data.element;
		if (!data.elementId) return null;
		const el = document.getElementById(data.elementId);
		return el instanceof HTMLSpanElement ? el : null;
	}

	private applySpanDecorators(
		span: HTMLSpanElement,
		decorators: { style?: Record<string, string>; onclick?: (ev: MouseEvent) => void }
	): void {
		if (decorators.style) {
			for (const [k, v] of Object.entries(decorators.style)) {
				span.style.setProperty(k, v);
			}
		}

		if (decorators.onclick) {
			span.addEventListener("click", decorators.onclick);
			span.classList.add("_hover_");
		}
	}

	private updateCommandTracker(): void {
		this.captureRange();
		const tracker: CommandTracker = {};
		for (const key of Object.keys(this.commandTracker)) tracker[key] = false;
		if (!this.range) {
			this.commandTracker = tracker;
			return;
		}

		const focusNode = this.range.collapsed ? this.range.startContainer : this.range.commonAncestorContainer;
		const element = focusNode.nodeType === Node.TEXT_NODE ? focusNode.parentElement : (focusNode as Element);
		if (!element || !this.element.contains(element)) {
			this.commandTracker = tracker;
			return;
		}

		for (const [command, cls] of Object.entries(this.styleTagOfCommand)) {
			const owner = element.closest(`.${cls}`) as HTMLElement | null;
			if (!owner) continue;
			if (command === "color") {
				const color = owner.style.color ? tryNormalizeColor(owner.style.color) : null;
				tracker.color = color || true;
			} else if (command === "backgroundColor") {
				const color = owner.style.backgroundColor ? tryNormalizeColor(owner.style.backgroundColor) : null;
				tracker.backgroundColor = color || true;
			} else {
				tracker[command] = true;
			}
		}

		const line = this.getClosestLine(this.range.startContainer);
		if (line) {
			tracker.alignLeft = !line.classList.contains("_alignCenter_") && !line.classList.contains("_alignRight_");
			tracker.alignCenter = line.classList.contains("_alignCenter_");
			tracker.alignRight = line.classList.contains("_alignRight_");
			tracker.quote = !!line.closest("blockquote");
			tracker.unorderedList = !!line.closest("ul");
			tracker.orderedList = !!line.closest("ol");
		}

		this.commandTracker = tracker;
		const caretNode = this.range.collapsed ? this.range.startContainer : this.range.endContainer;
		let caretRect: DOMRect | null = null;
		if (caretNode.nodeType === Node.TEXT_NODE) caretRect = this.range.getBoundingClientRect();
		else if (caretNode instanceof Element) caretRect = caretNode.getBoundingClientRect();

		void this.safeCallback({
			commandTracker: tracker,
			range: this.range,
			caratPosition: caretRect,
		}).catch((err) => console.error(err));
	}

	private async scanSpecialTokens(): Promise<void> {
		if (!this.hashtagEnabled && !this.urlEnabled) return;

		const sel = window.getSelection();
		const liveRange =
			sel && sel.rangeCount > 0 && this.element.contains(sel.anchorNode)
				? this.normalizeEditorRange(sel.getRangeAt(0))
				: null;
		const selectionSnapshot = liveRange
			? this.snapshotRangeToTextOffsets(liveRange)
			: null;
		let didMutate = false;

		const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => {
				const text = node.textContent || "";
				if (!text.trim()) return NodeFilter.FILTER_REJECT;
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (parent.closest("._media_, ._custom_, ._hashtag_, ._urllink_")) {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			},
		});

		const textNodes: Text[] = [];
		while (walker.nextNode()) {
			textNodes.push(walker.currentNode as Text);
		}

		const hashtagItems: HashtagData[] = [];
		const urlItems: UrlData[] = [];

		for (const textNode of textNodes) {
			const text = textNode.textContent || "";
			const parent = textNode.parentNode;
			if (!parent) continue;

			const chunks: Array<{ type: "text" | "hashtag" | "url"; value: string }> = [];
			let lastIndex = 0;
			const matches: Array<{ index: number; end: number; type: "hashtag" | "url"; value: string }> = [];

			if (this.hashtagEnabled) {
				for (const m of text.matchAll(HASHTAG_REGEX)) {
					const lead = m[1] || "";
					const tag = m[2] || "";
					const index = (m.index || 0) + lead.length;
					matches.push({ index, end: index + tag.length, type: "hashtag", value: tag });
				}
			}

			if (this.urlEnabled) {
				for (const m of text.matchAll(URL_REGEX)) {
					const value = m[0] || "";
					const index = m.index || 0;
					matches.push({ index, end: index + value.length, type: "url", value });
				}
			}

			matches.sort((a, b) => a.index - b.index);
			const filtered: typeof matches = [];
			let occupiedEnd = -1;
			for (const m of matches) {
				if (m.index < occupiedEnd) continue;
				filtered.push(m);
				occupiedEnd = m.end;
			}
			if (filtered.length === 0) continue;

			for (const m of filtered) {
				if (m.index > lastIndex) {
					chunks.push({ type: "text", value: text.slice(lastIndex, m.index) });
				}
				chunks.push({ type: m.type, value: m.value });
				lastIndex = m.end;
			}
			if (lastIndex < text.length) chunks.push({ type: "text", value: text.slice(lastIndex) });

			const fragment = document.createDocumentFragment();
			for (const chunk of chunks) {
				if (chunk.type === "text") {
					fragment.append(document.createTextNode(chunk.value));
					continue;
				}
				const span = document.createElement("span");
				span.setAttribute("contenteditable", "false");
				span.textContent = chunk.value;
				if (chunk.type === "hashtag") {
					const id = createUid("hashtag");
					span.id = id;
					span.className = `_hashtag_ _hashtag_${chunk.value}`;
					hashtagItems.push({ elementId: id, tag: chunk.value.replace(/^#/, ""), element: span });
				} else {
					const id = createUid("urllink");
					span.id = id;
					span.className = `_urllink_ _urllink_${chunk.value}`;
					span.addEventListener("click", () => {
						const url = /^https?:\/\//i.test(chunk.value) ? chunk.value : `http://${chunk.value}`;
						window.open(url, "_blank", "noopener,noreferrer");
					});
					urlItems.push({ elementId: id, url: chunk.value, element: span });
				}
				fragment.append(span);
			}

			parent.replaceChild(fragment, textNode);
			didMutate = true;
		}

		if (hashtagItems.length > 0) {
			const fb = await this.safeCallback({ hashtag: hashtagItems });
			for (const item of fb.hashtag || hashtagItems) {
				const span = this.resolveSpanByData(item);
				if (!span) continue;
				this.applySpanDecorators(span, item);
				this.hashtag_array.push({ ...item, element: span, elementId: span.id || item.elementId });
			}
		}
		if (urlItems.length > 0) {
			const fb = await this.safeCallback({ urllink: urlItems });
			for (const item of fb.urllink || urlItems) {
				const span = this.resolveSpanByData(item);
				if (!span) continue;
				this.applySpanDecorators(span, item);
				this.urllink_array.push({ ...item, element: span, elementId: span.id || item.elementId });
			}
		}

		if (didMutate && selectionSnapshot) {
			const rebased = this.restoreRangeFromTextOffsets(selectionSnapshot);
			if (rebased) {
				this.restoreLastSelection(rebased);
				this.backupCurrentRange(rebased, { bypassNormalize: true });
			}
		}
	}

	public async command(action: CommandInput): Promise<void> {
		const isColorObjectAction =
			typeof action === "object" &&
			!!action &&
			["color", "backgroundColor"].some((cmd) => cmd in action);
		const activeElement = document.activeElement;
		const activeColorInput =
			activeElement instanceof HTMLInputElement && activeElement.type === "color";

		if (
			isColorObjectAction &&
			(this.suspendSelectionCaptureForColorPicker || activeColorInput) &&
			this.rangeBackup
		) {
			this.restoreLastSelection(this.rangeBackup);
			this.range = this.rangeBackup.cloneRange();
		} else {
			this.captureRange();
		}

		if (!isColorObjectAction) {
			this.suspendSelectionCaptureForColorPicker = false;
		}

		if (typeof action === "string") {
			if (this.customCommandHandlers.has(action)) {
				await this.customCommandHandlers.get(action)?.(this, action);
				// return;
			}

			else if ((Object.keys(CLASS_BY_COMMAND) as InlineClassCommand[]).includes(action as InlineClassCommand)) {
				if (action === "color") {
					this.wrapSelectionWithClass(CLASS_BY_COMMAND.color, "color", this.highlightColor);
				} else {
					this.wrapSelectionWithClass(CLASS_BY_COMMAND[action as InlineClassCommand], action as InlineClassCommand);
				}

				// this.updateCommandTracker();
				// return;
			}

			else if (["alignLeft", "alignCenter", "alignRight"].includes(action)) {
				this.applyAlignment(action as AlignCommand);
				// this.updateCommandTracker();
				// return;
			}

			else if (action === "divider") {
				const hr = document.createElement("hr");
				this.insertNodeAtSelection(hr, true);
				this.ensureCaretAfterNonTextElement(hr);
				this.backupCurrentRange();
				// return;
			}

			else if (action === "quote") {
				// this.captureRange();
				if (this.range) {
					const quoteParent = this.getContainingQuote(this.range.startContainer);
					if (quoteParent) {
						this.unwrapQuote(quoteParent);
						this.normalizeDocument();
						// return;
					}
				}

				const quote = document.createElement("blockquote");
				const quoteLine = this.createEmptyParagraph();
				quote.append(quoteLine);
				this.insertNodeAtSelection(quote, true);
				this.ensureTrailingEditableLineAfter(quote);
				this.setSelectionAtStart(quoteLine);
				this.backupCurrentRange();
				// return;
			}

			else if (action === "unorderedList" || action === "orderedList") {
				const list = document.createElement(action === "unorderedList" ? "ul" : "ol");
				const li = document.createElement("li");
				li.append(document.createElement("br"));
				list.append(li);
				this.insertNodeAtSelection(list, true);
				this.ensureTrailingEditableLineAfter(list);
				this.setSelectionAtStart(li);
				this.backupCurrentRange();
				// return;
			}

			else if (action === "image") {
				// this.captureRange();
				this.imageInput.click();
				// return;
			}

			else {
				const maybeColor = tryNormalizeColor(action);
				if (maybeColor) {
					this.wrapSelectionWithClass(CLASS_BY_COMMAND.color, "color", maybeColor);
					this.updateCommandTracker();
				}
			}

			this.restoreLastSelection();
			this.updateCommandTracker();
			return;
		}

		if (typeof action === "object" && action) {
			const trackIt = ["color", "backgroundColor"].some((cmd) => cmd in action);
			if (trackIt) {
				const selectionSnapshot = this.range
					? this.snapshotRangeToTextOffsets(this.range)
					: null;

				const applyColorCommand = (
					nextAction: { color?: string; backgroundColor?: string },
					nextSnapshot: { start: number; end: number } | null
				): void => {
					if (nextAction.backgroundColor) {
						const color = tryNormalizeColor(nextAction.backgroundColor) || nextAction.backgroundColor;
						this.wrapSelectionWithClass(CLASS_BY_COMMAND.backgroundColor, "backgroundColor", color);
					}
					else if (nextAction.color) {
						const color = tryNormalizeColor(nextAction.color) || nextAction.color;
						this.wrapSelectionWithClass(CLASS_BY_COMMAND.color, "color", color);
					}

					if (nextSnapshot) {
						const rebased = this.restoreRangeFromTextOffsets(nextSnapshot);
						if (rebased) {
							this.restoreLastSelection(rebased);
							this.backupCurrentRange(rebased, { bypassNormalize: true });
						} else {
							this.restoreLastSelection();
						}
					} else {
						this.restoreLastSelection();
					}

					this.updateCommandTracker();
					this.suspendSelectionCaptureForColorPicker =
						document.activeElement instanceof HTMLInputElement &&
						document.activeElement.type === "color";
				};

				if (activeColorInput) {
					this.pendingColorCommand = {
						color: action.color,
						backgroundColor: action.backgroundColor,
					};
					this.pendingColorSelectionSnapshot = selectionSnapshot;

					if (this.colorCommandDebounceTimer !== null) {
						window.clearTimeout(this.colorCommandDebounceTimer);
					}

					this.colorCommandDebounceTimer = window.setTimeout(() => {
						const pending = this.pendingColorCommand;
						const pendingSnapshot = this.pendingColorSelectionSnapshot;
						this.pendingColorCommand = null;
						this.pendingColorSelectionSnapshot = null;
						this.colorCommandDebounceTimer = null;
						if (!pending) return;
						applyColorCommand(pending, pendingSnapshot);
					}, 16);
					return;
				}

				applyColorCommand(
					{ color: action.color, backgroundColor: action.backgroundColor },
					selectionSnapshot
				);
				return;
			}

			else if (action.element !== undefined) {
				let node: Node | null = null;
				let customElement: HTMLElement | null = null;
				if (typeof action.element === "string") {
					node = document.createTextNode(action.element);
				} else if (isHTMLElement(action.element)) {
					node = action.element;
					customElement = action.element;
					if (action.elementId) (node as HTMLElement).id = action.elementId;
				}
				if (!node) return;

				if (node instanceof HTMLElement && action.style) {
					for (const [k, v] of Object.entries(action.style)) {
						if (typeof v === "string") node.style.setProperty(k, v);
					}
				}

				if (node instanceof HTMLElement) {
					node.classList.add("_custom_");
					this.custom_array.push({ elementId: node.id || createUid("custom"), element: node });
				}

				const isTextNode = node.nodeType === Node.TEXT_NODE;
				this.insertNodeAtSelection(node, !isTextNode);
				// if (customElement && action.insert !== true) {
				if (customElement) {
					this.ensureCaretAfterNonTextElement(customElement);
				}
			}
			return;
		}

		this.suspendSelectionCaptureForColorPicker = false;
	}

	public async loadHTML(html: string, editable = false): Promise<void> {
		if (typeof html !== "string") throw new Error("html should be a string");

		this.setEditable(false);
		this.element.innerHTML = "";
		this.image_array = [];
		this.hashtag_array = [];
		this.urllink_array = [];
		this.custom_array = [];

		const div = document.createElement("div");
		div.innerHTML = html;

		for (const node of Array.from(div.childNodes)) {
			this.element.append(node);
		}

		const imageEls = this.element.querySelectorAll<HTMLImageElement>("._media_ img");
		for (const img of Array.from(imageEls)) {
			const elementId = img.id || createUid("img");
			img.id = elementId;
			this.image_array.push({ elementId, source: img.getAttribute("src") || "", element: img });
		}

		const hashtags = this.element.querySelectorAll("._hashtag_");
		for (const tag of Array.from(hashtags)) {
			const elementId = tag.id || createUid("hashtag");
			tag.id = elementId;
			this.hashtag_array.push({
				elementId,
				tag: (tag.textContent || "").replace(/^#/, ""),
				element: tag as HTMLSpanElement,
			});
		}

		const urls = this.element.querySelectorAll("._urllink_");
		for (const u of Array.from(urls)) {
			const elementId = u.id || createUid("urllink");
			u.id = elementId;
			this.urllink_array.push({
				elementId,
				url: u.textContent || "",
				element: u as HTMLSpanElement,
			});
		}

		const customs = this.element.querySelectorAll("._custom_");
		for (const c of Array.from(customs)) {
			const elementId = c.id || createUid("custom");
			c.id = elementId;
			this.custom_array.push({ elementId, element: c as HTMLElement });
		}

		this.normalizeDocument();
		if (editable) this.setEditable(true);
		if (this.element.childNodes.length === 0) this.element.append(this.createEmptyParagraph());
		this.updateCommandTracker();
	}

	public async export(
		pre?: (setup: ExportSetup) => ExportSetup | Promise<ExportSetup>
	): Promise<ExportPayload> {
		this.normalizeDocument();
		const dom = this.element.cloneNode(true) as HTMLElement;
		let setup: ExportSetup = {
			dom,
			urllink: this.urlEnabled ? this.urllink_array : undefined,
			hashtag: this.hashtagEnabled ? this.hashtag_array : undefined,
			image: this.image_array,
			custom: this.custom_array,
			title: "",
		};

		if (pre) {
			const out = pre(setup);
			setup = (out instanceof Promise ? await out : out) || setup;
		}

		const lines = Array.from(setup.dom.querySelectorAll(":scope > *"));
		let title = setup.title || "";
		const textParts: string[] = [];

		for (const line of lines) {
			const txt = (line.textContent || "").trim();
			if (!txt) continue;
			if (!title) {
				title = txt.slice(0, 200);
				if (txt.length > 200) textParts.push(txt.slice(200));
			} else {
				textParts.push(txt);
			}
		}

		return {
			html: setup.dom.innerHTML,
			title: title.trim(),
			text: textParts.join("\n").trim(),
			urllink: this.urlEnabled ? setup.urllink : undefined,
			hashtag: this.hashtagEnabled ? setup.hashtag : undefined,
			image: setup.image,
			custom: setup.custom,
		};
	}
}

