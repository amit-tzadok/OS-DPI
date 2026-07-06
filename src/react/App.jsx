import { Component } from "react";
import { HomeScreen } from "./HomeScreen.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: /** @type {Error | null} */ (null) };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ padding: "1rem" }}>
          <p>Something went wrong loading this screen.</p>
          <pre style={{ fontSize: "0.8em", opacity: 0.7 }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/** @param {{ mode?: string }} props */
export function App({ mode }) {
  if (mode === "home") {
    return (
      <ErrorBoundary>
        <HomeScreen />
      </ErrorBoundary>
    );
  }
  if (mode !== undefined) {
    console.warn(`App: unknown mode "${mode}"`);
  }
  return null;
}
