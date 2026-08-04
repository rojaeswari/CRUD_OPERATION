import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./supporter.css";

const Supporter = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [serials, setSerials] = useState([]);
    // const [serialId, setSerialId] = useState("");
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [state, setState] = useState({
        id: "",
        product_name: "",
        model_no: "",
        serial_no: "",
        replacement_serial_no: "",
        customer_id: ""

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
                .get(`https://smazo.onrender.com/api/get1/${id}`)
                .then((resp) => {
                    setState(resp.data[0]);
                });
        }
    }, [id]);
    useEffect(() => {
        axios
            .get("https://smazo.onrender.com/api/rma-serials")
            .then((res) => {
                setSerials(res.data);
            });
    }, [])
    useEffect(() => {
        axios
            .get("https://smazo.onrender.com/api/customers")
            .then((res) => {
                setCustomers(res.data);
            })
            .catch((err) => {
                console.log("Customer fetch error:", err);
            });
    }, []);

    useEffect(() => {

        axios
            .get("https://smazo.onrender.com/api/products")
            .then((res) => {
                setProducts(res.data);
            })
            .catch((err) => {
                console.log("Product fetch error:", err);
            });

    }, []);



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!id) {
                await axios.post(
                    "https://smazo.onrender.com/api/post1",
                    state
                );

                alert("Product Added Successfully");
            } else {
                await axios.put(
                    `https://smazo.onrender.com/api/update1/${id}`,
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
                {/* Customer */}
                <label>Customer</label>

                <select
                    name="customer_id"
                    className="form-control"
                    value={state.customer_id}
                    onChange={handleInputChange}
                >
                    <option value="">
    Select Customer
</option>

{[...customers]
    .sort((a, b) =>
        a.customer_name.localeCompare(
            b.customer_name
        )
    )
    .map((customer) => (
        <option
            key={customer.id}
            value={customer.id}
        >
            {customer.customer_name}
        </option>
    ))}
                </select>

                {/* <label>ID</label>
                <input
                    type="number"
                    name="id"
                    placeholder="Enter ID"
                    value={state.id}
                    onChange={handleInputChange}
                /> */}

                <label>Product Name</label>

<select
    name="product_name"
    className="form-control"
    value={state.product_name}
    onChange={(e) => {

        const selectedProduct = products.find(
            (product) =>
                product.replacement_product_name === e.target.value
        );

        setState({
            ...state,
            product_name: e.target.value,
            replacement_serial_no:
                selectedProduct?.serial_no || ""
        });
    }}
>
    <option value="">
        Select Replacement Product
    </option>

    {products.map((product) => (
        <option
            key={product.id}
            value={product.replacement_product_name}
        >
            {product.replacement_product_name}
        </option>
    ))}
</select>

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
    className="form-control"
    placeholder="Replacement Serial No"
    value={state.replacement_serial_no}
    readOnly
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