

function buildFreqMap(arr) {
  const freq = {};
  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1;
  }
  return freq;
}


/*
freq[elem] = ((freq[elem] || 0) + 1);
It checks its notepad to see if it has seen that letter before.
If it is a new letter: The robot says, "I see 0 of these on my notepad so far. 
Let's add 1!
"If it is an old letter: The robot says, "Ah, I already have a number for this letter. Let's add 1 to that number!"

*/
