import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";


function RMADetails1() {

  const { rma_no } = useParams();

  console.log("rma_no =", rma_no);

  const [data, setData] = useState([]);

  useEffect(() => {

    axios
      .get(`https://smazo.onrender.com/rma-details/${rma_no}`)
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, [rma_no]);



  const updateStatus = async () => {

    try {

      await axios.put(
        `https://smazo.onrender.com/update-rma-status/${rma_no}`,
        {
          status: "Completed"
        }
      );

      alert("RMA Completed");

      window.location.reload();

    } catch (err) {

      console.log(err);

      alert("Update Failed");

    }

  };

  if (data.length === 0) {
    return <h4>No Data Found</h4>;
  }

  return (
    <div className="container mt-4">

      <h3>RMA Details</h3>

      {/* Header Details */}
      <div className="card p-3 mb-3">
        <p>
          <strong>Customer :</strong>{" "}
          {data[0].center_name}
        </p>


      </div>

      {/* <div className="mb-3">

    <button
        className="btn btn-success"
        onClick={updateStatus}
    >
        Complete RMA
    </button>

</div> */}

      {/* Serial Details */}
      <table className="table table-bordered">

        <thead>
          <tr>

            <th>S.No</th>
            <th>product Name</th>
            <th>model Number</th>
            <th>quantity</th>
            <th>Serial No</th>
            <th>Accessory</th>
            <th>Issues</th>
            <th>status update</th>
            <th>Status History</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={item.serial_no || index}>
              <td>{index + 1}</td>
              <td>{item.product_name}</td>
              <td>{item.model_number}</td>
              <td>
                1
              </td>
              <td>{item.serial_no}</td>
              <td>{item.accessory}</td>
              <td>{item.issues}</td>

              <td>
                <Link

                  to={`/statuspage1/${item.item_id}`}
                >
                  status
                </Link>
              </td>



              <td>
              
              
                  <Link to={`/serial-history/${item.serial_no}`}>
                      View
                  </Link>
              </td>



            </tr>
          ))}
        </tbody>

      </table>
      <Link to="/home/home_z">
        <button className="back-btn">
          Go Back
        </button>
      </Link>

    </div>
  );
}

export default RMADetails1;