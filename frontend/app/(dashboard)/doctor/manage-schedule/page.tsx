"use client";

import { useState } from "react";

export default function ManageSchedule() {
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: "Monday", start: "09:00", end: "17:00", available: true },
    { day: "Tuesday", start: "09:00", end: "17:00", available: true },
    { day: "Wednesday", start: "09:00", end: "17:00", available: true },
    { day: "Thursday", start: "09:00", end: "17:00", available: true },
    { day: "Friday", start: "09:00", end: "16:00", available: true },
    { day: "Saturday", start: "", end: "", available: false },
    { day: "Sunday", start: "", end: "", available: false },
  ]);

  const updateDay = (index: number, field: string, value: any) => {
    const updated = [...weeklySchedule];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklySchedule(updated);
  };

  const saveSchedule = () => {
    // Mock save - will connect to API later
    alert("Schedule saved!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Weekly Schedule</h1>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {weeklySchedule.map((day, idx) => (
              <tr key={day.day}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{day.day}</td>
                <td className="px-6 py-4">
                  <input type="checkbox" checked={day.available} onChange={(e) => updateDay(idx, "available", e.target.checked)} className="h-4 w-4 text-blue-600" />
                </td>
                <td className="px-6 py-4">
                  <input type="time" value={day.start} onChange={(e) => updateDay(idx, "start", e.target.value)} disabled={!day.available} className="border rounded px-2 py-1 disabled:bg-gray-100" />
                </td>
                <td className="px-6 py-4">
                  <input type="time" value={day.end} onChange={(e) => updateDay(idx, "end", e.target.value)} disabled={!day.available} className="border rounded px-2 py-1 disabled:bg-gray-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-gray-50 flex justify-end">
          <button onClick={saveSchedule} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Schedule</button>
        </div>
      </div>
    </div>
  );
}