import { useState, useEffect } from "react";

export default function useScript(src) {
  // status: "idle", "loading", "ready", "error"
  const [status, setStatus] = useState(src ? "loading" : "idle");
  useEffect(
    () => {
      // Wait if source is not ready
      if (!src) {
        setStatus("idle");
        return;
      }
      // Check if script exists by src
      let script = document.querySelector(`script[src="${src}"]`);
      if (!script) {
        // If not override it with script tag
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.setAttribute("data-status", "loading");
        // Append script to body
        document.body.appendChild(script);
        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event) => {
          script.setAttribute(
            "data-status",
            event.type === "load" ? "ready" : "error"
          );
        };
        script.addEventListener("load", setAttributeFromEvent);
        script.addEventListener("error", setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(script.getAttribute("data-status"));
      }
      // Event handler to update state status
      const setStateFromEvent = (event) => {
        setStatus(event.type === "load" ? "ready" : "error");
      };
      // Add event listeners
      script.addEventListener("load", setStateFromEvent);
      script.addEventListener("error", setStateFromEvent);
      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent);
          script.removeEventListener("error", setStateFromEvent);
        }
      };
    },
    [] // Run only once
  );
  return status;
}
