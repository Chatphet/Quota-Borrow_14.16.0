const express = require("express");
const cors = require("cors");
const app = express();
const { connectAndQuery } = require("./sql");
const sql = require("mssql/msnodesqlv8");
require("dotenv").config();

app.use(cors());
const port = 5000;

app.get("/api/year", async function (req, res, next) {
    const table = req.query.table;

    // console.log('Filters received list:', { table });
    // console.log('------------');

    let sqlQuery = `SELECT YEAR(r.deliveryDate) AS year FROM Request r`;
    
    const validTables = ['QuotaPrint', 'BorrowNotebook']; // ใส่ชื่อตารางที่อนุญาต
    if (table && validTables.includes(table)) {
        sqlQuery += ` INNER JOIN ${table} x ON r.requestID = x.requestID`;
    }

    sqlQuery += ` GROUP BY YEAR(r.deliveryDate)`;

    try {
        const data = await connectAndQuery(sqlQuery, []);

        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/division", async function (req, res, next) {
    const table = req.query.table;

    // console.log('Filters received list:', { table });
    // console.log('------------');

    let sqlQuery = `SELECT r.divisionName FROM Request r`

    const validTables = ['QuotaPrint', 'BorrowNotebook']; // ใส่ชื่อตารางที่อนุญาต
    if (table || validTables.includes(table)) {
        sqlQuery += ` INNER JOIN ${table} x ON r.requestID = x.requestID`;
    }

    sqlQuery += ` GROUP BY r.divisionName`; 

    try {
        const data = await connectAndQuery(sqlQuery, []);

        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/list", async function (req, res, next) {
    const year = req.query.year;
    const division = req.query.division;
    const user = req.query.user;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const status = req.query.status;
    const blackWhite = req.query.blackWhite;
    const color = req.query.color;
    
    // console.log('Filters received list:', { year, division, user, startDate, endDate, status, blackWhite, color });
    // console.log('------------');

    let sqlQuery = `SELECT r.*, qp.black_white AS blackWhite,
                            qp.color AS color, 
                            (qp.black_white + qp.color) AS sumRound,
                            SUM(qp.black_white + qp.color) OVER (PARTITION BY r.requester, YEAR(r.deliveryDate)) AS sumUserYear,
                            rs.requestStatus AS requestStatus,
                            rt.requestTypeName,
                            st.subjectTypeName,
                            p.priorityName,
                            YEAR(r.deliveryDate) AS year
                    FROM QuotaPrint qp
                    INNER JOIN Request r ON r.requestID = qp.requestID
                    INNER JOIN RequestType rt ON rt.requestTypeID = r.requestTypeID
                    INNER JOIN SubjectType st ON st.subjectTypeID = r.subjectTypeID
                    INNER JOIN RequestStatus rs ON rs.requestStatusID = r.requestStatusID
                    INNER JOIN Priority p ON p.priorityID = r.priorityID
                    WHERE 1=1`;

    let queryParams = [];
    
    if (year) {
        sqlQuery += ` AND YEAR(r.deliveryDate) = @year`;
        queryParams.push({ name: 'year', type: sql.Int, value: parseInt(year) });
    }

    if (division) {
        sqlQuery += ` AND LOWER(r.divisionName) = LOWER(@division)`;
        queryParams.push({ name: 'division', type: sql.NVarChar, value: division });
    }

    if (user) {
        sqlQuery += ` AND LOWER(r.requester) LIKE '%' + LOWER(@user) + '%'`;
        queryParams.push({ name: 'user', type: sql.NVarChar, value: user });
    }

    if (startDate) {
        sqlQuery += ` AND r.deliveryDate >= @startDate`;
        queryParams.push({ name: 'startDate', type: sql.Date, value: new Date(startDate) });
    }

    if (endDate) {
        sqlQuery += ` AND r.deliveryDate <= @endDate`;
        queryParams.push({ name: 'endDate', type: sql.Date, value: new Date(endDate) });
    }

    if (status) {
        sqlQuery += ` AND LOWER(rs.requestStatus) = LOWER(@status)`;
        queryParams.push({ name: 'status', type: sql.NVarChar, value: status });
    }

    if (blackWhite === 'true') {
        sqlQuery += ` AND qp.black_white > 0`;
    }

    if (color === 'true') {
        sqlQuery += ` AND qp.color > 0`;
    }

    try {
        const data = await connectAndQuery(sqlQuery, queryParams);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/sumYear", async function (req, res, next) {
    const year = req.query.year;
    // console.log('Filters received 2:', { year });
    // console.log('------------');

    let sqlQuery = `SELECT YEAR(r.deliveryDate) AS year, 
                            SUM(qp.black_white) AS totalBlackWhite, 
                            SUM(qp.color) AS totalColor
                    FROM QuotaPrint qp
                    INNER JOIN Request r ON r.requestID = qp.requestID
                    WHERE 1=1`;

    let queryParams = [];
    
    if (year) {
        sqlQuery += ` AND YEAR(r.deliveryDate) = @year`;
        queryParams.push({ name: 'year', type: sql.Int, value: parseInt(year) });
    }

    sqlQuery += ` GROUP BY YEAR(r.deliveryDate)
                  ORDER BY Year DESC;`;

    try {
        const data = await connectAndQuery(sqlQuery, queryParams);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/api/sumUser", async function (req, res, next) {
    const year = req.query.year;
    // console.log('Filters received sumUser:', { year });
    // console.log('------------');

    let sqlQuery = `SELECT YEAR(r.deliveryDate) AS year, 
                            r.requester,
                            SUM(qp.black_white + qp.color) AS sumUserYear
                    FROM QuotaPrint qp
                    INNER JOIN Request r ON r.requestID = qp.requestID
                    WHERE 1=1`;

    let queryParams = [];
    
    if (year) {
        sqlQuery += ` AND YEAR(r.deliveryDate) = @year`;
        queryParams.push({ name: 'year', type: sql.Int, value: parseInt(year) });
    }

    sqlQuery += ` GROUP BY r.requester, YEAR(r.deliveryDate)
                  ORDER BY year DESC;`;

    try {
        const data = await connectAndQuery(sqlQuery, queryParams);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/sumBorrow", async function (req, res, next) {
    const year = req.query.year;
    // console.log('Filters received sumUser:', { year });
    // console.log('------------');

    let sqlQuery = `SELECT YEAR(r.deliveryDate) AS year, 
                            r.requester,
                            COUNT(r.requester) AS sumUserYear
                    FROM BorrowNotebook bn
                    INNER JOIN Request r ON r.requestID = bn.requestID
                    WHERE 1=1`;

    let queryParams = [];
    
    if (year) {
        sqlQuery += ` AND YEAR(r.deliveryDate) = @year`;
        queryParams.push({ name: 'year', type: sql.Int, value: parseInt(year) });
    }

    sqlQuery += ` GROUP BY r.requester, YEAR(r.deliveryDate)
                  ORDER BY year DESC;`;

    try {
        const data = await connectAndQuery(sqlQuery, queryParams);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/status", async function (req, res, next) {
    try {
        const data = await connectAndQuery(`SELECT rs.requestStatus
                                            FROM 
                                                RequestStatus rs;`);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/borrowList", async function (req, res, next) {
    const year = req.query.year;
    const division = req.query.division;
    const user = req.query.user;
    const borrowStartDate = req.query.borrowStartDate;
    const borrowEndDate = req.query.borrowEndDate;
    const status = req.query.status;
    const borrowStatus = req.query.borrowStatus;
    const location = req.query.location;

    console.log('Filters received borrowList:', { year, division, user, borrowStartDate, borrowEndDate, status, borrowStatus, location });
    console.log('------------');

    let sqlQuery = `SELECT bn.*,
                           r.requestNo,
                           r.requestName,
                           r.requester,
                           r.divisionName,
                           r.ownerJob,
                           r.deliveryDate,
                           p.priorityName,
                           rs.requestStatus,
                           bs.borrowStatusName,
                           rt.requestTypeName,
                           st.subjectTypeName,
                           l.locationName,
                           YEAR(r.deliveryDate) AS year
                    FROM BorrowNotebook bn
                    INNER JOIN Request r ON r.requestID = bn.requestID
                    INNER JOIN Priority p ON p.priorityID = r.priorityID
                    INNER JOIN Location l ON l.locationID = bn.locationID
                    INNER JOIN RequestType rt ON rt.requestTypeID = r.requestTypeID
                    INNER JOIN SubjectType st ON st.subjectTypeID = r.subjectTypeID
                    INNER JOIN BorrowStatus bs ON bs.borrowStatusID = bn.borrowStatusID
                    INNER JOIN RequestStatus rs ON rs.requestStatusID = r.requestStatusID
                    WHERE 1=1`;

    let queryParams = [];

    if (year) {
        sqlQuery += ` AND YEAR(r.deliveryDate) = @year`;
        queryParams.push({ name: 'year', type: sql.Int, value: parseInt(year) });
    }

    if (division) {
        sqlQuery += ` AND LOWER(r.divisionName) = LOWER(@division)`;
        queryParams.push({ name: 'division', type: sql.NVarChar, value: division });
    }

    if (user) {
        sqlQuery += ` AND LOWER(r.requester) LIKE '%' + LOWER(@user) + '%'`;
        queryParams.push({ name: 'user', type: sql.NVarChar, value: user });
    }

    if (borrowStartDate && borrowEndDate) {
        sqlQuery += ` AND bn.borrowStartDate BETWEEN @borrowStartDate AND @borrowEndDate`;
        queryParams.push({ name: 'borrowStartDate', type: sql.Date, value: new Date(borrowStartDate) });
        queryParams.push({ name: 'borrowEndDate', type: sql.Date, value: new Date(borrowEndDate) });
    } else if (borrowStartDate) {
        sqlQuery += ` AND bn.borrowStartDate >= @borrowStartDate`;
        queryParams.push({ name: 'borrowStartDate', type: sql.Date, value: new Date(borrowStartDate) });
    } else if (borrowEndDate) {
        sqlQuery += ` AND bn.borrowEndDate <= @borrowEndDate`;
        queryParams.push({ name: 'borrowEndDate', type: sql.Date, value: new Date(borrowEndDate) });
    }
    

    if (status) {
        sqlQuery += ` AND LOWER(rs.requestStatus) = LOWER(@status)`;
        queryParams.push({ name: 'status', type: sql.NVarChar, value: status });
    }

    if (borrowStatus) {
        sqlQuery += ` AND LOWER(bs.borrowStatusName) = LOWER(@borrowStatus)`;
        queryParams.push({ name: 'borrowStatus', type: sql.NVarChar, value: borrowStatus });
    }

    if (location) {
        sqlQuery += ` AND LOWER(l.locationName) = LOWER(@location)`;
        queryParams.push({ name: 'location', type: sql.NVarChar, value: location });
    }

    try {
        const data = await connectAndQuery(sqlQuery, queryParams);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/borrowStatus", async function (req, res, next) {
    try {
        const data = await connectAndQuery(`SELECT bs.borrowStatusName
                                            FROM 
                                                BorrowStatus bs;`);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/location", async function (req, res, next) {
    try {
        const data = await connectAndQuery(`SELECT l.locationName
                                            FROM 
                                                Location l`);
        res.json(data);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
