

function getSyllables(word) {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  let syllables = [];
  let currentSyllable = '';
  let firstVowelFound = false;

  if (word.length < 4) {
    syllables.push(word);
    return syllables;
  }

  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const nextLetter = word[i + 1];

    const isConsonant = !vowels.includes(letter.toLowerCase());

    if (i === word.length - 1) {
      if (isConsonant || letter.toLowerCase() === 'e') {
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
          firstVowelFound = true;
          currentSyllable += letter;
          const isNextLetterVowel = vowels.includes(nextLetter.toLowerCase());
          if (isNextLetterVowel) {
            currentSyllable += nextLetter;
            i++;
          }
        } else {
          syllables.push(currentSyllable);
          currentSyllable = letter;
        }

      }

    }
  }

  return syllables;
}
