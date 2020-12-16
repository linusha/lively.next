import { Window } from 'lively.components';
import { VerticalLayout, HorizontalLayout, Label, Morph } from 'lively.morphic';
import { pt, Rectangle } from 'lively.graphics';
import { resource } from 'lively.resources';
import { connect } from 'lively.bindings';
import { CommentMorph, Badge } from 'lively.collab';
import { ModeSelector } from 'lively.components/widgets.js';

let instance;

export class CommentBrowser extends Window {
  static close () {
    if (CommentBrowser.isOpen()) {
      instance.close();
    }
  }

  static get instance () {
    return instance;
  }

  static isOpen () {
    return instance && $world.get('comment browser');
  }

  static async removeCommentForMorph (comment, morph) {
    await instance.removeCommentForMorph(comment, morph);
  }

  static async addCommentForMorph (comment, morph) {
    await instance.addCommentForMorph(comment, morph);
  }

  static initializeCommentBrowser () {
    new CommentBrowser();
  }

  static open () {
    if (!instance || CommentBrowser.isOpen()) return;

    if (!instance.wasOpenedBefore) {
      instance.initializeAppearance();
      instance.wasOpenedBefore = true;
    }
    $world.addMorph(instance);
  }

  static close () {
    if (!instance) return;

    const topbar = $world.getSubmorphNamed('lively top bar');
    if (topbar) {
      topbar.uncolorCommentBrowserButton();
    }
    instance.remove();
  }

  static toggle () {
    CommentBrowser.isOpen() ? CommentBrowser.close() : CommentBrowser.open();
  }

  static async whenRendered () {
    return instance.whenRendered();
  }

  // Construction and initialization

  constructor () {
    if (!instance) {
      super();
      instance = this;

      this.name = 'comment browser';
      this.commentGroups = {}; // dict Morph id -> Comment group morph
      this.resolvedCommentGroups = {};
      this.wasOpenedBefore = false;

      this.buildContainers();
      this.buildFilterSelector();
      this.buildCommentGroupMorphs();
    }
    return instance;
  }

  buildContainers () {
    this.container = new Morph({
      clipMode: 'auto',
      name: 'container'
    });
    this.commentContainer = new Morph({
      layout: new VerticalLayout({
        spacing: 5,
        orderByIndex: true
      }),
      name: 'comment container'
    });
    this.resolvedCommentContainer = new Morph({
      layout: new VerticalLayout({
        spacing: 5,
        orderByIndex: true
      }),
      name: 'resolved comment container'
    });
    this.filterContainer = new Morph({
      name: 'filter container'
    });
    this.addMorph(this.container);
    this.addMorph(this.filterContainer);
    this.container.addMorph(this.commentContainer);
  }

  buildFilterSelector () {
    this.filterSelector = new ModeSelector({
      reactsToPointer: false,
      name: 'resolvedModeSelector',
      items: ['Unresolved Comments', 'Resolved Comments'],
      tooltips: {
        'Unresolved Comments': 'Show unresolved comments',
        'Resolved Comments': 'Show resolved comments'
      },
      layout: new HorizontalLayout({
        spacing: 5
      })
    });
    connect(this.filterSelector, 'Unresolved Comments', () => { this.toggleArchive(); });
    connect(this.filterSelector, 'Resolved Comments', () => { this.toggleArchive(); });
    this.filterContainer.addMorph(this.filterSelector);
  }

  initializeAppearance () {
    this.title = 'Comment Browser';

    const topbar = $world.getSubmorphNamed('lively top bar');

    this.height = $world.height - topbar.height;
    this.width = 280; // perhaps use width of comment morph?
    this.position = pt($world.width - this.width, topbar.height);

    // when styling palette is opened, position comment browser to the left of it
    if (topbar.activeSideBars.includes('Styling Palette')) {
      this.position = this.position.addPt(pt(-topbar.stylingPalette.width, 0));
    }

    this.relayoutWindowControls();
  }

  toggleArchive () {
    this.showsResolvedComments = !this.showsResolvedComments;
    let containerToRemove = this.resolvedCommentContainer;
    let newContainer = this.commentContainer;
    if (this.showsResolvedComments) {
      containerToRemove = this.commentContainer;
      newContainer = this.resolvedCommentContainer;
    }

    containerToRemove.remove();
    this.container.addMorph(newContainer);
    containerToRemove.submorphs.forEach((commentGroup) => commentGroup.hideCommentIndicators());
    newContainer.submorphs.forEach((commentGroup) => commentGroup.showCommentIndicators());
  }

  buildCommentGroupMorphs () {
    const commentGroupMorphs = [];
    $world.withAllSubmorphsDo(async (morph) => {
      if (morph.comments.length == 0) {
        return;
      }
      for (const comment of morph.comments) {
        await this.addCommentForMorph(comment, morph);
      }
    });
  }

  async addCommentForMorph (comment, morph) {
    let groupDictionary = this.commentGroups;
    let commentContainer = this.commentContainer;

    if (comment.isResolved()) {
      groupDictionary = this.resolvedCommentGroups;
      commentContainer = this.resolvedCommentContainer;
    }

    if (!(morph.id in groupDictionary)) {
      // TODO change when package location got changed
      const commentGroupMorph = await resource('part://CommentGroupMorphMockup/comment group morph master').read();
      await commentGroupMorph.initialize(morph);
      groupDictionary[morph.id] = commentGroupMorph;
      commentContainer.addMorph(commentGroupMorph);
    }
    await groupDictionary[morph.id].addCommentMorph(comment);
    this.updateCommentCountBadge();
  }

  async removeCommentForMorph (comment, morph) {
    let groupDictionary = this.commentGroups;
    if (this.resolvedCommentGroups[morph.id] &&
       this.resolvedCommentGroups[morph.id].hasCommentMorphForComment(comment)) {
      groupDictionary = this.resolvedCommentGroups;
    }
    const groupOfCommentMorph = groupDictionary[morph.id];

    await groupOfCommentMorph.removeCommentMorphFor(comment);
    if (groupOfCommentMorph.getCommentCount() === 0) {
      this.removeCommentGroup(groupOfCommentMorph, groupDictionary);
    }
    this.updateCommentCountBadge();
  }

  async applyResolveStatus (comment, referenceMorph) {
    await this.removeCommentForMorph(comment, referenceMorph);
    await this.addCommentForMorph(comment, referenceMorph);
  }

  removeCommentGroup (group, groupDictionary) {
    group.hideCommentIndicators();
    delete groupDictionary[group.referenceMorph.id];
    group.remove();
  }

  getCommentCount () {
    return this.getResolvedCommentCount() + this.getUnresolvedCommentCount();
  }

  getResolvedCommentCount () {
    return this.resolvedCommentContainer.submorphs.reduce((acc, cur) => cur.getCommentCount() + acc, 0);
  }

  getUnresolvedCommentCount () {
    return this.commentContainer.submorphs.reduce((acc, cur) => cur.getCommentCount() + acc, 0);
  }

  updateCommentCountBadge () {
    const count = this.getUnresolvedCommentCount();
    let badge = $world.get('lively top bar').get('comment browser button').get('comment count badge');
    if (badge) {
      if (count <= 0) {
        badge.remove();
        return;
      }
      badge.setText(count);
    } else if (count > 0) {
      badge = Badge.newWithText(count);
      badge.name = 'comment count badge';
      badge.addToMorph($world.get('lively top bar').get('comment browser button'));
    }
    if (badge) {
      badge.tooltip = count + ' unresolved comment' + (count == 1 ? '' : 's');
    }
  }

  relayoutWindowControls () {
    super.relayoutWindowControls();
    const headerHeight = 25;
    const filterContainerHeight = 30;
    const filterContainerBounds = new Rectangle(0, headerHeight, this.width, filterContainerHeight);
    const mainContainerBounds = new Rectangle(0, headerHeight + filterContainerHeight, this.width, this.height - headerHeight - filterContainerHeight);
    this.filterContainer.setBounds(filterContainerBounds);
    this.container.setBounds(mainContainerBounds);
  }
}
