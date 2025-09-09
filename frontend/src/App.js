import React, { useState } from "react";
import "./App.css";
import CalendarView from "./CalendarView";

function App() {
  const [days, setDays] = useState("");
  const [country, setCountry] = useState("");
  const [rawPlan, setRawPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [structuredPlan, setStructuredPlan] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!days || !country) {
      setError("Please provide both number of days and a country.");
      return;
    }
    setError("");
    setLoading(true);
    setRawPlan("");
    setStructuredPlan(null);

    try {
      const response = await fetch("http://localhost:5001/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days, country }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from the server.");
      }

      const data = await response.json();
      setRawPlan(
        data.rawText ||
          JSON.stringify(data.plan, null, 2) ||
          "No text response."
      );

      if (data.plan && data.plan.itinerary) {
        setStructuredPlan(data.plan.itinerary);
      } else {
        setStructuredPlan(null);
        if (data.error) {
          setError((prev) => (prev ? prev + " " : "") + data.error);
        }
      }
    } catch (err) {
      setError(
        "An error occurred while generating the plan. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Trip Planner Generator</h1>
        <form onSubmit={handleSubmit} className="plan-form">
          <div className="input-group">
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Number of days (e.g., 3)"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country (e.g., Thailand)"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <textarea
          className="plan-result"
          value={rawPlan}
          readOnly
          placeholder="Your raw JSON travel plan will appear here..."
        />

        <CalendarView itinerary={structuredPlan} />
      </header>
    </div>
  );
}

export default App;
