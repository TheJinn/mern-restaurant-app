import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";

export default function ThankYou() {
  const nav = useNavigate();
  const { setDetails } = useStore();
  const [secs, setSecs] = useState(3);

  useEffect(() => {
    // reset so the details modal re-opens on Home
    setDetails(null);

    let s = 3;
    setSecs(s);
    const timer = setInterval(() => {
      s -= 1;
      setSecs(s);
      if (s <= 0) {
        clearInterval(timer);
        nav("/");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nav, setDetails]);

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-gray-100">
      <div className="relative w-[414px] min-h-screen bg-green-500 text-white shadow flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Thanks For Ordering</div>
          <div className="text-sm opacity-90">
            Redirecting in {secs}s…
          </div>
        </div>
      </div>
    </div>
  );
}
