"use client";
import { useState } from "react";



export default function HelpModal() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="w-8 h-8 rounded-full text-white border border-white flex items-center justify-center shadow-md hover:text-pink-600 hover:bg-white"
      >
        ?
      </button>

      {visible && (
        <div className="fixed inset-0 z-50 flex items-center font-sans justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Help</h2>
            <div className="font-sans">
                
            </div>
            <p className="mb-2">
              Dear Tangle Users,
              </p>
              <ul className="list-none">

  <li className="relative pl-4 before:content-['–'] before:absolute before:left-0 before:top-0">
    Songs can take 3 to 5 minutes to process
  </li>
  <li className="relative pl-4 before:content-['–'] before:absolute before:left-0 before:top-0">
    To clarify, you can add the artist in the song field
  </li>
  <li className="relative pl-4 before:content-['–'] before:absolute before:left-0 before:top-0">
    You must login for unlimited uses
  </li>
</ul>
<p className=" mt-2">
              Sincerely,
              </p>
              <p className="mb-2">
              Team Io :)
              </p>
            <button
              onClick={() => setVisible(false)}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 mt-3 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
