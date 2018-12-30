package com.oomkik.client.android

import android.app.Activity
import android.arch.lifecycle.Observer
import android.arch.lifecycle.ViewModelProviders
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ApplicationInfo
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.view.Menu
import android.view.MenuItem
import android.view.View
import com.android.volley.toolbox.Volley
import com.bumptech.glide.load.engine.DiskCacheStrategy
import kotlinx.android.synthetic.main.activity_main.*

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
class MainActivity : AppCompatActivity() {

    private val SLIDESHOW_NOT_RUNNING = -1;

    private val mHideHandler = Handler()
    private val mHidePart2Runnable = Runnable {
        // Delayed removal of status and navigation bar

        // Note that some of these constants are new as of API 16 (Jelly Bean)
        // and API 19 (KitKat). It is safe to use them, as they are inlined
        // at compile-time and do nothing on earlier devices.
        image_view.systemUiVisibility =
                View.SYSTEM_UI_FLAG_LOW_PROFILE or
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
    }
    private val mShowPart2Runnable = Runnable {
        // Delayed display of UI elements
        supportActionBar?.show()
        fullscreen_content_controls.visibility = View.VISIBLE
    }
    private var mVisible: Boolean = false
    private val mHideRunnable = Runnable { hide() }
    /**
     * Touch listener to use for in-layout UI controls to delay hiding the
     * system UI. This is to prevent the jarring behavior of controls going away
     * while interacting with activity UI.
     */
    private val mDelayHideTouchListener = View.OnTouchListener { _, _ ->
        if (AUTO_HIDE) {
            delayedHide(AUTO_HIDE_DELAY_MILLIS)
        }
        false
    }

    /**
     * Start as false and set to true once the activity has been destroyed.
     * This is checked by mShowNextPhoto for e.g. to stop delayed operations.
     */
    private var mActivityDestroyed: Boolean = false

    private var mPhotoUrls: List<String> = emptyList()
    private val mHandler = Handler()
    private var mPhotoIndex = SLIDESHOW_NOT_RUNNING

    private lateinit var mViewModel: PhotosViewModel

    /**
     * The delay (in ms) to switch to the next photo.
     */
    private val FRAME_SWITCH_PHOTO_DELAY_MS = 6000

    private val mShowNextPhoto = object : Runnable {
        override fun run() {
            if (mActivityDestroyed) {
                // The activity has been destroyed, ignore this delayed run.
                return
            }

            mPhotoIndex++

            if (mPhotoIndex + 1 > mPhotoUrls.size) {
                mPhotoIndex = 0
            }

            GlideApp.with(this@MainActivity)
                    .load(mPhotoUrls.get(mPhotoIndex))
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .fitCenter()
                    .into(image_view)

            mHandler.postDelayed(this, FRAME_SWITCH_PHOTO_DELAY_MS.toLong())
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        HttpSingleton.queue = Volley.newRequestQueue(this)

        setContentView(R.layout.activity_main)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        mVisible = true

        // Set up the user interaction to manually show or hide the system UI.
        image_view.setOnClickListener { toggle() }

        // Upon interacting with UI controls, delay any scheduled hide()
        // operations to prevent the jarring behavior of controls going away
        // while interacting with the UI.
        dummy_button.setOnTouchListener(mDelayHideTouchListener)

        mViewModel = ViewModelProviders.of(this).get(PhotosViewModel::class.java)

        // Load saved frame info
        val savedFrameInfo = loadSelectedFrame()
        if (savedFrameInfo != null) {
            mViewModel.reloadPhotos(savedFrameInfo)
        }

        mViewModel.getPhotos().observe(this, Observer {
            mPhotoUrls = if (it == null) emptyList() else it

            if (mPhotoIndex == SLIDESHOW_NOT_RUNNING) {
                startShowPhotos()
            }
        })
    }

    private fun startShowPhotos() {
        mShowNextPhoto.run()
    }

    override fun onPostCreate(savedInstanceState: Bundle?) {
        super.onPostCreate(savedInstanceState)

        // Trigger the initial hide() shortly after the activity has been
        // created, to briefly hint to the user that UI controls
        // are available.
        delayedHide(100)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.fullscreen_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.action_settings -> {
                navigateToSettings()
                return true
            }

            else -> return super.onOptionsItemSelected(item)
        }
    }

    private fun navigateToSettings() {
        val selectFrameIntent = Intent(this, SelectFrameActivity::class.java)
        startActivityForResult(selectFrameIntent, 0)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (resultCode == Activity.RESULT_CANCELED) {

            // For debug pruposes, we load specific frame
            if (isDebugVersion()) {
                val frameInfo = FrameInfo(
                        "Debug Frame",
                        "5676073085829120",
                        "X9v3TB4Dvpz9k8bYPHa3pApJqiBwbCcoiHwhzQJp"
                )

                reloadFrame(frameInfo)
            }

        } else if (resultCode == Activity.RESULT_OK && data != null) {
            val frameInfo = FrameInfo(
                    data.getStringExtra("name"),
                    data.getStringExtra("id"),
                    data.getStringExtra("accessKey")
            )
            reloadFrame(frameInfo)
        }
    }

    private fun reloadFrame(frameInfo: FrameInfo) {
        saveSelectedFrame(frameInfo)
        mViewModel.reloadPhotos(frameInfo)
    }

    private fun isDebugVersion(): Boolean {
        return 0 != applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE
    }

    private fun saveSelectedFrame(frameInfo: FrameInfo) {
        getPreferences().edit()
                .putString("frameName", frameInfo.frameName)
                .putString("frameId", frameInfo.id)
                .putString("frameAccessKey", frameInfo.accessKey)
                .apply()
    }

    private fun getPreferences(): SharedPreferences {
        return getPreferences(Context.MODE_PRIVATE)
    }

    private fun loadSelectedFrame(): FrameInfo? {
        val pref = getPreferences()

        val frameName = pref.getString("frameName", null)
        val id = pref.getString("frameId", null)
        val accessKey = pref.getString("frameAccessKey", null)

        return if (
                frameName == null ||
                id == null ||
                accessKey == null) {

            // if any of the fields are null we ignore the stored preferences
            null

        } else {
            val selectedFrame = FrameInfo(frameName, id, accessKey)
            selectedFrame
        }
    }

    private fun toggle() {
        if (mVisible) {
            hide()
        } else {
            show()
        }
    }

    private fun hide() {
        // Hide UI first
        supportActionBar?.hide()
        fullscreen_content_controls.visibility = View.GONE
        mVisible = false

        // Schedule a runnable to remove the status and navigation bar after a delay
        mHideHandler.removeCallbacks(mShowPart2Runnable)
        mHideHandler.postDelayed(mHidePart2Runnable, UI_ANIMATION_DELAY.toLong())
    }

    private fun show() {
        // Show the system bar
        image_view.systemUiVisibility =
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        mVisible = true

        // Schedule a runnable to display UI elements after a delay
        mHideHandler.removeCallbacks(mHidePart2Runnable)
        mHideHandler.postDelayed(mShowPart2Runnable, UI_ANIMATION_DELAY.toLong())
    }

    /**
     * Schedules a call to hide() in [delayMillis], canceling any
     * previously scheduled calls.
     */
    private fun delayedHide(delayMillis: Int) {
        mHideHandler.removeCallbacks(mHideRunnable)
        mHideHandler.postDelayed(mHideRunnable, delayMillis.toLong())
    }

    companion object {
        /**
         * Whether or not the system UI should be auto-hidden after
         * [AUTO_HIDE_DELAY_MILLIS] milliseconds.
         */
        private val AUTO_HIDE = true

        /**
         * If [AUTO_HIDE] is set, the number of milliseconds to wait after
         * user interaction before hiding the system UI.
         */
        private val AUTO_HIDE_DELAY_MILLIS = 3000

        /**
         * Some older devices needs a small delay between UI widget updates
         * and a change of the status and navigation bar.
         */
        private val UI_ANIMATION_DELAY = 300
    }
}
