import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams,Link } from "react-router-dom";


function RMADetails() {

  const { rma_no } = useParams();

  console.log("rma_no =", rma_no);

  const [data, setData] = useState([]);
     const [supporterData, setSupporterData] = useState([]);
      const [loading, setLoading] = useState(true);

  useEffect(() => {

    axios
      .get(`http://localhost:5000/rma-details_r/${rma_no}`)
      .then((res) => {
        console.log(res.data);
        setData(res.data);
         setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });

  }, [rma_no]);

  if (loading) {
    return <h4>Loading...</h4>;
  }

  if (data.length === 0) {
    return <h4>No Data Found</h4>;
  }

 const loadSupporter = async (serialNo) => {

        const res = await axios.get(
            `http://localhost:5000/api/supporter-by-serial/${serialNo}`
        );
        
           console.log(res.data);  

        setSupporterData(res.data);
    };


const updateStatus = async () => {

    try {

        await axios.put(
            `http://localhost:5000/update-rma-status/${rma_no}`,
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
          {data[0].customer_name}
        </p>
      </div>

     {supporterData.length > 0 && (
    <div className="mt-4">

        <h3>Supporter Details</h3>

        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Product Name</th>
                    <th>Model No</th>
                    <th>Serial No</th>
                     <th> Replacement Serial No</th>

                </tr>
            </thead>

            <tbody>
                {supporterData.map((row, index) => (
                    <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.product_name}</td>
                        <td>{row.model_no}</td>
                        <td>{row.serial_no}</td>
                        <td>{row.replacement_serial_no}</td>
                    </tr>
                ))}
            </tbody>
        </table>

    </div>
)}



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
            <th>status</th>
            <th> Status Update</th>
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
  {index === 0 ||
  data[index - 1].id !== item.id
    ? item.quantity_no
    : ""}
</td>
              <td>{item.serial_no}</td>
              <td>{item.accessory}</td>
              <td>{item.issues}</td>


              <td>
    <button
        onClick={() => loadSupporter(item.serial_no)}
    >
        View
    </button>
</td>


<td>
                <Link

                to={`/statuspage/${item.item_id}`}
              >
                status
              </Link>
              </td>

<td>


    <Link to={`/serial-history/${item.serial_no}`}>
        View
    </Link>
</td>









              {/* <td> <Link

                to={`/status-history_lsr/${item.item_id}`}
              >
                View
              </Link></td> */}
            </tr>
          ))}
        </tbody>

      </table>

      
      <Link to="/home/home_l">
                          <button className="back-btn">
                              Go Back
                          </button>
                      </Link>

    </div>
  );
}

export default RMADetails;