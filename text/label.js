import { obj, arr, string } from "lively.lang";
import { rect, Rectangle, Color, pt } from "lively.graphics";
import { Morph, show } from "../index.js";
import { defaultStyle, defaultAttributes } from "../rendering/morphic-default.js";
import { h } from "virtual-dom";

const defaultTextStyle = {
  fontFamily: "Sans-Serif",
  fontSize: 12,
  fontColor: Color.black,
  fontWeight: "normal",
  fontStyle: "normal",
  textDecoration: "none",
  textStyleClasses: undefined,
}

export class Label extends Morph {

  static icon(iconName, props = {prefix: "", suffix: ""}) {
    // var l = Label.icon("users", {prefix: "??? ", suffix: " !!!", fontSize: 30}).openInWorld();
    var {prefix, suffix} = props;
    var textAndAttributes = [];
    if (prefix) textAndAttributes.push(typeof prefix === "string" ? [prefix || "", {}] : prefix);
    textAndAttributes.push([
      Icons[iconName].code || `icon ${iconName} not found`,
       {fontFamily: "", textStyleClasses: ["fa"]}]);
    if (suffix) textAndAttributes.push(typeof suffix === "string" ? [suffix || "", {}] : suffix);
    return new this({
      value: textAndAttributes,
      ...obj.dissoc(props, ["prefix", "suffix"])
    });
  }

  constructor(props = {}) {
    var { fontMetric, position, rightCenter, leftCenter, topCenter,
          bottom, top, right, left, bottomCenter, bottomLeft, bottomRight,
          topRight, topLeft, center } = props;
    super({
      fill: null,
      draggable: false,
      padding: 0,
      nativeCursor: "default",
      autofit: true,
      ...defaultTextStyle,
      ...obj.dissoc(props, ["fontMetric"])
    });
    if (fontMetric)
      this._fontMetric = fontMetric;
    this.fit();
    // Update position after fit
    if (position !== undefined) this.position = position;
    if (rightCenter !== undefined) this.rightCenter = rightCenter;
    if (leftCenter !== undefined) this.leftCenter = leftCenter;
    if (topCenter !== undefined) this.topCenter = topCenter;
    if (bottom !== undefined) this.bottom = bottom;
    if (top !== undefined) this.top = top;
    if (right !== undefined) this.right = right;
    if (left !== undefined) this.left = left;
    if (bottomCenter !== undefined) this.bottomCenter = bottomCenter;
    if (bottomLeft !== undefined) this.bottomLeft = bottomLeft;
    if (bottomRight !== undefined) this.bottomRight = bottomRight;
    if (topRight !== undefined) this.topRight = topRight;
    if (topLeft !== undefined) this.topLeft = topLeft;
    if (center !== undefined) this.center = center;
  }

  get isLabel() { return true }

  get value() {
    var {textAndAttributes} = this;
    if (textAndAttributes.length === 1) {
      var [text, style] = textAndAttributes[0];
      if (!Object.keys(style).length) return text;
    }
    return textAndAttributes;
  }
  set value(value) {
    typeof value === "string" ?
      this.textString = value :
      this.textAndAttributes = value;
  }

  get textString() { return this.textAndAttributes.map(([text]) => text).join(""); }
  set textString(value) { this.textAndAttributes = [[value, {}]]; }

  get textAndAttributes() { return this.getProperty("textAndAttributes") || [[""]]; }
  set textAndAttributes(value) {
    this._cachedTextBounds = null;
    this.addValueChange("textAndAttributes", value);
    if (this.autofit) this._needsFit = true;
  }

  get autofit() { return this.getProperty("autofit") }
  set autofit(value) {
    this.addValueChange("autofit", value);
    if (value) this._needsFit = true;
  }

  get padding() { return this.getProperty("padding"); }
  set padding(value) {
    this._cachedTextBounds = null;
    this.addValueChange("padding", typeof value === "number" ? Rectangle.inset(value) : value);
    if (this.autofit) this._needsFit = true;
  }

  get fontFamily() { return this.getProperty("fontFamily"); }
  set fontFamily(fontFamily) {
    this._cachedTextBounds = null;
    this.addValueChange("fontFamily", fontFamily);
    if (this.autofit) this._needsFit = true;
  }

  get fontSize() { return this.getProperty("fontSize"); }
  set fontSize(fontSize) {
    this._cachedTextBounds = null;
    this.addValueChange("fontSize", fontSize);
    if (this.autofit) this._needsFit = true;
  }

  get fontColor() { return this.getProperty("fontColor"); }
  set fontColor(fontColor) {
    this.addValueChange("fontColor", fontColor);
  }

  get fontWeight() { return this.getProperty("fontWeight"); }
  set fontWeight(fontWeight) {
    this._cachedTextBounds = null;
    this.addValueChange("fontWeight", fontWeight);
    if (this.autofit) this._needsFit = true;
  }

  get fontStyle() { return this.getProperty("fontStyle"); }
  set fontStyle(fontStyle) {
    this._cachedTextBounds = null;
    this.addValueChange("fontStyle", fontStyle);
    if (this.autofit) this._needsFit = true;
  }

  get textDecoration() { return this.getProperty("textDecoration"); }
  set textDecoration(textDecoration) {
    this.addValueChange("textDecoration", textDecoration);
  }

  get textStyleClasses() { return this.getProperty("textStyleClasses"); }
  set textStyleClasses(textStyleClasses) {
    this._cachedTextBounds = null;
    this.addValueChange("textStyleClasses", textStyleClasses);
    if (this.autofit) this._needsFit = true;
  }

  get textStyle() {
    return obj.select(this, [
      "textStyleClasses",
      "textDecoration",
      "fontStyle",
      "fontWeight",
      "fontColor",
      "fontSize",
      "fontFamily"
    ]);
  }

  fit() {
    this.extent = this.textBounds().extent();
    this._needsFit = false;
    return this;
  }

  get textAndAttributesOfLines() {
    var lines = [[]],
        {textAndAttributes} = this;
    for (var i = 0; i < textAndAttributes.length; i++) {
      var [text, style] = textAndAttributes[i],
          style = style || {},
          textLines = string.lines(text);
      if (textLines[0].length)
        arr.last(lines).push([textLines[0], style])
      for (var j = 1; j < textLines.length; j++)
        lines.push(textLines[j].length ? [[textLines[j], style]] : []);
    }
    return lines
  }

  textBoundsSingleChunk() {
    // text bounds not considering "chunks", i.e. only default text style is
    // used
    var fm = this._fontMetric || this.env.fontMetric,
        [[text, chunkStyle]] = this.textAndAttributes,
        style = {...this.textStyle, chunkStyle},
        padding = this.padding,
        width, height;
    if (!fm.isProportional(style.fontFamily)) {
      var {width: charWidth, height: charHeight} = fm.sizeFor(style, "x");
      width = text.length * charWidth;
      height = charHeight;
    } else {
      ({width, height} = fm.sizeFor(style, text));
    }
    return new Rectangle(0,0,
      padding.left() + padding.right() + width,
      padding.top() + padding.bottom() + height);
  }

  textBoundsAllChunks() {
    var fm = this._fontMetric || this.env.fontMetric,
        padding = this.padding,
        defaultStyle = this.textStyle,
        lines = this.textAndAttributesOfLines,
        defaultIsMonospaced = !fm.isProportional(defaultStyle.fontFamily),
        {height: defaultHeight} = fm.sizeFor(defaultStyle, "x"),
        height = 0, width = 0;

    for (var i = 0; i < lines.length; i++) {
      var textAndAttributes = lines[i];

      // empty line
      if (!textAndAttributes.length) { height += defaultHeight; continue; }

      var lineHeight = 0, lineWidth = 0;

      for (var j = 0; j < textAndAttributes.length; j++) {
        var [text, style] = textAndAttributes[j],
            mergedStyle = {...defaultStyle, ...style},
            isMonospaced = (defaultIsMonospaced && !style.fontFamily)
                        || !fm.isProportional(mergedStyle.fontFamily);

        if (isMonospaced) {
          var fontId = mergedStyle.fontFamily + "-" + mergedStyle.fontSize,
              {width: charWidth, height: charHeight} = fm.sizeFor(mergedStyle, "x");
          lineWidth += text.length*charWidth;
          lineHeight = Math.max(lineHeight, charHeight);

        } else {
          var {width: textWidth, height: textHeight} = fm.sizeFor(mergedStyle, text);
          lineWidth += textWidth
          lineHeight = Math.max(lineHeight, textHeight);
        }
      }

      height += lineHeight;
      width = Math.max(width, lineWidth);
    }

    return new Rectangle(0,0,
      padding.left() + padding.right() + width,
      padding.top() + padding.bottom() + height);
  }

  textBounds() {
    // this.env.fontMetric.sizeFor(style, string)
    var {textAndAttributes, _cachedTextBounds} = this;
    return _cachedTextBounds ? _cachedTextBounds :
      this._cachedTextBounds = textAndAttributes.length <= 1 ?
        this.textBoundsSingleChunk() : this.textBoundsAllChunks();
  }

  render(renderer) {
    if (this._needsFit) this.fit();

    var renderedText = [],
        nLines = this.textAndAttributesOfLines.length;

    for (var i = 0; i < nLines; i++) {
      var line = this.textAndAttributesOfLines[i];
      for (var j = 0; j < line.length; j++) {
        var [text, style] = line[j];
        renderedText.push(this.renderChunk(text, style));
      }
      if (i < nLines-1) renderedText.push(h("br"));
    }

    var {
          fontColor,
          fontFamily,
          fontSize,
          fontStyle,
          fontWeight,
          textDecoration,
          textStyleClasses,
        } = this.textStyle,
        padding = this.padding,
        style = {
          fontFamily,
          fontSize: typeof fontSize === "number" ? fontSize + "px" : fontSize,
          color: fontColor ? String(fontColor) : "transparent",
          position: "absolute",
          paddingLeft: padding.left() + "px",
          paddingRight: padding.right() + "px",
          paddingTop: padding.top() + "px",
          paddingBottom: padding.bottom() + "px",
          cursor: this.nativeCursor,
          whiteSpace: "pre"
        },
        attrs = defaultAttributes(this, renderer);

    if (fontWeight !== "normal") style.fontWeight = fontWeight;
    if (fontStyle !== "normal") style.fontStyle = fontStyle;
    if (textDecoration !== "none") style.textDecoration = textDecoration;
    if (textStyleClasses && textStyleClasses.length)
      attrs.className = (attrs.className || "") + " " + textStyleClasses.join(" ");
    attrs.style = {...defaultStyle(this), ...style};

    return h("div", attrs,
      renderedText.concat(renderer.renderSubmorphs(this)));
  }

  renderChunk(text, chunkStyle) {
    var {
          fontColor,
          fontFamily,
          fontSize,
          fontStyle,
          fontWeight,
          textDecoration,
          textStyleClasses
        } = chunkStyle || {},
        style = {},
        attrs = {style};
    if (fontFamily) style.fontFamily = fontFamily;
    if (fontSize) style.fontSize = fontSize + "px";
    if (fontColor) style.fontColor = String(fontColor);
    if (fontWeight !== "normal") style.fontWeight = fontWeight;
    if (fontStyle !== "normal") style.fontStyle = fontStyle;
    if (textDecoration !== "none") style.textDecoration = textDecoration;
    if (textStyleClasses && textStyleClasses.length)
      attrs.className = textStyleClasses.join(" ");
    return h("span", attrs, text);
  }
}

/*
Currently only FontAwesome icons are supported
  http://fontawesome.io/icons/

Resources are here
$$world.execCommand("open file browser", {
  file: "assets/font-awesome/",
  location: lively.modules.getPackage("lively.morphic").url
});

Show all icons:
$$world.openInWindow(morph({
  extent: pt(300,300), clipMode: "auto", type: "text", fontSize: 20,
  textAndAttributes: Object.keys(Icons).map(name =>
    [`${Icons[name].code} ${name}\n`, {fontFamily: "", textStyleClasses: ["fa"]}])
})).activate();

*/

export var Icons = {
  "500px":                               {code: "\uf26e"},
  "address-book":                        {code: "\uf2b9"},
  "address-book-o":                      {code: "\uf2ba"},
  "address-card":                        {code: "\uf2bb"},
  "address-card-o":                      {code: "\uf2bc"},
  "adjust":                              {code: "\uf042"},
  "adn":                                 {code: "\uf170"},
  "align-center":                        {code: "\uf037"},
  "align-justify":                       {code: "\uf039"},
  "align-left":                          {code: "\uf036"},
  "align-right":                         {code: "\uf038"},
  "amazon":                              {code: "\uf270"},
  "ambulance":                           {code: "\uf0f9"},
  "american-sign-language-interpreting": {code: "\uf2a3"},
  "anchor":                              {code: "\uf13d"},
  "android":                             {code: "\uf17b"},
  "angellist":                           {code: "\uf209"},
  "angle-double-down":                   {code: "\uf103"},
  "angle-double-left":                   {code: "\uf100"},
  "angle-double-right":                  {code: "\uf101"},
  "angle-double-up":                     {code: "\uf102"},
  "angle-down":                          {code: "\uf107"},
  "angle-left":                          {code: "\uf104"},
  "angle-right":                         {code: "\uf105"},
  "angle-up":                            {code: "\uf106"},
  "apple":                               {code: "\uf179"},
  "archive":                             {code: "\uf187"},
  "area-chart":                          {code: "\uf1fe"},
  "arrow-circle-down":                   {code: "\uf0ab"},
  "arrow-circle-left":                   {code: "\uf0a8"},
  "arrow-circle-o-down":                 {code: "\uf01a"},
  "arrow-circle-o-left":                 {code: "\uf190"},
  "arrow-circle-o-right":                {code: "\uf18e"},
  "arrow-circle-o-up":                   {code: "\uf01b"},
  "arrow-circle-right":                  {code: "\uf0a9"},
  "arrow-circle-up":                     {code: "\uf0aa"},
  "arrow-down":                          {code: "\uf063"},
  "arrow-left":                          {code: "\uf060"},
  "arrow-right":                         {code: "\uf061"},
  "arrow-up":                            {code: "\uf062"},
  "arrows":                              {code: "\uf047"},
  "arrows-alt":                          {code: "\uf0b2"},
  "arrows-h":                            {code: "\uf07e"},
  "arrows-v":                            {code: "\uf07d"},
  "asl-interpreting":                    {code: "\uf2a3"},
  "assistive-listening-systems":         {code: "\uf2a2"},
  "asterisk":                            {code: "\uf069"},
  "at":                                  {code: "\uf1fa"},
  "audio-description":                   {code: "\uf29e"},
  "automobile":                          {code: "\uf1b9"},
  "backward":                            {code: "\uf04a"},
  "balance-scale":                       {code: "\uf24e"},
  "ban":                                 {code: "\uf05e"},
  "bandcamp":                            {code: "\uf2d5"},
  "bank":                                {code: "\uf19c"},
  "bar-chart":                           {code: "\uf080"},
  "bar-chart-o":                         {code: "\uf080"},
  "barcode":                             {code: "\uf02a"},
  "bars":                                {code: "\uf0c9"},
  "bath":                                {code: "\uf2cd"},
  "bathtub":                             {code: "\uf2cd"},
  "battery":                             {code: "\uf240"},
  "battery-0":                           {code: "\uf244"},
  "battery-1":                           {code: "\uf243"},
  "battery-2":                           {code: "\uf242"},
  "battery-3":                           {code: "\uf241"},
  "battery-4":                           {code: "\uf240"},
  "battery-empty":                       {code: "\uf244"},
  "battery-full":                        {code: "\uf240"},
  "battery-half":                        {code: "\uf242"},
  "battery-quarter":                     {code: "\uf243"},
  "battery-three-quarters":              {code: "\uf241"},
  "bed":                                 {code: "\uf236"},
  "beer":                                {code: "\uf0fc"},
  "behance":                             {code: "\uf1b4"},
  "behance-square":                      {code: "\uf1b5"},
  "bell":                                {code: "\uf0f3"},
  "bell-o":                              {code: "\uf0a2"},
  "bell-slash":                          {code: "\uf1f6"},
  "bell-slash-o":                        {code: "\uf1f7"},
  "bicycle":                             {code: "\uf206"},
  "binoculars":                          {code: "\uf1e5"},
  "birthday-cake":                       {code: "\uf1fd"},
  "bitbucket":                           {code: "\uf171"},
  "bitbucket-square":                    {code: "\uf172"},
  "bitcoin":                             {code: "\uf15a"},
  "black-tie":                           {code: "\uf27e"},
  "blind":                               {code: "\uf29d"},
  "bluetooth":                           {code: "\uf293"},
  "bluetooth-b":                         {code: "\uf294"},
  "bold":                                {code: "\uf032"},
  "bolt":                                {code: "\uf0e7"},
  "bomb":                                {code: "\uf1e2"},
  "book":                                {code: "\uf02d"},
  "bookmark":                            {code: "\uf02e"},
  "bookmark-o":                          {code: "\uf097"},
  "braille":                             {code: "\uf2a1"},
  "briefcase":                           {code: "\uf0b1"},
  "btc":                                 {code: "\uf15a"},
  "bug":                                 {code: "\uf188"},
  "building":                            {code: "\uf1ad"},
  "building-o":                          {code: "\uf0f7"},
  "bullhorn":                            {code: "\uf0a1"},
  "bullseye":                            {code: "\uf140"},
  "bus":                                 {code: "\uf207"},
  "buysellads":                          {code: "\uf20d"},
  "cab":                                 {code: "\uf1ba"},
  "calculator":                          {code: "\uf1ec"},
  "calendar":                            {code: "\uf073"},
  "calendar-check-o":                    {code: "\uf274"},
  "calendar-minus-o":                    {code: "\uf272"},
  "calendar-o":                          {code: "\uf133"},
  "calendar-plus-o":                     {code: "\uf271"},
  "calendar-times-o":                    {code: "\uf273"},
  "camera":                              {code: "\uf030"},
  "camera-retro":                        {code: "\uf083"},
  "car":                                 {code: "\uf1b9"},
  "caret-down":                          {code: "\uf0d7"},
  "caret-left":                          {code: "\uf0d9"},
  "caret-right":                         {code: "\uf0da"},
  "caret-square-o-down":                 {code: "\uf150"},
  "caret-square-o-left":                 {code: "\uf191"},
  "caret-square-o-right":                {code: "\uf152"},
  "caret-square-o-up":                   {code: "\uf151"},
  "caret-up":                            {code: "\uf0d8"},
  "cart-arrow-down":                     {code: "\uf218"},
  "cart-plus":                           {code: "\uf217"},
  "cc":                                  {code: "\uf20a"},
  "cc-amex":                             {code: "\uf1f3"},
  "cc-diners-club":                      {code: "\uf24c"},
  "cc-discover":                         {code: "\uf1f2"},
  "cc-jcb":                              {code: "\uf24b"},
  "cc-mastercard":                       {code: "\uf1f1"},
  "cc-paypal":                           {code: "\uf1f4"},
  "cc-stripe":                           {code: "\uf1f5"},
  "cc-visa":                             {code: "\uf1f0"},
  "certificate":                         {code: "\uf0a3"},
  "chain":                               {code: "\uf0c1"},
  "chain-broken":                        {code: "\uf127"},
  "check":                               {code: "\uf00c"},
  "check-circle":                        {code: "\uf058"},
  "check-circle-o":                      {code: "\uf05d"},
  "check-square":                        {code: "\uf14a"},
  "check-square-o":                      {code: "\uf046"},
  "chevron-circle-down":                 {code: "\uf13a"},
  "chevron-circle-left":                 {code: "\uf137"},
  "chevron-circle-right":                {code: "\uf138"},
  "chevron-circle-up":                   {code: "\uf139"},
  "chevron-down":                        {code: "\uf078"},
  "chevron-left":                        {code: "\uf053"},
  "chevron-right":                       {code: "\uf054"},
  "chevron-up":                          {code: "\uf077"},
  "child":                               {code: "\uf1ae"},
  "chrome":                              {code: "\uf268"},
  "circle":                              {code: "\uf111"},
  "circle-o":                            {code: "\uf10c"},
  "circle-o-notch":                      {code: "\uf1ce"},
  "circle-thin":                         {code: "\uf1db"},
  "clipboard":                           {code: "\uf0ea"},
  "clock-o":                             {code: "\uf017"},
  "clone":                               {code: "\uf24d"},
  "close":                               {code: "\uf00d"},
  "cloud":                               {code: "\uf0c2"},
  "cloud-download":                      {code: "\uf0ed"},
  "cloud-upload":                        {code: "\uf0ee"},
  "cny":                                 {code: "\uf157"},
  "code":                                {code: "\uf121"},
  "code-fork":                           {code: "\uf126"},
  "codepen":                             {code: "\uf1cb"},
  "codiepie":                            {code: "\uf284"},
  "coffee":                              {code: "\uf0f4"},
  "cog":                                 {code: "\uf013"},
  "cogs":                                {code: "\uf085"},
  "columns":                             {code: "\uf0db"},
  "comment":                             {code: "\uf075"},
  "comment-o":                           {code: "\uf0e5"},
  "commenting":                          {code: "\uf27a"},
  "commenting-o":                        {code: "\uf27b"},
  "comments":                            {code: "\uf086"},
  "comments-o":                          {code: "\uf0e6"},
  "compass":                             {code: "\uf14e"},
  "compress":                            {code: "\uf066"},
  "connectdevelop":                      {code: "\uf20e"},
  "contao":                              {code: "\uf26d"},
  "copy":                                {code: "\uf0c5"},
  "copyright":                           {code: "\uf1f9"},
  "creative-commons":                    {code: "\uf25e"},
  "credit-card":                         {code: "\uf09d"},
  "credit-card-alt":                     {code: "\uf283"},
  "crop":                                {code: "\uf125"},
  "crosshairs":                          {code: "\uf05b"},
  "css3":                                {code: "\uf13c"},
  "cube":                                {code: "\uf1b2"},
  "cubes":                               {code: "\uf1b3"},
  "cut":                                 {code: "\uf0c4"},
  "cutlery":                             {code: "\uf0f5"},
  "dashboard":                           {code: "\uf0e4"},
  "dashcube":                            {code: "\uf210"},
  "database":                            {code: "\uf1c0"},
  "deaf":                                {code: "\uf2a4"},
  "deafness":                            {code: "\uf2a4"},
  "dedent":                              {code: "\uf03b"},
  "delicious":                           {code: "\uf1a5"},
  "desktop":                             {code: "\uf108"},
  "deviantart":                          {code: "\uf1bd"},
  "diamond":                             {code: "\uf219"},
  "digg":                                {code: "\uf1a6"},
  "dollar":                              {code: "\uf155"},
  "dot-circle-o":                        {code: "\uf192"},
  "download":                            {code: "\uf019"},
  "dribbble":                            {code: "\uf17d"},
  "drivers-license":                     {code: "\uf2c2"},
  "drivers-license-o":                   {code: "\uf2c3"},
  "dropbox":                             {code: "\uf16b"},
  "drupal":                              {code: "\uf1a9"},
  "edge":                                {code: "\uf282"},
  "edit":                                {code: "\uf044"},
  "eercast":                             {code: "\uf2da"},
  "eject":                               {code: "\uf052"},
  "ellipsis-h":                          {code: "\uf141"},
  "ellipsis-v":                          {code: "\uf142"},
  "empire":                              {code: "\uf1d1"},
  "envelope":                            {code: "\uf0e0"},
  "envelope-o":                          {code: "\uf003"},
  "envelope-open":                       {code: "\uf2b6"},
  "envelope-open-o":                     {code: "\uf2b7"},
  "envelope-square":                     {code: "\uf199"},
  "envira":                              {code: "\uf299"},
  "eraser":                              {code: "\uf12d"},
  "etsy":                                {code: "\uf2d7"},
  "eur":                                 {code: "\uf153"},
  "euro":                                {code: "\uf153"},
  "exchange":                            {code: "\uf0ec"},
  "exclamation":                         {code: "\uf12a"},
  "exclamation-circle":                  {code: "\uf06a"},
  "exclamation-triangle":                {code: "\uf071"},
  "expand":                              {code: "\uf065"},
  "expeditedssl":                        {code: "\uf23e"},
  "external-link":                       {code: "\uf08e"},
  "external-link-square":                {code: "\uf14c"},
  "eye":                                 {code: "\uf06e"},
  "eye-slash":                           {code: "\uf070"},
  "eyedropper":                          {code: "\uf1fb"},
  "fa":                                  {code: "\uf2b4"},
  "facebook":                            {code: "\uf09a"},
  "facebook-f":                          {code: "\uf09a"},
  "facebook-official":                   {code: "\uf230"},
  "facebook-square":                     {code: "\uf082"},
  "fast-backward":                       {code: "\uf049"},
  "fast-forward":                        {code: "\uf050"},
  "fax":                                 {code: "\uf1ac"},
  "feed":                                {code: "\uf09e"},
  "female":                              {code: "\uf182"},
  "fighter-jet":                         {code: "\uf0fb"},
  "file":                                {code: "\uf15b"},
  "file-archive-o":                      {code: "\uf1c6"},
  "file-audio-o":                        {code: "\uf1c7"},
  "file-code-o":                         {code: "\uf1c9"},
  "file-excel-o":                        {code: "\uf1c3"},
  "file-image-o":                        {code: "\uf1c5"},
  "file-movie-o":                        {code: "\uf1c8"},
  "file-o":                              {code: "\uf016"},
  "file-pdf-o":                          {code: "\uf1c1"},
  "file-photo-o":                        {code: "\uf1c5"},
  "file-picture-o":                      {code: "\uf1c5"},
  "file-powerpoint-o":                   {code: "\uf1c4"},
  "file-sound-o":                        {code: "\uf1c7"},
  "file-text":                           {code: "\uf15c"},
  "file-text-o":                         {code: "\uf0f6"},
  "file-video-o":                        {code: "\uf1c8"},
  "file-word-o":                         {code: "\uf1c2"},
  "file-zip-o":                          {code: "\uf1c6"},
  "files-o":                             {code: "\uf0c5"},
  "film":                                {code: "\uf008"},
  "filter":                              {code: "\uf0b0"},
  "fire":                                {code: "\uf06d"},
  "fire-extinguisher":                   {code: "\uf134"},
  "firefox":                             {code: "\uf269"},
  "first-order":                         {code: "\uf2b0"},
  "flag":                                {code: "\uf024"},
  "flag-checkered":                      {code: "\uf11e"},
  "flag-o":                              {code: "\uf11d"},
  "flash":                               {code: "\uf0e7"},
  "flask":                               {code: "\uf0c3"},
  "flickr":                              {code: "\uf16e"},
  "floppy-o":                            {code: "\uf0c7"},
  "folder":                              {code: "\uf07b"},
  "folder-o":                            {code: "\uf114"},
  "folder-open":                         {code: "\uf07c"},
  "folder-open-o":                       {code: "\uf115"},
  "font":                                {code: "\uf031"},
  "font-awesome":                        {code: "\uf2b4"},
  "fonticons":                           {code: "\uf280"},
  "fort-awesome":                        {code: "\uf286"},
  "forumbee":                            {code: "\uf211"},
  "forward":                             {code: "\uf04e"},
  "foursquare":                          {code: "\uf180"},
  "free-code-camp":                      {code: "\uf2c5"},
  "frown-o":                             {code: "\uf119"},
  "futbol-o":                            {code: "\uf1e3"},
  "gamepad":                             {code: "\uf11b"},
  "gavel":                               {code: "\uf0e3"},
  "gbp":                                 {code: "\uf154"},
  "ge":                                  {code: "\uf1d1"},
  "gear":                                {code: "\uf013"},
  "gears":                               {code: "\uf085"},
  "genderless":                          {code: "\uf22d"},
  "get-pocket":                          {code: "\uf265"},
  "gg":                                  {code: "\uf260"},
  "gg-circle":                           {code: "\uf261"},
  "gift":                                {code: "\uf06b"},
  "git":                                 {code: "\uf1d3"},
  "git-square":                          {code: "\uf1d2"},
  "github":                              {code: "\uf09b"},
  "github-alt":                          {code: "\uf113"},
  "github-square":                       {code: "\uf092"},
  "gitlab":                              {code: "\uf296"},
  "gittip":                              {code: "\uf184"},
  "glass":                               {code: "\uf000"},
  "glide":                               {code: "\uf2a5"},
  "glide-g":                             {code: "\uf2a6"},
  "globe":                               {code: "\uf0ac"},
  "google":                              {code: "\uf1a0"},
  "google-plus":                         {code: "\uf0d5"},
  "google-plus-circle":                  {code: "\uf2b3"},
  "google-plus-official":                {code: "\uf2b3"},
  "google-plus-square":                  {code: "\uf0d4"},
  "google-wallet":                       {code: "\uf1ee"},
  "graduation-cap":                      {code: "\uf19d"},
  "gratipay":                            {code: "\uf184"},
  "grav":                                {code: "\uf2d6"},
  "group":                               {code: "\uf0c0"},
  "h-square":                            {code: "\uf0fd"},
  "hacker-news":                         {code: "\uf1d4"},
  "hand-grab-o":                         {code: "\uf255"},
  "hand-lizard-o":                       {code: "\uf258"},
  "hand-o-down":                         {code: "\uf0a7"},
  "hand-o-left":                         {code: "\uf0a5"},
  "hand-o-right":                        {code: "\uf0a4"},
  "hand-o-up":                           {code: "\uf0a6"},
  "hand-paper-o":                        {code: "\uf256"},
  "hand-peace-o":                        {code: "\uf25b"},
  "hand-pointer-o":                      {code: "\uf25a"},
  "hand-rock-o":                         {code: "\uf255"},
  "hand-scissors-o":                     {code: "\uf257"},
  "hand-spock-o":                        {code: "\uf259"},
  "hand-stop-o":                         {code: "\uf256"},
  "handshake-o":                         {code: "\uf2b5"},
  "hard-of-hearing":                     {code: "\uf2a4"},
  "hashtag":                             {code: "\uf292"},
  "hdd-o":                               {code: "\uf0a0"},
  "header":                              {code: "\uf1dc"},
  "headphones":                          {code: "\uf025"},
  "heart":                               {code: "\uf004"},
  "heart-o":                             {code: "\uf08a"},
  "heartbeat":                           {code: "\uf21e"},
  "history":                             {code: "\uf1da"},
  "home":                                {code: "\uf015"},
  "hospital-o":                          {code: "\uf0f8"},
  "hotel":                               {code: "\uf236"},
  "hourglass":                           {code: "\uf254"},
  "hourglass-1":                         {code: "\uf251"},
  "hourglass-2":                         {code: "\uf252"},
  "hourglass-3":                         {code: "\uf253"},
  "hourglass-end":                       {code: "\uf253"},
  "hourglass-half":                      {code: "\uf252"},
  "hourglass-o":                         {code: "\uf250"},
  "hourglass-start":                     {code: "\uf251"},
  "houzz":                               {code: "\uf27c"},
  "html5":                               {code: "\uf13b"},
  "i-cursor":                            {code: "\uf246"},
  "id-badge":                            {code: "\uf2c1"},
  "id-card":                             {code: "\uf2c2"},
  "id-card-o":                           {code: "\uf2c3"},
  "ils":                                 {code: "\uf20b"},
  "image":                               {code: "\uf03e"},
  "imdb":                                {code: "\uf2d8"},
  "inbox":                               {code: "\uf01c"},
  "indent":                              {code: "\uf03c"},
  "industry":                            {code: "\uf275"},
  "info":                                {code: "\uf129"},
  "info-circle":                         {code: "\uf05a"},
  "inr":                                 {code: "\uf156"},
  "instagram":                           {code: "\uf16d"},
  "institution":                         {code: "\uf19c"},
  "internet-explorer":                   {code: "\uf26b"},
  "intersex":                            {code: "\uf224"},
  "ioxhost":                             {code: "\uf208"},
  "italic":                              {code: "\uf033"},
  "joomla":                              {code: "\uf1aa"},
  "jpy":                                 {code: "\uf157"},
  "jsfiddle":                            {code: "\uf1cc"},
  "key":                                 {code: "\uf084"},
  "keyboard-o":                          {code: "\uf11c"},
  "krw":                                 {code: "\uf159"},
  "language":                            {code: "\uf1ab"},
  "laptop":                              {code: "\uf109"},
  "lastfm":                              {code: "\uf202"},
  "lastfm-square":                       {code: "\uf203"},
  "leaf":                                {code: "\uf06c"},
  "leanpub":                             {code: "\uf212"},
  "legal":                               {code: "\uf0e3"},
  "lemon-o":                             {code: "\uf094"},
  "level-down":                          {code: "\uf149"},
  "level-up":                            {code: "\uf148"},
  "life-bouy":                           {code: "\uf1cd"},
  "life-buoy":                           {code: "\uf1cd"},
  "life-ring":                           {code: "\uf1cd"},
  "life-saver":                          {code: "\uf1cd"},
  "lightbulb-o":                         {code: "\uf0eb"},
  "line-chart":                          {code: "\uf201"},
  "link":                                {code: "\uf0c1"},
  "linkedin":                            {code: "\uf0e1"},
  "linkedin-square":                     {code: "\uf08c"},
  "linode":                              {code: "\uf2b8"},
  "linux":                               {code: "\uf17c"},
  "list":                                {code: "\uf03a"},
  "list-alt":                            {code: "\uf022"},
  "list-ol":                             {code: "\uf0cb"},
  "list-ul":                             {code: "\uf0ca"},
  "location-arrow":                      {code: "\uf124"},
  "lock":                                {code: "\uf023"},
  "long-arrow-down":                     {code: "\uf175"},
  "long-arrow-left":                     {code: "\uf177"},
  "long-arrow-right":                    {code: "\uf178"},
  "long-arrow-up":                       {code: "\uf176"},
  "low-vision":                          {code: "\uf2a8"},
  "magic":                               {code: "\uf0d0"},
  "magnet":                              {code: "\uf076"},
  "mail-forward":                        {code: "\uf064"},
  "mail-reply":                          {code: "\uf112"},
  "mail-reply-all":                      {code: "\uf122"},
  "male":                                {code: "\uf183"},
  "map":                                 {code: "\uf279"},
  "map-marker":                          {code: "\uf041"},
  "map-o":                               {code: "\uf278"},
  "map-pin":                             {code: "\uf276"},
  "map-signs":                           {code: "\uf277"},
  "mars":                                {code: "\uf222"},
  "mars-double":                         {code: "\uf227"},
  "mars-stroke":                         {code: "\uf229"},
  "mars-stroke-h":                       {code: "\uf22b"},
  "mars-stroke-v":                       {code: "\uf22a"},
  "maxcdn":                              {code: "\uf136"},
  "meanpath":                            {code: "\uf20c"},
  "medium":                              {code: "\uf23a"},
  "medkit":                              {code: "\uf0fa"},
  "meetup":                              {code: "\uf2e0"},
  "meh-o":                               {code: "\uf11a"},
  "mercury":                             {code: "\uf223"},
  "microchip":                           {code: "\uf2db"},
  "microphone":                          {code: "\uf130"},
  "microphone-slash":                    {code: "\uf131"},
  "minus":                               {code: "\uf068"},
  "minus-circle":                        {code: "\uf056"},
  "minus-square":                        {code: "\uf146"},
  "minus-square-o":                      {code: "\uf147"},
  "mixcloud":                            {code: "\uf289"},
  "mobile":                              {code: "\uf10b"},
  "mobile-phone":                        {code: "\uf10b"},
  "modx":                                {code: "\uf285"},
  "money":                               {code: "\uf0d6"},
  "moon-o":                              {code: "\uf186"},
  "mortar-board":                        {code: "\uf19d"},
  "motorcycle":                          {code: "\uf21c"},
  "mouse-pointer":                       {code: "\uf245"},
  "music":                               {code: "\uf001"},
  "navicon":                             {code: "\uf0c9"},
  "neuter":                              {code: "\uf22c"},
  "newspaper-o":                         {code: "\uf1ea"},
  "object-group":                        {code: "\uf247"},
  "object-ungroup":                      {code: "\uf248"},
  "odnoklassniki":                       {code: "\uf263"},
  "odnoklassniki-square":                {code: "\uf264"},
  "opencart":                            {code: "\uf23d"},
  "openid":                              {code: "\uf19b"},
  "opera":                               {code: "\uf26a"},
  "optin-monster":                       {code: "\uf23c"},
  "outdent":                             {code: "\uf03b"},
  "pagelines":                           {code: "\uf18c"},
  "paint-brush":                         {code: "\uf1fc"},
  "paper-plane":                         {code: "\uf1d8"},
  "paper-plane-o":                       {code: "\uf1d9"},
  "paperclip":                           {code: "\uf0c6"},
  "paragraph":                           {code: "\uf1dd"},
  "paste":                               {code: "\uf0ea"},
  "pause":                               {code: "\uf04c"},
  "pause-circle":                        {code: "\uf28b"},
  "pause-circle-o":                      {code: "\uf28c"},
  "paw":                                 {code: "\uf1b0"},
  "paypal":                              {code: "\uf1ed"},
  "pencil":                              {code: "\uf040"},
  "pencil-square":                       {code: "\uf14b"},
  "pencil-square-o":                     {code: "\uf044"},
  "percent":                             {code: "\uf295"},
  "phone":                               {code: "\uf095"},
  "phone-square":                        {code: "\uf098"},
  "photo":                               {code: "\uf03e"},
  "picture-o":                           {code: "\uf03e"},
  "pie-chart":                           {code: "\uf200"},
  "pied-piper":                          {code: "\uf2ae"},
  "pied-piper-alt":                      {code: "\uf1a8"},
  "pied-piper-pp":                       {code: "\uf1a7"},
  "pinterest":                           {code: "\uf0d2"},
  "pinterest-p":                         {code: "\uf231"},
  "pinterest-square":                    {code: "\uf0d3"},
  "plane":                               {code: "\uf072"},
  "play":                                {code: "\uf04b"},
  "play-circle":                         {code: "\uf144"},
  "play-circle-o":                       {code: "\uf01d"},
  "plug":                                {code: "\uf1e6"},
  "plus":                                {code: "\uf067"},
  "plus-circle":                         {code: "\uf055"},
  "plus-square":                         {code: "\uf0fe"},
  "plus-square-o":                       {code: "\uf196"},
  "podcast":                             {code: "\uf2ce"},
  "power-off":                           {code: "\uf011"},
  "print":                               {code: "\uf02f"},
  "product-hunt":                        {code: "\uf288"},
  "puzzle-piece":                        {code: "\uf12e"},
  "qq":                                  {code: "\uf1d6"},
  "qrcode":                              {code: "\uf029"},
  "question":                            {code: "\uf128"},
  "question-circle":                     {code: "\uf059"},
  "question-circle-o":                   {code: "\uf29c"},
  "quora":                               {code: "\uf2c4"},
  "quote-left":                          {code: "\uf10d"},
  "quote-right":                         {code: "\uf10e"},
  "ra":                                  {code: "\uf1d0"},
  "random":                              {code: "\uf074"},
  "ravelry":                             {code: "\uf2d9"},
  "rebel":                               {code: "\uf1d0"},
  "recycle":                             {code: "\uf1b8"},
  "reddit":                              {code: "\uf1a1"},
  "reddit-alien":                        {code: "\uf281"},
  "reddit-square":                       {code: "\uf1a2"},
  "refresh":                             {code: "\uf021"},
  "registered":                          {code: "\uf25d"},
  "remove":                              {code: "\uf00d"},
  "renren":                              {code: "\uf18b"},
  "reorder":                             {code: "\uf0c9"},
  "repeat":                              {code: "\uf01e"},
  "reply":                               {code: "\uf112"},
  "reply-all":                           {code: "\uf122"},
  "resistance":                          {code: "\uf1d0"},
  "retweet":                             {code: "\uf079"},
  "rmb":                                 {code: "\uf157"},
  "road":                                {code: "\uf018"},
  "rocket":                              {code: "\uf135"},
  "rotate-left":                         {code: "\uf0e2"},
  "rotate-right":                        {code: "\uf01e"},
  "rouble":                              {code: "\uf158"},
  "rss":                                 {code: "\uf09e"},
  "rss-square":                          {code: "\uf143"},
  "rub":                                 {code: "\uf158"},
  "ruble":                               {code: "\uf158"},
  "rupee":                               {code: "\uf156"},
  "s15":                                 {code: "\uf2cd"},
  "safari":                              {code: "\uf267"},
  "save":                                {code: "\uf0c7"},
  "scissors":                            {code: "\uf0c4"},
  "scribd":                              {code: "\uf28a"},
  "search":                              {code: "\uf002"},
  "search-minus":                        {code: "\uf010"},
  "search-plus":                         {code: "\uf00e"},
  "sellsy":                              {code: "\uf213"},
  "send":                                {code: "\uf1d8"},
  "send-o":                              {code: "\uf1d9"},
  "server":                              {code: "\uf233"},
  "share":                               {code: "\uf064"},
  "share-alt":                           {code: "\uf1e0"},
  "share-alt-square":                    {code: "\uf1e1"},
  "share-square":                        {code: "\uf14d"},
  "share-square-o":                      {code: "\uf045"},
  "shekel":                              {code: "\uf20b"},
  "sheqel":                              {code: "\uf20b"},
  "shield":                              {code: "\uf132"},
  "ship":                                {code: "\uf21a"},
  "shirtsinbulk":                        {code: "\uf214"},
  "shopping-bag":                        {code: "\uf290"},
  "shopping-basket":                     {code: "\uf291"},
  "shopping-cart":                       {code: "\uf07a"},
  "shower":                              {code: "\uf2cc"},
  "sign-in":                             {code: "\uf090"},
  "sign-language":                       {code: "\uf2a7"},
  "sign-out":                            {code: "\uf08b"},
  "signal":                              {code: "\uf012"},
  "signing":                             {code: "\uf2a7"},
  "simplybuilt":                         {code: "\uf215"},
  "sitemap":                             {code: "\uf0e8"},
  "skyatlas":                            {code: "\uf216"},
  "skype":                               {code: "\uf17e"},
  "slack":                               {code: "\uf198"},
  "sliders":                             {code: "\uf1de"},
  "slideshare":                          {code: "\uf1e7"},
  "smile-o":                             {code: "\uf118"},
  "snapchat":                            {code: "\uf2ab"},
  "snapchat-ghost":                      {code: "\uf2ac"},
  "snapchat-square":                     {code: "\uf2ad"},
  "snowflake-o":                         {code: "\uf2dc"},
  "soccer-ball-o":                       {code: "\uf1e3"},
  "sort":                                {code: "\uf0dc"},
  "sort-alpha-asc":                      {code: "\uf15d"},
  "sort-alpha-desc":                     {code: "\uf15e"},
  "sort-amount-asc":                     {code: "\uf160"},
  "sort-amount-desc":                    {code: "\uf161"},
  "sort-asc":                            {code: "\uf0de"},
  "sort-desc":                           {code: "\uf0dd"},
  "sort-down":                           {code: "\uf0dd"},
  "sort-numeric-asc":                    {code: "\uf162"},
  "sort-numeric-desc":                   {code: "\uf163"},
  "sort-up":                             {code: "\uf0de"},
  "soundcloud":                          {code: "\uf1be"},
  "space-shuttle":                       {code: "\uf197"},
  "spinner":                             {code: "\uf110"},
  "spoon":                               {code: "\uf1b1"},
  "spotify":                             {code: "\uf1bc"},
  "square":                              {code: "\uf0c8"},
  "square-o":                            {code: "\uf096"},
  "stack-exchange":                      {code: "\uf18d"},
  "stack-overflow":                      {code: "\uf16c"},
  "star":                                {code: "\uf005"},
  "star-half":                           {code: "\uf089"},
  "star-half-empty":                     {code: "\uf123"},
  "star-half-full":                      {code: "\uf123"},
  "star-half-o":                         {code: "\uf123"},
  "star-o":                              {code: "\uf006"},
  "steam":                               {code: "\uf1b6"},
  "steam-square":                        {code: "\uf1b7"},
  "step-backward":                       {code: "\uf048"},
  "step-forward":                        {code: "\uf051"},
  "stethoscope":                         {code: "\uf0f1"},
  "sticky-note":                         {code: "\uf249"},
  "sticky-note-o":                       {code: "\uf24a"},
  "stop":                                {code: "\uf04d"},
  "stop-circle":                         {code: "\uf28d"},
  "stop-circle-o":                       {code: "\uf28e"},
  "street-view":                         {code: "\uf21d"},
  "strikethrough":                       {code: "\uf0cc"},
  "stumbleupon":                         {code: "\uf1a4"},
  "stumbleupon-circle":                  {code: "\uf1a3"},
  "subscript":                           {code: "\uf12c"},
  "subway":                              {code: "\uf239"},
  "suitcase":                            {code: "\uf0f2"},
  "sun-o":                               {code: "\uf185"},
  "superpowers":                         {code: "\uf2dd"},
  "superscript":                         {code: "\uf12b"},
  "support":                             {code: "\uf1cd"},
  "table":                               {code: "\uf0ce"},
  "tablet":                              {code: "\uf10a"},
  "tachometer":                          {code: "\uf0e4"},
  "tag":                                 {code: "\uf02b"},
  "tags":                                {code: "\uf02c"},
  "tasks":                               {code: "\uf0ae"},
  "taxi":                                {code: "\uf1ba"},
  "telegram":                            {code: "\uf2c6"},
  "television":                          {code: "\uf26c"},
  "tencent-weibo":                       {code: "\uf1d5"},
  "terminal":                            {code: "\uf120"},
  "text-height":                         {code: "\uf034"},
  "text-width":                          {code: "\uf035"},
  "th":                                  {code: "\uf00a"},
  "th-large":                            {code: "\uf009"},
  "th-list":                             {code: "\uf00b"},
  "themeisle":                           {code: "\uf2b2"},
  "thermometer":                         {code: "\uf2c7"},
  "thermometer-0":                       {code: "\uf2cb"},
  "thermometer-1":                       {code: "\uf2ca"},
  "thermometer-2":                       {code: "\uf2c9"},
  "thermometer-3":                       {code: "\uf2c8"},
  "thermometer-4":                       {code: "\uf2c7"},
  "thermometer-empty":                   {code: "\uf2cb"},
  "thermometer-full":                    {code: "\uf2c7"},
  "thermometer-half":                    {code: "\uf2c9"},
  "thermometer-quarter":                 {code: "\uf2ca"},
  "thermometer-three-quarters":          {code: "\uf2c8"},
  "thumb-tack":                          {code: "\uf08d"},
  "thumbs-down":                         {code: "\uf165"},
  "thumbs-o-down":                       {code: "\uf088"},
  "thumbs-o-up":                         {code: "\uf087"},
  "thumbs-up":                           {code: "\uf164"},
  "ticket":                              {code: "\uf145"},
  "times":                               {code: "\uf00d"},
  "times-circle":                        {code: "\uf057"},
  "times-circle-o":                      {code: "\uf05c"},
  "times-rectangle":                     {code: "\uf2d3"},
  "times-rectangle-o":                   {code: "\uf2d4"},
  "tint":                                {code: "\uf043"},
  "toggle-down":                         {code: "\uf150"},
  "toggle-left":                         {code: "\uf191"},
  "toggle-off":                          {code: "\uf204"},
  "toggle-on":                           {code: "\uf205"},
  "toggle-right":                        {code: "\uf152"},
  "toggle-up":                           {code: "\uf151"},
  "trademark":                           {code: "\uf25c"},
  "train":                               {code: "\uf238"},
  "transgender":                         {code: "\uf224"},
  "transgender-alt":                     {code: "\uf225"},
  "trash":                               {code: "\uf1f8"},
  "trash-o":                             {code: "\uf014"},
  "tree":                                {code: "\uf1bb"},
  "trello":                              {code: "\uf181"},
  "tripadvisor":                         {code: "\uf262"},
  "trophy":                              {code: "\uf091"},
  "truck":                               {code: "\uf0d1"},
  "try":                                 {code: "\uf195"},
  "tty":                                 {code: "\uf1e4"},
  "tumblr":                              {code: "\uf173"},
  "tumblr-square":                       {code: "\uf174"},
  "turkish-lira":                        {code: "\uf195"},
  "tv":                                  {code: "\uf26c"},
  "twitch":                              {code: "\uf1e8"},
  "twitter":                             {code: "\uf099"},
  "twitter-square":                      {code: "\uf081"},
  "umbrella":                            {code: "\uf0e9"},
  "underline":                           {code: "\uf0cd"},
  "undo":                                {code: "\uf0e2"},
  "universal-access":                    {code: "\uf29a"},
  "university":                          {code: "\uf19c"},
  "unlink":                              {code: "\uf127"},
  "unlock":                              {code: "\uf09c"},
  "unlock-alt":                          {code: "\uf13e"},
  "unsorted":                            {code: "\uf0dc"},
  "upload":                              {code: "\uf093"},
  "usb":                                 {code: "\uf287"},
  "usd":                                 {code: "\uf155"},
  "user":                                {code: "\uf007"},
  "user-circle":                         {code: "\uf2bd"},
  "user-circle-o":                       {code: "\uf2be"},
  "user-md":                             {code: "\uf0f0"},
  "user-o":                              {code: "\uf2c0"},
  "user-plus":                           {code: "\uf234"},
  "user-secret":                         {code: "\uf21b"},
  "user-times":                          {code: "\uf235"},
  "users":                               {code: "\uf0c0"},
  "vcard":                               {code: "\uf2bb"},
  "vcard-o":                             {code: "\uf2bc"},
  "venus":                               {code: "\uf221"},
  "venus-double":                        {code: "\uf226"},
  "venus-mars":                          {code: "\uf228"},
  "viacoin":                             {code: "\uf237"},
  "viadeo":                              {code: "\uf2a9"},
  "viadeo-square":                       {code: "\uf2aa"},
  "video-camera":                        {code: "\uf03d"},
  "vimeo":                               {code: "\uf27d"},
  "vimeo-square":                        {code: "\uf194"},
  "vine":                                {code: "\uf1ca"},
  "vk":                                  {code: "\uf189"},
  "volume-control-phone":                {code: "\uf2a0"},
  "volume-down":                         {code: "\uf027"},
  "volume-off":                          {code: "\uf026"},
  "volume-up":                           {code: "\uf028"},
  "warning":                             {code: "\uf071"},
  "wechat":                              {code: "\uf1d7"},
  "weibo":                               {code: "\uf18a"},
  "weixin":                              {code: "\uf1d7"},
  "whatsapp":                            {code: "\uf232"},
  "wheelchair":                          {code: "\uf193"},
  "wheelchair-alt":                      {code: "\uf29b"},
  "wifi":                                {code: "\uf1eb"},
  "wikipedia-w":                         {code: "\uf266"},
  "window-close":                        {code: "\uf2d3"},
  "window-close-o":                      {code: "\uf2d4"},
  "window-maximize":                     {code: "\uf2d0"},
  "window-minimize":                     {code: "\uf2d1"},
  "window-restore":                      {code: "\uf2d2"},
  "windows":                             {code: "\uf17a"},
  "won":                                 {code: "\uf159"},
  "wordpress":                           {code: "\uf19a"},
  "wpbeginner":                          {code: "\uf297"},
  "wpexplorer":                          {code: "\uf2de"},
  "wpforms":                             {code: "\uf298"},
  "wrench":                              {code: "\uf0ad"},
  "xing":                                {code: "\uf168"},
  "xing-square":                         {code: "\uf169"},
  "y-combinator":                        {code: "\uf23b"},
  "y-combinator-square":                 {code: "\uf1d4"},
  "yahoo":                               {code: "\uf19e"},
  "yc":                                  {code: "\uf23b"},
  "yc-square":                           {code: "\uf1d4"},
  "yelp":                                {code: "\uf1e9"},
  "yen":                                 {code: "\uf157"},
  "yoast":                               {code: "\uf2b1"},
  "youtube":                             {code: "\uf167"},
  "youtube-play":                        {code: "\uf16a"},
  "youtube-square":                      {code: "\uf166"}
}
