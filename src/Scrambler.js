export default class Scrambler {
  static get DELAY() {
    return 3;
  }
  static get MAX_COUNTER() {
    return 12;
  }
  static get CHARACTERS() {
    return {
      DIGITS: ['0','1','2','3','4','5','6','7','8','9'],
      DEFAULT: ['@', '#', '$', '%', '£', '&', '*', '§', '+', '_'],
      ALPHABET: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
      DIGITS_AND_ALPHABET: ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
      ALPHABET_WITH_CAPITALS: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
      DIGITS_AND_ALPHABET_WITH_CAPITALS: ['0','1','2','3','4','5','6','7','8','9', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
    };
  }

  constructor() {
    this.delay = Scrambler.DELAY;
    this.maxCounter = Scrambler.MAX_COUNTER;
    this.characters = Scrambler.CHARACTERS.DEFAULT;

    this.targetText = '';
    this.scrambledText = '';
    this.encodingCounters = [];
    this.decodingCounters = [];
    this.onScramble = null;

    this.frameId = null;
    this.frameIndex = 0;
  }

  scramble(text, onScramble, options = null) {
    if (options) {
      if (options.delay) this.delay = options.delay;
      if (options.maxCounter) this.maxCounter = options.maxCounter;
      if (options.characters) this.characters = options.characters;
    }
    this.targetText = text;
    this.encodingCounters = this._generateCounters(this.scrambledText);
    this.decodingCounters = this._generateCounters(this.targetText);
    this.onScramble = onScramble;

    this.frameId = null;
    this.frameIndex = 0;

    this.frameId = requestAnimationFrame(() => this._encode());
  }

  _randomText(length) {
    let text = '';
    for (let i = 0; i < length; i += 1) {
      text += this.characters[
        Math.floor(Math.random() * this.characters.length)
      ];
    }
    return text;
  }

  _generateCounters(text) {
    return new Array(text.length)
      .fill(0)
      .map(() => Math.floor(Math.random() * this.maxCounter) + 1);
  }

  _encode() {
    if (this.frameIndex === 0) {
      const finished = this.encodingCounters.reduce((acc, crr) => acc + crr, 0) === 0;
      if (finished) {
        this.frameId = requestAnimationFrame(() => this._fill());
        return;
      }

      for (let i = 0; i < this.encodingCounters.length; i += 1) {
        if (this.encodingCounters[i] === 0) {
          const temp = this.scrambledText.split('');
          temp[i] = this._randomText(1);
          this.scrambledText = temp.join('');
          continue;
        }
        this.encodingCounters[i] -= 1;
        this.onScramble(this.scrambledText);
      }
    }

    this.frameIndex = (this.frameIndex + 1) % this.delay;
    this.frameId = requestAnimationFrame(() => this._encode());
  }

  _fill() {
    if (this.frameIndex === 0) {
      const finished = this.scrambledText.length === this.targetText.length;
      if (finished) {
        this.frameId = requestAnimationFrame(() => this._decode());
        return;
      }

      const increase = this.scrambledText.length < this.targetText.length ? 1 : -1;
      this.scrambledText = this._randomText(this.scrambledText.length + increase);
      this.onScramble(this.scrambledText);
    }

    this.frameIndex = (this.frameIndex + 1) % this.delay;
    this.frameId = requestAnimationFrame(() => this._fill());
  }

  _decode() {
    const finished = this.scrambledText === this.targetText;
    if (finished) {
      cancelAnimationFrame(this.frameId);
      return;
    }

    if (this.frameIndex === 0) {
      let decodingText = '';
      for (let i = 0; i < this.decodingCounters.length; i += 1) {
        if (this.decodingCounters[i] === 0) {
          decodingText += this.targetText[i];
          continue;
        }
        decodingText += this.characters[Math.floor(
          Math.random() * this.characters.length,
        )];
        this.decodingCounters[i] -= 1;
      }
      this.scrambledText = decodingText;
      this.onScramble(this.scrambledText);
    }

    this.frameIndex = (this.frameIndex + 1) % this.delay;
    this.frameId = requestAnimationFrame(() => this._decode());
  }
}
