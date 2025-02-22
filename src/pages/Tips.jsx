import React from "react";

export default function Tips() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold text-yellow-400 text-center mb-6">
        Bulking Tips & Nutrition Advice
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tip 1 */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white">1. Eat in a Caloric Surplus</h2>
          <p className="mt-2 text-gray-400">
            To gain muscle, consume more calories than you burn. Use our{" "}
            <span className="text-yellow-300 font-semibold">calorie calculator</span> to find your optimal intake.
          </p>
        </div>

        {/* Tip 2 */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white">2. Prioritize Protein Intake</h2>
          <p className="mt-2 text-gray-400">
            Aim for at least 1g of protein per pound of body weight. High-protein meals will optimize muscle growth.
          </p>
        </div>

        {/* Tip 3 */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white">3. Train with Progressive Overload</h2>
          <p className="mt-2 text-gray-400">
            Increase weights, reps, or sets over time to keep challenging your muscles and stimulate growth.
          </p>
        </div>

        {/* Tip 4 */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white">4. Get Enough Sleep & Recovery</h2>
          <p className="mt-2 text-gray-400">
            Your muscles grow while you rest. Aim for 7-9 hours of sleep per night for optimal recovery.
          </p>
        </div>
      </div>
    </div>
  );
}