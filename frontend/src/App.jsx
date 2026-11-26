import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const distance = steps * 0.00075;
  const calories = steps * 0.04;
  const pace =
    distance > 0
      ? (seconds / 60 / distance).toFixed(2)
      : 0;

  const formatTime = (time) => {
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = time % 60;

    return [hrs, mins, secs]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    setSteps(0);
  };

  const formatPace = (value) => {
    if (!value || !isFinite(value)) return "--:--";

    const mins = Math.floor(value);
    const secs = Math.round((value - mins) * 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🏃 StepTrack</h2>

        <nav>
          <a className="active">⌂ Home</a>
          <a>◷ History</a>
          <a>▥ Statistics</a>
          <a>⚙ Settings</a>
        </nav>

        <div className="motivation">
          <h3>Keep going!</h3>
          <p>Every step counts. 💪</p>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>Dashboard</h1>
            <p>Your daily activity tracker</p>
          </div>
          <span className="status">
            ● {running ? "Tracking" : "Not tracking"}
          </span>
        </header>

        <section className="timer-card">
          <span className="tracking">
            ● {running ? "Workout in progress" : "Ready to walk"}
          </span>

          <h1>{formatTime(seconds)}</h1>

          <div className="timer-buttons">
            <button
              className="start"
              onClick={() => setRunning(!running)}
            >
              {running ? "Ⅱ Pause" : "▶ Start"}
            </button>

            <button className="reset" onClick={reset}>
              ■ Reset
            </button>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card blue">
            <span>👟</span>
            <p>Steps walked</p>
            <h2>{steps.toLocaleString()}</h2>
          </div>

          <div className="stat-card green">
            <span>📍</span>
            <p>Distance</p>
            <h2>{distance.toFixed(2)} km</h2>
          </div>

          <div className="stat-card orange">
            <span>🔥</span>
            <p>Calories burned</p>
            <h2>{Math.round(calories)} kcal</h2>
          </div>

          <div className="stat-card purple">
            <span>⏱</span>
            <p>Average pace</p>
            <h2>
              {formatPace(pace)} <small>/km</small>
            </h2>
          </div>
        </section>

        <section className="bottom">
          <div className="input-card">
            <h2>Update your steps</h2>
            <p>Enter the number of steps you've walked.</p>

            <input
              type="number"
              min="0"
              value={steps}
              onChange={(e) =>
                setSteps(Math.max(0, Math.floor(Number(e.target.value) || 0)))
              }
              placeholder="Enter steps"
            />

            <div className="step-buttons">
              <button onClick={() => setSteps((s) => s + 100)}>
                +100
              </button>
              <button onClick={() => setSteps((s) => s + 500)}>
                +500
              </button>
              <button onClick={() => setSteps((s) => s + 1000)}>
                +1000
              </button>
            </div>
          </div>

          <div className="summary-card">
            <h2>Activity summary</h2>
            <div className="summary-row">
              <span>Walking time</span>
              <strong>{formatTime(seconds)}</strong>
            </div>
            <div className="summary-row">
              <span>Total steps</span>
              <strong>{steps.toLocaleString()}</strong>
            </div>
            <div className="summary-row">
              <span>Total distance</span>
              <strong>{distance.toFixed(2)} km</strong>
            </div>
            <div className="summary-row">
              <span>Calories</span>
              <strong>{Math.round(calories)} kcal</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}