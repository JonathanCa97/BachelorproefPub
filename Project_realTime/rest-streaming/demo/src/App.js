import React, { Component } from 'react';
import Websocket from 'react-websocket';
import logo from './logo.svg';
import './App.css';
import NestActivity from './NestActivity';

class App extends Component {
  state = {
    connected: false,
    motionDetected: false,
    personRecognized: false,
    tryingToRecognize: false,
  };
  handleOnMessage = data => {
    const result = JSON.parse(data);
    console.log('result', result);
    switch (result.type) {
      case 'motionDetected':
        this.setState({
          motionDetected: true,
        });
        break;
      case 'snapshot':
        this.setState({
          imageData: 'data:image/png;base64, ' + result.data,
          tryingToRecognize: true,
        });
        break;
      case 'recognizeResult':
        this.setState({
          personRecognized: result.recognized,
          personName: result.recognized ? result.data : undefined,
          tryingToRecognize: false,
        });
        setTimeout(() => {
          this.setState({
            motionDetected: false,
          });
        }, 5000);
        break;
    }
  };

  toggleConnection = connected => {
    this.setState({ connected });
  };

  renderHeader = () => {
    const { connected } = this.state;
    return connected ? (
      <header className="App-header">
        <h1 className="App-title">We are connected with server.</h1>
      </header>
    ) : (
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Waiting for real-time connection</h1>
      </header>
    );
  };

  createNestActivityProps = () => {
    const {
      motionDetected,
      imageData,
      personRecognized,
      personName,
      tryingToRecognize,
    } = this.state;
    if (!motionDetected) {
      return { message: 'Monitoring camera...', spinner: 'double-bounce' };
    } else if (motionDetected) {
      if (!imageData) {
        return {
          message: 'Detected something in front of the camera, taking snapshot',
          spinner: 'wandering-cubes',
        };
      } else if (imageData) {
        if (tryingToRecognize) {
          return {
            message: 'Trying to recognize person',
            spinner: 'wandering-cubes',
          };
        } else {
          if (personRecognized) {
            return {
              recognizeMessage: 'We have recognized ',
              personName,
            };
          } else {
            return {
              recognizeMessage: 'Could not recognize somebody',
            };
          }
        }
      }
    }
  };

  render() {
    return (
      <div className="App">
        {this.renderHeader()}
        {this.state.connected && (
          <NestActivity {...this.createNestActivityProps()} />
        )}
        <Websocket
          url="ws://localhost:8081/"
          onMessage={this.handleOnMessage}
          onOpen={() => this.toggleConnection(true)}
          onClose={() => this.toggleConnection(false)}
        />
      </div>
    );
  }
}

export default App;
