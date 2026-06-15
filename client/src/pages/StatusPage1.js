

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function StatusPage1() {

  const { item_id, reminder_id } = useParams();
  
const navigate = useNavigate();
  const [data, setData] = useState({});
  const [status, setStatus] = useState("");
  const [statusText, setStatusText] = useState("");

// const [selectedItem, setSelectedItem] =
//     useState({ item_id: id });

const loadData = () => {
  axios.get("http://localhost:5000/reminders_ls")
    .then(res => setData(res.data));
};

useEffect(() => {
  loadData();
}, []);

  useEffect(() => {

    axios
      .get(`http://localhost:5000/reminders_ls`)
      .then((res) => {
        setData(res.data);
      });

  }, []);

  const saveStatus = async () => {  

    await axios.post(
  `http://localhost:5000/update-status_ls/${item_id}`,
  {
    item_id,
    reminder_id,
    status,
    status_text: statusText
  }
);

    alert("Status Updated");
    navigate("/dashboard");
    loadData();

};
    //loadReminders();



  const completeStatus = async () => {

  console.log("DATA:", data);

  await axios.post(
    "http://localhost:5000/update-status_l",
    {
      reminder_id: item_id,
      rma_id: data.rma_id,
      status_text: status,
      completed: true
    }
  );

  alert("Completed");
};

  return (
    // <div>
    // {selectedItem && (

<div className="card p-3">

    <h5>Status Update</h5>

    <select
        className="form-control mb-2"
        value={status}
        onChange={(e) =>
            setStatus(e.target.value)}
    >

        <option value="Pending">
            Pending
        </option>

        <option value="Completed">
            Completed
        </option>

    </select>

    <textarea
        className="form-control mb-2"
        value={statusText}
        onChange={(e) =>
            setStatusText(e.target.value)
        }
    />

    <button
        className="btn btn-success"
        onClick={saveStatus}
    >
        Save
    </button>

</div>

// )}
// </div>
  );
}

export default StatusPage1;