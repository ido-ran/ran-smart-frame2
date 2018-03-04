package com.oomkik.client.android;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.bumptech.glide.load.engine.DiskCacheStrategy;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
public class FullscreenActivity extends AppCompatActivity {
    /**
     * Whether or not the system UI should be auto-hidden after
     * {@link #AUTO_HIDE_DELAY_MILLIS} milliseconds.
     */
    private static final boolean AUTO_HIDE = true;

    /**
     * If {@link #AUTO_HIDE} is set, the number of milliseconds to wait after
     * user interaction before hiding the system UI.
     */
    private static final int AUTO_HIDE_DELAY_MILLIS = 3000;

    /**
     * Some older devices needs a small delay between UI widget updates
     * and a change of the status and navigation bar.
     */
    private static final int UI_ANIMATION_DELAY = 300;
    private final Handler mHideHandler = new Handler();
    private ImageView mContentView;
    private Button mDummyButton;

    private List<String> mPhotoUrls = new ArrayList<>();
    private Handler mHandler = new Handler();
    private int mPhotoIndex = -1;

    /**
     * Start as false and set to true once the activity has been destroyed.
     * This is checked by mShowNextPhoto for e.g. to stop delayed operations.
     */
    private boolean mActivityDestroyed;

    private final Runnable mShowNextPhoto = new Runnable() {
        @Override
        public void run() {
            if (mActivityDestroyed) {
                // The activity has been destroyed, ignore this delayed run.
                return;
            }

            mPhotoIndex++;

            if (mPhotoIndex + 1 > mPhotoUrls.size()) {
                mPhotoIndex = 0;
            }

            GlideApp.with(FullscreenActivity.this)
                    .load(mPhotoUrls.get(mPhotoIndex))
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .fitCenter()
                    .into(mContentView);

            mHandler.postDelayed(mShowNextPhoto, 20000);
        }
    };

    private final Runnable mHidePart2Runnable = new Runnable() {
        @SuppressLint("InlinedApi")
        @Override
        public void run() {
            // Delayed removal of status and navigation bar

            // Note that some of these constants are new as of API 16 (Jelly Bean)
            // and API 19 (KitKat). It is safe to use them, as they are inlined
            // at compile-time and do nothing on earlier devices.
            mContentView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LOW_PROFILE
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
    };
    private View mControlsView;
    private final Runnable mShowPart2Runnable = new Runnable() {
        @Override
        public void run() {
            // Delayed display of UI elements
            ActionBar actionBar = getSupportActionBar();
            if (actionBar != null) {
                actionBar.show();
            }
            mControlsView.setVisibility(View.VISIBLE);
        }
    };
    private boolean mVisible;
    private final Runnable mHideRunnable = new Runnable() {
        @Override
        public void run() {
            hide();
        }
    };
    /**
     * Touch listener to use for in-layout UI controls to delay hiding the
     * system UI. This is to prevent the jarring behavior of controls going away
     * while interacting with activity UI.
     */
    private final View.OnTouchListener mDelayHideTouchListener = new View.OnTouchListener() {
        @Override
        public boolean onTouch(View view, MotionEvent motionEvent) {
            if (AUTO_HIDE) {
                delayedHide(AUTO_HIDE_DELAY_MILLIS);
            }
            return false;
        }
    };

    private BroadcastReceiver mHandleQuickBroadcast = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            System.out.println("shutting down FullscreenActivity...");

            // Quit the app
            finish();
        }
    };

    @Override
    protected void onDestroy() {
        mActivityDestroyed = true;
        super.onDestroy();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_fullscreen);

        // Keep screen on all the time
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        mVisible = true;
        mControlsView = findViewById(R.id.fullscreen_content_controls);
        mContentView = (ImageView) findViewById(R.id.image_view);
        mDummyButton = (Button) findViewById(R.id.dummy_button);

        fetchFrameData();

        // Set up the user interaction to manually show or hide the system UI.
        mContentView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                toggle();
            }
        });

        // Upon interacting with UI controls, delay any scheduled hide()
        // operations to prevent the jarring behavior of controls going away
        // while interacting with the UI.
        mDummyButton.setOnTouchListener(mDelayHideTouchListener);
        mDummyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent selectFrameIntent = new Intent(FullscreenActivity.this, SelectFrameActivity.class);
                startActivityForResult(selectFrameIntent, 0);
            }
        });

        Toolbar myToolbar = (Toolbar) findViewById(R.id.my_toolbar);
        setSupportActionBar(myToolbar);

        LocalBroadcastManager mgr = LocalBroadcastManager.getInstance(this);
        mgr.registerReceiver(mHandleQuickBroadcast, new IntentFilter("quit-please"));

        scheduleShutdownTimer();
    }

    private void scheduleShutdownTimer() {
        // Set the alarm to start at 22:00 PM which will quit the app to allow it to auto-update
        long currentTimeInMs = System.currentTimeMillis();
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(currentTimeInMs);
        calendar.set(Calendar.HOUR_OF_DAY, 22);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);

        long alarmTimeInMs = calendar.getTimeInMillis();

        if (alarmTimeInMs < currentTimeInMs) {
            // The alarm time of the day has passed, add another day to wait until that time tomorrow.
            alarmTimeInMs += TimeUnit.DAYS.toMillis(1);
        }

        AlarmManager alarmMgr = (AlarmManager)getSystemService(Context.ALARM_SERVICE);

        Intent intent = new Intent(this, ShutdownReceiver.class);
        intent.setAction(ShutdownReceiver.ACTION_SHUTDOWN);
        PendingIntent pi = PendingIntent.getBroadcast(this, 0, intent, 0);

        alarmMgr.set(AlarmManager.RTC_WAKEUP, alarmTimeInMs,
                //System.currentTimeMillis() + 2 * 1000
                pi);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode == RESULT_OK) {
            String frameName = data.getExtras().getString("name");
            String id = data.getExtras().getString("id");
            String accessKey = data.getExtras().getString("accessKey");

            saveSelectedFrame(frameName, id, accessKey);
            fetchFrameData();
        }
    }

    private void saveSelectedFrame(String frameName, String id, String accessKey) {
        getPreferences().edit()
                .putString("frameName", frameName)
                .putString("frameId", id)
                .putString("frameAccessKey", accessKey)
                .apply();
    }

    private SharedPreferences getPreferences() {
        return getPreferences(MODE_PRIVATE);
    }

    private FrameInfo loadSelectedFrame() {
        SharedPreferences pref = getPreferences();
        FrameInfo selectedFrame = new FrameInfo();
        selectedFrame.name = pref.getString("frameName", null);
        selectedFrame.id = pref.getString("frameId", null);
        selectedFrame.accessKey = pref.getString("frameAccessKey", null);

        if (selectedFrame.name == null ||
                selectedFrame.id == null ||
                selectedFrame.accessKey == null) {

            // if any of the fields are null we ignore the stored preferences
            return null;
        } else {
            return selectedFrame;
        }
    }

    private void fetchFrameData() {

        final FrameInfo selectedFrame = loadSelectedFrame();
        if (selectedFrame == null) {
            debug("No frame is selected yet");
            return;
        }

        debug("Loading frame data...");

        RequestQueue queue = Volley.newRequestQueue(this);

        String url = MessageFormat.format(
                Apis.API_ROOT_URL + "/public/api/frames/{0}?access_key={1}",
                selectedFrame.id, selectedFrame.accessKey);

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                debug("Data loaded");
                parseResponse(response, selectedFrame);
                saveFrameData(response.toString());
            }
        },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        debug("Data load failed");
                        Log.e("FullScreenActivity", "Fail to fetch frame data. " + error.getMessage());

                        String cachedFrameData = getFrameData();
                        if (cachedFrameData == null) return;

                        try {
                            JSONObject cachedFrameDataJson = new JSONObject(cachedFrameData);
                            parseResponse(cachedFrameDataJson, selectedFrame);
                        } catch (JSONException e) {
                            e.printStackTrace();
                            debug("Cached frame data is not JSON parsable");
                        }
                    }
                });

        // Add the request to the RequestQueue.
        queue.add(request);
    }

    private void saveFrameData(String frameData) {
        getPreferences().edit()
                .putString("frameData", frameData)
                .apply();
    }

    public String getFrameData() {
        return getPreferences().getString("frameData", null);
    }

    private void debug(String message) {
        if (mDummyButton != null) {
            mDummyButton.setText(message);
        }
    }

    private void parseResponse(JSONObject response, FrameInfo selectedFrame) {
        try {
            JSONArray streams = response.getJSONArray("streams");
            for (int streamIndex = 0; streamIndex < streams.length(); streamIndex++) {
                JSONObject stream = streams.getJSONObject(streamIndex);
                String streamId = stream.getString("id");

                JSONArray photos = stream.getJSONArray("photos");
                for (int photoIndex = 0; photoIndex < photos.length(); photoIndex++) {
                    JSONObject photo = photos.getJSONObject(photoIndex);
                    String photoId = photo.getString("id");

                    String url =
                            MessageFormat.format(
                                    Apis.API_ROOT_URL + "/public/api/" +
                                            "frames/{0}/streams/{1}/photos/{2}?access_key={3}",
                                    selectedFrame.id, streamId, photoId, selectedFrame.accessKey);

                    mPhotoUrls.add(url);
                }

            }

            startShowPhotos();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void startShowPhotos() {
        mShowNextPhoto.run();
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        // Trigger the initial hide() shortly after the activity has been
        // created, to briefly hint to the user that UI controls
        // are available.
        delayedHide(100);
    }

    private void toggle() {
        if (mVisible) {
            hide();
        } else {
            show();
        }
    }

    private void hide() {
        // Hide UI first
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }
        mControlsView.setVisibility(View.GONE);
        mVisible = false;

        // Schedule a runnable to remove the status and navigation bar after a delay
        mHideHandler.removeCallbacks(mShowPart2Runnable);
        mHideHandler.postDelayed(mHidePart2Runnable, UI_ANIMATION_DELAY);
    }

    @SuppressLint("InlinedApi")
    private void show() {
        // Show the system bar
        mContentView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        mVisible = true;

        // Schedule a runnable to display UI elements after a delay
        mHideHandler.removeCallbacks(mHidePart2Runnable);
        mHideHandler.postDelayed(mShowPart2Runnable, UI_ANIMATION_DELAY);
    }

    /**
     * Schedules a call to hide() in [delay] milliseconds, canceling any
     * previously scheduled calls.
     */
    private void delayedHide(int delayMillis) {
        mHideHandler.removeCallbacks(mHideRunnable);
        mHideHandler.postDelayed(mHideRunnable, delayMillis);
    }

    private static class FrameInfo {
        public String id;
        public String accessKey;
        public String name;
    }
}
