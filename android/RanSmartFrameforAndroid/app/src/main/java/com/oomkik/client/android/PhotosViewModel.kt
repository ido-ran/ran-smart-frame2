package com.oomkik.client.android

import android.app.Application
import android.arch.lifecycle.AndroidViewModel
import android.arch.lifecycle.LiveData
import android.arch.lifecycle.MutableLiveData
import android.util.Log
import com.android.volley.DefaultRetryPolicy
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import org.json.JSONException
import org.json.JSONObject
import java.text.MessageFormat

class PhotosViewModel(app: Application) : AndroidViewModel(app) {

    private val tracer = Tracer()
    private val photosCache: PhotosListCache = PhotosListCache(app)

    private var photos: MutableLiveData<List<String>> = MutableLiveData()

    init {
        try {
            photos.value = photosCache.load();

            if (photos.value == null) {
                tracer.event("PhotosViewModel.init", mapOf(
                        "numOfPhotos" to "null"
                ))
            } else {
                tracer.event("PhotosViewModel.init", mapOf(
                        "numOfPhotos" to photos.value?.size
                ))
            }
        } catch (e: Exception) {
            photos.value = listOf(
                    "http://eskipaper.com/images/landscape-wallpaper-hd-33.jpg",
                    "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?cs=srgb&dl=beach-exotic-holiday-248797.jpg&fm=jpg",
                    "https://images.pexels.com/photos/260573/pexels-photo-260573.jpeg?cs=srgb&dl=beach-boat-island-260573.jpg&fm=jpg"
            )

            tracer.event("PhotosViewModel.init.failed", mapOf(
                    "exception" to (e.message ?: "no-exception-message")
            ))
        }
    }

    /**
     * Get the live data of list of photos.
     */
    fun getPhotos(): LiveData<List<String>> {
        return photos
    }

    fun reloadPhotos(frameInfo: FrameInfo) {

        val url = MessageFormat.format(
                Apis.API_ROOT_URL + "/public/api/frames/{0}?access_key={1}",
                frameInfo.id, frameInfo.accessKey)

        val request = JsonObjectRequest(Request.Method.GET, url, null, Response.Listener { response ->
            val parser = PhotosJsonParser()
            val listOfPhotos = parser.parseResponse(response, frameInfo)

            if (listOfPhotos != null) {
                photosCache.save(listOfPhotos);
                photos.value = listOfPhotos
            }
        },

                Response.ErrorListener { error ->
                    Log.e("FullScreenActivity", "Fail to fetch frame data. " + error.message)
                })

        // Set the timeout to be very, very long since the server is currently
        // loading image list in a very slow way.
        request.retryPolicy = DefaultRetryPolicy(60 * 1000, 2, 3.0f)

        // Add the request to the RequestQueue.
        HttpSingleton.queue?.add(request)
    }

}
