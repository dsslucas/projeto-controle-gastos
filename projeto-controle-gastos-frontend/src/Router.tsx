import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './screens/Home';
import Investments from './screens/Investments';
import Report from './screens/Report';

const Router = () => {
    return (
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/report" element={<Report />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    )
}

export default Router