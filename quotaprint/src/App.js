import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuotaPrint from './components/quotaPrint';
import ViewDetailQuota from './components/viewDetailQuota';
import BorrowLaptop from './components/borrowLaptop';
import ViewDetailBorrow from './components/viewDetailBorrow';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<QuotaPrint />} />
                <Route path="/borrow-laptop" element={<BorrowLaptop />} />
                <Route path="/view-detail-quota" element={<ViewDetailQuota />} />
                <Route path="/view-detail-borrow" element={<ViewDetailBorrow />} />
            </Routes>
        </Router>
    );
}

export default App;
