import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams,Link } from "react-router-dom";


function RMAInupdata() {

  const { rma_no } = useParams();

  console.log("rma_no =", rma_no);

  const [data, setData] = useState([]);

  useEffect(() => {

   axios.get(`https://smazo.onrender.com/rma-details_r/${rma_no}`)
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, [rma_no]);

const handleChange = (
  index,
  field,
  value
) => {

  const updatedData = [...data];

  updatedData[index][field] = value;

  setData(updatedData);

};

const updateData = async () => {
      console.log(data); 
  try {
    await axios.put(
      `https://smazo.onrender.com/update-rma_r/${rma_no}`,
      data
    );

    alert("Updated Successfully");
  } catch (err) {
    console.log(err);
    
  }
};

const updateStatus = async () => {
  try {
    await axios.put(
      `https://smazo.onrender.com/update-rma-status_r/${rma_no}`,
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

    <div className="card p-3 mb-3">
      <p>
        <strong>Customer :</strong> {data[0].customer_name}
      </p>
    </div>

    <table className="table table-bordered">
      <tbody>
        {data.map((item, index) => (
          <tr key={item.item_id}>
            <td>{index + 1}</td>

            <td>
              <input
                value={item.product_name || ""}
                onChange={(e) =>
                  handleChange(index, "product_name", e.target.value)
                }
              />
            </td>

            <td>
              <input
                value={item.model_number || ""}
                onChange={(e) =>
                  handleChange(index, "model_number", e.target.value)
                }
              />
            </td>

            <td>
              <input
                value={item.serial_no || ""}
                onChange={(e) =>
                  handleChange(index, "serial_no", e.target.value)
                }
              />
            </td>

            <td>
              <input
                value={item.accessory || ""}
                onChange={(e) =>
                  handleChange(index, "accessory", e.target.value)
                }
              />
            </td>

            <td>
              <input
                value={item.issues || ""}
                onChange={(e) =>
                  handleChange(index, "issues", e.target.value)
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="mt-3">
      <button
        className="btn btn-primary"
        onClick={updateData}
      >
        Update
      </button>

      <Link to="/home/home_l">
        <button className="back-btn">
          Go Back
        </button>
      </Link>
    </div>

  </div>
);
}

export default RMAInupdata;