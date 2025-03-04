import { NativeModules, Button, View, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

const { ScreenshotModule } = NativeModules;

const ScreenshotToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState({});

  useEffect(() => {
    collectDeviceDetails();
  }, []);

  const collectDeviceDetails = async () => {
    try {
      const os = DeviceInfo.getSystemName();
      const deviceName = await DeviceInfo.getDeviceName();
      const macAddress = await DeviceInfo.getMacAddress();
      const imei = await DeviceInfo.getUniqueId();
      
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const ipResponse = await axios.get('https://api64.ipify.org?format=json');
          const publicIP = ipResponse.data.ip;

          setDeviceDetails({
            os,
            deviceName,
            macAddress,
            imei,
            location: { latitude, longitude },
            publicIP,
            screenshotStatus: isEnabled ? "Enabled" : "Disabled",
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error("Error collecting device details:", error);
    }
  };

  const toggleScreenshot = async () => {
    if (isEnabled) {
      ScreenshotModule.disableScreenshot();
    } else {
      ScreenshotModule.enableScreenshot();
    }
    setIsEnabled(!isEnabled);

    // Update the screenshot status and send the data
    setDeviceDetails((prev) => {
      const updatedDetails = { ...prev, screenshotStatus: isEnabled ? "Disabled" : "Enabled" };
      sendDataToAPI(updatedDetails);
      return updatedDetails;
    });
  };

  const sendDataToAPI = async (data) => {
    try {
      await axios.post('https://your-api-endpoint.com/device-details', data);
      Alert.alert("Success", "Device details sent!");
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Failed to send device details.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={isEnabled ? 'Deactivate' : 'Activate'}
        onPress={toggleScreenshot}
      />
    </View>
  );
};

export default ScreenshotToggle;
