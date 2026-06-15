import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaHome, FaUserTie, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const[pencount,setPencount]=useState(0);

  const role = localStorage.getItem("role");
  const nav = useNavigate();

  const [rmaReminders, setRmaReminders] = useState([]);
const [outReminders, setOutReminders] = useState([]);

const [reminders, setReminders] =
    useState([]);
    const [inreminders, setInreminders] =
    useState([]);

const loadReminders = async () => {

    const res = await axios.get(
        "http://localhost:5000/reminders_ls"
    );

    setReminders(res.data);

};

useEffect(() => {
    loadReminders_l();
}, []);



const loadReminders_l = async () => {

    const res = await axios.get(
        "http://localhost:5000/reminders_lsr"
    );

    setInreminders(res.data);

};

const openStatus = (item) => {
    console.log(item);
};

const [selectedItem, setSelectedItem] =
    useState(null);

const [statusText, setStatusText] =
    useState("");

useEffect(() => {
    loadReminders();
}, []);

  // ✅ LOAD REMINDERS
  useEffect(() => {
  axios.get("http://localhost:5000/reminders")
    .then((res) => {
      console.log("RMA:", res.data);
      setRmaReminders(res.data);
    })
    .catch((err) => console.log(err));
}, []);
 console.log("OUT:", rmaReminders);
useEffect(() => {
  axios.get("http://localhost:5000/reminders_l")
    .then((res) => {
      console.log("OUT:", res.data);
      setOutReminders(res.data);
    })
    .catch((err) => console.log(err));
}, []);



  // ✅ GET CUSTOMER COUNT
  const getCustomerCount = async () => {
    try {
      const resp = await axios.get(
        "http://localhost:5000/api/customerCount"
      );
      setCount(resp.data[0].total);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
   // loadReminders();
    getCustomerCount();


    

    // auto refresh dashboard every 10 sec
    const interval = setInterval(() => {
     // loadReminders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">MK Electronic</h2>

        <ul className="menu">
          <li>
            <Link to="/dashboard">
              <FaHome /> Dashboard
            </Link>
          </li>

          <li>
            <Link to="/home">
              <FaUsers /> Customers
            </Link>
          </li>

          <li>
            <Link to="/home/home_l">
              <FaUsers /> RMA-Inward
            </Link>
          </li>

          <li>
            <Link to="/home/home_z">
              <FaUsers /> RMA-Outward
            </Link>
          </li>

          {role === "admin" && (
            <li>
              <Link to="/home/staff">
                <FaUserTie /> Staff
              </Link>
            </li>
          )}

          <li>
            <Link to="/home/services">
              <FaUserTie /> Service
            </Link>
          </li>

          <li>
            <Link to="/">
              <FaSignOutAlt /> Logout
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-cards">
          
          {/* Customer Card */}
          <div className="total-card" 
      
    >
            <h2>{count}</h2>
            <p>Total Customers</p>
          </div>
          

          {/* Reminder Section */}
          <div className="reminder-section">
            <h2>RMA-OutWard Reminders</h2>

            {reminders.length === 0 ? (
  <p>No active reminders</p>
) : (

<table className="table table-bordered">

  <thead>
    <tr>
      <th>RMA No</th>
      <th>Serial No</th>
      <th>Reminders</th>
      {/* <th>Status</th>
      <th>Action</th> */}
    </tr>
  </thead>

  <tbody>

    {reminders.map((item) => (

      <tr key={item.reminder_id}>

        <td>{item.rma_no}</td>

        <td>{item.serial_no}</td>

        <td>
  {item.reminder_day} Day Reminder

  <button
    className="btn btn-warning btn-sm ms-2"
    onClick={() =>
      nav(`/statuspage1/${item.item_id}/${item.reminder_id}`)
    }
  >
    Update Status
  </button>
</td>

        {/* <td>{item.item_status}</td>

        <td>

          <button
            className="btn btn-warning btn-sm"
            onClick={() =>
              openStatus(item)
            }
          >
            Update
          </button>

        </td> */}

      </tr>

    ))}

  </tbody>

</table>

)}

    </div>

    <div className="reminder-section">
            <h2>RMA-InWard Reminders</h2>

            {inreminders.length === 0 ? (
  <p>No active reminders</p>
) : (

<table className="table table-bordered">

  <thead>
    <tr>
      <th>RMA No</th>
      <th>Serial No</th>
      <th>Reminders</th>
      {/* <th>Status</th>
      <th>Action</th> */}
    </tr>
  </thead>

  <tbody>

    {inreminders.map((item) => (

      <tr key={item.reminder_id}>

        <td>{item.rma_no}</td>

        <td>{item.serial_no}</td>

        <td>
  {item.reminder_day} Day Reminder

  <button
    className="btn btn-warning btn-sm ms-2"
    onClick={() =>
      nav(`/statuspage/${item.item_id}/${item.reminder_id}`)
    }
  >
    Update Status
  </button>
</td>

        {/* <td>{item.item_status}</td>

        <td>

          <button
            className="btn btn-warning btn-sm"
            onClick={() =>
              openStatus(item)
            }
          >
            Update
          </button>

        </td> */}

      </tr>

    ))}

  </tbody>

</table>

)}

    </div>
    </div>
    </div>
    </div>

  );
};

export default Dashboard;