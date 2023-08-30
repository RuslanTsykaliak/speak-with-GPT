import React, { Button, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system'
import { useVoiceRecognition } from './hooks/useVoiceRecognition';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
})


export default function App() {
  const { state, startRecognizing, stopRecognizing, destroyRecognizer } = useVoiceRecognition()
  const [borderColor, setBorderColor] = useState<'lightgray' | 'lightreen'>('lightgray')
  const [urlPath, setUrlPath] = useState('')

  useEffect(() => {
    listFiles()
  }, [])

  const listFiles = async () => {
    try {
      const result = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory!
      );
      if (result.length > 0) {
        const filename = result[0];
        const path = FileSystem.documentDirectory + filename;
        console.log("Full path to the file:", path);
        setUrlPath(path);
      }

    } catch (error) {
      console.log('An error occurred while listing the files:', error);

    }
  }

  const handleSubmit = async () => {
    if (!state.results[0]) return
    try {
      // Fetch the audio blob from the server
      const audioBlob = await fetchAudio(state.results[0])

      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target && typeof e.target.result === 'string') {
          // data:audio/mpeg;base64,...(actual base64 data)...
          const audioData = e.target.result.split(',')[1]

          // Write the audio data to a local file
          const path = await writeAudioToFile(audioData)

          await playFromPath(path)
          destroyRecognizer()
        }
      }

      reader.readAsDataURL(audioBlob)
    } catch (e) {
      console.error('An error occurred', e);
    }
  }

  // Function to fetch synthesized audio from the server
  const fetchAudio = async (text: string) => {
    const response = await fetch(
      "http://localhost:4000/text-to-speech/synthesize",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    return await response.blob()
  }

  // Function to write the audio data to local file
  const writeAudioToFile = async (audioData: string) => {
    const path = FileSystem.documentDirectory + 'temp.mp3'
    await FileSystem.writeAsStringAsync(path, audioData, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return path
  }

  async function playFromPath(path: string) {
    try {
      const soundObject = new Audio.Sound()
      await soundObject.loadAsync({ uri: path })
      await soundObject.playAsync()
    } catch (error) {
      console.log('An error occured while palying the audio:', error);

    }
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 30 }} >
        Talk with GPT
      </Text>
      <Text style={styles.instructions} >
        Press and hold this button to record your voice. Release the button to
        send the recording, and you'll hear a response
      </Text>
      <Text style={styles.welcome}>Your message: "{state.results[0]}"</Text>
      <Pressable
        onPressIn={() => {
          setBorderColor('lightgray')
          startRecognizing()
        }}
        onPressOut={() => {
          setBorderColor('lightgray')
          stopRecognizing()
          handleSubmit()
        }}
        style={{
          width: '90%',
          padding: 30,
          gap: 10,
          borderWidth: 3,
          alignItems: 'center',
          borderRadius: 10,
          borderColor: borderColor,
        }}
      >
        <Text style={styles.welcome}>
          {state.isRecording ? 'Release to Send' : 'Hold to Speak'}
        </Text>
        <Image style={styles.button} source={require('./assets/button.png')} />
      </Pressable>
      <Button
        title="Replay last message"
        onPress={async () => await playFromPath(urlPath)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    backgroundColor: "#E74C3C",
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#333333',
  },
  action: {
    textAlign: "center",
    color: "#0000FF",
    marginVertical: 5,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },
  instructions: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 5,
  },
  stat: {
    color: '#B0171F',
    textAlign: 'center',
    marginBottom: 1,
  },
});



