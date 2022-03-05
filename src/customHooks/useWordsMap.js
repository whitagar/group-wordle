import { LocalStorageKeys } from '../util/LocalStorageKeys';

export default function useWordsMap() {
  const getWordsMap = () => {
    return JSON.parse(localStorage.getItem(LocalStorageKeys.WordsMap));
  };
  const setWordsMap = (wordsMap) => {
    localStorage.setItem(LocalStorageKeys.WordsMap, JSON.stringify(wordsMap));
  };

  return [getWordsMap, setWordsMap];
}
