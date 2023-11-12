async function textToAudioBlob(textToConvert,ttsSpRt) {
  const apiKey = 'AIzaSyAUdCwRe0WxgyJB1bcHn-lYX__PLDCOGy4';

  if (!textToConvert || textToConvert.trim() === '') {
    throw new Error('Text to convert is missing or empty.');
  }

if (textToConvert === 'a'){
   textToConvert = "uh";

}

  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const requestData = {
    input: {
      'text': textToConvert
    },
    voice: {
      'languageCode': 'en-US',
      'name': 'en-US-Standard-B',
      'ssmlGender': 'MALE'
    },
    audioConfig: {
      'audioEncoding': 'MP3',
      'speakingRate': ttsSpRt
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Failed to convert text to audio: ${response.statusText}`);
    }

    const responseBody = await response.json();
    const audioContentBase64 = responseBody.audioContent;

    if (!audioContentBase64) {
      throw new Error('Audio content not found in the response.');
    }

    const audioBlob = base64ToBlob(audioContentBase64);
    return audioBlob;
  } catch (error) {
    console.error('An error occurred while converting text to audio:', error.message);
    throw error;
  }
}


// Helper function to convert base64 to blob
function base64ToBlob(base64) {
  const binary = atob(base64);
  const arrayBuffer = new ArrayBuffer(binary.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  checkAudioFormat( new Blob([arrayBuffer]));
  return new Blob([arrayBuffer]);
}

async function checkAudioFormat(audioBlob) {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    
    audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      console.log('Audio format is compatible:', buffer);
    }, (error) => {
      console.error('Error decoding audio data:', error);
    });
  } catch (error) {
    console.error('Error checking audio format:', error);
  }
}
console.log("textToAudioBlob.js loaded");