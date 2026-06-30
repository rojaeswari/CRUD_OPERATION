import React, { useEffect, useState } from "react";
import { getReminder, updateReminder } from "./api";
import { useParams } from "react-router-dom";

export default function ReminderPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  const load = async () => {
    const res = await getReminder(id);
    setData(res.data);
  };

  const update = async (type) => {
    await updateReminder(id, { status: type });
    alert("Updated");
    load();
  };

  if (!data) return null;

  return (
    <div>
      <h2>Reminder Detail</h2>

      <p>Product: {data.product_name}</p>
      <p>Reminder: {data.reminder_date}</p>
      <p>Status: {data.status}</p>

      <input
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        placeholder="update status"
      />

      <button onClick={() => update(status)}>Update</button>
      <button onClick={() => update("completed")}>
        Completed
      </button>
    </div>
  );
}