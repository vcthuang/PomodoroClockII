import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { createStore, combineReducers} from 'redux';

///////////////REDUX DISPATCHERS/////////////////////////
//
const INCREMENT_SESSION = "INCREMENT_SESSION";
const DECREMENT_SESSION = "DECREMENT_SESSION";
const INCREMENT_BREAK = "INCREMENT_BREAK";
const DECREMENT_BREAK = "DECREMENT_BREAK";
const RESET_ALL = "RESET_ALL"

///////////////REDUX ACTIONS/////////////////////////
//
const incSession = () => ({
  type: INCREMENT_SESSION
});

const decSession = () => ({
  type: DECREMENT_SESSION
});

const incBreak = () => ({
  type: INCREMENT_BREAK,
});

const decBreak = () => ({
  type: DECREMENT_BREAK
});

const reset = () => ({
  type: RESET_ALL
});

///////////////REDUX REDUCERS/////////////////////////
//
const initialState = {
  sessionLength: 1500,
  breakLength: 300
};

const breakReducer = (state = initialState.breakLength, action) => {
  switch (action.type) {
    case INCREMENT_BREAK:
      return state + 60;
    case DECREMENT_BREAK:
      return state - 60;
    case RESET_ALL:
      return initialState.breakLength;
    default:
      return state;
  }
};

const sessionReducer = (state = initialState.sessionLength, action) => {
  switch (action.type) {
    case INCREMENT_SESSION:
      return state + 60;
    case DECREMENT_SESSION:
      return state - 60;
    case RESET_ALL:
      return initialState.sessionLength;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  break: breakReducer,
  session: sessionReducer
});

///////////////REDUX STORE/////////////////////////
//
export const store = createStore(rootReducer);

/////////////////////////////////////////////////////////////////////////////

class PomodoroClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runningSession: true,
      isRunning: false,
      seconds: 1500 //25*60
    };
    this.audioRef = createRef();
    this.timer = 0;
    this.startStop = this.startStop.bind(this);
    this.countDown = this.countDown.bind(this);
    this.reset = this.reset.bind(this);
    this.breakIncrement = this.breakIncrement.bind(this);
    this.breakDecrement = this.breakDecrement.bind(this);
    this.sessionIncrement = this.sessionIncrement.bind(this);
    this.sessionDecrement = this.sessionDecrement.bind(this);
  }

  secondsToTime(value) {
    let minutes = Math.floor(value / 60);
    let seconds = value - minutes *60;

    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return minutes + ':' + seconds;
  }

  componentDidMonunt() {
  }

  componentWillReceiveProps(newProps) {
    if (newProps.sessionLength && this.state.runningSession) {
      this.setState({
        seconds: newProps.sessionLength
      });
    }
    if (newProps.breakLength && !this.state.runningSession) {
      this.setState({
        seconds: newProps.breakLength
      });
    }
  }

  startStop() {
    if (!this.state.isRunning) {
      this.timer = setInterval(this.countDown, 1000);
      this.setState({
        isRunning: true
      })
    } else {
      this.setState({
        isRunning: false,
      })
      clearInterval(this.timer);     
    } 
  }

  reset() {
    this.props.submitReset();
    this.setState({
      runningSession: true,
      isRunning: false,
      seconds: 1500
    });
    clearInterval(this.timer);
    this.timer = 0;
    this.audioRef.current.pause();
    this.audioRef.current.currentTime = 0;
  }

  countDown() {
    let seconds = this.state.seconds - 1;
    this.setState({
      seconds: seconds
    });

    if (seconds < 0) {
      if (this.state.runningSession) {
        this.setState({
          runningSession: !this.state.runningSession,
          seconds: this.props.breakLength
        });
      } else {
        this.setState({
          runningSession: !this.state.runningSession,
          seconds: this.props.sessionLength
        });
      }  
      //clearInterval(this.timer);
      //this.timer = 0;
    } else if (seconds === 0) {
      this.audioRef.current.play();
      //document.getElementById('beep').play();
    }
  }

  breakDecrement = () => {
    if (this.props.breakLength > 60 )  
      this.props.submitDecBreak();
  };
  
  breakIncrement = () => {
    if (this.props.breakLength < 300 )  
      this.props.submitIncBreak();
  };
  
  sessionDecrement = () => {
    if (this.props.sessionLength > 60 )  
      this.props.submitDecSession();
  };
  
  sessionIncrement = () => {
    if (this.props.sessionLength < 3600 )  
      this.props.submitIncSession();
  };
  
  render() {
    let content;
    if (this.state.runningSession) {
      content = (
        <div>
          <h3 id="timer-label">Running Session...</h3>
        </div>
      );
    } else {
      content = (
        <div>
          <h3 id="timer-label">Running Break...</h3>
        </div>
      );
    }

    const {breakLength, sessionLength} = this.props;
    
    return (
      <div className = "container">
          <div className = "card bg-dark border-primary text-secondary">
            <div className = "card-header border-primary text-left text-danger">
              <h1>Pomodoro Clock</h1>
            </div>
            <div className="card-body">
              <div className = "row">  
                
                <div className = "col-md-3">
                  <div className="break">
                    <div className="card bg-info text-center">
                      <div
                        className="card-header border-primary text-danger"
                        id="break-label"
                      >
                        <h3>Break</h3>
                      </div>
                      <div className="card-body">
                        <i
                          className="fas fa-minus pr-2"
                          id="break-decrement"
                          style={{ color: "blue" }}
                          onClick={this.breakDecrement}
                        ></i>

                        <span id="break-length" style={{ color: "blue" }}>
                          {Math.round(this.secondsToTime(breakLength).slice(0,2))}
                        </span>
                        <i
                          className="fas fa-plus pl-2"
                          id="break-increment"
                          style={{ color: "blue" }}
                          onClick={this.breakIncrement}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className = "col-md-6">
                  <div className="timer text-center">
                    {content}
                    <h1 id="time-left" style={{ color: "yellow" }}>
                      {this.secondsToTime(this.state.seconds)}
                    </h1>
                    <i
                      className="fas fa-toggle-on pr-5"
                      style={{ color: "blue" }}
                      id="start-stop"
                      onClick={this.startStop}
                    ></i>
                    <i
                      className="fas fa-power-off pl-5"
                      style={{ color: "red" }}
                      id="reset"
                      onClick={this.reset}
                    ></i>
                  </div>
                </div>
                
                <div className = "col-md-3">
                  <div className="session">
                    <div className="card bg-warning text-center">
                      <div
                        className="card-header border-primary text-danger"
                        id="session-label"
                      >
                        <h3>Session</h3>
                      </div>
                      <div className="card-body">
                        <i
                          className="fas fa-minus pr-2"
                          id="session-decrement"
                          style={{ color: "blue" }}
                          onClick={this.sessionDecrement}
                        ></i>

                        <span id="session-length" style={{ color: "blue" }}>
                          {Math.round(this.secondsToTime(sessionLength).slice(0,2))}
                        </span>
                        <i
                          className="fas fa-plus pl-2"
                          id="session-increment"
                          style={{ color: "blue" }}
                          onClick={this.sessionIncrement}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <audio ref={this.audioRef} 
             id="beep"
             src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3">
          </audio>

        </div>
     );
  }
}


const mapStateToProps = (state) => ({
  sessionLength: state.session,
  breakLength: state.break
});

const mapDispatchToProps = (dispatch) => ({ 
  submitIncSession: () => dispatch(incSession()),
  submitDecSession: () => dispatch(decSession()),
  submitIncBreak: () => dispatch(incBreak()),
  submitDecBreak: () => dispatch(decBreak()),
  submitReset: ()=> dispatch(reset())
});

const ClockContainer = connect (mapStateToProps, mapDispatchToProps)(PomodoroClock); 
export default ClockContainer;