class Replacement {
    constructor(key, _with) {
        this.key = new RegExp(`{{${key}}}`, 'g');
        this.with = _with;
    }
}

module.exports = Replacement;
