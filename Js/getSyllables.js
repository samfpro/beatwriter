function getSyllables(word) {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  let syllables = [];
  let currentSyllable = '';
  let prevLetter = '';
  let letter = '';
  let nextLetter = '';
  let firstVowelFound = false;

  if (word.length < 4) {
    syllables.push(word);
    return syllables;
  }

  for (let i = 0; i < word.length; i++) {
    
    if (i > 0) {
      prevLetter = word[i - 1];
    }else{
      prevLetter = '';
    }

    letter = word[i];

    if (i < word.length) {
      nextLetter = word[i + 1];
    }else{
      nextLetter = '';
    }

    if (i === word.length - 2 && letter === 'e' && nextLetter === 's'){
       currentSyllable += 'es';
       syllables.push(currentSyllable);
       return syllables;
    }

    const isConsonant = !vowels.includes(letter.toLowerCase());

    if (i === word.length - 1) {
      if (isConsonant || letter.toLowerCase() === 'e' || !firstVowelFound) {
        currentSyllable += letter;
        syllables.push(currentSyllable);
        return syllables;
      } else {
        syllables.push(currentSyllable);
        currentSyllable = letter;
        syllables.push(currentSyllable);
        return syllables;
      }

    } else {
      if (isConsonant) {
        currentSyllable += letter;
      } else {
        if (!firstVowelFound) {
          if (i == 0 && letter === 'y'){
             currentSyllable = 'y';
          }else{
            firstVowelFound = true;
            currentSyllable += letter;
          }
          const isNextLetterVowel = vowels.includes(nextLetter.toLowerCase());
          if (isNextLetterVowel) {
            currentSyllable += nextLetter;
            i++;
            if (i === word.length - 1){
              syllables.push(currentSyllable);
              return syllables;
            }
          }
        } else {

          syllables.push(currentSyllable);
          const prevLetterIsConsonant = !vowels.includes(prevLetter.toLowerCase());
          if (prevLetter && prevLetterIsConsonant) {
            currentSyllable = prevLetter;
            currentSyllable += letter;
          } else {

            currentSyllable = letter;
          }
        }
      }
    }
  }
  return syllables;
}
console.log("getSyllables.js loaded.")