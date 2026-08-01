const express = require("express");
const app = express();

const bodyParser = require("body-parser");
// const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");


// middleware FIRST
// app.use(cors({
//     origin: "http://localhost:3000"
// }));

// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // /require("./cron");

// // database
// const db = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "Mysql@123",
//     database: "crud_contact",
//     port: 3307
// })
const { Pool } = require("pg");
require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
app.get("/test-neon", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// db.query(
//     "SELECT DATABASE() AS db",
//     (err, result) => {
//         console.log("CURRENT DATABASE =", result);
//     }
// );

function generateReminders_l(item_id) {

    const reminderDays = [3, 5, 7, 10, 13, 15, 17, 20, 23, 25, 27, 30, 33, 35, 37, 40];

    reminderDays.forEach(day => {

        db.query(
            `INSERT INTO rma_reminders
            (rma_item_id, reminder_day)
            VALUES ($1,$2)`,
            [item_id, day],
            (err) => {

                if (err) {
                    console.log(err);
                }

            }
        );

    });

}

function generateReminders(item_id) {

    const reminderDays = [3, 5, 7, 10, 13, 15, 17, 20, 23, 25, 27, 30, 33, 35, 37, 40];

    reminderDays.forEach(day => {

        db.query(
            `INSERT INTO rma_reminders1
            (rma_item_id, reminder_day)
            VALUES ($1,$2)`,
            [item_id, day],
            (err) => {

                if (err) {
                    console.log(err);
                }

            }
        );

    });

}


// login api
app.post("/login", (req, res) => {
    console.log("LOGIN REQUEST:", req.body);
    const { username, password } = req.body;

    const sql =
        "SELECT id,username,role FROM login_user WHERE username=$1 AND password=$2";

    db.query(
        sql,
        [username, password],
        (err, data) => {

            if (err) {
                console.error("LOGIN ERROR:", err);

                return res.status(500).json("Error");

            }
            console.log("LOGIN DETAILS:", data.rows);


            if (data.rows.length > 0) {
                return res.json({
                    message: "Login Successfully",
                    role: data.rows[0].role,
                    id: data.rows[0].id,
                    username: data.rows[0].username,
                });
            } else {
                return res.json("No Record");
            }
        }
    );
});

// app.get("/api/get_product", (req, res) => {

//     const sqlGet =
//         SELECT * FROM rma_entry1;

//     db.query(sqlGet, (error, result) => {
//         res.send(result);
//     });
// });

// get api
app.get("/api/get", (req, res) => {

    const sqlGet =
        "SELECT id, customer_name, company_name, phone_no FROM customer_details";

    db.query(sqlGet, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).json(error);
        }
        res.json(result.rows);
    });
});

app.get("/api/staff", (req, res) => {

    const sqlGet =
        "SELECT id, username,role from login_user";

    db.query(sqlGet, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).json(error);
        }
        res.json(result.rows);
    });
});

app.get("/api/service", (req, res) => {

    const sqlGet =
        "SELECT id, servicer_name, center_name, phone_no FROM services_details";

    db.query(sqlGet, (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).json(error);
        }
        res.json(result.rows);
    });
});

app.delete("/api/remove/:id", (req, res) => {
    const id = req.params.id;
    const sqlRemove =
        "Delete from customer_details where id=$1 RETURNING *";
    db.query(sqlRemove, [id], (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        console.log(result.rows);
        console.log(result.rows[0]);
        if (result.rowCount === 0) {
            return res.status(404).send("customer not found")
        }

        res.send("Customer deleted successfully");
    });
});

app.delete("/api/ser_remove/:id", (req, res) => {
    const id = req.params.id;
    const sqlRemove =
        "Delete from services_details where id=$1 RETURNING *";
    db.query(sqlRemove, [id], (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        console.log(result.rows);
        console.log(result.rows[0]);
        if (result.rowCount === 0) {
            return res.status(404).send("service center not found")
        }
        res.send("Service deatails deleted successfully");
    });
});

// post api
app.post("/api/post", (req, res) => {

    const {
        customer_name,
        company_name,
        address,
        phone_no,
        gst_no,
        location,
        email
    } = req.body;

    // Required validation
    if (
        !customer_name ||
        !address ||
        !phone_no ||
        !location
    ) {
        return res.status(400).json({
            message: "Please fill required fields"
        });
    }

    const sql = `
    INSERT INTO customer_details
    (
        customer_name,
        company_name,
        address,
        phone_no,
        gst_no,
        location,
        email
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;

    db.query(
        sql,
        [
            customer_name,
            company_name,
            address,
            phone_no,
            gst_no,
            location,
            email
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Database Error");
            }

            res.json({
                message: "Customer Added Successfully",
                customer: result.rows[0]
            });
        }
    );
});

app.post("/api/service_d", (req, res) => {

    const {
        servicer_name,
        center_name,
        address,
        phone_no,
        mobile,
        location,
        email
    } = req.body;

    // Required validation
    if (
        !servicer_name ||
        !center_name ||
        !address ||
        !phone_no ||
        !mobile ||
        !location
    ) {
        return res.status(400).json({
            message: "Please fill required fields"
        });
    }

    const sql = `
    INSERT INTO services_details
    (
        servicer_name,
        center_name,
        address,
        phone_no,
        mobile,
        location,
        email
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;

    db.query(
        sql,
        [
            servicer_name,
            center_name,
            address,
            phone_no,
            mobile,
            location,
            email
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Database Error");
            }

            res.json("Service Added Successfully");
        }
    );
});


app.post("/api/addstaff", (req, res) => {

    const {
        username,
        password,
        role
    } = req.body;

    // Required validation
    if (
        !username ||
        !password ||
        !role
    ) {
        return res.status(400).json({
            message: "Please fill required fields"
        });
    }

    const sql = `
    INSERT INTO login_user
    (
        username,
        password,
        role
    )
    VALUES ($1, $2, $3)
    `;

    db.query(
        sql,
        [
            username,
            password,
            role
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Database Error");
            }

            res.json("Staff Added Successfully");
        }
    );
});


app.get(
    "/api/password/:id",
    (req, res) => {

        const { id } =
            req.params;

        const sql =
            "SELECT username FROM login_user WHERE id=$1";

        db.query(
            sql,
            [id],
            (error, result) => {

                if (error) {
                    return res.status(500).json(error);
                }

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                res.json(result.rows[0]);
            }
        );
    }
);
app.put(
    "/api/password/:id",
    (req, res) => {

        const { id } =
            req.params;

        const { password } =
            req.body;

        const sqlUpdate =
            `UPDATE login_user
             SET password=$1
             WHERE id=$2`;

        db.query(
            sqlUpdate,
            [password, id],
            (error, result) => {

                if (error) {
                    console.log(error);

                    return res
                        .status(500)
                        .send(error);
                }

                res.json({
                    message:
                        "Password Updated Successfully"
                });
            }
        );
    }
);

app.get("/api/get/:id", (req, res) => {
    const { id } = req.params;
    const sqlGet = "select  * from customer_details where id=$1";
    db.query(sqlGet, [id], (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        console.log(result.rows);

        if (result.rowCount === 0) {
            return res.status(404).send("customer not found")
        }

        res.json(result.rows[0]);
    });
});

app.get("/api/getservice/:id", (req, res) => {
    const { id } = req.params;

    const sqlGet = `
        SELECT *
        FROM services_details
        WHERE id = $1
    `;

    db.query(sqlGet, [id], (error, result) => {
        if (error) {
            console.log("GET SERVICE ERROR:", error);
            return res.status(500).json(error);
        }

        console.log("ROWS:", result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Service center not found"
            });
        }

        res.json(result.rows[0]);
    });
});

// Customer Count API
app.get(
    "/api/customerCount",
    (req, res) => {

        const sql =
            `SELECT COUNT(*) AS total
             FROM customer_details`;

        db.query(
            sql,
            (error, result) => {

                if (error) {
                    console.log(
                        error
                    );

                    return res
                        .status(500)
                        .send(error);
                }

                res.json(result.rows[0]);

            }
        );
    }
);

app.get(
    "/api/InwardCount",
    (req, res) => {

        const sql =
            `SELECT COUNT(*) AS total
FROM rma_items
WHERE TRIM(LOWER(status)) = 'pending'`;

        db.query(
            sql,
            (error, result) => {

                if (error) {
                    console.log(
                        error
                    );

                    return res
                        .status(500)
                        .send(error);
                }

                res.json(result.rows[0]);
            }
        );
    }
);

app.put("/api/update/:id", (req, res) => {
    const { id } = req.params;
    const {
        customer_name,
        company_name,
        address,
        phone_no,
        gst_no,
        location,
        email
    } = req.body;
    const sqlUpdate = "update customer_details set customer_name=$1,company_name=$2,address=$3,phone_no=$4,gst_no=$5,location=$6,email=$7 where id=$8 RETURNING *;";
    db.query(sqlUpdate, [customer_name, company_name, address, phone_no, gst_no, location, email, id], (error, result) => {
        if (error) {
            console.log(error);
            return res
                .status(500)
                .send(error);
        }
        res.json(result.rows[0]);
    });
});

app.put("/api/update_ser/:id", (req, res) => {
    const { id } = req.params;
    const {
        servicer_name,
        center_name,
        address,
        phone_no,
        mobile,
        location,
        email
    } = req.body;
    const sqlUpdate = "update services_details set servicer_name=$1,center_name=$2,address=$3,phone_no=$4,mobile=$5,location=$6,email=$7 where id=$8 RETURNING *;";
    db.query(sqlUpdate, [servicer_name, center_name, address, phone_no, mobile, location, email, id], (error, result) => {
        if (error) {
            console.log(error);
            return res
                .status(500)
                .send(error);
        }
        res.json(result.rows[0]);
    });
});

// RMA Entry

app.get("/api/get_P", (req, res) => {
    const sql = `SELECT
    MIN(r.id) AS id,
    r.rma_no,
    MAX(c.customer_name) AS customer_name,
    MIN(r.product_name) AS product_name,
    MIN(r.model_number) AS model_number,
    MIN(r.quantity_no) AS quantity_no,
    MIN(r.status) AS status,
    MIN(r.entry_date) AS entry_date
FROM rma_entry1 r
JOIN customer_details c
ON r.customer_id = c.id
GROUP BY r.rma_no
ORDER BY r.rma_no ASC`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res
                .status(500)
                .send(error);
        }
        console.log(result.rows);
        res.json(result.rows);
    });
});

// get single data
app.get("/api/get_P/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
SELECT
customer_id,
product_name,
model_number,
quantity_no,
serial_no,
accessory,
customer_dc_no,
issues,
reminder_date
FROM rma_entry1
WHERE id=$1
`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
        }
        res.json(result.rows);
    });
});

app.get("/test", (req, res) => {
    res.send("API Working");
});




app.get("/api/customers", (req, res) => {

    const sql = `
        SELECT id, customer_name
        FROM customer_details
        ORDER BY customer_name ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });

});

app.get("/api/pdf/:rmaNo", (req, res) => {

    const rmaNo = req.params.rmaNo;

    const sql = `
    SELECT
    r.id,
    r.rma_no,
    r.product_name,
    r.model_number,
    r.quantity_no,
    r.reminder_date,
    r.created_by as created_by_name,
    TO_CHAR(r.entry_date,'DD-MM-YYYY')AS entry_date,
    c.customer_name,
    c.company_name,
    c.phone_no,
    c.email,
    c.address,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
FROM rma_entry1 r
JOIN customer_details c
    ON r.customer_id = c.id
JOIN rma_items i
    ON r.id = i.rma_id
WHERE r.rma_no = $1
    `;

    db.query(sql, [rmaNo], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        console.log("PDF DATA:", result);

        res.json(result.rows);

    });

});

app.put(
    "/api/service-complete/:id",
    (req, res) => {

        const { id } =
            req.params;

        const sql =
            `UPDATE customer_details
             SET status='completed'
             WHERE id=$1`;

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {
                    return res
                        .status(500)
                        .json(err);
                }

                res.json({
                    message:
                        "Service Completed"
                });
            }
        );
    }
);




app.get(
    "/api/rma/:id",
    (req, res) => {

        const { id }
            = req.params;

        const sql =
            `
SELECT r.*,
c.customer_name
FROM rma_entry1 r
JOIN customer_details c
ON r.customer_id=c.id
WHERE r.id=$1
`;

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {
                    return res
                        .status(500)
                        .json(err);
                }

                res.json(result.rows);

            });
    });



const cron = require("node-cron");


//RMA OUT

app.get("/api/get_o", (req, res) => {
    const sql = `SELECT
    MIN(r.id) AS id,
    r.rma_no,
    MAX(c.center_name) AS center_name,

    MIN(i.product_name) AS product_name,
    MIN(i.model_number) AS model_number,

    MAX(r.quantity_no) AS quantity_no,
    MAX(r.entry_date) AS entry_date,
    MAX(r.status) AS status

FROM rma_out r

JOIN services_details c
    ON r.services_id = c.id

JOIN rma_items1 i
    ON r.id = i.rma_id

GROUP BY r.rma_no

ORDER BY r.rma_no ASC`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.json(result.rows);
    });
});

// get single data
app.get("/api/get_o/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
    SELECT
        r.id,
        r.rma_no,
        r.services_id,
        r.quantity_no,
        r.entry_date,
        r.reminder_date,
        r.status,

        i.id AS item_id,
        i.product_name,
        i.model_number,
        i.serial_no,
        i.accessory,
        i.issues,

        s.center_name,
        s.phone_no,
        s.email,
        s.address

    FROM rma_out r

    JOIN services_details s
        ON r.services_id = s.id

    JOIN rma_items1 i
        ON r.id = i.rma_id

    WHERE r.id = $1

    ORDER BY i.id;
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("GET ERROR:", err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });
});

app.get("/test", (req, res) => {
    res.send("API Working");
});


app.get("/api/services", (req, res) => {
    const sql = `
        SELECT id, servicer_name
        FROM services_details
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });
});



app.post("/complete-rma", (req, res) => {

    const { id } = req.body;

    db.query(
        `
 UPDATE rma_entry1
 SET status='Completed'
 WHERE id=$1
 `,
        [id],
        (err) => {

            if (err) {
                return res.send(err);
            }

            res.send("Completed");

        });

});


app.get("/history", (req, res) => {

    db.query(
        `
    SELECT
      sh.history_id,
      sh.rma_id,
      c.customer_name,
      sh.status_text,
      sh.updated_date
    FROM status_history sh
    JOIN rma_entry1 r
      ON sh.rma_id = r.id
    JOIN customer_details c
      ON r.customer_id = c.id
    ORDER BY sh.updated_date DESC
    `,
        (err, result) => {

            if (err) {
                return res.send(err);
            }

            res.json(result.rows);

        }
    );

});

app.get("/rma-list", (req, res) => {

    db.query(
        `
    SELECT
      r.id,
      c.customer_name,
      c.phone,
      r.entry_date,
      r.reminder_date,
      r.status
    FROM rma_entry1 r
    JOIN customer_details c
      ON r.customer_id = c.id
    ORDER BY r.id ASC
    `,
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result.rows);

        }
    );

});

app.get("/history/:rma_id", (req, res) => {

    const rma_id = req.params.rma_id;

    const sql = `
    SELECT
      sh.history_id,
      sh.rma_id,
      c.customer_name,
      sh.status_text,
      sh.updated_date
    FROM status_history sh
    JOIN rma_entry1 r
      ON sh.rma_id = r.id
    JOIN customer_details c
      ON r.customer_id = c.id
    WHERE sh.rma_id = ?
    ORDER BY sh.updated_date DESC
  `;

    db.query(sql, [rma_id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

app.get("/get-customers", (req, res) => {

    const sql = "SELECT id, customer_name FROM customer_details";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows);
    });

});

//RMA OUT reminder


app.post("/api/entry_out", (req, res) => {

    const {
        services_id,
        entry_date,
        items,
        created_by
    } = req.body;

    console.log("REQ BODY =", req.body);
    console.log("services_id:", services_id);
    console.log("entry_date:", entry_date);
    console.log("items:", items);
    if (!items || items.length === 0) {
        return res.status(400).json({
            message: "No serial numbers added"
        });
    }
    const serials = items.map(item => item.serial_no);
    const uniqueSerials = [...new Set(serials)];

    if (serials.length !== uniqueSerials.length) {
        return res.status(400).json({
            message: "Duplicate serial numbers in current entry"
        });
    }

    // const checkSql = `
    //     SELECT serial_no
    //     FROM rma_items1
    //     WHERE serial_no =ANY ($1)
    //     AND status <> 'Completed'
    // `;

    // db.query(checkSql, [serials], (err, result) => {

    //     if (err) {
    //         console.log("CHECK SERIAL ERROR:", err);
    //         return res.status(500).json(err);
    //     }

    //     if (result.rows.length > 0) {
    //         return res.status(400).json({
    //             success: false,
    //             message: `Serial No already exists: ${
    //                 result.rows.map(r => r.serial_no).join(", ")
    //             }`
    //         });
    //     }

    //     // ONLY IF NO DUPLICATES
    //     saveRma();

    // });
    saveRma();
    function saveRma() {


        const getRmaNo = `
SELECT COALESCE(MAX(rma_no),1000)+1 AS "rmaNo"
FROM rma_out
`;

        db.query(getRmaNo, (err, result) => {
            if (err) {
                console.log("GET RMA ERROR:", err);
                return res.status(500).json(err);
            }


            const rmaNo = result.rows[0].rmaNo;


            const reminderDate = new Date(entry_date);
            reminderDate.setDate(reminderDate.getDate() + 3);

            // 1. Insert into rma_out (MASTER)
            const sql = `
            INSERT INTO rma_out
            (rma_no, services_id,quantity_no,reminder_date, entry_date,status,created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7)RETURNING id
        `;

            db.query(sql, [
                rmaNo,
                services_id,

                items.length,

                reminderDate,
                entry_date,
                "pending",
                created_by
            ], (err, result) => {

                if (err) {
                    console.log("RMA_OUT INSERT ERROR:", err);
                    return res.status(500).json(err);
                }
                const rmaId = result.rows[0].id;

                // 2. Insert multiple serials (CHILD TABLE)
                const insertItems = items.map(item => {
                    return new Promise((resolve, reject) => {
                        db.query(
                            `INSERT INTO rma_items1 
                        (rma_id, serial_no, accessory, issues, product_name,model_number,status)
                        VALUES ($1,$2,$3,$4,$5,$6,$7)RETURNING id`,
                            [
                                rmaId,
                                item.serial_no,

                                item.accessory,
                                item.issues,
                                item.product_name,
                                item.model_number,

                                "pending"
                            ],
                            (err, result) => {
                                if (err) return reject(err);
                                resolve(result);
                            }
                        );
                    });
                });

                Promise.all(insertItems)
                    .then(() => {
                        res.json({
                            success: true,
                            rma_no: rmaNo
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json(err);
                    });

            });
        });
    }
});



app.post("/complete-rma_l", (req, res) => {

    const { id } = req.body;

    db.query(
        `
 UPDATE rma_out
 SET status='Completed'
 WHERE id=$1
 `,
        [id],
        (err) => {

            if (err) {
                return res.send(err);
            }

            res.send("Completed");

        });

});


app.get("/history_l", (req, res) => {

    db.query(
        `
    SELECT
      sh.history_id,
      sh.rma_id,
      c.center_name,
      sh.status_text,
      sh.updated_date
    FROM status_history_l sh
    JOIN rma_out r
      ON sh.rma_id = r.id
    JOIN services_details c
      ON r.services_id = c.id
    ORDER BY sh.updated_date DESC
    `,
        (err, result) => {

            if (err) {
                return res.send(err);
            }

            res.send(result);

        }
    );

});

app.get("/rma_out-list", (req, res) => {

    db.query(
        `
    SELECT
      r.id,
      c.center_name,
      
      r.entry_date,
      r.reminder_date,
      r.status
    FROM rma_out r
    JOIN services_details c
      ON r.services_id = c.id
    ORDER BY r.id ASC
    `,
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result.rows);

        }
    );

});

app.get("/history_l/:rma_id", (req, res) => {

    const rma_id = req.params.rma_id;

    const sql = `
    SELECT
      sh.history_id,
      sh.rma_id,
      c.center_name,
      sh.status_text,
      sh.updated_date
    FROM status_history_l sh
    JOIN rma_out r
      ON sh.rma_id = r.id
    JOIN services_details c
      ON r.services_id = c.id
    WHERE sh.rma_id = $1
    ORDER BY sh.updated_date DESC
  `;

    db.query(sql, [rma_id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

app.get("/get-services", (req, res) => {

    const sql = "SELECT id, center_name FROM services_details";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows);
    });

});

app.get("/api/pdf1/:rmaNo", (req, res) => {

    const rmaNo = req.params.rmaNo;


    const sql = `
    SELECT
        r.id,
        r.rma_no,
        i.product_name,
        i.model_number,
        r.quantity_no,
        
        r.reminder_date,
        TO_CHAR(r.entry_date,'DD-MM-YYYY') AS entry_date,
        r.created_by,
        l.username AS created_by_name,
        c.center_name,
        c.phone_no,
        c.email,
        c.address,

        i.serial_no,
        i.accessory,
        i.issues,
        i.status

    FROM rma_out r

    JOIN services_details c
        ON r.services_id = c.id

    JOIN rma_items1 i
        ON r.id = i.rma_id
        LEFT JOIN login_user l
ON r.created_by::integer = l.id

    WHERE r.rma_no = $1
    `;


    db.query(sql, [rmaNo], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        console.log("PDF DATA:", result.rows);


        res.json(result.rows);

    });

});


app.get("/rma-summary", (req, res) => {

    const sql = `
    SELECT
      c.id AS customer_id,
      c.customer_name,
      r.product_name,
      r.model_number,
      COUNT(*) AS quantity
    FROM rma_entry1 r
    JOIN customer_details c
      ON r.customer_id = c.id
    GROUP BY
      c.id,
      c.customer_name,
      r.product_name,
      r.model_number
    ORDER BY c.customer_name
  `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("PDF SQL ERROR:", err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(result.rows);

    });

});

app.get("/rma-details/:rma_no", (req, res) => {

    const { rma_no } = req.params;
    console.log("RMA NO =", rma_no);

    const sql = `
   SELECT
    r.id,
    r.rma_no,
    c.center_name,
    i.product_name,
    i.model_number,
    r.quantity_no,
    
    r.entry_date,

    i.id AS item_id,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status

FROM rma_out r

LEFT JOIN services_details c
    ON r.services_id = c.id

LEFT JOIN rma_items1 i
    ON r.id = i.rma_id

WHERE r.rma_no = $1

ORDER BY r.id`;

    db.query(sql, [rma_no], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        console.log(result.rows);

        res.json(result.rows);

    });

});


app.put("/update-rma/:rma_no", (req, res) => {

    const rows = req.body;

    rows.forEach((item) => {

        // Update rma_out
        const sql1 = `
            UPDATE rma_out
            SET
                
                quantity_no = $1
                
            WHERE id = $2
        `;

        db.query(sql1, [

            item.quantity_no,

            item.id
        ]);

        // Update rma_items1
        const sql2 = `
            UPDATE rma_items1
            SET
            product_name = $1,
                model_number = $2,
                serial_no = $3,
                accessory = $4,
                issues = $5
            WHERE id = $6
        `;

        db.query(sql2, [
            item.product_name,
            item.model_number,
            item.serial_no,
            item.accessory,
            item.issues,
            item.item_id
        ]);
        (err, result) => {
            console.log(err);
            console.log(result);
        }

    });

    res.json({
        message: "RMA Updated Successfully"
    });

});

app.put("/update-rma1/:rma_no", (req, res) => {

    const rows = req.body;

    rows.forEach((item) => {

        // Update rma_out
        const sql1 = `
            UPDATE rma_entry1
            SET
                product_name = $1,
                model_number = $2,
                quantity_no = $3
                
            WHERE id = $4
        `;

        db.query(sql1, [
            item.product_name,
            item.model_number,
            item.quantity_no,
            item.id
        ]);

        // Update rma_items1
        const sql2 = `
            UPDATE rma_items
            SET
                serial_no = $1,
                accessory = $2,
                issues = $3
            WHERE id = $4
        `;

        db.query(sql2, [
            item.serial_no,
            item.accessory,
            item.issues,
            item.item_id
        ]);
        (err, result) => {
            console.log(err);
            console.log(result);
        }

    });

    res.json({
        message: "RMA Updated Successfully"
    });

});


app.put("/update-rma-status/:rma_no", (req, res) => {

    const { status } = req.body;
    const { rma_no } = req.params;

    const sql = `
        UPDATE rma_items1 i
         SET status = $1
        from rma_out r
            where i.rma_id = r.id
        and r.rma_no = $2
        RETURNING *;
    `;

    db.query(
        sql,
        [status, rma_no],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "All Status Updated",
                affectedRows: result.rowCount
            });

        }
    );

});

app.delete("/delete-rma/:rma_no", async (req, res) => {
    const { rma_no } = req.params;

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Delete from rma_status_history
        await client.query(
            `
            DELETE FROM rma_status_history
            WHERE rma_item_id IN (
                SELECT i.id
                FROM rma_items1 i
                JOIN rma_out r
                    ON i.rma_id = r.id
                WHERE r.rma_no = $1
            )
            `,
            [rma_no]
        );

        // Delete from rma_items1
        await client.query(
            `
            DELETE FROM rma_items1
            WHERE rma_id IN (
                SELECT id
                FROM rma_out
                WHERE rma_no = $1
            )
            `,
            [rma_no]
        );

        // Delete from rma_out
        await client.query(
            `
            DELETE FROM rma_out
            WHERE rma_no = $1
            `,
            [rma_no]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "RMA deleted successfully"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json(err);
    } finally {
        client.release();
    }
});


app.get("/reminders_ls", (req, res) => {

    const sql = `
    SELECT
        r.rma_no,
    
        i.product_name,
        i.model_number,
        r.entry_date,

        i.id AS item_id,
        i.serial_no,
        i.status,

        rm.id AS reminder_id,
        rm.reminder_day,
        rm.is_read,

        (CURRENT_DATE - r.entry_date::date) AS days_passed

    FROM rma_out r
    JOIN rma_items1 i
        ON r.id = i.rma_id

    JOIN rma_reminders1 rm
        ON rm.rma_item_id = i.id

    WHERE
        LOWER(i.status) != 'completed'
        AND rm.is_read = 0
        AND (CURRENT_DATE - r.entry_date::date) >= rm.reminder_day

    ORDER BY r.entry_date ASC,
             rm.reminder_day ASC
    `;

    db.query(sql, (err, rows) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(rows);

    });

});

// app.post("/update-status_ls/:item_id", (req, res) => {

//     const item_id = req.params.item_id;
//     console.log("PARAMS:", req.params);
//     console.log("BODY:", req.body);
//     const {
//         status,
//         status_text,
//         reminder_id,
//         updated_by
//     } = req.body;

//     console.log("item_id:", item_id);
//     console.log("reminder_id:", reminder_id);
//     console.log("body:", req.body);
//     //check before the status already completed or not
//     const checkStatusSql = `
//     SELECT status
//     FROM rma_items1
//     WHERE id = $1
// `;

//     db.query(checkStatusSql, [item_id], (err, result) => {

//         if (err) {
//             return res.status(500).json(err);
//         }

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Item not found"
//             });
//         }
//         result.rows[0]

//         if (
//             result.rows[0].status &&
//             result.rows[0].status.toLowerCase() === "completed"
//         ) {
//             return res.status(400).json({
//                 message: "Status already completed. Cannot update again."
//             });
//         }
//         // 1. update item
//         const updateSql = `
//         UPDATE rma_items1
//         SET status = COALESCE(NULLIF($1, ''), status)
//         WHERE id = $2
//     `;
//         if (!status || status.trim() === "") {
//             return res.status(400).json({
//                 message: "Please select a status"
//             });
//         }

//         db.query(updateSql, [status, item_id], (err) => {
//             if (err) return res.status(500).json(err);
//             // Check whether all serials under this RMA are completed
//             const checkSql = `
//         SELECT rma_id
//         FROM rma_items1
//         WHERE id = $1
//     `;

//             db.query(checkSql, [item_id], (err, result) => {

//                 if (err) return res.status(500).json(err);

//                 const rmaId = result.rows[0].rma_id;

//                 const pendingSql = `
//             SELECT COUNT(*) AS pendingcount
//             FROM rma_items1
//             WHERE rma_id = $1
//             AND status <> 'Completed'
//         `;

//                 db.query(pendingSql, [rmaId], (err, result) => {

//                     if (err) return res.status(500).json(err);

//                     if (Number(result.rows[0].pendingcount) === 0) {

//                         const completeSql = `
//                     UPDATE rma_out
//                     SET status = 'Completed'
//                     WHERE id = $1
//                 `;

//                         db.query(completeSql, [rmaId]);
//                     }

//                     // res.json({
//                     //     success: true
//                     // });

//                 });

//             });




//             // 2. history
//             const historySql = `
//             INSERT INTO rma_status_history
//             (rma_item_id, status, status_text,updated_by)
//             VALUES ($1,$2,$3,$4)
//         `;

//             db.query(historySql, [item_id, status, status_text, updated_by]);

//             // 3. STOP ONLY THIS SERIAL IF COMPLETE
//             // Mark ONLY the clicked reminder as handled
//             const reminderSql = `
//     UPDATE rma_reminders1
//     SET is_read = 1
//     WHERE id = $1
// `;

//             db.query(reminderSql, [reminder_id]);

//             // If status = complete, stop all reminders for this serial number
//             if (status.toLowerCase() === "completed") {

//                 const clearSql = `
//         UPDATE rma_reminders1
//         SET is_read = 1
//         WHERE rma_item_id = $1
//     `;

//                 db.query(clearSql, [item_id]);
//             }


//             res.json({ success: true });
//         });
//     });
// });

//new rma outward

app.post("/update-status_ls/:item_id", (req, res) => {

    const item_id = req.params.item_id;

    const {
        status,
        status_text,
        reminder_id,
        updated_by
    } = req.body;

    console.log("OUTWARD PARAMS:", req.params);
    console.log("OUTWARD BODY:", req.body);

    // 1. Check current status + RMA ID
    const checkStatusSql = `
        SELECT status, rma_id
        FROM rma_items1
        WHERE id = $1
    `;

    db.query(checkStatusSql, [item_id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const currentStatus = result.rows[0].status;
        const rmaId = result.rows[0].rma_id;

        // 2. Already completed check
        if (
            currentStatus &&
            currentStatus.trim().toLowerCase() === "completed"
        ) {
            return res.status(400).json({
                message:
                    "Status already completed. Cannot update again."
            });
        }

        // 3. Status required
        if (!status || status.trim() === "") {
            return res.status(400).json({
                message: "Please select a status"
            });
        }

        // 4. Update item status
        const updateSql = `
            UPDATE rma_items1
            SET status = COALESCE(NULLIF($1, ''), status)
            WHERE id = $2
        `;

        db.query(
            updateSql,
            [status, item_id],
            (err) => {

                if (err) {
                    console.log("STATUS UPDATE ERROR:", err);
                    return res.status(500).json(err);
                }

                // 5. Save history
                const historySql = `
                    INSERT INTO rma_status_history
                    (
                        rma_item_id,
                        status,
                        status_text,
                        updated_by
                    )
                    VALUES ($1, $2, $3, $4)
                `;

                db.query(
                    historySql,
                    [
                        item_id,
                        status,
                        status_text,
                        updated_by
                    ],
                    (historyErr) => {

                        if (historyErr) {
                            console.log(
                                "HISTORY ERROR:",
                                historyErr
                            );

                            return res
                                .status(500)
                                .json(historyErr);
                        }

                        // 6. Mark clicked reminder as read
                        if (reminder_id) {

                            db.query(
                                `
                                UPDATE rma_reminders1
                                SET is_read = 1
                                WHERE id = $1
                                `,
                                [reminder_id]
                            );
                        }

                        // 7. If completed,
                        // stop all reminders for this serial
                        if (
                            status.trim().toLowerCase() ===
                            "completed"
                        ) {

                            db.query(
                                `
                                UPDATE rma_reminders1
                                SET is_read = 1
                                WHERE rma_item_id = $1
                                `,
                                [item_id]
                            );
                        }

                        // 8. Check ALL products
                        // under same RMA
                        const pendingSql = `
                            SELECT
                                COUNT(*) AS total_items,
                                COUNT(*) FILTER (
                                    WHERE LOWER(TRIM(status))
                                    = 'completed'
                                ) AS completed_items
                            FROM rma_items1
                            WHERE rma_id = $1
                        `;

                        db.query(
                            pendingSql,
                            [rmaId],
                            (err, result) => {

                                if (err) {
                                    console.log(
                                        "PENDING COUNT ERROR:",
                                        err
                                    );

                                    return res
                                        .status(500)
                                        .json(err);
                                }

                                const totalItems =
                                    Number(
                                        result.rows[0]
                                            .total_items
                                    );

                                const completedItems =
                                    Number(
                                        result.rows[0]
                                            .completed_items
                                    );

                                console.log(
                                    "OUTWARD RMA ID:",
                                    rmaId
                                );

                                console.log(
                                    "TOTAL ITEMS:",
                                    totalItems
                                );

                                console.log(
                                    "COMPLETED ITEMS:",
                                    completedItems
                                );

                                // 9. ALL products completed
                                if (
                                    totalItems > 0 &&
                                    totalItems ===
                                        completedItems
                                ) {

                                    const completeSql = `
                                        UPDATE rma_out
                                        SET status = 'Completed'
                                        WHERE id = $1
                                    `;

                                    db.query(
                                        completeSql,
                                        [rmaId],
                                        (err) => {

                                            if (err) {
                                                console.log(
                                                    "RMA OUT UPDATE ERROR:",
                                                    err
                                                );

                                                return res
                                                    .status(500)
                                                    .json(err);
                                            }

                                            console.log(
                                                "RMA OUT COMPLETED:",
                                                rmaId
                                            );

                                            return res.json({
                                                success: true,
                                                rmaStatus:
                                                    "Completed",
                                                totalItems:
                                                    totalItems,
                                                completedItems:
                                                    completedItems
                                            });
                                        }
                                    );

                                } else {

                                    // Some products still pending
                                    return res.json({
                                        success: true,
                                        rmaStatus:
                                            "Pending",
                                        totalItems:
                                            totalItems,
                                        completedItems:
                                            completedItems
                                    });

                                }

                            }
                        );

                    }
                );

            }
        );

    });

});

app.post("/reminder-click/:id", (req, res) => {

    const reminder_id = req.params.id;

    const sql = `
        UPDATE rma_reminders1
        SET is_read = 1
        WHERE id = $1
    `;

    db.query(sql, [reminder_id], (err) => {

        if (err) return res.status(500).json(err);

        res.json({ success: true });
    });
});

app.get(
    "/status-history_ls/:item_id",
    (req, res) => {

        const { item_id } = req.params;

        const sql = `
        SELECT
            status,
            status_text,
            updated_at
        FROM rma_status_history
        WHERE rma_item_id = $1
        ORDER BY updated_at DESC
        `;

        db.query(
            sql,
            [item_id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(result.rows);

            }
        );

    }
);


//RMA Entry

app.post("/api/entry_in", async (req, res) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const {
            customer_id,
            entry_date,
            products,
            created_by
        } = req.body;

        // Generate RMA No
        const rmaResult = await client.query(`
            SELECT COALESCE(MAX(rma_no),1000)+1 AS "rmaNo"
            FROM rma_entry1
        `);

        const rmaNo = rmaResult.rows[0].rmaNo;

        // Generate DC No
        const dcResult = await client.query(`
    SELECT COALESCE(MAX(customer_dc_no::integer), 5000) + 1 AS "dcNo"
    FROM rma_entry1
`);

        const dcNo = dcResult.rows[0].dcNo;

        for (const product of products) {

            const reminderDate = new Date(entry_date);
            reminderDate.setDate(reminderDate.getDate() + 3);

            const productResult = await client.query(
                `
                INSERT INTO rma_entry1
                (
                    rma_no,
                    customer_id,
                    product_name,
                    model_number,
                    quantity_no,
                    customer_dc_no,
                    reminder_date,
                    entry_date,
                    created_by
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                RETURNING id
                `,
                [
                    rmaNo,
                    customer_id,
                    product.product_name,
                    product.model_number,
                    product.quantity_no,
                    dcNo,
                    reminderDate,
                    entry_date,
                    created_by
                ]
            );

            const productId = productResult.rows[0].id;

            for (const item of product.items) {

                const itemResult = await client.query(
                    `
                    INSERT INTO rma_items
                    (
                        rma_id,
                        serial_no,
                        accessory,
                        issues,
                        status
                    )
                    VALUES
                    ($1,$2,$3,$4,$5)
                    RETURNING id
                    `,
                    [
                        productId,
                        item.serial_no,
                        item.accessory,
                        item.issues,
                        "pending"
                    ]
                );

                const item_id = itemResult.rows[0].id;

                await generateReminders_l(item_id);
            }
        }

        await client.query("COMMIT");

        res.json({
            success: true,
            rma_no: rmaNo,
            customer_dc_no: dcNo
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json(err);
    } finally {
        client.release();
    }
});


app.put("/update-rma_r/:rma_no", async (req, res) => {
    const rows = req.body;
    console.log("ROWS =", JSON.stringify(rows, null, 2));

    try {
        for (const item of rows) {
            console.log("ITEM =", item);

            await db.query(`
                UPDATE rma_entry1
                SET product_name = $1,
                    model_number = $2,
                    quantity_no = $3,
                    customer_dc_no = $4
                WHERE id = $5
            `, [
                item.product_name,
                item.model_number,
                item.quantity_no,
                item.customer_dc_no,
                item.id
            ]);

            await db.query(`
                UPDATE rma_items
                SET serial_no = $1,
                    accessory = $2,
                    issues = $3
                WHERE id = $4
            `, [
                item.serial_no,
                item.accessory,
                item.issues,
                item.item_id
            ]);
        }

        return res.json({
            message: "RMA Updated Successfully"
        });

    } catch (err) {
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({
            message: "Update failed",
            error: err.message
        });
    }
});

app.put("/update-rma-status_r/:rma_no", (req, res) => {

    const { status } = req.body;
    const { rma_no } = req.params;

    const sql = `
        UPDATE rma_items i
        JOIN rma_entry1 r
            ON i.rma_id = r.id
        SET i.status = $1
        WHERE r.rma_no = $2
    `;

    db.query(
        sql,
        [status, rma_no],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "All Status Updated",
                affectedRows: result.affectedRows
            });

        }
    );

});

app.delete("/delete-rma_r/:rma_no", async (req, res) => {
    const { rma_no } = req.params;

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Delete from rma_status_history
        await client.query(
            `
            DELETE FROM rma_status_history1
            WHERE rma_item_id IN (
                SELECT i.id
                FROM rma_items i
                JOIN rma_entry1 r
                    ON i.rma_id = r.id
                WHERE r.rma_no = $1
            )
            `,
            [rma_no]
        );

        // Delete from rma_items1
        await client.query(
            `
            DELETE FROM rma_items
            WHERE rma_id IN (
                SELECT id
                FROM rma_entry1
                WHERE rma_no = $1
            )
            `,
            [rma_no]
        );

        // Delete from rma_out
        await client.query(
            `
            DELETE FROM rma_entry1
            WHERE rma_no = $1
            `,
            [rma_no]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "RMA deleted successfully"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json(err);
    } finally {
        client.release();
    }
});


app.get("/reminders_lsr", (req, res) => {

    const sql = `
    SELECT
        r.rma_no,
        r.entry_date,

        i.id AS item_id,
        i.serial_no,
        i.status,

        rm.id AS reminder_id,
        rm.reminder_day

    FROM rma_entry1 r

    JOIN rma_items i
        ON r.id = i.rma_id

    JOIN rma_reminders rm
        ON rm.rma_item_id = i.id

    WHERE
        LOWER(i.status) != 'completed'
        AND rm.is_read = 0
        AND(CURRENT_DATE- r.entry_date::date) >= rm.reminder_day

    ORDER BY rm.reminder_day ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });
});

app.post("/update-status_lsr/:item_id", (req, res) => {

    const item_id = req.params.item_id;
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);

    const {
        status,
        status_text,
        reminder_id,
        updated_by
    } = req.body;

    console.log("item_id:", item_id);
    console.log("reminder_id:", reminder_id);
    console.log("body:", req.body);

    //check before the status already completed or not
    const checkStatusSql = `
    SELECT status
    FROM rma_items
    WHERE id = $1
`;

    db.query(checkStatusSql, [item_id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (
            result.rows[0].status &&
            result.rows[0].status.toLowerCase() === "completed"
        ) {
            return res.status(400).json({
                message: "Status already completed. Cannot update again."
            });
        }
        if (!status || status.trim() === "") {
            return res.status(400).json({
                message: "Please select a status"
            });
        }
        if (status.toLowerCase() === "completed") {

            const serialSql = `
        SELECT serial_no
        FROM rma_items
        WHERE id = $1
    `;
            db.query(serialSql, [item_id], (err, result) => {

                if (err) return res.status(500).json(err);

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        message: "Serial not found"
                    });
                }

                const serialNo = result.rows[0].serial_no;

                const outwardSql = `
            SELECT status
            FROM rma_items1
            WHERE serial_no = $1
        `;

                db.query(outwardSql, [serialNo], (err, result) => {

                    if (err) return res.status(500).json(err);

                    if (result.rows.length > 0) {

                        if (result.rows[0].status.toLowerCase() !== "completed") {
                            return res.status(400).json({
                                message:
                                    "Complete this serial in OUTWARD first."
                            });
                        }

                    }

                    continueUpdate(
                        db,
                        item_id,
                        status,
                        status_text,
                        updated_by,
                        reminder_id,
                        res
                    );

                });

            });

        } else {

            continueUpdate(
                db,
                item_id,
                status,
                status_text,
                updated_by,
                reminder_id,
                res
            );

        }


    });
});

app.post("/reminder-click_r/:id", (req, res) => {

    const reminder_id = req.params.id;

    const sql = `
        UPDATE rma_reminders
        SET is_read = 1
        WHERE id = $1
    `;

    db.query(sql, [reminder_id], (err) => {

        if (err) return res.status(500).json(err);

        res.json({ success: true });
    });
});

app.get(
    "/status-history_lsr/:item_id",
    (req, res) => {

        const { item_id } = req.params;

        const sql = `
        SELECT
            status,
            status_text,
            updated_at
        FROM rma_status_history1
        WHERE rma_item_id = $1
        ORDER BY updated_at DESC
        `;

        db.query(
            sql,
            [item_id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(result.rows);

            }
        );

    }
);

app.get("/get-services_r", (req, res) => {

    const sql = "SELECT id, customer_name FROM customer_details";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows);
    });

});

app.get("/rma-details_r/:rma_no", (req, res) => {

    const { rma_no } = req.params;

    const sql = `
   SELECT
    r.id,
    r.rma_no,
    r.customer_dc_no, 
    c.customer_name,
    r.product_name,
    r.model_number,
    r.quantity_no,
    r.entry_date,

    i.id AS item_id,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status

FROM rma_entry1 r

LEFT JOIN customer_details c
    ON r.customer_id = c.id

LEFT JOIN rma_items i
    ON r.id = i.rma_id

WHERE r.rma_no = $1

ORDER BY r.id`;

    db.query(sql, [rma_no], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

app.get("/pending-serials", (req, res) => {

    const sql = `
        SELECT
    r.rma_no,
    r.product_name,
    r.model_number,
    r.entry_date,
    i.id AS item_id,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
FROM rma_entry1 r
JOIN rma_items i
    ON r.id = i.rma_id
WHERE LOWER(TRIM(i.status)) = 'pending'
ORDER BY r.entry_date DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });

});

app.get("/complete-serials", (req, res) => {

    const sql = `
        SELECT
    r.rma_no,
    r.product_name,
    r.model_number,
    r.entry_date,
    i.id AS item_id,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
FROM rma_entry1 r
JOIN rma_items i
    ON r.id = i.rma_id
WHERE LOWER(TRIM(i.status)) = 'Completed'
ORDER BY r.entry_date DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });

});

app.get("/api/get1", (req, res) => {

    const sql = `
        SELECT
            s.id,
            s.product_name,
            s.model_no,
            s.serial_no,
            s.replacement_serial_no,
            s.customer_id,
            s.return_status,
            c.customer_name
        FROM supporter s
        LEFT JOIN customer_details c
            ON s.customer_id = c.id
        ORDER BY s.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("DATABASE ERROR:", err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });
});


app.post("/api/post1", (req, res) => {

    const {
        product_name,
        model_no,
        serial_no,
        replacement_serial_no,
        customer_id
    } = req.body;

    const sql = `
        INSERT INTO supporter
        (
            product_name,
            model_no,
            serial_no,
            replacement_serial_no,
            customer_id,
            return_status
        )
        VALUES ($1, $2, $3, $4, $5, 'Not Returned')
        RETURNING *
    `;

    db.query(
        sql,
        [
            product_name,
            model_no,
            serial_no,
            replacement_serial_no,
            customer_id
        ],
        (err, result) => {

            if (err) {
                console.log("SUPPORTER INSERT ERROR:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            const supporter = result.rows[0];

            // Initial status history
            const historySql = `
                INSERT INTO supporter_status_history
                (
                    supporter_id,
                    status
                )
                VALUES ($1, $2)
            `;

            db.query(
                historySql,
                [supporter.id, "Not Returned"],
                (historyErr) => {

                    if (historyErr) {
                        console.log(
                            "HISTORY INSERT ERROR:",
                            historyErr
                        );

                        return res.status(500).json({
                            success: false,
                            error: historyErr.message
                        });
                    }

                    res.json({
                        success: true,
                        data: supporter
                    });
                }
            );
        }
    );
});


app.get("/api/rma-serials", (req, res) => {

    const sql = `
        SELECT id, serial_no
        FROM rma_items
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

//single data 
app.get("/api/get1/:id", (req, res) => {
    const { id } = req.params;

    const sql =
        "SELECT * FROM supporter WHERE id=$1";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        res.json(result.rows);
    });
});

app.put("/api/update1/:id", (req, res) => {

    const { id } = req.params;

    const {
        customer_id,
        product_name,
        model_no,
        serial_no,
        replacement_serial_no,
        return_status
    } = req.body;

    const sql = `
        UPDATE supporter
        SET
            customer_id = $1,
            product_name = $2,
            model_no = $3,
            serial_no = $4,
            replacement_serial_no = $5,
            return_status = $6
        WHERE id = $7
    `;

    db.query(
        sql,
        [
            customer_id,
            product_name,
            model_no,
            serial_no,
            replacement_serial_no,
            return_status,
            id
        ],
        (err, result) => {

            if (err) {
                console.log("UPDATE ERROR:", err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Product Updated Successfully"
            });
        }
    );
});

app.put("/api/update-return-status/:id", (req, res) => {

    const { id } = req.params;
    const { return_status } = req.body;

    // Check current status
    const checkSql = `
        SELECT return_status
        FROM supporter
        WHERE id = $1
    `;

    db.query(checkSql, [id], (checkErr, checkResult) => {

        if (checkErr) {
            console.log(checkErr);

            return res.status(500).json({
                success: false,
                error: checkErr.message
            });
        }

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const currentStatus = checkResult.rows[0].return_status;

        // Already Returned
        if (currentStatus === "Returned") {

            return res.status(400).json({
                success: false,
                message: "This product is already returned"
            });
        }

        // Only allow Not Returned -> Returned
        if (
            currentStatus === "Not Returned" &&
            return_status !== "Returned"
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid status change"
            });
        }

        // Update current status
        const updateSql = `
            UPDATE supporter
            SET return_status = $1
            WHERE id = $2
            RETURNING *
        `;

        db.query(
            updateSql,
            [return_status, id],
            (updateErr, updateResult) => {

                if (updateErr) {
                    console.log(updateErr);

                    return res.status(500).json({
                        success: false,
                        error: updateErr.message
                    });
                }

                // Save history
                const historySql = `
                    INSERT INTO supporter_status_history
                    (
                        supporter_id,
                        status
                    )
                    VALUES ($1, $2)
                `;

                db.query(
                    historySql,
                    [id, return_status],
                    (historyErr) => {

                        if (historyErr) {
                            console.log(historyErr);

                            return res.status(500).json({
                                success: false,
                                error: historyErr.message
                            });
                        }

                        res.json({
                            success: true,
                            message: "Product Returned Successfully",
                            data: updateResult.rows[0]
                        });

                    }
                );
            }
        );
    });
});


//view supporter page
app.get("/api/supporter-view/:id", (req, res) => {

    const { id } = req.params;

    const productSql = `
        SELECT
            s.id,
            s.product_name,
            s.model_no,
            s.serial_no,
            s.replacement_serial_no,
            s.return_status,
            s.customer_id,
            c.customer_name
        FROM supporter s
        LEFT JOIN customer_details c
            ON s.customer_id = c.id
        WHERE s.id = $1
    `;

    db.query(productSql, [id], (err, productResult) => {

        if (err) {
            console.log("PRODUCT VIEW ERROR:", err);
            return res.status(500).json(err);
        }

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const historySql = `
            SELECT
                id,
                status,
                status_date
            FROM supporter_status_history
            WHERE supporter_id = $1
            ORDER BY status_date ASC
        `;

        db.query(
            historySql,
            [id],
            (historyErr, historyResult) => {

                if (historyErr) {
                    console.log("HISTORY VIEW ERROR:", historyErr);
                    return res.status(500).json(historyErr);
                }

                res.json({
                    product: productResult.rows[0],
                    history: historyResult.rows
                });
            }
        );
    });
});


app.delete("/api/remove1/:id", (req, res) => {

    const { id } = req.params;

    const sql =
        "DELETE FROM supporter WHERE id=$1";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
        }

        res.json(result.rows);
    });
});



app.get("/api/supporter-by-serial/:serialNo", (req, res) => {

    const { serialNo } = req.params;

    const sql = `
        SELECT *
        FROM supporter
        WHERE serial_no = $1
    `;

    db.query(sql, [serialNo], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        console.log(result.rows);

        res.json(result.rows);

    });

});


app.get("/api/supporter-list", (req, res) => {

    const sql = `
        SELECT
            s.id,
            s.product_name,
            s.model_no,
            s.serial_no,
            s.replacement_serial_no,
            s.return_status,
            s.customer_id,
            c.customer_name
        FROM supporter s
        LEFT JOIN customer_details c
            ON s.customer_id = c.id
        ORDER BY s.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("SUPPORTER LIST ERROR:", err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json(result.rows);
    });
});


app.get("/api/supporter-status-history/:supporterId", (req, res) => {

    const { supporterId } = req.params;

    const sql = `
        SELECT
            id,
            supporter_id,
            status,
            status_date
        FROM supporter_status_history
        WHERE supporter_id = $1
        ORDER BY status_date ASC
    `;

    db.query(sql, [supporterId], (err, result) => {

        if (err) {
            console.log("SUPPORTER HISTORY ERROR:", err);

            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json(result.rows);
    });
});


//Product Master API

app.post("/api/products", (req, res) => {

    const { product_name } = req.body;

    const sql = `
        INSERT INTO products (product_name)
        VALUES ($1)
        RETURNING *
    `;

    db.query(sql, [product_name], (err, result) => {

        if (err) {
            console.log("PRODUCT INSERT ERROR:", err);

            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    });
});

app.get("/api/products", (req, res) => {

    const sql = `
        SELECT *
        FROM products
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("PRODUCT GET ERROR:", err);

            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json(result.rows);
    });
});
app.put("/api/products/:id", (req, res) => {

    const { id } = req.params;
    const { product_name } = req.body;

    const sql = `
        UPDATE products
        SET product_name = $1
        WHERE id = $2
        RETURNING *
    `;

    db.query(
        sql,
        [product_name, id],
        (err, result) => {

            if (err) {
                console.log("PRODUCT UPDATE ERROR:", err);

                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        }
    );
});

app.delete("/api/products/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM products
        WHERE id = $1
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("PRODUCT DELETE ERROR:", err);

            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Product Deleted Successfully"
        });
    });
});

app.get("/api/pending-count", (req, res) => {

    const sql = `
        SELECT COUNT(*)::int AS "totalPending"
FROM rma_entry1
WHERE LOWER(status) = 'pending'
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows[0]);

    });

});

app.get("/api/completed-count", (req, res) => {

    const sql = `
        SELECT COUNT(*)::int AS "totalPending"
FROM rma_entry1
WHERE LOWER(status) = 'completed'
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows[0]);

    });

});
//rma inward pending and complete

app.get("/api/pending-rma", (req, res) => {

    const sql = `
        SELECT
    r.rma_no,
    MAX(c.customer_name) AS customer_name,
    MAX(r.customer_dc_no) AS customer_dc_no,
    MAX(r.product_name) AS product_name,
    MAX(r.model_number) AS model_number,
    MAX(r.entry_date) AS entry_date,
    MAX(r.status) AS status
FROM rma_entry1 r
JOIN customer_details c
    ON r.customer_id = c.id
WHERE LOWER(TRIM(r.status)) = 'pending'
GROUP BY r.rma_no
ORDER BY r.rma_no ASC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows);
    });

})

app.get("/api/completed-rma", (req, res) => {

    const sql = `
        SELECT
            r.rma_no,
            MAX(c.customer_name) AS customer_name,
            MAX(r.customer_dc_no) AS customer_dc_no,
            STRING_AGG(r.product_name, ', ') AS product_name,
            STRING_AGG(r.model_number, ', ') AS model_number,
            MAX(r.entry_date) AS entry_date,
            MAX(r.status) AS status
        FROM rma_entry1 r
        JOIN customer_details c
            ON r.customer_id = c.id
        WHERE LOWER(TRIM(r.status)) = 'completed'
        GROUP BY r.rma_no
        ORDER BY r.rma_no ASC
    `;


    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});


app.get("/api/rma/completed", (req, res) => {

    const sql = `
        SELECT *
        FROM rma_entry1
        WHERE status = 'Completed'
        ORDER BY id ASC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

app.get("/api/pending-rma-out", (req, res) => {

    const sql = `
        SELECT
            o.rma_no,
            MAX(s.center_name) AS center_name,
            MAX(o.quantity_no) AS quantity_no,
            MAX(o.entry_date) AS entry_date,
            STRING_AGG(i.product_name, ', ') AS product_name,
            STRING_AGG(i.model_number, ', ') AS model_number,
            'pending' AS status

        FROM rma_out o

        LEFT JOIN services_details s
            ON o.services_id = s.id

        LEFT JOIN rma_items1 i
            ON o.id = i.rma_id

        WHERE LOWER(TRIM(o.status)) = 'pending'

        GROUP BY o.rma_no

        ORDER BY o.rma_no ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

app.get("/api/completed-rma-out", (req, res) => {

    const sql = `
        SELECT
            o.rma_no,
            MAX(s.center_name) AS center_name,
            MAX(o.quantity_no) AS quantity_no,
            MAX(o.entry_date) AS entry_date,
            STRING_AGG(i.product_name, ', ') AS product_name,
            STRING_AGG(i.model_number, ', ') AS model_number,
            'completed' AS status

        FROM rma_out o

        LEFT JOIN services_details s
            ON o.services_id = s.id

        LEFT JOIN rma_items1 i
            ON o.id = i.rma_id

        WHERE LOWER(TRIM(o.status)) = 'completed'

        GROUP BY o.rma_no

        ORDER BY o.rma_no ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

app.get("/api/pending-rma-out-count", (req, res) => {

    const sql = `
       SELECT COUNT(*)::INT AS "totalPending"
FROM rma_out
WHERE LOWER(status) = 'pending'`;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows[0]);

    });

});

app.get("/api/completed-rma-out-count", (req, res) => {

    const sql = `
       SELECT COUNT(*)::INT AS "totalCompleted"
FROM rma_out
WHERE LOWER(status) = 'completed'`;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows[0]);

    });

});

app.get("/api/serial-pending-rma", (req, res) => {

    const sql = `
        SELECT
            r.rma_no,
    c.customer_name,
    r.product_name,
    r.model_number,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
        FROM rma_entry1 r
        LEFT JOIN customer_details c
            ON r.customer_id = c.id
        INNER JOIN rma_items i
            ON r.id = i.rma_id
       WHERE LOWER(i.status) = 'pending'
        AND i.serial_no IS NOT NULL
        AND i.serial_no <> ''
        ORDER BY r.id ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});

app.get("/api/serial-completed-rma", (req, res) => {

    const sql = `
        SELECT
             r.rma_no,
    c.customer_name,
    r.product_name,
    r.model_number,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
        FROM rma_entry1 r
        LEFT JOIN customer_details c
            ON r.customer_id = c.id
        INNER JOIN rma_items i
            ON r.id = i.rma_id
       WHERE LOWER(i.status)='completed'
        AND i.serial_no IS NOT NULL
        AND i.serial_no <> ''
        ORDER BY r.id ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        console.log("COMPLETED LIST =", result);

        res.json(result.rows);

    });

});

app.get("/api/serial-completed-count", (req, res) => {

    const sql = `
       SELECT COUNT(*)::INT AS "totalCompleted"
FROM rma_items i
INNER JOIN rma_entry1 r
    ON r.id = i.rma_id
WHERE LOWER(i.status) = 'completed'
  AND i.serial_no IS NOT NULL
  AND i.serial_no <> ''`;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows[0]);

    });

});

app.get("/api/serial-pending-count", (req, res) => {

    const sql = `
       SELECT COUNT(*)::INT AS "totalPending"
FROM rma_items i
INNER JOIN rma_entry1 r
    ON r.id = i.rma_id
WHERE LOWER(r.status) = 'pending'
  AND i.serial_no IS NOT NULL
  AND i.serial_no <> ''`;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result.rows[0]);

    });

});

// serial rma outward





app.get("/api/serial-pending-rma-out", (req, res) => {

    const sql = `
       SELECT
    r.*,
    i.product_name,
    i.model_number,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
FROM rma_out r
INNER JOIN rma_items1 i
    ON r.id = i.rma_id
WHERE LOWER(i.status) = 'pending'
  AND i.serial_no IS NOT NULL
  AND i.serial_no <> ''
ORDER BY r.id ASC`;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result.rows);

    });

});


app.get("/api/serial-completed-rma-out", (req, res) => {

    const sql = `
        SELECT
            r.rma_no,
            s.center_name,
            i.product_name,
            i.model_number,
            i.serial_no,
            i.status
        FROM rma_out r
        LEFT JOIN services_details s
            ON r.services_id = s.id
        INNER JOIN rma_items1 i
            ON r.id = i.rma_id
        WHERE i.status = 'completed'
        AND i.serial_no IS NOT NULL
        AND i.serial_no <> ''
        ORDER BY r.id ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        console.log(result.rows);

        res.json(result.rows);

    });

});


app.get("/api/serial-completed-rma-out-count", (req, res) => {

    const sql = `
      SELECT COUNT(*)::INT AS "totalCompleted"
FROM rma_items1
WHERE LOWER(status) = 'completed'
  AND serial_no IS NOT NULL
  AND serial_no <> ''`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows[0]);
    });

});


app.get("/api/serial-pending-rma-out-count", (req, res) => {

    const sql = `
       SELECT COUNT(*)::INT AS "totalPending"
FROM rma_items1
WHERE LOWER(status) = 'pending'
  AND serial_no IS NOT NULL
  AND serial_no <> ''`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows[0]);
    });

});

// historypage

app.get("/serial-history/:serial_no", (req, res) => {

    const { serial_no } = req.params;
    console.log("SERIAL:", serial_no);

    const sql = `
        SELECT
            i.serial_no,
            h.status,
            h.status_text,
            h.updated_by,
            h.updated_at,
            'INWARD' AS source
        FROM rma_items i
        JOIN rma_status_history1 h
            ON i.id = h.rma_item_id
        WHERE i.serial_no = $1

        UNION ALL

        SELECT
            i1.serial_no,
            h1.status,
            h1.status_text,
            h1.updated_by,
            h1.updated_at,
            'OUTWARD' AS source
        FROM rma_items1 i1
        JOIN rma_status_history h1
            ON i1.id = h1.rma_item_id
        WHERE i1.serial_no = $2

        ORDER BY updated_at ASC
    `;

    db.query(sql, [serial_no, serial_no], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        console.log("RESULT:", result.rows);
        res.json(result.rows);
    });

});


// status pages

function continueUpdate(
    db,
    item_id,
    status,
    status_text,
    updated_by,
    reminder_id,
    res
) {

    const updateSql = `
        UPDATE rma_items
        SET status = COALESCE(NULLIF($1, ''), status)
        WHERE id = $2
    `;

    db.query(updateSql, [status, item_id], (err) => {

        if (err) {
            console.log("ITEM UPDATE ERROR:", err);
            return res.status(500).json(err);
        }

        // Save status history
        const historySql = `
            INSERT INTO rma_status_history1
            (rma_item_id, status, status_text, updated_by)
            VALUES ($1, $2, $3, $4)
        `;

        db.query(
            historySql,
            [item_id, status, status_text, updated_by],
            (historyErr) => {

                if (historyErr) {
                    console.log("HISTORY ERROR:", historyErr);
                    return res.status(500).json(historyErr);
                }

                // Mark clicked reminder as read
                if (reminder_id) {

                    db.query(
                        `
                        UPDATE rma_reminders
                        SET is_read = 1
                        WHERE id = $1
                        `,
                        [reminder_id]
                    );
                }

                // If this product is completed,
                // stop all reminders for this serial
                if (
                    status &&
                    status.trim().toLowerCase() === "completed"
                ) {

                    db.query(
                        `
                        UPDATE rma_reminders
                        SET is_read = 1
                        WHERE rma_item_id = $1
                        `,
                        [item_id]
                    );
                }

                // Get RMA ID
                const checkSql = `
                    SELECT rma_id
                    FROM rma_items
                    WHERE id = $1
                `;

                db.query(
                    checkSql,
                    [item_id],
                    (err, result) => {

                        if (err) {
                            console.log("RMA ID ERROR:", err);
                            return res.status(500).json(err);
                        }

                        if (result.rows.length === 0) {
                            return res.status(404).json({
                                message: "RMA item not found"
                            });
                        }

                        const rmaId = result.rows[0].rma_id;

                        console.log("RMA ID:", rmaId);

                        // Check all products under this RMA
                        const pendingSql = `
                            SELECT
                                COUNT(*) AS total_items,
                                COUNT(*) FILTER (
                                    WHERE LOWER(TRIM(status)) = 'completed'
                                ) AS completed_items
                            FROM rma_items
                            WHERE rma_id = $1
                        `;

                        db.query(
                            pendingSql,
                            [rmaId],
                            (err, result) => {

                                if (err) {
                                    console.log(
                                        "RMA COUNT ERROR:",
                                        err
                                    );

                                    return res.status(500).json(err);
                                }

                                const totalItems =
                                    Number(
                                        result.rows[0].total_items
                                    );

                                const completedItems =
                                    Number(
                                        result.rows[0].completed_items
                                    );

                                console.log(
                                    "Total Items:",
                                    totalItems
                                );

                                console.log(
                                    "Completed Items:",
                                    completedItems
                                );

                                // ALL products completed
                                if (
                                    totalItems > 0 &&
                                    totalItems === completedItems
                                ) {

                                    db.query(
                                        `
                                        UPDATE rma_entry1
                                        SET status = 'Completed'
                                        WHERE id = $1
                                        `,
                                        [rmaId],
                                        (updateErr) => {

                                            if (updateErr) {
                                                console.log(
                                                    "RMA COMPLETE ERROR:",
                                                    updateErr
                                                );

                                                return res
                                                    .status(500)
                                                    .json(updateErr);
                                            }

                                            console.log(
                                                "RMA COMPLETED:",
                                                rmaId
                                            );

                                            return res.json({
                                                success: true,
                                                rmaStatus: "Completed"
                                            });
                                        }
                                    );

                                } else {

                                    // Some products are still pending
                                    return res.json({
                                        success: true,
                                        rmaStatus: "Pending",
                                        totalItems: totalItems,
                                        completedItems: completedItems
                                    });
                                }
                            }
                        );
                    }
                );
            }
        );
    });
}
app.post("/update-status_lsr/:item_id", (req, res) => {

    const item_id = req.params.item_id;
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);

    const {
        status,
        status_text,
        reminder_id,
        updated_by
    } = req.body;

    console.log("item_id:", item_id);
    console.log("reminder_id:", reminder_id);
    console.log("body:", req.body);


    //check before the status already completed or not
    const checkStatusSql = `
    SELECT status
    FROM rma_items
    WHERE id = $1
`;

    db.query(checkStatusSql, [item_id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (
            result.rows[0].status &&
            result.rows[0].status.toLowerCase() === "completed"
        ) {
            return res.status(400).json({
                message: "Status already completed. Cannot update again."
            });
        }
        if (!status || status.trim() === "") {
            return res.status(400).json({
                message: "Please select a status"
            });
        }
        if (status.toLowerCase() === "completed") {

            const serialSql = `
        SELECT serial_no
        FROM rma_items
        WHERE id = $1
    `;

            db.query(serialSql, [item_id], (err, serialRows) => {

                if (err) {
                    return res.status(500).json(err);
                }

                const serialNo = serialRows[0].serial_no;

                const outwardSql = `
            SELECT status
            FROM rma_items1
            WHERE serial_no = $1
        `;

                db.query(outwardSql, [serialNo], (err, outwardRows) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    // Serial exists in rma_items1
                    if (outwardRows.length > 0) {

                        if (
                            outwardRows[0].status.toLowerCase() !==
                            "completed"
                        ) {
                            return res.status(400).json({
                                message:
                                    "Complete this serial in OUTWARD first."
                            });
                        }

                    }

                    continueUpdate(
                        db,
                        item_id,
                        status,
                        status_text,
                        updated_by,
                        reminder_id,
                        res


                    );

                });

            });

        } else {

            continueUpdate(
                db,
                item_id,
                status,
                status_text,
                updated_by,
                reminder_id,
                res
            );

        }


    });
});



// status pages1


app.post("/update-status_ls/:item_id", (req, res) => {

    const item_id = req.params.item_id;
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);
    const {
        status,
        status_text,
        reminder_id,
        updated_by
    } = req.body;

    console.log("item_id:", item_id);
    console.log("reminder_id:", reminder_id);
    console.log("body:", req.body);
    //check before the status already completed or not
    const checkStatusSql = `
    SELECT status
    FROM rma_items1
    WHERE id = $1
`;

    db.query(checkStatusSql, [item_id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (
            result.rows[0].status &&
            result.rows[0].status.toLowerCase() === "completed"
        ) {
            return res.status(400).json({
                message: "Status already completed. Cannot update again."
            });
        }
        // 1. update item
        const updateSql = `
        UPDATE rma_items1
        SET status = COALESCE(NULLIF($1, ''), status)
        WHERE id = $2
    `;
        if (!status || status.trim() === "") {
            return res.status(400).json({
                message: "Please select a status"
            });
        }

        db.query(updateSql, [status, item_id], (err) => {
            if (err) return res.status(500).json(err);
            // Check whether all serials under this RMA are completed
            const checkSql = `
        SELECT rma_id
        FROM rma_items1
        WHERE id = $1
    `;

            db.query(checkSql, [item_id], (err, rows) => {

                if (err) return res.status(500).json(err);

                const rmaId = rows[0].rma_id;

                const pendingSql = `
            SELECT COUNT(*) AS pendingcount
            FROM rma_items1
            WHERE rma_id = $1
            AND status <> 'Completed'
        `;

                db.query(pendingSql, [rmaId], (err, result) => {

                    if (err) return res.status(500).json(err);

                    if (result.rows[0].pendingcount === 0) {

                        const completeSql = `
                    UPDATE rma_out
                    SET status = 'Completed'
                    WHERE id = $1
                `;

                        db.query(completeSql, [rmaId]);
                    }

                    // res.json({
                    //     success: true
                    // });

                });

            });




            // 2. history
            const historySql = `
            INSERT INTO rma_status_history
            (rma_item_id, status, status_text,updated_by)
            VALUES ($1,$2,$3,$4)
        `;

            db.query(historySql, [item_id, status, status_text, updated_by]);

            // 3. STOP ONLY THIS SERIAL IF COMPLETE
            // Mark ONLY the clicked reminder as handled
            const reminderSql = `
    UPDATE rma_reminders1
    SET is_read = 1
    WHERE id = $1
`;

            db.query(reminderSql, [reminder_id]);

            // If status = complete, stop all reminders for this serial number
            if (status.toLowerCase() === "completed") {

                const clearSql = `
        UPDATE rma_reminders1
        SET is_read = 1
        WHERE rma_item_id = $1
    `;

                db.query(clearSql, [item_id]);
            }


            res.json({ success: true });
        });
    });
});



app.get("/search-serial/:serialNo", (req, res) => {

    const { serialNo } = req.params;
    const checkSql = `
        SELECT serial_no
        FROM rma_items1
        WHERE serial_no = $1
        AND status <> 'Completed'
    `;

    db.query(checkSql, [serialNo], (err, result) => {

        if (err) return res.status(500).json(err);

        // if (result.rows.length > 0) {
        //     return res.json({
        //         exists: true,
        //         message: "Serial Number Already Exists"
        //     });
        // }
        const sql = `
SELECT
    e.product_name,
    e.model_number,
    e.customer_dc_no,
    i.serial_no,
    i.accessory,
    i.issues,
    i.status
FROM rma_entry1 e
JOIN rma_items i
    ON e.id = i.rma_id
WHERE i.serial_no = $1
`;

        db.query(sql, [serialNo], (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "Serial Number Not Found"
                });
            }

            // if (
            //     result.rows[0].status &&
            //     result.rows[0].status.toLowerCase() !== "pending"
            // ) {
            //     return res.json({
            //         success: false,
            //         message: `Serial Number status is ${result.rows[0].status}`
            //     });
            // }

            res.json({
                success: true,
                data: result.rows[0]
            });
        });

    });
});


app.get("/test-db", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT NOW() AS now"
        );

        res.json({
            success: true,
            now: result.rows[0].now
        });
    } catch (error) {
        console.log("Test DB error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/customers/search", async (req, res) => {
    const { q } = req.query;

    const sql = `
    SELECT *
    FROM customer
    WHERE LOWER(customer_name) LIKE LOWER($1)
       OR phone_no LIKE $1
       OR LOWER(company_name) LIKE LOWER($1)
    ORDER BY id DESC
  `;

    try {
        const result = await pool.query(sql, [`%${q}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/api/rma/search", async (req, res) => {
    const { q } = req.query;

    const sql = `
    SELECT *
    FROM rma_entry1
    WHERE LOWER(customer_name) LIKE LOWER($1)
       OR LOWER(product_name) LIKE LOWER($1)
       OR LOWER(model_no) LIKE LOWER($1)
    ORDER BY id DESC
  `;

    try {
        const result = await pool.query(sql, [`%${q}%`]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get("/api/rmaout/search", async (req, res) => {
    const { q } = req.query;

    const sql = `
    SELECT DISTINCT
      r.id,
      r.rma_no,
      s.center_name,
      i.product_name,
      i.model_number,
      r.quantity_no,
      r.status,
      r.entry_date
    FROM rma_out r
    JOIN services s
      ON r.services_id = s.id
    JOIN rma_items1 i
      ON r.id = i.rma_id
    WHERE LOWER(s.center_name) LIKE LOWER($1)
       OR LOWER(i.product_name) LIKE LOWER($1)
       OR LOWER(i.model_number) LIKE LOWER($1)
    ORDER BY r.id DESC
  `;

    try {
        const result = await db.query(sql, [`%${q}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//new rma entry list complete first

app.get("/api/rma-list", (req, res) => {

    const sql = `
        SELECT
            r.rma_no,
            MAX(c.customer_name) AS customer_name,
            MAX(r.customer_dc_no) AS customer_dc_no,
            STRING_AGG(r.product_name, ', ') AS product_name,
            STRING_AGG(r.model_number, ', ') AS model_number,
            MAX(r.entry_date) AS entry_date,
            MAX(r.status) AS status,
            MAX(r.id) AS latest_id

        FROM rma_entry1 r

        LEFT JOIN customer_details c
            ON r.customer_id = c.id

        GROUP BY r.rma_no

        ORDER BY
            CASE
                WHEN LOWER(TRIM(MAX(r.status))) = 'completed'
                THEN 1
                ELSE 2
            END,
            MAX(r.id) DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("RMA LIST ERROR:", err);

            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json(result.rows);
    });

});

// new rma out complete first
app.get("/api/rma-out-list", (req, res) => {

    const sql = `
        SELECT
            o.rma_no,
            MAX(s.center_name) AS center_name,
            MAX(o.quantity_no) AS quantity_no,
            MAX(o.entry_date) AS entry_date,
            STRING_AGG(i.product_name, ', ') AS product_name,
            STRING_AGG(i.model_number, ', ') AS model_number,
            MAX(o.status) AS status,
            MAX(o.id) AS latest_id

        FROM rma_out o

        LEFT JOIN services_details s
            ON o.services_id = s.id

        LEFT JOIN rma_items1 i
            ON o.id = i.rma_id

        GROUP BY o.rma_no

        ORDER BY
            CASE
                WHEN LOWER(TRIM(MAX(o.status))) = 'completed'
                THEN 1
                ELSE 2
            END,
            MAX(o.id) DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("RMA OUT LIST ERROR:", err);

            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json(result.rows);
    });

});

// ===============================
// RMA INWARD REMINDER CHECK
// ===============================

const checkInwardReminders = () => {

    const reminderDays = [3, 5, 7, 10, 13, 15];

    const sql = `
        SELECT
            i.id AS item_id,
            i.rma_id,
            i.status,
            r.entry_date
        FROM rma_items i
        INNER JOIN rma_entry1 r
            ON i.rma_id = r.id
        WHERE LOWER(COALESCE(i.status, '')) <> 'completed'
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("Reminder fetch error:", err);
            return;
        }

        result.rows.forEach((item) => {

            if (!item.entry_date) {
                return;
            }

            const entryDate = new Date(item.entry_date);
            const today = new Date();

            // Difference in days
            const diffTime =
                today.getTime() - entryDate.getTime();

            const diffDays =
                Math.floor(
                    diffTime / (1000 * 60 * 60 * 24)
                );

            reminderDays.forEach((days) => {

                // Reminder day not reached yet
                if (diffDays < days) {
                    return;
                }

                const statusText =
                    `You missed ${days} day reminder`;

                // Check whether reminder already exists
                const checkSql = `
                    SELECT id
                    FROM rma_status_history1
                    WHERE rma_item_id = $1
                    AND status = 'Missed'
                    AND status_text = $2
                    LIMIT 1
                `;

                db.query(
                    checkSql,
                    [
                        item.item_id,
                        statusText
                    ],
                    (err, checkResult) => {

                        if (err) {
                            console.log(
                                "Reminder check error:",
                                err
                            );
                            return;
                        }

                        // Already created → don't create again
                        if (checkResult.rows.length > 0) {
                            return;
                        }

                        // Insert missed reminder
                        const insertSql = `
                            INSERT INTO rma_status_history1
                            (
                                rma_item_id,
                                status_text,
                                status,
                                updated_at,
                                updated_by
                            )
                            VALUES
                            (
                                $1,
                                $2,
                                'Missed',
                                NOW(),
                                'System'
                            )
                        `;

                        db.query(
                            insertSql,
                            [
                                item.item_id,
                                statusText
                            ],
                            (err) => {

                                if (err) {
                                    console.log(
                                        "Reminder insert error:",
                                        err
                                    );
                                    return;
                                }

                                console.log(
                                    `INWARD ${days} day reminder created for item ${item.item_id}`
                                );

                            }
                        );

                    }
                );

            });

        });

    });

};

// ===============================
// GET RMA INWARD REMINDERS
// ===============================

app.get("/api/inward-reminders", (req, res) => {

    const sql = `
        SELECT
            r.rma_no,
            r.product_name,
            r.model_number,
            i.id AS item_id,
            i.serial_no,
            h.status,
            h.status_text,
            h.updated_at,
            h.updated_by
        FROM rma_items i

        INNER JOIN rma_entry1 r
            ON i.rma_id = r.id

        INNER JOIN rma_status_history1 h
            ON i.id = h.rma_item_id

        WHERE h.status = 'Missed'

        ORDER BY h.updated_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("Inward reminder API error:", err);
            return res.status(500).json(err);
        }

        res.json(result.rows);
    });

});

// ===============================
// START REMINDER CHECK
// ===============================

checkInwardReminders();

setInterval(() => {

    console.log("Checking inward reminders...");

    checkInwardReminders();

}, 60 * 60 * 1000);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});