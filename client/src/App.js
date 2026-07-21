import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Home from './pages/Home';
import AddEdit from "./pages/AddEdit";
import View from "./pages/View";
import Login from "./Login";
import Staff from "./pages/Staff";
import Password from "./pages/Password";
import Dashboard from "./pages/Dashboard";
import AddStaff from "./pages/AddStaff";
import Services from "./pages/Services";
import AddService from "./pages/AddService";
import SView from "./pages/SView";
import 'bootstrap/dist/css/bootstrap.min.css';
import Homel from "./pages/Homel";
import Add from "./pages/Add";
import Homez from "./pages/Homez";
import Out from "./pages/Out";
import Status from "./pages/Status";
import History from "./pages/History";
import History1 from "./pages/History1";
import ReminderPage from "./pages/ReminderPage";
import StatusPage from "./pages/StatusPage";
import StatusPage1 from "./pages/StatusPage1";
import HistoryPage from "./pages/HistoryPage";
import HistoryPage1 from "./pages/HistoryPages1";
import SearchModel from "./pages/SearchModel";
import RMASummary from "./pages/RMADetails1";
import RMADetails1 from "./pages/RMADetails1";
import RMADetails from "./pages/RMADetails";
import RmaOutUpdate from "./pages/RmaOutUpdate";
import RMAInupdata from "./pages/RMAInupdata";
import Support from "./pages/support";
import Supporter from "./pages/supporter";
import PendingRMA from "./pages/PendingRMA";
import TotalRMAOut from "./pages/TotalRMAOut";
import SerialPendingRMA from "./pages/SerialPendingRMA";
import SerialRMAOut from "./pages/SerialRMAOut";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ToastContainer position="top-center" />

        <Routes>
          
          <Route path="/" element={<Login />} />
         <Route path="/home"element={<PrivateRoute> <Home /></PrivateRoute> }/>
          <Route path="/home/home_l" element={<PrivateRoute><Homel /></PrivateRoute>} />
          <Route path="/home/home_z" element={<PrivateRoute><Homez /></PrivateRoute>} />
          <Route path="/home/post" element={<PrivateRoute><AddEdit /></PrivateRoute>} />
          <Route path="/home/staff" element={<PrivateRoute><Staff /></PrivateRoute>} />
          <Route path="/home/addstaff" element={<PrivateRoute><AddStaff /></PrivateRoute>} />
          <Route path="/home/update/:id" element={<PrivateRoute><AddEdit /></PrivateRoute>} />
          <Route path="/home/View/:id" element={<PrivateRoute><View /></PrivateRoute>} />
          <Route path="/home/services" element={<PrivateRoute><Services /></PrivateRoute>} />
          <Route path="/home/addservice" element={<PrivateRoute><AddService /></PrivateRoute>} />
          <Route path="/home/update_ser/:id" element={<PrivateRoute><AddService /></PrivateRoute>} />
          <Route path="/home/SView/:id" element={<PrivateRoute><SView /></PrivateRoute>} />
          <Route path="/home/Add" element={<PrivateRoute><Add /></PrivateRoute>} />
          <Route path="/home/update_P/:id" element={<PrivateRoute><Add /></PrivateRoute>} />
          <Route path="/home/pdf/:id" element={<PrivateRoute><Add /></PrivateRoute>} />
          <Route path="/home/Out" element={<PrivateRoute><Out /></PrivateRoute>} />
          <Route path="/home/update_o/:id" element={<PrivateRoute><Out /></PrivateRoute>} />

          {/* <Route path="/home/post1" element={<supporter/>}/>
          <Route path="/home/updata1" element={<supporter/>}/>
          <Route path="/home/get" element={<support/>}/> */}
          <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
<Route path="/supporter" element={<PrivateRoute><Supporter /></PrivateRoute>} />
<Route path="/supporter/:id" element={<PrivateRoute><Supporter /></PrivateRoute>} />
<Route
    path="/pending-rma"
    element={<PrivateRoute><PendingRMA /></PrivateRoute>}
/>
<Route
    path="/completed-rma"
    element={<PrivateRoute><PendingRMA /></PrivateRoute>}/>

    <Route path="/pending-rma-out" element={<PrivateRoute><TotalRMAOut /></PrivateRoute>} />
<Route path="/completed-rma-out" element={<PrivateRoute><TotalRMAOut /></PrivateRoute>} />


<Route
    path="/serial-pending-rma"
    element={<PrivateRoute><SerialPendingRMA /></PrivateRoute>}
/>

<Route
    path="/serial-completed-rma"
    element={<PrivateRoute><SerialPendingRMA /></PrivateRoute>}
/>


<Route
    path="/serial-pending-rma-out"
    element={<PrivateRoute><SerialRMAOut /></PrivateRoute>}
/>

<Route
    path="/serial-completed-rma-out"
    element={<PrivateRoute><SerialRMAOut /></PrivateRoute>}
/>
          
          <Route
            path="/home/status/:id"
            element={<PrivateRoute><Status /></PrivateRoute>}
          />
          <Route path="/home/reminder/:id" element={<PrivateRoute><ReminderPage /></PrivateRoute>} />

        {/* 📜 History Page */}
         <Route
          path="/status-history_lsr/:item_id"
          element={<PrivateRoute><History /></PrivateRoute>}
        />
        <Route
          path="/status-history_ls/:item_id"
          element={<PrivateRoute><History1 /></PrivateRoute>}
        />

        <Route
          path="/serial-history/:serial_no"
          element={<PrivateRoute><History1 /></PrivateRoute>}
        />

        <Route path="/statuspage/:item_id" element={<PrivateRoute><StatusPage /></PrivateRoute>} />
        <Route path="/statuspage1/:item_id" element={<PrivateRoute><StatusPage1 /></PrivateRoute>} />


          <Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
          <Route path="/staff/password/:id" element={<PrivateRoute><Password /></PrivateRoute>} />

           <Route path="/statuspage/:item_id/:reminder_id" element={<PrivateRoute><StatusPage /></PrivateRoute>} />
           <Route path="/update-status_ls/:item_id" element={<PrivateRoute><StatusPage1 /></PrivateRoute>} />
           <Route
  path="/statuspage1/:item_id/:reminder_id"
  element={<PrivateRoute><StatusPage1 /></PrivateRoute>}
/>
           <Route
  path="/history/:rma_id"
  element={<PrivateRoute><HistoryPage /></PrivateRoute>}

/>
          <Route
  path="/history_l/:rma_id"
  element={<PrivateRoute><HistoryPage1 /></PrivateRoute>}/>
  <Route
  path="/search-model/:model_number"
  element={<PrivateRoute><SearchModel /></PrivateRoute>}

/>
<Route path="/rma-summary" element={<PrivateRoute><RMASummary/></PrivateRoute>}/>
<Route path="/rma-details/:customer_id/:model_number" element={<PrivateRoute><RMASummary/></PrivateRoute>}/>
<Route
  path="/rma-details_r/:rma_no"
  element={<PrivateRoute><RMADetails /></PrivateRoute>}
/>
<Route path="/rma-details/:rma_no" element={<PrivateRoute><RMADetails1/></PrivateRoute>}/>
<Route path="/update-rma-status_l/:rma_no" element={<PrivateRoute><RMADetails/></PrivateRoute>}/>
<Route path="/update-rma/:rma_no" element={<PrivateRoute><RmaOutUpdate/></PrivateRoute>}/>

<Route path="/update-rma1/:rma_no" element={<PrivateRoute><RMAInupdata/></PrivateRoute>}/>
{/* <Route path="/pending-serials" element={<DashPending/>}/> */}
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;