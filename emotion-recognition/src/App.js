import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { drawMesh } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require('@tensorflow-models/blazeface');
  const [emotionData, setEmotionData] = useState(null);

  const runFaceDetectorModel = async () => {
    const model = await blazeface.load();
    console.log("FaceDetection Model is Loaded..") ;
    setInterval(() => {
      detect(model);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
    
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

    
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

   
      const face = await net.estimateFaces(video);
     

     
      var socket = new WebSocket('ws://localhost:8000')
      var imageSrc = webcamRef.current.getScreenshot()
      var apiCall = {
        event: "localhost:subscribe",
        data: { 
          image: imageSrc
        },
      };
      socket.onopen = () => socket.send(JSON.stringify(apiCall))
      socket.onmessage = function(event) {
        var pred_log = JSON.parse(event.data);
        document.getElementById("Angry").value = Math.round(pred_log['predictions']['angry']*100);
        document.getElementById("Neutral").value = Math.round(pred_log['predictions']['neutral']*100);
        document.getElementById("Happy").value = Math.round(pred_log['predictions']['happy']*100);
        document.getElementById("Fear").value = Math.round(pred_log['predictions']['fear']*100);
        document.getElementById("Surprise").value = Math.round(pred_log['predictions']['surprise']*100);
        document.getElementById("Sad").value = Math.round(pred_log['predictions']['sad']*100);
        document.getElementById("Disgust").value = Math.round(pred_log['predictions']['disgust']*100);

        document.getElementById("emotion_text").value = pred_log['emotion'];

        
        const ctx = canvasRef.current.getContext("2d");
        requestAnimationFrame(()=>{drawMesh(face, pred_log, ctx)});
        
        
        const dataToStore = {
          angry: Math.round(pred_log['predictions']['angry']*100),
          neutral: Math.round(pred_log['predictions']['neutral']*100),
          happy: Math.round(pred_log['predictions']['happy']*100),
          fear: Math.round(pred_log['predictions']['fear']*100),
          surprise: Math.round(pred_log['predictions']['surprise']*100),
          sad: Math.round(pred_log['predictions']['sad']*100),
          disgust: Math.round(pred_log['predictions']['disgust']*100),
          emotion: pred_log['emotion']
        };

        localStorage.setItem('emotionData', JSON.stringify(dataToStore));
        setEmotionData(dataToStore);
      };
    }
  };

  useEffect(()=>{runFaceDetectorModel()}, []);

  return (
    <div className="App">
      <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 600,
            top:20,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 600,
            top:20,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      <header className="App-header">
        <img src={logo} 
        className="App-logo" 
        alt="logo"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          bottom:10,
          left: 0,
          right: 0,
          width: 150,
          height: 150,
        }}
        />

   
        {emotionData && (
          <div className="Emotion-data">
            <p>Angry: {emotionData.angry}</p>
            <p>Neutral: {emotionData.neutral}</p>
            <p>Happy: {emotionData.happy}</p>
            <p>Fear: {emotionData.fear}</p>
            <p>Surprise: {emotionData.surprise}</p>
            <p>Sad: {emotionData.sad}</p>
            <p>Disgust: {emotionData.disgust}</p>
            <p>Emotion: {emotionData.emotion}</p>
          </div>
        )}
        <div className="Prediction" style={{
          position:"absolute",
          right:100,
          width:500,
          top: 60
        }}>
          <label htmlFor="Angry" style={{color:'red'}}>Angry </label>
          <progress id="Angry" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Neutral" style={{color:'lightgreen'}}>Neutral </label>
          <progress id="Neutral" value="0" max = "100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Happy" style={{color:'orange'}}>Happy </label>
          <progress id="Happy" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Fear" style={{color:'lightblue'}}>Fear </label>
          <progress id="Fear" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Surprise" style={{color:'yellow'}}>Surprised </label>
          <progress id="Surprise" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Sad" style={{color:'gray'}} >Sad </label>
          <progress id="Sad" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Disgust" style={{color:'pink'}} >Disgusted </label>
          <progress id="Disgust" value="0" max = "100" >10%</progress>
        </div>
        <input id="emotion_text" name="emotion_text" value="Neutral"
               style={{
                 position:"absolute",
                 width:200,
                 height:50,
                 bottom:60,
                 left:300,
                 "font-size": "30px",
               }}></input>
      </header>
    </div>
  );
}

export default App;