import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./supporter.css";

const Supporter = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [serials, setSerials] = useState([]);
    // const [serialId, setSerialId] = useState("");

    const [state, setState] = useState({
        id: "",
        product_name: "",
        model_no: "",
        serial_no: "",
        replacement_serial_no: ""

    });

    const handleInputChange = (e) => {
    const { name, value } = e.target;

    setState({
        ...state,
        [name]: value,
    });
};

    useEffect(() => {
        if (id) {
            axios
                .get(`http://localhost:5000/api/get1/${id}`)
                .then((resp) => {
                    setState(resp.data[0]);
                });
        }
    }, [id]);
    useEffect(() => {
        axios
            .get("http://localhost:5000/api/rma-serials")
            .then((res) => {
                setSerials(res.data);
            });
    }, [])





    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!id) {
                await axios.post(
                    "http://localhost:5000/api/post1",
                    state
                );

                alert("Product Added Successfully");
            } else {
                await axios.put(
                    `http://localhost:5000/api/update1/${id}`,
                    state
                );

                alert("Product Updated Successfully");
            }

            navigate("/support");

        } catch (err) {
            console.log(err);
            alert("Save Failed");
        }
    };

    return (
        <div className="form-container">

            <h2>Add Product</h2>

            <form onSubmit={handleSubmit}>

                {/* <label>ID</label>
                <input
                    type="number"
                    name="id"
                    placeholder="Enter ID"
                    value={state.id}
                    onChange={handleInputChange}
                /> */}

                <label>Product Name</label>
                <input
                    type="text"
                    name="product_name"
                    placeholder="Enter Product Name"
                    value={state.product_name}
                    onChange={handleInputChange}
                />

                <label>Model No</label>
                <input
                    type="text"
                    name="model_no"
                    placeholder="Enter Model No"
                    value={state.model_no}
                    onChange={handleInputChange}
                />

                <label>Serial No</label>

                <select
                    name="serial_no"
                    className="form-control"
                    value={state.serial_no}
                    onChange={handleInputChange}
                >
                    <option value="">
                        Select Serial No
                    </option>

                    {serials.map((item) => (
                        <option
                            key={item.id}
                            value={item.serial_no}
                        >
                            {item.serial_no}
                        </option>
                    ))}
                </select>
                 <label>Replacement Serial No</label>

                <input
                    type="text"
                    name="replacement_serial_no"
                    placeholder="Enter Replacement Serial No"
                    value={state.replacement_serial_no}
                    onChange={handleInputChange}
                />




                <div className="btn-group">


                    <button type="submit">
                        {id ? "Update" : "Save"}
                    </button>
                    {/* <button  type="submit" onClick={()=>navigate("/home/home_l")}>
                        {id ? "Update" : "Save"}
                    </button> */}


                    <button
                        type="button"
                        onClick={() => navigate("/support")}
                    >
                        Go Back
                    </button>
                </div>

            </form>

        </div>
    );
};

export default Supporter;