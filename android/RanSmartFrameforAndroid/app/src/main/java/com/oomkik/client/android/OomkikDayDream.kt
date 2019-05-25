package com.oomkik.client.android

import android.arch.lifecycle.Observer
import android.arch.lifecycle.ViewModelProviders
import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.os.Handler
import android.service.dreams.DreamService
import android.support.annotation.RequiresApi
import android.widget.ImageView
import com.android.volley.toolbox.Volley
import com.bumptech.glide.load.engine.DiskCacheStrategy
import kotlinx.android.synthetic.main.activity_main.*

@RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
class OomkikDayDream : DreamService() {

    private val SLIDESHOW_NOT_RUNNING = -1;

    /**
     * Start as false and set to true once the activity has been destroyed.
     * This is checked by mShowNextPhoto for e.g. to stop delayed operations.
     */
    private var mActivityDestroyed: Boolean = false

    private var mPhotoUrls: List<String> = emptyList()
    private val mHandler = Handler()
    private var mPhotoIndex = SLIDESHOW_NOT_RUNNING

    private lateinit var mImageView: ImageView

    private lateinit var mViewModel: PhotosViewModel

    private val photosObserve = Observer<List<String>> {
            mPhotoUrls = it ?: emptyList()

            if (mPhotoIndex == SLIDESHOW_NOT_RUNNING) {
                startShowPhotos()
            }
        }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()

        // Exit dream upon user touch
        isInteractive = false
        // Hide system UI
        isFullscreen = true

        setContentView(R.layout.dream_test)

        mImageView = findViewById(R.id.image_view)
    }

    override fun onDreamingStarted() {
        super.onDreamingStarted()

        HttpSingleton.queue = Volley.newRequestQueue(this)

        UniqueIdKeeper.uniqueId = UniqueId().id(applicationContext)

//        setContentView(R.layout.activity_main)

        // Set up the user interaction to manually show or hide the system UI.
//        image_view.setOnClickListener { toggle() }

//        mViewModel = ViewModelProviders.of(this).get(PhotosViewModel::class.java)
        mViewModel = PhotosViewModel(application)

        // Load saved frame info
        val savedFrameInfo = loadSelectedFrame()
        if (savedFrameInfo != null) {
            mViewModel.reloadPhotos(savedFrameInfo)
        }

        mViewModel.getPhotos().observeForever(photosObserve)
    }

    override fun onDreamingStopped() {
        super.onDreamingStopped()

        mViewModel.getPhotos().removeObserver(photosObserve)
    }

    private fun getPreferences(): SharedPreferences {
        return getSharedPreferences("oomkik-preferences", Context.MODE_PRIVATE)
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

    /**
     * The delay (in ms) to switch to the next photo.
     */
    private val FRAME_SWITCH_PHOTO_DELAY_MS = 6000

    private fun startShowPhotos() {
        mShowNextPhoto.run()
    }

    private val mShowNextPhoto = object : Runnable {
        override   fun run() {
            if (mActivityDestroyed) {
                // The activity has been destroyed, ignore this delayed run.
                return
            }

            mPhotoIndex++

            if (mPhotoIndex + 1 > mPhotoUrls.size) {
                mPhotoIndex = 0
            }

            GlideApp.with(applicationContext)
                    .load(mPhotoUrls.get(mPhotoIndex))
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .fitCenter()
                    .into(mImageView)

            mHandler.postDelayed(this, FRAME_SWITCH_PHOTO_DELAY_MS.toLong())
        }
    }

}