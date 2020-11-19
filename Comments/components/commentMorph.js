import { Morph, Label } from 'lively.morphic';
import { pt, Rectangle } from 'lively.graphics';

export class CommentMorph extends Morph {
  static get properties () {
    return {
      comment: {
      },
      referenceMorph: {
      }
    };
  }

  constructor () {
    super();
    this.ui = {
      dateLabel: this.get('date label'),
      commentTextLabel: this.get('comment text field'),
      deleteButton: this.get('delete button')
    };
  }

  initialize (comment, referenceMorph) {
    this.comment = comment;
    this.referenceMorph = referenceMorph;
    const [date, time] = new Date(this.comment.timestamp).toLocaleString('de-DE', { hour12: false }).split(', ');
    this.get('date label').textString = date + ' ' + time;
    // TODO: Fix that width doesn't need to be increased at runtime
    this.get('date label').width += 20;
    this.get('comment text field').textString = this.comment.text;
  }

  onMouseDown (evt) {
    super.onMouseDown(evt);

    if (evt.targetMorph === this.get('delete button')) {
      this.referenceMorph.removeComment(this.comment);
    } else if (this.referenceMorph) {
      this.referenceMorph.show();
    }
  }
}
