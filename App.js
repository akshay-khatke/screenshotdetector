import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { enableScreenshotDetection, disableScreenshotDetection } from '../ScreenshotDetect/NativeScreenshotModule';

const App = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleScreenshot = () => {
    if (isActive) {
      disableScreenshotDetection();
    } else {
      enableScreenshotDetection();
    }
    setIsActive(!isActive);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screenshot Detection</Text>
      <Button title={isActive ? 'Deactivate' : 'Activate'} onPress={toggleScreenshot} />
    </View>
  );
};

export default App;
