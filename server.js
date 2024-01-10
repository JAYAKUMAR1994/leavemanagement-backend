const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const { connectToDatabase } = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/user", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const [rows] = await db.execute("SELECT * FROM user_profile ");

    res.send({ records: rows });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).send("Error fetching records");
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

app.get("/employees", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const [rows] = await db.execute("SELECT * FROM employee_profile ");

    res.send({ employees: rows });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).send("Error fetching records");
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

app.post("/signup", async (req, res) => {
  let db;
  try {
    const { userName, email, password } = req.body;

    // Assuming you have a function connectToDatabase that returns a promise
    db = await connectToDatabase();

    // Insert into user_profile table
    const insertUserProfileQuery =
      "INSERT INTO user_profile (username, email, password, role) VALUES (?, ?, ?, ?)";
    const userProfileValues = [userName, email, password, "admin"];

    await db.query(insertUserProfileQuery, userProfileValues);

    // Get the user_id of the inserted user
    const getUserIdQuery = "SELECT LAST_INSERT_ID() as user_id";
    const [userResult] = await db.query(getUserIdQuery);
    const userId = userResult[0].user_id;

    // Insert into admin_signup table
    const insertAdminSignupQuery =
      "INSERT INTO admin_signup (user_id) VALUES (?)";
    const adminSignupValues = [userId];

    await db.query(insertAdminSignupQuery, adminSignupValues);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

//create table employee

app.post("/createemployee", async (req, res) => {
  let db;
  try {
    const {
      empCode,
      role,
      gender,
      userName,
      email,
      phoneNumber,
      department,
      country,
      city,
      town,
      password,
      confirmPassword,
      userid,
      creationDate,
    } = req.body;

    db = await connectToDatabase();

    // Insert into user_profile table
    const insertUserProfileQuery =
      "INSERT INTO user_profile (username, email, password, role) VALUES (?, ?, ?, ?)";
    const userProfileValues = [userName, email, password, role];

    const [userProfileResult] = await db.execute(
      insertUserProfileQuery,
      userProfileValues
    );

    // Get the auto-generated user ID from the inserted user_profile record
    const insertedUserId = userProfileResult.insertId;

    // Insert into employee_profile table
    const insertEmployeeProfileQuery =
      "INSERT INTO employee_profile (user_id, empCode, gender, user_name, email, password, phone_number, department, country, city, town,creationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
    const employeeProfileValues = [
      insertedUserId,
      empCode,
      gender,
      userName,
      email,
      password,
      phoneNumber,
      department,
      country,
      city,
      town,
      creationDate,
    ];

    const [employeeProfileResult] = await db.execute(
      insertEmployeeProfileQuery,
      employeeProfileValues
    );

    // Retrieve the updated list of employees
    const [selectResults] = await db.execute("SELECT * FROM employee_profile");

    // Send the updated list of employees in the response
    res.json({ employees: selectResults });
  } catch (error) {
    console.error("Error creating records:", error);
    res.status(500).send("Error creating records");
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

// Department create
app.post("/department", async (req, res) => {
  let db;
  try {
    const { slNo, deptCode, deptName, deptShortName, creationDate } = req.body;

    const db = await connectToDatabase();

    const sql =
      "INSERT INTO Department (deptCode, deptName, deptShortName, creationDate) VALUES (?, ?, ?, ?)";
    const values = [deptCode, deptName, deptShortName, creationDate];

    await db.execute(sql, values);

    // Retrieve the updated list of departments
    const [selectResults] = await db.execute(
      "SELECT id, deptcode, deptname, deptshortname, creationdate FROM department"
    );

    // Send the updated list of departments in the response
    res.json({ department: selectResults });
  } catch (error) {
    console.error("Error creating department records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

//Load Departments
app.get("/departments", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.execute(
      "SELECT id, deptcode, deptname,deptshortname,creationdate FROM department "
    );

    res.json({ departments: results });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

// Update Department
app.put("/updatedepartment/:id", async (req, res) => {
  let db;
  try {
    const departmentId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    // Extract updated department data from the request body
    const { deptcode, deptname, deptshortname, creationdate } = req.body;

    db = await connectToDatabase();
    const [results] = await db.execute(
      "UPDATE department SET deptcode = ?, deptname = ?, deptshortname = ?, creationdate = ? WHERE id = ?",
      [deptcode, deptname, deptshortname, creationdate, departmentId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Retrieve the updated department data from the database
    const [selectResults] = await db.execute(
      "SELECT id, deptcode, deptname,deptshortname,creationdate FROM department "
    );

    res.json({ department: selectResults });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

// Delete Department
app.delete("/deletedepartment/:id", async (req, res) => {
  let db;
  try {
    const departmentId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    db = await connectToDatabase();

    // Delete the department from the database
    const [deleteResults] = await db.execute(
      "DELETE FROM department WHERE id = ?",
      [departmentId]
    );

    if (deleteResults.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete department" });
    }

    // Check if the department exists before deleting
    const [selectResults] = await db.execute(
      "SELECT id, deptcode, deptname,deptshortname,creationdate FROM department "
    );

    if (selectResults.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ department: selectResults });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

//Leave Type create
app.post("/leavetype", async (req, res) => {
  let db;
  try {
    // Extract 'type' and 'desc' from the request body
    const { type, description } = req.body;

    // Connect to the database
    db = await connectToDatabase();

    // SQL query to insert leave type into the 'leavetypes' table
    const sql = "INSERT INTO leavetypes (leavetype, description) VALUES (?, ?)";

    await db.execute(sql, [type, description]);
    // Uncomment the following lines if you want to retrieve the updated list of leave types
    const [selectResults] = await db.execute(
      "SELECT id,leavetype, description, creationdate FROM LeaveTypes "
    );

    // Send a response, potentially including the updated list of leave types
    res.json({ leavetypes: selectResults });
  } catch (error) {
    console.error("Error at line 394:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the database connection in the finally block
    if (db) {
      db.end(); // Assuming you're using mysql2's connection pooling, use `end()` to release the connection back to the pool
    }
  }
});

//Load Leavetypes
app.get("/getleavetypesdata", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.execute(
      "SELECT id, leavetype , description ,creationdate FROM LeaveTypes  "
    );

    res.json({ leavetypes: results });
  } catch (error) {
    console.error("Error fetching LeaveTypes :", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Update Leavetype
app.put("/updateleavetype/:id", async (req, res) => {
  let db;
  try {
    const leavetypeid = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(leavetypeid)) {
      return res.status(400).json({ error: "Invalid leavetype ID" });
    }

    // Extract updated department data from the request body
    const { leavetype, description, creationdate } = req.body;

    db = await connectToDatabase();
    const [results] = await db.execute(
      "UPDATE LeaveTypes  SET leavetype = ?, description  = ? WHERE id = ?",
      [leavetype, description, leavetypeid]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "leavetype not found" });
    }

    // Retrieve the updated department data from the database
    const [selectResults] = await db.execute(
      "SELECT id, leavetype , description ,creationdate FROM LeaveTypes "
    );
    res.json({ leavetypes: selectResults });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Delete leavetype
app.delete("/deleteleavetype/:id", async (req, res) => {
  let db;
  try {
    const leavetypeId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(leavetypeId)) {
      return res.status(400).json({ error: "Invalid leavetype ID" });
    }

    db = await connectToDatabase();

    // Delete the department from the database
    const [deleteResults] = await db.execute(
      "DELETE FROM LeaveTypes  WHERE id = ?",
      [leavetypeId]
    );

    if (deleteResults.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete LeaveType" });
    }

    // Check if the department exists before deleting
    const [selectResults] = await db.execute(
      "SELECT id, leavetype , description ,creationdate FROM LeaveTypes "
    );

    if (selectResults.length === 0) {
      return res.status(404).json({ error: "leavetypes not found" });
    }
    res.json({ leavetypes: selectResults });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Update Employee
app.put("/updateemployee/:id", async (req, res) => {
  let db;
  try {
    const empId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(empId)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    // Extract updated department data from the request body
    const { userName, department, gender, phoneNumber, country, city, town } =
      req.body;

    db = await connectToDatabase();
    const [results] = await db.execute(
      "UPDATE employee_profile  SET user_name  = ?, department  = ?,gender = ?,phone_number=?,country=?,city=?,town=?  WHERE user_id = ?",
      [userName, department, gender, phoneNumber, country, city, town, empId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const [selectResults] = await db.execute("SELECT * FROM employee_profile ");
    res.json({ employees: selectResults });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Delete Employee
app.delete("/deleteemployee/:id", async (req, res) => {
  let db;
  try {
    const EmpId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(EmpId)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    db = await connectToDatabase();

    // Delete the department from the database
    const [deleteResultsEmployee] = await db.execute(
      "DELETE FROM employee_profile   WHERE user_id  = ?",
      [EmpId]
    );
    if (deleteResultsEmployee.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete Employee" });
    }

    const [deleteResultsUser] = await db.execute(
      "DELETE FROM user_profile   WHERE user_id  = ?",
      [EmpId]
    );

    if (deleteResultsUser.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete Employee" });
    }

    const [selectResults] = await db.execute("SELECT * FROM employee_profile ");

    res.json({ employees: selectResults });
  } catch (error) {
    console.error("Error deleting Employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Example endpoint handling the leave request
app.post("/submitLeave", async (req, res) => {
  let db;
  try {
    const { fromDate, toDate, leaveType, description, userid } = req.body;

    // Connect to the database
    db = await connectToDatabase();

    const sql =
      "INSERT INTO leavetable (user_id, leave_type_id, start_date, end_date, comments) VALUES (?,?,?,?,?)";
    await db.execute(sql, [
      userid.user_id,
      leaveType,
      fromDate,
      toDate,
      description,
    ]);

    // const [selectResults] = await db.execute('SELECT * FROM leavetable  ');
    const table = "SELECT * FROM leavetable  ";
    const [selectResults] = await db.query(table);

    res.json({ leaves: selectResults });

    // res.status(200).json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

//Load Leaves
app.get("/leaves", async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.execute(
      "SELECT leave_id,user_id,leave_type_id,start_date,end_date,status,comments,submission_date FROM Leavetable"
    );

    const table = "SELECT * FROM leavetable  ";
    const [selectResults] = await db.query(table);

    res.json({ leaves: results });
  } catch (error) {
    console.error("Error fetching Leaves :", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Update Leave
app.put("/updateleave/:id", async (req, res) => {
  let db;
  try {
    const leaveId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(leaveId)) {
      return res.status(400).json({ error: "Invalid leave ID" });
    }

    // Extract updated department data from the request body
    const { from, to, description, leave_type_id } = req.body;

    db = await connectToDatabase();
    const [results] = await db.execute(
      "UPDATE Leavetable SET start_date = ?, end_date = ?, comments = ?, leave_type_id = ? WHERE leave_id = ?",
      [
        convertDateFormat(from),
        convertDateFormat(to),
        description,
        leave_type_id,
        leaveId,
      ]
    );

    function convertDateFormat(dateString) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Leave not found" });
    }

    const [selectResults] = await db.execute("SELECT * FROM Leavetable  ");
    res.json({ leaves: selectResults });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Delete Leave
app.delete("/deleteleave/:id", async (req, res) => {
  let db;
  try {
    const leaveId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(leaveId)) {
      return res.status(400).json({ error: "Invalid Leave ID" });
    }

    db = await connectToDatabase();

    // Delete the department from the database
    const [deleteResults] = await db.execute(
      "DELETE FROM Leavetable   WHERE leave_id  = ?",
      [leaveId]
    );

    if (deleteResults.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to delete Leave" });
    }

    const [selectResults] = await db.execute("SELECT * FROM Leavetable ");

    res.json({ leaves: selectResults });
  } catch (error) {
    console.error("Error deleting Employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Update Leave
// app.put('/leave/status/:id', async (req, res) => {
//   let db;
//   try {
//     const leaveId = req.params.id;

//     // Validate that departmentId is a valid integer (optional)
//     if (isNaN(leaveId)) {
//       return res.status(400).json({ error: 'Invalid leave ID' });
//     }

//     // Extract updated department data from the request body
//     const { status  } = req.body;

//     db = await connectToDatabase();
//     const [results] = await db.execute(
//       'UPDATE Leavetable SET status = ? WHERE leave_id = ?',
//       [status, leaveId]
//     );

//     console.log(results)
//     const [selectResults] = await db.execute('SELECT * FROM Leavetable  ');
//     res.json({ leaves: selectResults });
//   } catch (error) {
//     console.error('Error updating leave status:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }finally {
//     if (db) {
//       db.end();
//     }
//   }
// });

app.put("/leave/status/:id", async (req, res) => {
  let db;
  try {
    const leaveId = req.params.id;

    // Validate that leaveId is a valid integer
    if (isNaN(leaveId)) {
      return res.status(400).json({ error: "Invalid leave ID" });
    }

    // Extract updated leave data from the request body
    const { status } = req.body;

    db = await connectToDatabase();

    // Use parameterized query to prevent SQL injection
    const [results] = await db.execute(
      "UPDATE Leavetable SET status = ? WHERE leave_id = ?",
      [status, leaveId]
    );

    // Check if the update was successful
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Leave not found" });
    }

    // Fetch all leaves after the update
    const [selectResults] = await db.execute("SELECT * FROM Leavetable");
    res.json({ leaves: selectResults });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

// Update Employee Password
app.put("/updatedEmpPassword/:id", async (req, res) => {
  let db;
  try {
    const empId = req.params.id;

    // Validate that departmentId is a valid integer (optional)
    if (isNaN(empId)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    // Extract updated department data from the request body
    const { password } = req.body;

    db = await connectToDatabase();
    const [results] = await db.execute(
      "UPDATE employee_profile  SET password   = ? WHERE user_id = ?",
      [password, empId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const [resultsval] = await db.execute(
      "UPDATE user_profile   SET password   = ? WHERE user_id = ?",
      [password, empId]
    );

    if (resultsval.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [selectResultsEmployeeProfile] = await db.execute(
      "SELECT * FROM employee_profile "
    );
    const [selectResultsUserProfile] = await db.execute(
      "SELECT * FROM user_profile "
    );

    res.json({
      employees: selectResultsEmployeeProfile,
      user: selectResultsUserProfile,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) {
      db.end();
    }
  }
});

const corsOptions = {
  origin: "http://localhost:3000", // Replace with your React app's URL
  optionSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.listen(8081, () => {
  console.log("listening");
});

app.use(cors(corsOptions));

module.exports.handler = serverless(app);
