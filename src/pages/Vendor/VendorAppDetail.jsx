import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import AppDetail from '../../Components/Vendor/AppDetail';
import vendorService from '../../services/vendorService';
import { Loader2, AlertCircle } from 'lucide-react';
import PrimaryButton from '../../Components/Vendor/PrimaryButton';

const VendorAppDetail = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const detailData = await vendorService.getAppDetails(appId);
            setData(detailData);
            setError(null);
        } catch (err) {
            setError('Failed to load app details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [appId]);

    const handleDeactivate = async () => {
        try {
            await vendorService.deactivateApp(appId);
            // Refresh data to show Inactive status
            fetchData();
        } catch (err) {
            alert('Deactivation failed. Please try again.');
        }
    };

    const handleReactivate = async () => {
        try {
            await vendorService.reactivateApp(appId);
            fetchData();
        } catch (err) {
            alert('Reactivation failed. Please try again.');
        }
    };

    const handleSubmitForReview = async () => {
        try {
            await vendorService.submitForReview(appId);
            fetchData();
        } catch (err) {
            alert('Submission failed. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            await vendorService.deleteApp(appId);
            navigate('/vendor/overview'); // Redirect to dashboard after delete
        } catch (err) {
            alert('Deletion failed. Please try again.');
        }
    };

    const handleUpdateUrl = async (newUrl) => {
        try {
            await vendorService.updateApp(appId, { url: newUrl });
            fetchData();
        } catch (err) {
            alert('Update failed. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Fetching app usage data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-900 mb-2">{error}</h3>
                <PrimaryButton onClick={fetchData} className="mt-4">
                    Retry Loading
                </PrimaryButton>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <AppDetail
                app={data.agent}
                usage={data.usage}
                onDeactivate={handleDeactivate}
                onReactivate={handleReactivate}
                onSubmitForReview={handleSubmitForReview}
                onDelete={handleDelete}
                onUpdateUrl={handleUpdateUrl}
                onBack={() => navigate('/vendor/apps')}
            />
        </div>
    );
};

export default VendorAppDetail;
