/* global global,System */
import { obj, arr, num } from 'lively.lang';
import { pt, Rectangle } from 'lively.graphics';
import vdom from 'virtual-dom';
import { defaultAttributes, defaultStyle } from '../rendering/morphic-default.js';
import { addOrChangeCSSDeclaration } from '../rendering/dom-helper.js';
import { hyperscriptFnForDocument } from '../rendering/dom-helper.js';
import { objectReplacementChar } from './document.js';
import config from '../config.js';
import { getSvgVertices } from '../rendering/property-dom-mapping.js';

const { h, create, patch, diff } = vdom;

let cssInstalled = false;

const debug = !!config.onloadURLQuery['debug-text'];

function printViewState (textMorph) {
  const {
    viewState: {
      scrollTop, scrollHeight,
      heightBefore, textHeight,
      firstVisibleRow, lastVisibleRow,
      firstFullyVisibleRow, lastFullyVisibleRow,
      visibleLines
    },
    document: { lines }
  } = textMorph;

  console.log(`${textMorph} #${textMorph.id.slice(0, 12)}
scroll: ${scrollTop} + ${scrollHeight}
lines: ${firstVisibleRow} - ${lastVisibleRow}
visible lines: ${lastVisibleRow - firstVisibleRow}
height: ${textHeight}, ${lines.length} lines`);
}

function installCSS (domEnv) {
  cssInstalled = true;
  addOrChangeCSSDeclaration('new-text-css', `

    /* markers */

    .newtext-marker-layer {
      position: absolute;
    }

    /* selection / cursor */

    .newtext-cursor {
      z-index: 5;
      pointer-events: none;
      position: absolute;
      background-color: black;
    }

    .hidden-cursor .newtext-cursor {
      background-color: transparent !important;
    }

    .newtext-cursor.diminished {
      background-color: gray;
    }

    .newtext-selection-layer {
      position: absolute;
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*/
    /* text layer / content */

    .newtext-text-layer {
      box-sizing: border-box;
      position: absolute;
      white-space: pre;
      z-index: 0;
      min-width: 100%;
      pointer-events: none;
    }

    .newtext-before-filler {}

    .newtext-text-layer.wrap-by-words {
      white-space: pre-wrap;
      overflow-wrap: break-word;
      max-width: 100%;
    }

    .newtext-text-layer.only-wrap-by-words {
      white-space: pre-wrap;
      overflow-wrap: break-all;
      max-width: 100%;
    }

    .newtext-text-layer.wrap-by-chars {
      white-space: pre-wrap;
      word-break: break-all;
      max-width: 100%;
    }

    .newtext-text-layer.no-wrapping {
    }

    .newtext-text-layer a {
       pointer-events: auto;
    }

    .newtext-text-layer.auto-width .line {
      width: fit-content;
    }

    .newtext-text-layer .line {
      -moz-border-radius: 0;
      -webkit-border-radius: 0;
      border-radius: 0;
      border-width: 0;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      margin: 0;
      word-wrap: normal;
      line-height: inherit;
      color: inherit;
      position: relative;
      overflow: visible;
      -webkit-tap-highlight-color: transparent;
      -webkit-font-variant-ligatures: contextual;
      font-variant-ligatures: contextual;
    }

    .line > .Morph {
      display: inline-block !important;
      vertical-align: top !important;
    }

    blockquote {
      margin: 0;
      -webkit-margin-start: 0;
      -webkit-margin-end: 0;
    }

    .newtext-text-layer blockquote {
      margin-left: 2em;
      margin-right: 2em;
      border-left: 2px lightgray solid;
      padding-left: 2%;
    }

    /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*/
    /* debug styling */

    .debug-info {
      position: absolute;
      outline: 1px solid green;
      pointer-events: none;
      z-index: 4;
      text-align: center;
      font-family: monospace;
      color: green;
      background-color: white;
      font-size: small;
      vertical-align: baseline;
    }

    .debug-line {
      position: absolute;
      outline: 1px solid red;
      pointer-events: none;
      z-index: 4,
      text-align: right;
      font-family: monospace;
      font-size: small;
      vertical-align: baseline;
      color: red;
    }

    .debug-char {
      position: absolute;
      outline: 1px solid orange;
      pointer-events: none;
      z-index: 3
    }

  `, domEnv.document);
}

// installCSS({document});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

const nextTick = (function (window, prefixes, i, p, fnc, to) {
  while (!fnc && i < prefixes.length) {
    fnc = window[prefixes[i++] + 'equestAnimationFrame'];
  }
  return (fnc && fnc.bind(window)) || window.setImmediate || function (fnc) { window.setTimeout(fnc, 0); };
})(typeof window !== 'undefined' ? window : global, 'r webkitR mozR msR oR'.split(' '), 0);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Render hook to update layout / size of text document lines once those are
// rendered and DOM measuring can be used

class AfterTextRenderHook {
  reset (morph) {
    this.morph = morph;
    this.called = false;
    this.needsRerender = false;
  }

  updateLineHeightOfNode (morph, docLine, lineNode) {
    if (docLine.height === 0 || docLine.hasEstimatedExtent) {
      const tfm = morph.getGlobalTransform().inverse();
      tfm.e = tfm.f = 0;

      const needsTransformAdjustment = tfm.getScale() != 1 || tfm.getRotation() != 0;
      if (needsTransformAdjustment) lineNode.style.transform = tfm.toString();
      const { height: nodeHeight, width: nodeWidth } = lineNode.getBoundingClientRect();
      if (needsTransformAdjustment) lineNode.style.transform = '';

      if (nodeHeight && nodeWidth && (docLine.height !== nodeHeight || docLine.width !== nodeWidth) &&
         morph.fontMetric.isFontSupported(morph.fontFamily, morph.fontWeight)) {
        // console.log(`[${docLine.row}] ${nodeHeight} vs ${docLine.height}`)
        docLine.changeExtent(nodeWidth, nodeHeight, false);
        morph.textLayout.resetLineCharBoundsCacheOfLine(docLine);
        // force re-render in case text layout / line heights changed
        this.needsRerender = true;
        morph.viewState._needsFit = true;
      }

      if (docLine.textAndAttributes && docLine.textAndAttributes.length) {
        let inlineMorph;
        for (let j = 0, column = 0; j < docLine.textAndAttributes.length; j += 2) {
          inlineMorph = docLine.textAndAttributes[j];
          if (inlineMorph && inlineMorph.isMorph) {
            morph._positioningSubmorph = inlineMorph;
            inlineMorph.position = morph.textLayout.pixelPositionFor(morph, { row: docLine.row, column }).subPt(morph.origin);
            inlineMorph._dirty = false; // no need to rerender
            morph._positioningSubmorph = null;
            column++;
          } else if (inlineMorph) {
            column += inlineMorph.length;
          }
        }
      }

      return nodeHeight;
    }
    return docLine.height;
  }

  updateExtentsOfLines (textlayerNode) {
    // figure out what lines are displayed in the text layer node and map those
    // back to document lines.  Those are then updated via lineNode.getBoundingClientRect
    const { morph } = this;
    const { textLayout, viewState, fontMetric } = morph;

    viewState.dom_nodes = [];
    viewState.dom_nodeFirstRow = 0;
    viewState.textWidth = textlayerNode.scrollWidth;

    const lineNodes = textlayerNode.children;
    let i = 0;
    let firstLineNode;

    while (i < lineNodes.length && lineNodes[i].className != 'line') i++;

    if (i < lineNodes.length) {
      firstLineNode = lineNodes[i];
    } else {
      return;
    }

    const ds = firstLineNode.dataset;
    const row = Number(ds ? ds.row : firstLineNode.getAttribute('data-row'));
    if (typeof row !== 'number' || isNaN(row)) return;
    viewState.dom_nodeFirstRow = row;
    let actualTextHeight = 0;
    let line = morph.document.getLine(row);

    let foundEstimatedLine;
    for (; i < lineNodes.length; i++) {
      const node = lineNodes[i];
      viewState.dom_nodes.push(node);
      if (line) {
        if (!foundEstimatedLine) { foundEstimatedLine = line.hasEstimatedExtent; }
        line.hasEstimatedExtent = foundEstimatedLine;
        actualTextHeight = actualTextHeight + this.updateLineHeightOfNode(morph, line, node);
        // if we measured but the font as not been loaded, this is also just an estimate
        line.hasEstimatedExtent = !fontMetric.isFontSupported(morph.fontFamily, morph.fontWeight);
        line = line.nextLine();
      }
    }

    if (this.needsRerender) {
      morph.fitIfNeeded();
      morph.makeDirty();
    } else morph._dirty = !!morph.submorphs.find(m => m.needsRerender());
  }

  hook (node, propName, prevValue) {
    if (!node || !node.parentNode) return;
    const vs = this.morph.viewState;
    vs.text_layer_node = node;
    vs.fontmetric_text_layer_node = null;
    this.called = true;
    // the childNodes = line nodes of node are updated after the hook was called,
    // so delay...
    this.updateExtentsOfLines(node);
  }
}

export default class TextRenderer {
  constructor (domEnv) {
    if (!domEnv) {
      console.warn('Text renderer initialized without domEnv. Depending on what you want to do you might have bad luck...!');
    } else if (!cssInstalled) installCSS(domEnv);
    this.domEnv = domEnv;
  }

  directRenderLineFn (morph) {
    let fn = morph.viewState._renderLineFn;
    if (!fn) {
      const h = hyperscriptFnForDocument(this.domEnv.document);
      fn = morph.viewState._renderLineFn = line => this.renderLine(h, null, morph, line);
    }
    return fn;
  }

  directRenderTextLayerFn (morph) {
    let fn = morph.viewState._renderTextLayerFn;
    if (!fn) {
      const h = hyperscriptFnForDocument(this.domEnv.document);
      fn = morph.viewState._renderTextLayerFn = additionalStyle =>
        this.renderJustTextLayerNode(h, morph, additionalStyle, []);
    }
    return fn;
  }

  renderMorph (morph, renderer) {
    const cursorWidth = 1;
    let selectionLayer = [];

    const sel = morph.selection;
    if (morph.inMultiSelectMode()) {
      const sels = sel.selections; let i = 0;
      for (; i < sels.length - 1; i++) { selectionLayer.push(...this.renderSelectionLayer(morph, sels[i], true/* diminished */, 2)); }
      selectionLayer.push(...this.renderSelectionLayer(morph, sels[i], false/* diminished */, 4));
    } else {
      selectionLayer = this.renderSelectionLayer(morph, sel, false, cursorWidth);
    }

    const textLayer = this.renderTextLayer(morph, renderer);
    const textLayerForFontMeasure = this.renderJustTextLayerNode(h, morph, null, []);
    const markerLayer = this.renderMarkerLayer(morph, renderer);
    const horizontalScrollBarVisible = morph.document.width > morph.width;
    const scrollBarOffset = horizontalScrollBarVisible ? morph.scrollbarOffset : pt(0, 0);

    const scrollLayer = h('div', {
      className: 'scrollLayer',
      style: {
        position: 'absolute',
        top: 0 + 'px',
        ...morph.viewState.fastScroll ? { overflow: morph.scrollActive ? morph.clipMode : 'hidden' } : {},
        width: morph.width + 'px',
        height: morph.height + 'px'
      }
    }, [h('div', {
      style: {
        width: Math.max(morph.document.width, morph.width) + 'px',
        height: Math.max(morph.document.height, morph.height) - scrollBarOffset.y + 'px'
      }
    })]);

    textLayer.properties.className += ' actual';
    textLayer.properties.style.overflow = morph.clipMode === 'visible' ? 'visible' : 'hidden';
    textLayerForFontMeasure.properties.className += ' font-measure';

    const { embeddedMorphMap } = morph;
    const submorphsNotInText = embeddedMorphMap
      ? morph.submorphs.filter(ea => !embeddedMorphMap.has(ea))
      : morph.submorphs;

    const subNodes = [
      ...selectionLayer, markerLayer,
      textLayerForFontMeasure,
      textLayer,
      renderer.renderSelectedSubmorphs(morph, submorphsNotInText)
    ];

    return h('div', {
      ...defaultAttributes(morph, renderer),
      style: {
        ...defaultStyle(morph),
        ...morph.viewState.fastScroll ? { overflow: morph.clipMode == 'visible' ? 'visible' : 'hidden' } : {},
        '-moz-user-select': 'none',
        cursor: morph.nativeCursor === 'auto'
          ? (morph.readOnly ? 'default' : 'text')
          : morph.nativeCursor
      }
    }, [
      scrollLayer,
      ...morph.viewState.fastScroll ? [h('div', {
        className: 'scrollWrapper',
        style: {
          'pointer-events': 'none',
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(-${morph.scroll.x}px, -${morph.scroll.y}px)`
        }
      }, subNodes)] : subNodes
    ]
    );
  }

  renderTextLayer (morph, renderer) {
    // this method renders the text content = lines

    const children = morph.debug ? [
      ...this.renderDebugLayer(morph),
      ...this.renderLines(h, renderer, morph)
    ] : this.renderLines(h, renderer, morph);

    const node = this.renderJustTextLayerNode(h, morph, null, children);
    node.properties.style.position = 'absolute';

    // install hook so we can update text layout from real DOM once it is rendered
    const hook = morph.viewState.afterTextRenderHook ||
            (morph.viewState.afterTextRenderHook = new AfterTextRenderHook());
    hook.reset(morph);
    node.properties['after-text-render-hook'] = hook;
    nextTick(() => {
      // The hook only gets called on prop changes of textlayer node. We
      // actually want to always trigger in order to update the lines, so run
      // delayed
      this.manuallyTriggerTextRenderHook(morph, renderer);
    });

    return node;
  }

  manuallyTriggerTextRenderHook (morph, renderer) {
    const hook = morph.viewState.afterTextRenderHook;
    if (!hook || hook.called) return;
    const node = renderer.getNodeForMorph(morph);
    const textlayerNode = node && node.querySelector('.actual.newtext-text-layer');
    if (textlayerNode) hook.hook(textlayerNode);
    if (morph.ownerChain().every(m => m.visible)) { morph.fit(); }
  }

  renderJustTextLayerNode (h, morph, additionalStyle, children) {
    // this method renders the text content = lines

    const {
      height,
      padding: { x: padLeft, y: padTop, width: padWidth, height: padHeight },
      lineWrapping,
      fixedWidth,
      fixedHeight,
      backgroundColor,
      fontColor,
      textAlign,
      fontSize,
      textDecoration,
      fontStyle,
      fontWeight,
      fontFamily,
      lineHeight,
      wordSpacing,
      letterSpacing,
      document: doc,
      tabWidth
    } = morph;
    const padRight = padLeft + padWidth;
    const padBottom = padTop + padHeight;
    const textHeight = Math.max(morph.document.height, morph.height);
    let textLayerClasses = 'newtext-text-layer';

    // assemble attributes of node

    // start with lineWrapping

    switch (lineWrapping) {
      case true:
      case 'by-words': textLayerClasses = textLayerClasses + ' wrap-by-words'; break;
      case 'only-by-words': textLayerClasses = textLayerClasses + ' only-wrap-by-words'; break;
      case 'by-chars': textLayerClasses = textLayerClasses + ' wrap-by-chars'; break;
      case false: textLayerClasses = textLayerClasses + ' no-wrapping'; break;
    }

    if (!fixedWidth) textLayerClasses = textLayerClasses + ' auto-width';
    if (!fixedHeight) textLayerClasses = textLayerClasses + ' auto-height';

    // ...and now other attribues
    const style = { height: textHeight + 'px' };
    if (padLeft > 0) style.paddingLeft = padLeft + 'px';
    if (padRight > 0) style.paddingRight = padRight + 'px';
    if (padTop > 0) style.paddingTop = padTop + 'px';
    if (padBottom > 0) style.paddingBottom = padBottom + 'px';
    if (letterSpacing) style.letterSpacing = letterSpacing;
    if (wordSpacing) style.wordSpacing = wordSpacing;
    if (lineHeight) style.lineHeight = lineHeight;
    if (fontFamily) style.fontFamily = fontFamily;
    if (fontWeight) style.fontWeight = fontWeight;
    if (fontStyle) style.fontStyle = fontStyle;
    if (textDecoration) style.textDecoration = textDecoration;
    if (fontSize) style.fontSize = fontSize + 'px';
    if (textAlign) style.textAlign = textAlign;
    if (fontColor) style.color = String(fontColor);
    if (backgroundColor) style.backgroundColor = backgroundColor;
    if (tabWidth !== 8) style.tabSize = tabWidth;

    const textAttrs = { className: textLayerClasses, style };

    style.overflow = 'hidden';

    if (additionalStyle) {
      const { clipMode, height, width } = additionalStyle;
      if (typeof width === 'number') { style.width = width + 'px'; }
      if (typeof height === 'number') { style.height = height + 'px'; }
      if (clipMode) { style.overflow = clipMode; }
    }

    return h('div', textAttrs, children);
  }

  renderLines (h, renderer, morph) {
    const {
      height,
      scroll,
      padding: { x: padLeft, y: padTop, width: padWidth, height: padHeight },
      document: doc,
      clipMode
    } = morph;
    const node = renderer.getNodeForMorph(morph);
    const padRight = padLeft + padWidth;
    const padBottom = padTop + padHeight;
    const scrollTop = scroll.y;
    const scrollHeight = height;
    const lastLineNo = doc.rowCount - 1;
    const textHeight = doc.height;
    const clips = clipMode !== 'visible';

    const {
      line: startLine,
      offset: startOffset,
      y: heightBefore,
      row: startRow
    } = doc.findLineByVerticalOffset(clips ? Math.max(0, clips ? scrollTop - padTop : 0) : 0) ||
     { row: 0, y: 0, offset: 0, line: doc.getLine(0) };

    const {
      line: endLine,
      offset: endLineOffset,
      row: endRow
    } = doc.findLineByVerticalOffset(clips ? Math.min(textHeight, (scrollTop - padTop) + scrollHeight) : textHeight) ||
     { row: lastLineNo, offset: 0, y: 0, line: doc.getLine(lastLineNo) };

    const firstVisibleRow = clips ? startRow : 0;
    const firstFullyVisibleRow = startOffset === 0 ? startRow : startRow + 1;
    const lastVisibleRow = clips ? endRow + 1 : lastLineNo;
    const lastFullyVisibleRow = !endLine || endLineOffset === endLine.height ? endRow : endRow - 1;

    // render lines via virtual-dom

    this.maxVisibleLines = Math.max(this.maxVisibleLines || 1, lastVisibleRow - firstVisibleRow + 1);

    const visibleLines = [];
    const renderedLines = [];

    // spacer to push visible lines into the scrolled area
    renderedLines.push(h('div.newtext-before-filler', { key: 'filler', style: { height: heightBefore + 'px' } }));

    let line = startLine; let i = 0;
    while (i < this.maxVisibleLines) {
      visibleLines.push(line);
      const newLine = this.renderLine(h, renderer, morph, line);
      renderedLines.push(newLine);
      newLine.key = line.row % this.maxVisibleLines;
      i++;
      line = line.nextLine();
      if (!line) break;
    }

    Object.assign(morph.viewState, {
      scrollTop,
      scrollHeight,
      scrollBottom: scrollTop + scrollHeight,
      heightBefore,
      textHeight,
      firstVisibleRow,
      lastVisibleRow,
      firstFullyVisibleRow,
      lastFullyVisibleRow,
      visibleLines
    });

    morph.debug && printViewState(morph);

    return renderedLines;
  }

  renderLine (h, renderer, morph, line) {
    // Note: this function is being used in the font metric as well, with a
    // non-virtual-dom "h" function

    const { textAndAttributes } = line;
    const renderedChunks = [];
    const size = textAndAttributes.length;
    let content; let attr;
    let fontSize; let fontFamily; let fontWeight; let fontStyle; let textDecoration; let fontColor;
    let backgroundColor; let nativeCursor; let textStyleClasses; let link;
    let tagname; let nodeStyle; let nodeAttrs; let paddingRight; let paddingLeft; let paddingTop; let paddingBottom;
    let lineHeight; let textAlign; let verticalAlign; let wordSpacing; let letterSpacing; let quote; let nested;
    let textStroke;
    let minFontSize = morph.fontSize;

    if (size > 0) {
      for (let i = 0; i < size; i = i + 2) {
        content = textAndAttributes[i] || '\u00a0';
        attr = textAndAttributes[i + 1];

        if (typeof content !== 'string') {
          renderedChunks.push(
            content.isMorph
              ? this.renderEmbeddedSubmorph(h, renderer, content, attr)
              : objectReplacementChar);
          continue;
        }

        if (!attr) { renderedChunks.push(content); continue; }

        fontSize = attr.fontSize && (obj.isString(attr.fontSize) ? attr.fontSize : attr.fontSize + 'px');
        fontFamily = attr.fontFamily;
        fontWeight = attr.fontWeight;
        fontStyle = attr.fontStyle;
        textDecoration = attr.textDecoration;
        fontColor = attr.fontColor;
        backgroundColor = attr.backgroundColor;
        nativeCursor = attr.nativeCursor;
        textStyleClasses = attr.textStyleClasses;
        link = attr.link;
        lineHeight = attr.lineHeight || lineHeight;
        textAlign = attr.textAlign || textAlign;
        wordSpacing = attr.wordSpacing || wordSpacing;
        letterSpacing = attr.letterSpacing || letterSpacing;
        paddingRight = attr.paddingRight;
        paddingLeft = attr.paddingLeft;
        paddingTop = attr.paddingTop;
        paddingBottom = attr.paddingBottom;
        verticalAlign = attr.verticalAlign;
        textStroke = attr.textStroke;
        quote = attr.quote || quote;

        tagname = 'span';
        nodeStyle = {};
        nodeAttrs = { style: nodeStyle };

        if (fontSize && attr.fontSize < minFontSize) minFontSize = attr.fontSize;

        if (link) {
          tagname = 'a';
          nodeAttrs.href = link;
          if (link && link.startsWith('http')) nodeAttrs.target = '_blank';
        }

        if (link || nativeCursor) nodeStyle.pointerEvents = 'auto';

        if (fontSize) nodeStyle.fontSize = fontSize;
        if (fontFamily) nodeStyle.fontFamily = fontFamily;
        if (fontWeight) nodeStyle.fontWeight = fontWeight;
        if (fontStyle) nodeStyle.fontStyle = fontStyle;
        if (textDecoration) nodeStyle.textDecoration = textDecoration;
        if (fontColor) nodeStyle.color = String(fontColor);
        if (backgroundColor) nodeStyle.backgroundColor = String(backgroundColor);
        if (nativeCursor) nodeStyle.cursor = nativeCursor;
        if (paddingRight) nodeStyle.paddingRight = paddingRight;
        if (paddingLeft) nodeStyle.paddingLeft = paddingLeft;
        if (paddingTop) nodeStyle.paddingTop = paddingTop;
        if (paddingBottom) nodeStyle.paddingBottom = paddingBottom;
        if (verticalAlign) nodeStyle.verticalAlign = verticalAlign;
        if (textStroke) nodeStyle['-webkit-text-stroke'] = textStroke;
        if (attr.doit) { nodeStyle.pointerEvents = 'auto'; nodeStyle.cursor = 'pointer'; }

        if (textStyleClasses && textStyleClasses.length) { nodeAttrs.className = textStyleClasses.join(' '); }

        renderedChunks.push(h(tagname, nodeAttrs, content));
      }
    } else renderedChunks.push(h('br'));

    const lineStyle = {};
    // var lineTag = quote ? "blockquote" : "div";
    const lineTag = 'div';
    if (morph.fontSize > minFontSize) lineStyle.fontSize = minFontSize + 'px';
    if (lineHeight) lineStyle.lineHeight = lineHeight;
    if (textAlign) lineStyle.textAlign = textAlign;
    if (letterSpacing) lineStyle.letterSpacing = letterSpacing;
    if (wordSpacing) lineStyle.wordSpacing = wordSpacing;

    let node = h(lineTag,
      { className: 'line', style: lineStyle, dataset: { row: line.row } },
      renderedChunks);

    if (quote) {
      if (typeof quote !== 'number') quote = 1;
      for (let i = quote; i--;) node = h('blockquote', {}, node);
    }

    return node;
  }

  renderEmbeddedSubmorph (h, renderer, morph, attr) {
    let rendered;
    attr = attr || {};
    if (renderer) {
      rendered = renderer.render(morph);
      rendered.properties.style.position = 'relative';
      rendered.properties.style.transform = '';
      rendered.properties.style.textAlign = 'initial';
      // fixme:  this addition screws up the bounds computation of the embedded submorph
      if (attr.paddingTop) rendered.properties.style.marginTop = attr.paddingTop;
      if (attr.paddingLeft) rendered.properties.style.marginLeft = attr.paddingLeft;
      if (attr.paddingRight) rendered.properties.style.marginRight = attr.paddingRight;
      if (attr.paddingBottom) rendered.properties.style.marginBottom = attr.paddingBottom;
      return rendered;
    }
    const { extent, styleClasses } = morph;
    const width = extent.x + 'px';
    const height = extent.y + 'px';
    return h('div', { className: styleClasses.join(' '), style: { width, height } }, []);
  }

  renderSelectionLayer (morph, selection, diminished = false, cursorWidth = 2) {
    if (!selection) return [];

    const { textLayout } = morph;

    const { start, end, cursorVisible, selectionColor } = selection;
    const { document, cursorColor } = morph;
    const isReverse = selection.isReverse();
    const startBounds = textLayout.boundsFor(morph, start);
    const maxBounds = textLayout.computeMaxBoundsForLineSelection(morph, selection);
    const endBounds = textLayout.boundsFor(morph, end);
    const startPos = pt(startBounds.x, maxBounds.y);
    const endPos = pt(endBounds.x, endBounds.y);
    const leadLineHeight = startBounds.height;
    const endLineHeight = endBounds.height;
    const cursorPos = isReverse ? pt(startBounds.x, startBounds.y) : endPos;
    const cursorHeight = isReverse ? leadLineHeight : endLineHeight;
    const renderedCursor = this.cursor(cursorPos, cursorHeight, cursorVisible, diminished, cursorWidth, cursorColor);

    if (selection.isEmpty()) return [renderedCursor];

    // render selection layer
    const slices = [];
    let row = selection.start.row;
    let yOffset = document.computeVerticalOffsetOf(row) + morph.padding.top();
    const paddingLeft = morph.padding.left();
    const bufferOffset = 50;

    let charBounds,
      selectionTopLeft,
      selectionBottomRight,
      isFirstLine,
      renderedSelectionPart,
      cb, line, isWrapped;

    while (row <= selection.end.row) {
      line = document.getLine(row);

      if (row < morph.viewState.firstVisibleRow - bufferOffset) {
        yOffset += line.height;
        row++;
        continue;
      }

      if (row > morph.viewState.lastVisibleRow + bufferOffset) break;

      charBounds = textLayout.charBoundsOfRow(morph, row).map(Rectangle.fromLiteral);
      isFirstLine = row == selection.start.row;
      isWrapped = charBounds[0].bottom() < arr.last(charBounds).top();

      if (isWrapped) {
        // since wrapped lines spread multiple "rendered" rows, we need to do add in a couple of
        // additional selection parts here
        const rangesToRender = textLayout.rangesOfWrappedLine(morph, row).map(r => r.intersect(selection));
        let isFirstSubLine = isFirstLine;
        let subLineMinY = 0;
        let subCharBounds;
        let subLineMaxBottom;
        for (const r of rangesToRender) {
          if (r.isEmpty()) continue;

          subCharBounds = charBounds.slice(r.start.column, r.end.column);

          subLineMinY = isFirstSubLine ? arr.min(subCharBounds.map(cb => cb.top())) : subLineMinY;
          subLineMaxBottom = arr.max(subCharBounds.map(cb => cb.bottom()));

          cb = subCharBounds[0];
          selectionTopLeft = pt(paddingLeft + cb.left(), yOffset + subLineMinY);

          cb = arr.last(subCharBounds);
          selectionBottomRight = pt(paddingLeft + cb.right(), yOffset + subLineMaxBottom);

          subLineMinY = subLineMaxBottom;
          isFirstSubLine = false;

          slices.push(Rectangle.fromAny(selectionTopLeft, selectionBottomRight));
        }
      }

      if (!isWrapped) {
        const isLastLine = row == selection.end.row;
        const startIdx = isFirstLine ? selection.start.column : 0;
        const endIdx = isLastLine ? selection.end.column : charBounds.length - 1;
        const lineMinY = isFirstLine && arr.min(charBounds.slice(startIdx, endIdx + 1).map(cb => cb.top())) || 0;
        const emptyBuffer = startIdx >= endIdx ? 5 : 0;

        cb = charBounds[startIdx];
        selectionTopLeft = pt(paddingLeft + (cb ? cb.left() : arr.last(charBounds).right()), yOffset + lineMinY);

        cb = charBounds[endIdx];
        if (selection.includingLineEnd) { selectionBottomRight = pt(morph.width - morph.padding.right(), yOffset + lineMinY + line.height); } else {
          const excludeCharWidth = isLastLine && selection.end.column <= charBounds.length - 1;
          selectionBottomRight = pt(paddingLeft + (cb ? (excludeCharWidth ? cb.left() : cb.right()) : arr.last(charBounds).right()) + emptyBuffer, yOffset + lineMinY + line.height);
        }

        slices.push(Rectangle.fromAny(selectionTopLeft, selectionBottomRight));
      }

      yOffset += line.height;
      row++;
    }

    const renderedSelection = this.selectionLayerRounded(slices, selectionColor, morph);

    renderedSelection.push(renderedCursor);
    return renderedSelection;
  }

  selectionLayerRounded (slices, selectionColor, morph) {
    // split up the rectangle corners into a left and right batches
    let currentBatch;
    const batches = [
      currentBatch = {
        left: [], right: []
      }
    ];

    let lastSlice;
    for (const slice of slices) {
      // if rectangles do not overlap, create a new split batch
      if (lastSlice && (lastSlice.left() > slice.right() || lastSlice.right() < slice.left())) {
        batches.push(currentBatch = { left: [], right: [] });
      }
      currentBatch.left.push(slice.topLeft(), slice.bottomLeft());
      currentBatch.right.push(slice.topRight(), slice.bottomRight());
      lastSlice = slice;
    }
    // turn each of the batches into its own svg path
    const svgs = [];
    for (const batch of batches) {
      if (!batch.left.length) continue;
      const pos = batch.left.reduce((p1, p2) => p1.minPt(p2)); // topLeft of the path
      const vs = batch.left.concat(batch.right.reverse());

      // move a sliding window over each vertex
      let updatedVs = [];
      for (let vi = 0; vi < vs.length; vi++) {
        const prevV = vs[vi - 1] || arr.last(vs);
        const currentV = vs[vi];
        const nextV = vs[vi + 1] || arr.first(vs);

        // replace the vertex by two adjacent ones offset by distance
        const offset = 6;
        const offsetV1 = prevV.subPt(currentV).normalized().scaleBy(offset);
        const p1 = currentV.addPt(offsetV1);
        p1._next = offsetV1.scaleBy(-1);
        const offsetV2 = nextV.subPt(currentV).normalized().scaleBy(offset);
        const p2 = currentV.addPt(offsetV2);
        p2._prev = offsetV2.scaleBy(-1);

        updatedVs.push(p1, p2);
      }

      updatedVs = updatedVs.map(p => ({
        position: p.subPt(pos), isSmooth: true, controlPoints: { next: p._next || pt(0), previous: p._prev || pt(0) }
      })
      );

      const d = getSvgVertices(updatedVs);
      const { y: minY, x: minX } = updatedVs.map(p => p.position).reduce((p1, p2) => p1.minPt(p2));
      const { y: maxY, x: maxX } = updatedVs.map(p => p.position).reduce((p1, p2) => p1.maxPt(p2));
      const height = maxY - minY;
      const width = maxX - minX;
      svgs.push(
        h('svg', {
          namespace: 'http://www.w3.org/2000/svg',
          version: '1.1',
          style: {
            position: 'absolute',
            left: pos.x + 'px',
            top: pos.y + 'px',
            width,
            height
          }
        }, h('path', {
          namespace: 'http://www.w3.org/2000/svg',
          attributes: { d, fill: selectionColor.toString() }
        }))
      );
    }

    return svgs;
  }

  cursor (pos, height, visible, diminished, width, color) {
    return h('div', {
      className: 'newtext-cursor' + (diminished ? ' diminished' : ''),
      style: {
        left: pos.x - Math.ceil(width / 2) + 'px',
        top: pos.y + 'px',
        width: width + 'px',
        height: height + 'px',
        display: visible ? '' : 'none',
        background: color || 'black'
      }
    }/*, "\u00a0" */);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // markers

  renderMarkerLayer (morph) {
    const {
      markers,
      textLayout,
      viewState: { firstVisibleRow, lastVisibleRow }
    } = morph;
    const parts = [];

    if (!markers) return parts;

    for (const m of markers) {
      const { style, range: { start, end } } = m;

      if (end.row < firstVisibleRow || start.row > lastVisibleRow) continue;

      // single line
      if (start.row === end.row) {
        parts.push(this.renderMarkerPart(textLayout, morph, start, end, style));
        continue;
      }

      // multiple lines
      // first line
      parts.push(this.renderMarkerPart(textLayout, morph, start, morph.lineRange(start.row).end, style));
      // lines in the middle
      for (let row = start.row + 1; row <= end.row - 1; row++) {
        const { start: lineStart, end: lineEnd } = morph.lineRange(row);
        parts.push(this.renderMarkerPart(textLayout, morph, lineStart, lineEnd, style, true));
      }
      // last line
      parts.push(this.renderMarkerPart(textLayout, morph, { row: end.row, column: 0 }, end, style));
    }

    return parts;
  }

  renderMarkerPart (textLayouter, morph, start, end, style, entireLine = false) {
    let startX = 0; let endX = 0; let y = 0; let height = 0;
    const { document: doc } = morph;
    const line = doc.getLine(start.row);
    if (entireLine) {
      const { padding } = morph;
      startX = padding.left();
      y = padding.top() + doc.computeVerticalOffsetOf(start.row);
      endX = startX + line.width;
      height = line.height;
    } else {
      ({ x: startX, y } = textLayouter.boundsFor(morph, start));
      ({ x: endX, height } = textLayouter.boundsFor(morph, end));
    }
    height = Math.ceil(height);
    return h('div.newtext-marker-layer', {
      style: {
        ...style,
        left: startX + 'px',
        top: y + 'px',
        height: height + 'px',
        width: endX - startX + 'px'
      }
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // debug layer

  renderDebugLayer (morph) {
    const vs = morph.viewState;
    const debugHighlights = [];
    const textWidth = 0;
    let { heightBefore: rowY, firstVisibleRow, lastVisibleRow, visibleLines } = vs;
    const { padding, scroll: { x: visibleLeft, y: visibleTop } } = morph;
    const leftP = padding.left();
    const rightP = padding.right();
    const topP = padding.top();
    const bottomP = padding.bottom();

    debugHighlights.push(h('div.debug-info', {
      style: {
        left: (visibleLeft + leftP) + 'px',
        top: visibleTop + 'px',
        width: (morph.width - rightP) + 'px'
      }
    }, h('span', `visible rows: ${firstVisibleRow} - ${lastVisibleRow}`)));

    for (let i = 0, row = firstVisibleRow; row < lastVisibleRow; i++, row++) {
      const line = visibleLines[i];
      const charBounds = morph.textLayout.lineCharBoundsCache.get(line);
      const { height } = line;

      debugHighlights.push(h('div.debug-line', {
        style: {
          left: (visibleLeft + leftP) + 'px',
          top: (topP + rowY) + 'px',
          width: (morph.width - rightP) + 'px',
          height: height + 'px'
        }
      }, h('span', String(row))));

      if (!charBounds) {
        rowY = rowY + height;
        continue;
      }

      for (let col = 0; col < charBounds.length; col++) {
        const { x, y, width, height } = charBounds[col];
        debugHighlights.push(h('div.debug-char', {
          style: {
            left: (leftP + x) + 'px',
            top: (topP + rowY + y) + 'px',
            width: width + 'px',
            height: height + 'px'
          }
        }));
      }

      rowY = rowY + height;
    }

    return debugHighlights;
  }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// DOM extraction from text morph

export function extractHTMLFromTextMorph (
  textMorph,
  textAndAttributes = textMorph.textAndAttributesInRange(textMorph.selection.range)
) {
  const text = new textMorph.constructor({
    ...textMorph.defaultTextStyle,
    width: textMorph.width,
    textAndAttributes: textAndAttributes
  });
  const render = text.textRenderer.directRenderTextLayerFn(text);
  const renderLine = text.textRenderer.directRenderLineFn(text);
  const textLayerNode = render();
  const style = System.global && System.global.getComputedStyle ? System.global.getComputedStyle(textLayerNode) : null;
  if (style) {
    textLayerNode.ownerDocument.body.appendChild(textLayerNode);
    textLayerNode.style.whiteSpace = style.whiteSpace;
    textLayerNode.style.overflowWrap = style.overflowWrap;
    textLayerNode.style.wordBreak = style.wordBreak;
    textLayerNode.style.minWidth = style.minWidth;
    textLayerNode.parentNode.removeChild(textLayerNode);
  }
  for (const line of text.document.lines) { textLayerNode.appendChild(renderLine(line)); }
  return textLayerNode.outerHTML;
}
