package com.screenshotdetect;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.database.ContentObserver;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

public class ScreenshotModule extends ReactContextBaseJavaModule {

    private static final String TAG = "ScreenshotModule";
    private final ReactApplicationContext reactContext;
    private ContentObserver screenshotObserver;

    public ScreenshotModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ScreenshotModule";
    }

    @ReactMethod
    public void enableScreenshotDetection() {
        if (screenshotObserver == null) {
            screenshotObserver = new ContentObserver(new Handler()) {
                @Override
                public void onChange(boolean selfChange, Uri uri) {
                    super.onChange(selfChange, uri);
                    Log.d(TAG, "Screenshot detected!");
                    sendScreenshotEvent();
                }
            };
            ContentResolver contentResolver = reactContext.getContentResolver();
            contentResolver.registerContentObserver(
                    Uri.parse("content://media/external/images/media"),
                    true,
                    screenshotObserver
            );
        }
    }

    @ReactMethod
    public void disableScreenshotDetection() {
        if (screenshotObserver != null) {
            reactContext.getContentResolver().unregisterContentObserver(screenshotObserver);
            screenshotObserver = null;
            Log.d(TAG, "Screenshot detection disabled.");
        }
    }

    private void sendScreenshotEvent() {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onScreenshotTaken", "Screenshot detected");
        }

        // Send device details to API
        new Thread(() -> {
            try {
                JSONObject json = new JSONObject();
                json.put("OS", "Android");
                json.put("Device Name", Build.MODEL);
                json.put("MAC Address", "00:11:22:33:44:55"); // Example MAC, replace with actual
                json.put("IMEI", "123456789012345"); // Example IMEI, replace with actual
                json.put("Location", "Unknown"); // Add location retrieval logic
                json.put("Public IP", "192.168.1.1"); // Fetch actual public IP
                json.put("Screenshot Status", "Detected");

                URL url = new URL("https://your-api-endpoint.com/screenshot"); // Replace with actual API
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.getOutputStream().write(json.toString().getBytes());

                Scanner scanner = new Scanner(conn.getInputStream());
                while (scanner.hasNext()) {
                    Log.d(TAG, scanner.nextLine());
                }
                scanner.close();

            } catch (Exception e) {
                Log.e(TAG, "Error sending screenshot details", e);
            }
        }).start();
    }
}
