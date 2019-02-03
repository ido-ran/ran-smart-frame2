package com.oomkik.client.android

import android.app.Application
import android.arch.lifecycle.AndroidViewModel
import android.arch.lifecycle.LiveData
import android.arch.lifecycle.MutableLiveData
import android.util.Log
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import org.json.JSONException
import org.json.JSONObject
import java.text.MessageFormat

class PhotosViewModel(app: Application) : AndroidViewModel(app) {

    private var photos: MutableLiveData<List<String>> = MutableLiveData()
    private val photosCache: PhotosListCache = PhotosListCache(app)

    init {
        try {
            photos.value = photosCache.load();
        } catch (e: Exception) {
            photos.value = listOf(
                    "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?cs=srgb&dl=beach-exotic-holiday-248797.jpg&fm=jpg",
                    "https://images.pexels.com/photos/260573/pexels-photo-260573.jpeg?cs=srgb&dl=beach-boat-island-260573.jpg&fm=jpg"
            )
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

        // Add the request to the RequestQueue.
        HttpSingleton.queue?.add(request)
    }

}
