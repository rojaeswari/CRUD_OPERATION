import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaHome, FaUserTie, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const[pencount,setPencount]=useState(0);
  const[comcount,setComcount]=useState(0);
  const [outPenCount, setOutPenCount] = useState(0);
  const [outComCount, setOutComCount] = useState(0);
  const [serialPendingCount, setSerialPendingCount] = useState(0);
  const [serialCompletedCount, setSerialCompletedCount] = useState(0);

  const [serialPendingOutCount,
      setSerialPendingOutCount] = useState(0);

const [serialCompletedOutCount,
      setSerialCompletedOutCount] = useState(0);

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
        "https://smazo.onrender.com/reminders_ls"
    );

    setReminders(res.data);

};

useEffect(() => {
    loadReminders_l();
}, []);



const loadReminders_l = async () => {

    const res = await axios.get(
        "https://smazo.onrender.com/reminders_lsr"
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
  axios.get("https://smazo.onrender.com/reminders")
    .then((res) => {
      console.log("RMA:", res.data);
      setRmaReminders(res.data);
    })
    .catch((err) => {
      console.log("API URL:", err.config?.url);
      console.log("Status:", err.response?.status);
      console.log("Response:", err.response?.data);
      console.log(err);
    });
}, []);
//  console.log("OUT:", rmaReminders);
// useEffect(() => {
//   axios.get("https://smazo.onrender.com/reminders_l")
//     .then((res) => {
//       console.log("OUT:", res.data);
//       setOutReminders(res.data);
//     })
//     .catch((err) => console.log(err));
// }, []);



  // ✅ GET CUSTOMER COUNT
  const getCustomerCount = async () => {
    try {
      const resp = await axios.get(
        "https://smazo.onrender.com/api/customerCount"
      );
      setCount(resp.data.total);
    } catch (err) {
      console.log(err);
    }
  };

  const getPendingCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/pending-count"
        );

        setPencount(resp.data.totalPending);

    } catch (err) {

        console.log(err);

    }

};

const getCompleteCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/completed-count"
        );

        setComcount(resp.data.totalPending);

    } catch (err) {

        console.log(err);

    }

};


const getOutPendingCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/pending-rma-out-count"
        );

        setOutPenCount(resp.data.totalPending);

    } catch (err) {

        console.log(err);

    }

};

const getOutCompleteCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/completed-rma-out-count"
        );

        setOutComCount(resp.data.totalCompleted);

    } catch (err) {

        console.log(err);

    }

};

const getSerialPendingCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/serial-pending-count"
        );

        setSerialPendingCount(resp.data.totalPending);

    } catch (err) {

        console.log(err);

    }

};


const getSerialCompletedCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/serial-completed-count"
        );

        console.log(resp.data);

        setSerialCompletedCount(
            resp.data.totalCompleted
        );

    } catch (err) {

        console.log(err);

    }

};

const getSerialPendingOutCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/serial-pending-rma-out-count"
        );

        setSerialPendingOutCount(
            resp.data.totalPending
        );

    } catch (err) {

        console.log(err);

    }

};

const getSerialCompletedOutCount = async () => {

    try {

        const resp = await axios.get(
            "https://smazo.onrender.com/api/serial-completed-rma-out-count"
        );

        setSerialCompletedOutCount(
            resp.data.totalCompleted
        );

    } catch (err) {

        console.log(err);

    }

};



  // ✅ INITIAL LOAD
  useEffect(() => {
   // loadReminders();
    getCustomerCount();
     getPendingCount();
     getCompleteCount();
     getOutPendingCount();
    getOutCompleteCount();
    getCompleteCount();
    getSerialPendingCount();
    getSerialCompletedCount();
     getSerialPendingOutCount();
    getSerialCompletedOutCount();
    


    

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
        <h2 className="logo">SMAZO</h2>

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
         <div className="dashboard-cards">

    {/* Row 1 */}
    {/* <div className="row-cards"> */}
        <div className="card total-card">
    <h1>{totalCustomer}</h1>
    <p>Total Customers</p>
  </div>

  <div className="card-row">
    <div className="card">
      <h1>{pendingInward}</h1>
      <p>Pending Inward</p>
    </div>

    <div className="card">
      <h1>{completeInward}</h1>
      <p>Complete Inward</p>
    </div>

    <div className="card">
      <h1>{pendingOutward}</h1>
      <p>Pending Outward</p>
    </div>

    <div className="card">
      <h1>{completeOutward}</h1>
      <p>Complete Outward</p>
    </div>
  </div>

  <div className="card-row">
    <div className="card">
      <h1>{snPendingInward}</h1>
      <p>S.No Pending Inward</p>
    </div>

    <div className="card">
      <h1>{snCompleteInward}</h1>
      <p>S.No Complete Inward</p>
    </div>

    <div className="card">
      <h1>{snPendingOutward}</h1>
      <p>S.No Pending Outward</p>
    </div>

    <div className="card">
      <h1>{snCompleteOutward}</h1>
      <p>S.No Complete Outward</p>
    </div>

    </div>

</div>
          {/* Reminder Section */}
          {/* <div className="reminder-section">
            <h2>RMA-OutWard Reminders</h2>

            {reminders.length === 0 ? (
  <p>No active reminders</p>
) : ( */}

{/* <table className="table table-bordered">

  <thead>
    <tr>
      <th>RMA No</th>
      <th>Serial No</th>
      <th>Reminders</th> */}
      {/* <th>Status</th>
      <th>Action</th> */}
    {/* </tr>
  </thead>

  <tbody>

    {reminders.map((item) => (

      <tr key={item.reminder_id}>

        <td>{item.rma_no}</td>

        <td>{item.serial_no}</td>

        <td>
  {item.reminder_day} Day Reminder */}

  {/* <button
    className="btn btn-warning btn-sm ms-2"
    onClick={() =>
      nav(`/statuspage1/${item.item_id}/${item.reminder_id}`)
    }
  >
    Update Status
  </button>
</td> */}

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

      {/* </tr>

    ))}

  </tbody>

</table>

)}

    </div> */}

    {/* <div className="reminder-section">
            <h2>RMA-InWard Reminders</h2>

            {inreminders.length === 0 ? (
  <p>No active reminders</p>
) : (

<table className="table table-bordered">

  <thead>
    <tr>
      <th>RMA No</th>
      <th>Serial No</th>
      <th>Reminders</th> */}
      {/* <th>Status</th>
      <th>Action</th> */}
    {/* </tr>
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
</td> */}

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

      {/* </tr>

    ))}

  </tbody>

</table>

)}

    </div>
    </div> */}
    </div>
    </div>
    </div>

  );
};
export default Dashboard;