import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Button, Modal, Box, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import PieChartList from './pieChartList';
import PieChartYear from './pieChartYear';

function QuotaPrint() {
    const [data, setData] = useState([]);
    const [sumYearData, setSumYearData] = useState([]);
    const [sumUserData, setSumUserData] = useState([]);
    const [filteredSumYearData, setFilteredSumYearData] = useState([]);
    const [filteredSumUserData, setFilteredSumUserData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filterYear, setFilterYear] = useState('');
    const [filterDivision, setFilterDivision] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterStartDate, setFilterStartDate] = useState(null);
    const [filterEndDate, setFilterEndDate] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterBlackWhite, setFilterBlackWhite] = useState(false);
    const [filterColor, setFilterColor] = useState(false);
    const [years, setYears] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [filterCriteria, setFilterCriteria] = useState({
        year: '',
        blackWhite: false,
        color: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [divisionsResponse, statusesResponse, sumUserResponse, yearResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/division', { params: { table: 'QuotaPrint' } }),
                    axios.get('http://localhost:5000/api/status'),
                    axios.get('http://localhost:5000/api/sumUser'),
                    axios.get('http://localhost:5000/api/year', { params: { table: 'QuotaPrint' } })
                ]);

                const divisionData = divisionsResponse.data.map(item => item.divisionName);
                const statusData = statusesResponse.data.map(item => item.requestStatus);
                setDivisions(divisionData);
                setStatuses(statusData);

                const sumYearData = yearResponse.data;
                const yearData = [...new Set(sumYearData.map(item => item.year))].sort((a, b) => b - a); // สร้างลิสต์ปีที่ไม่ซ้ำและเรียงลำดับจากมากไปน้อย
                setYears(yearData);

                setSumYearData(sumYearData);
                setSumUserData(sumUserResponse.data);

                if (sumYearData.length > 0) {
                    const mostRecentYear = Math.max(...sumYearData.map(item => item.year));
                    setFilterYear(mostRecentYear);
                    setFilterCriteria(prevCriteria => ({ ...prevCriteria, year: mostRecentYear }));
                    fetchFilteredData(mostRecentYear);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
    
        const filteredSumYear = sumYearData.filter(item => {
            const isYearMatch = !filterCriteria.year || item.year === filterCriteria.year;
            const isBlackWhiteMatch = !filterCriteria.blackWhite || item.totalBlackWhite > 0;
            const isColorMatch = !filterCriteria.color || item.totalColor > 0;

            return isYearMatch && isBlackWhiteMatch && isColorMatch;
        });

        setFilteredSumYearData(filteredSumYear);

        const filteredSumUser = sumUserData.filter(item => {
            const isYearMatch = !filterCriteria.year || item.year === filterCriteria.year;
            return isYearMatch;
        });

        setFilteredSumUserData(filteredSumUser);
    }, [filterCriteria, sumYearData, sumUserData]);

    const fetchFilteredData = async (year, division, user, startDate, endDate, status, blackWhite, color) => {
        try {
            const [listResponse, sumYearResponse, sumUserResponse] = await Promise.all([
                axios.get('http://localhost:5000/api/list', {
                    params: {
                        year,
                        division,
                        user,
                        startDate: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
                        endDate: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
                        status,
                        blackWhite,
                        color
                    }
                }),
                axios.get('http://localhost:5000/api/sumYear', { params: { year } }),
                axios.get('http://localhost:5000/api/sumUser', { params: { year } }),
            ]);
    
            // console.log('List Response Data:', listResponse.data);
            // console.log('Sum Year Response Data:', sumYearResponse.data);
            // console.log('Sum User Response Data:', sumUserResponse.data);
    
            const formattedData = listResponse.data.map(row => ({
                ...row,
                deliveryDate: moment(row.deliveryDate).format('DD-MM-YYYY'),
                requestDateStart: moment(row.requestDateStart).format('DD-MM-YYYY'),
                requestDateEnd: moment(row.requestDateEnd).format('DD-MM-YYYY'),
                priorityName: row.priorityName
            }));
    
            setData(formattedData);
            setFilteredData(formattedData);
            setSumYearData(sumYearResponse.data);
            setSumUserData(sumUserResponse.data);
    
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        }
    };

    const handleFilter = () => {

        setFilterCriteria({
            year: filterYear,
            blackWhite: filterBlackWhite,
            color: filterColor
        });

        fetchFilteredData(filterYear, filterDivision, filterUser, filterStartDate, filterEndDate, filterStatus, filterBlackWhite, filterColor);
        setFilterModalOpen(false);
    };

    const columns = [
        { field: 'requestNo', headerName: 'Request No.', width: 130 },
        { field: 'subjectTypeName', headerName: 'Topic', width: 130 },
        { field: 'blackWhite', headerName: 'Black & White', width: 130 },
        { field: 'color', headerName: 'Color', width: 130 },
        { field: 'requester', headerName: 'Requester', width: 130 },
        { field: 'divisionName', headerName: 'Division', width: 130 },
        { field: 'deliveryDate', headerName: 'Date', width: 130 },
        { field: 'requestDateStart', headerName: 'Start', width: 130 },
        { field: 'requestDateEnd', headerName: 'End', width: 130 },
        { field: 'ownerJob', headerName: 'Owner Job', width: 130 },
        { field: 'requestStatus', headerName: 'Request Status', width: 130 },
        {
            field: 'view',
            headerName: 'Detail',
            width: 100,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewClick(params.row)}
                >
                    View
                </Button>
            ),
        },
    ];

    const handleViewClick = (rowData) => {
        navigate('/view-detail-quota', { state: { data: rowData } });
    };

    const handleSearch = (event) => {
        const searchText = event.target.value;
        setSearchText(searchText);

        if (!searchText.trim()) {
            setFilteredData(data);
            return;
        }

        const filtered = data.filter(item => {
            const lowerSearchText = searchText.toLowerCase();
            return (
                item.requestNo.toLowerCase().includes(lowerSearchText) ||
                item.subjectTypeName.toLowerCase().includes(lowerSearchText) ||
                item.requester.toLowerCase().includes(lowerSearchText) ||
                item.divisionName.toLowerCase().includes(lowerSearchText) ||
                item.deliveryDate.toLowerCase().includes(lowerSearchText) ||
                item.ownerJob.toLowerCase().includes(lowerSearchText) ||
                item.requestStatus.toLowerCase().includes(lowerSearchText)
            );
        });

        setFilteredData(filtered);
    };

    return (
        <div>
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1%' }}>Quota Print</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px' }}>
                <div style={{ flex: 1 }}>
                    <PieChartYear data={filteredSumYearData} />
                </div>
                <div style={{ flex: 1 }}>
                    <PieChartList data={filteredSumUserData} />
                </div>
            </div>
            <div style={{ display: 'flex', margin: '10px 0' }}>
                <TextField
                    label="Search"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    style={{ margin: '0 10px', width: '400px' }}
                />
                <Button variant="outlined" onClick={() => setFilterModalOpen(true)} style={{ marginRight: '10px' }}>
                    Filter
                </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '0 10px' }}>
                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredData.map((row, index) => ({ id: index, ...row }))}
                        columns={columns}
                        checkboxSelection={true}
                        autoHeight
                        initialState={{
                            pagination: {
                              paginationModel: { page: 0, pageSize: 20 },
                            },
                          }}
                        pageSizeOptions={[20, 40, 60, 80, 100]}
                    />
                </div>
            </div>

            <Modal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{ width: 400, p: 3, backgroundColor: 'white', margin: 'auto', marginTop: '10%', borderRadius: 1, boxShadow: 3 }}>
                    <h2 id="modal-title" style={{ textAlign: 'center' }}>Filter Options</h2>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="year-label">Select Year</InputLabel>
                        <Select
                            labelId="year-label"
                            label="Select Year"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {years.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="division-label">Select Division</InputLabel>
                        <Select
                            labelId="division-label"
                            label="Select Division"
                            value={filterDivision}
                            onChange={(e) => setFilterDivision(e.target.value)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {divisions.map(division => (
                                <MenuItem key={division} value={division}>{division}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Search User"
                        variant="outlined"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Start Date"
                        variant="outlined"
                        type="date"
                        value={filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : ''}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Date"
                        variant="outlined"
                        type="date"
                        value={filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : ''}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label">Select Status</InputLabel>
                        <Select
                            labelId="status-label"
                            label="Select Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {statuses.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterBlackWhite}
                                onChange={(e) => setFilterBlackWhite(e.target.checked)}
                            />
                        }
                        label="Black&White"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterColor}
                                onChange={(e) => setFilterColor(e.target.checked)}
                            />
                        }
                        label="Color"
                    />
                    <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <Button variant="outlined" onClick={() => setFilterModalOpen(false)} style={{ marginRight: '10px' }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleFilter}>
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}

export default QuotaPrint;
