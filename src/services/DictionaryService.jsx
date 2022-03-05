export class DictionaryService {
  static async isValidWord(word) {
    const url = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + word;
    const data = await (await fetch(url)).json();
    if (Array.isArray(data)) {
      return true;
    } else {
      return false;
    }
  }

  static isValidWordFast(word) {
    const checkWord = require('check-if-word');
    const words = checkWord('en');
    return words.check(word);
  }
}
