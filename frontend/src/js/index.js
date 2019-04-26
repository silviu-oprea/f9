import * as initialisers from "./initialisers";

const elems = initialisers.initElems();

Array.prototype.sameValuesAs = function (other) {
    if (!Array.isArray(other) || this.length !== other.length)
        return false;

    const arr1 = this.concat().sort();
    const arr2 = other.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
};

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.distinct = function () {
  return [...new Set(this)];
};