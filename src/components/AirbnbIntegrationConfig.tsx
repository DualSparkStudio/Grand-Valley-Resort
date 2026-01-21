import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/supabase';
import { getAirbnbBookings } from '../lib/airbnb-integration';

interface AirbnbIntegrationConfigProps {
  onConfigChange?: (icalUrl: string) => void;
}

const AirbnbIntegrationConfig: React.FC<AirbnbIntegrationConfigProps> = ({
  onConfigChange
}) => {
  const [icalUrl, setIcalUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    bookingsCount?: number;
  } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const settings = await api.getCalendarSettings();
      const airbnbSetting = settings.find(s => s.setting_key === 'airbnb_ical_url');
      if (airbnbSetting) {
        setIcalUrl(airbnbSetting.setting_value);
      }
    } catch (error) {
    }
  };

  const handleSave = async () => {
    if (!icalUrl.trim()) {
      toast.error('Please enter a valid iCal URL');
      return;
    }

    setIsLoading(true);
    try {
      await api.updateCalendarSetting('airbnb_ical_url', icalUrl.trim());
      toast.success('Airbnb integration configured successfully!');
      onConfigChange?.(icalUrl.trim());
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!icalUrl.trim()) {
      toast.error('Please enter a valid iCal URL first');
      return;
    }

    setIsTesting(true);
    setTestResults(null);
    
    try {
      const bookings = await getAirbnbBookings(icalUrl.trim());
      setTestResults({
        success: true,
        message: `Successfully connected to Airbnb calendar!`,
        bookingsCount: bookings.length
      });
      toast.success(`Found ${bookings.length} Airbnb bookings`);
    } catch (error) {
      setTestResults({
        success: false,
        message: 'Failed to connect to Airbnb calendar. Please check the URL and try again.'
      });
      toast.error('Failed to connect to Airbnb calendar');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await api.updateCalendarSetting('airbnb_ical_url', '');
      setIcalUrl('');
      setTestResults(null);
      toast.success('Airbnb integration removed successfully!');
      onConfigChange?.('');
    } catch (error) {
      toast.error('Failed to remove configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🏠 Airbnb Calendar Integration
        </h3>
        <p className="text-sm text-gray-600">
          Connect your Airbnb calendar to sync bookings with your admin calendar.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="ical-url" className="block text-sm font-medium text-gray-700 mb-2">
            Airbnb iCal URL
          </label>
          <input
            type="url"
            id="ical-url"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Find this in your Airbnb hosting dashboard under Calendar → Export Calendar
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleTest}
            disabled={isTesting || !icalUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading || !icalUrl.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </button>
          
          {icalUrl && (
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLoading ? 'Removing...' : 'Remove Integration'}
            </button>
          )}
        </div>

        {testResults && (
          <div className={`p-4 rounded-md ${
            testResults.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full mr-3 ${
                testResults.success ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div>
                <p className={`text-sm font-medium ${
                  testResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResults.message}
                </p>
                {testResults.success && testResults.bookingsCount !== undefined && (
                  <p className="text-xs text-green-600 mt-1">
                    Found {testResults.bookingsCount} booking{testResults.bookingsCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">How to get your Airbnb iCal URL:</h4>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Log in to your Airbnb hosting dashboard</li>
          <li>Go to Calendar → Export Calendar</li>
          <li>Copy the iCal URL for your listing</li>
          <li>Paste it in the field above</li>
          <li>Test the connection and save</li>
        </ol>
      </div>
    </div>
  );
};

export default AirbnbIntegrationConfig; 
