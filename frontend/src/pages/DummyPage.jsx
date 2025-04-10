import React from "react";
import { usePredictStore } from "../store/usePredictStore";

const DummyPage = () => {
  const { predictions } = usePredictStore();
  if (!predictions) return;
  return (
    <div className="h-screen">
      {predictions && (
        <div className="mt-4">
          <h3 className="font-semibold">Response:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(predictions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DummyPage;
