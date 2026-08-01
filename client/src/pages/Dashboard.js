import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaHome, FaUserTie, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
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
  const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("id");

  nav("/");
};

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

  const filteredReminders = inreminders.filter((item) => {

  const text = search.toLowerCase();

  return (
    String(item.rma_no || "")
      .toLowerCase()
      .includes(text) ||

    String(item.product_name || "")
      .toLowerCase()
      .includes(text) ||

    String(item.serial_no || "")
      .toLowerCase()
      .includes(text)
  );

});

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
            <Link to="/home/services">
              <FaUserTie /> Service
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
  <button className="logout-btn" onClick={logout}>
    <FaSignOutAlt /> Logout
  </button>
</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-cards">
          
          {/* Customer Card */}
         <div className="dashboard-cards">

    {/* Row 1 */}
    <div className="row-cards first-row">
        <div className="total-card">
            <h2>{count}</h2>
            <p>Total Customers</p>
        </div>
    </div>
     <div className="row-cards">
</div>

    {/* Row 2 */}
    <div className="row-cards">

        <Link to="/pending-rma">
            <div className="total-card">
                <h2>{pencount}</h2>
                <p>Pending Inward</p>
            </div>
        </Link>

        <Link to="/completed-rma">
            <div className="total-card">
                <h2>{comcount}</h2>
                <p>Complete Inward</p>
            </div>
        </Link>

        <Link to="/serial-pending-rma">
            <div className="total-card">
                <h2>{serialPendingCount}</h2>
                <p>S.No Pending Inward</p>
            </div>
        </Link>
        <Link to="/serial-completed-rma">
            <div className="total-card">
                <h2>{serialCompletedCount}</h2>
                <p>S.No Complete Inward</p>
            </div>
        </Link>

        {/* <Link to="/pending-rma-out">
            <div className="total-card">
                <h2>{outPenCount}</h2>
                <p>Pending Outward</p>
            </div>
        </Link> */}
{/* 
        <Link to="/completed-rma-out">
            <div className="total-card">
                <h2>{outComCount}</h2>
                <p>Complete Outward</p>
            </div>
        </Link> */}

    </div>

    {/* Row 3 */}
    <div className="row-cards">

        {/* <Link to="/serial-pending-rma">
            <div className="total-card">
                <h2>{serialPendingCount}</h2>
                <p>S.No Pending Inward</p>
            </div>
        </Link> */}
         <Link to="/pending-rma-out">
            <div className="total-card">
                <h2>{outPenCount}</h2>
                <p>Pending Outward</p>
            </div>
        </Link>
        
        <Link to="/completed-rma-out">
            <div className="total-card">
                <h2>{outComCount}</h2>
                <p>Complete Outward</p>
            </div>
        </Link>

        {/* <Link to="/serial-completed-rma">
            <div className="total-card">
                <h2>{serialCompletedCount}</h2>
                <p>S.No Complete Inward</p>
            </div>
        </Link> */}

        <Link to="/serial-pending-rma-out">
            <div className="total-card">
                <h2>{serialPendingOutCount}</h2>
                <p>S.No Pending Outward</p>
            </div>
        </Link>

        <Link to="/serial-completed-rma-out">
            <div className="total-card">
                <h2>{serialCompletedOutCount}</h2>
                <p>S.No Complete Outward</p>
            </div>
        </Link>

    </div>

</div>
    <div className="row justify-content-center">

    <div className="col-lg-10">
    <div className="card">

    <div className="card-body">
    <div
  className="card-header d-flex justify-content-between align-items-center"
  style={{ cursor: "pointer" }}
  onClick={() => setOpen(!open)}
>
  <h5 className="mb-0">🔔 RMA-Inward Reminders</h5>

  <div
  onClick={() => setOpen(!open)}
  style={{ cursor: "pointer" }}
>
  <span className="badge bg-danger me-2">
    {inreminders.length} Pending
  </span>

  {open ? "▲" : "▼"}
</div>
</div>
{open && (

<div className="card-body">
        <input
      type="text"
      className="form-control mb-3"
      placeholder="Search RMA / Product / Serial"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

<div className="table-responsive">

<table
    className="table table-sm table-hover align-middle"
    style={{ fontSize: "13px" }}
>

  <thead className="table-dark">
    <tr>
      <th>RMA No</th>
      <th>Product Name</th>
      <th>Model Number</th>
      <th>Serial No</th>
      <th>Reminders</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>

    {filteredReminders.map((item) => (

      <tr key={item.reminder_id}>

        <td>{item.rma_no}</td>
        <td>{item.product_name}</td>
        <td>{item.model_number}</td>
        <td>{item.serial_no}</td>

        <td>
          Day-{item.reminder_day}
        </td>

        <td>

          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() =>
              nav(`/rma-details_r/${item.rma_no}`, {
                state: {
                  from: "/Dashboard"
                }
              })
            }
          >
            View
          </button>

          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() =>
              nav(
                `/statuspage/${item.item_id}/${item.reminder_id}`
              )
            }
          >
            Update
          </button>

        </td>

      </tr>

    ))}

  </tbody>

</table>

</div>

</div>

)}

</div>

</div>

</div>
         
    </div>
    </div>
   
     </div>
    </div>
    

  );
};

export default Dashboard;