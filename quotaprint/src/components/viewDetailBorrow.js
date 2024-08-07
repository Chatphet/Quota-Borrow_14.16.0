import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, FormControl, InputLabel, FilledInput, Checkbox, FormControlLabel, Button, CircularProgress } from '@mui/material';
import FroalaEditor from 'react-froala-wysiwyg';
import 'froala-editor/css/froala_editor.pkgd.min.css';

function ViewDetailBorrow() {
    const location = useLocation();
    const navigate = useNavigate();
    const { data } = location.state || {};
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (data && data.requestDetail) {
            setEditorContent(data.requestDetail);
        }
        setLoading(false);
    }, [data]);

    const handleBackClick = () => {
        navigate(-1);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (!data) {
        return <div>No data available</div>;
    }

    const isInOfficeChecked = data.borrowStatusID === 1;
    const isOutOfficeChecked = data.borrowStatusID === 2;

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                <h1>IT Request</h1>
            </Box>
            <Button variant="contained" onClick={handleBackClick} style={{ marginBottom: '20px' }}>Back</Button>
            <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: '35%' }}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel htmlFor="division">Division</InputLabel>
                            <FilledInput id="division" value={data.divisionName} disabled />
                        </FormControl>
                    </Box>
                    <Box sx={{ width: '20%' }}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel htmlFor="requestNo">IT Request no.</InputLabel>
                            <FilledInput id="requestNo" value={data.requestNo} disabled />
                        </FormControl>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: '15%' }}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel htmlFor="requestTypeName">Type</InputLabel>
                            <FilledInput id="requestTypeName" value={data.requestTypeName} disabled />
                        </FormControl>
                    </Box>
                    <Box sx={{ width: '40%' }}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel htmlFor="subjectTypeName">SubjectType</InputLabel>
                            <FilledInput id="subjectTypeName" value={data.subjectTypeName} disabled />
                        </FormControl>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '20%' }}>
                        <FormControlLabel
                            control={<Checkbox checked={isInOfficeChecked} />}
                            label="in office"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '30%' }}>
                        <FormControlLabel
                            control={<Checkbox checked={isOutOfficeChecked} />}
                            label="out office (or more than 1 day)"
                        />
                    </Box>
                </Box>
                <Box sx={{ width: '40%' }}>
                    <FormControl variant="filled" fullWidth>
                        <InputLabel htmlFor="assetID">Asset</InputLabel>
                        <FilledInput id="assetID" value={data.asset} disabled />
                    </FormControl>
                </Box>
                <Box sx={{ width: '40%' }}>
                    <FormControl variant="filled" fullWidth>
                        <InputLabel htmlFor="priorityName">Priority</InputLabel>
                        <FilledInput id="priorityName" value={data.priorityName} disabled />
                    </FormControl>
                </Box>
                <Box sx={{ mt: 0 }}>
                    <FormControl variant="filled" fullWidth>
                        <p style={{ margin: '4px 0' }}>Detail</p>
                        <FroalaEditor
                            tag='textarea'
                            model={editorContent}
                            onModelChange={setEditorContent}
                            config={{
                                placeholderText: '',
                                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'color', 'undo', 'redo'],
                                heightMin: 100,
                                heightMax: 250,
                            }}
                        />
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: '15%' }}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel htmlFor="deliveryDate">Delivery Date</InputLabel>
                            <FilledInput id="deliveryDate" value={data.deliveryDate} disabled />
                        </FormControl>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: '20%' }}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel htmlFor="requester">Requester</InputLabel>
                            <FilledInput id="requester" value={data.requester} disabled />
                        </FormControl>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ViewDetailBorrow;
