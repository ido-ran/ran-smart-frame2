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
            val listOfPhotos = ArrayList<String>()
            parseResponse(response, frameInfo, listOfPhotos)

            photosCache.save(listOfPhotos);
            photos.value = listOfPhotos
//            saveFrameData(response.toString())
        },
                Response.ErrorListener { error ->
                    Log.e("FullScreenActivity", "Fail to fetch frame data. " + error.message)

//                    val cachedFrameData = getFrameData() ?: return@ErrorListener
//
//                    try {
//                        val cachedFrameDataJson = JSONObject(cachedFrameData)
//                        parseResponse(cachedFrameDataJson, selectedFrame)
//                    } catch (e: JSONException) {
//                        e.printStackTrace()
//                        debug("Cached frame data is not JSON parsable")
//                    }
                })

        // Add the request to the RequestQueue.
        HttpSingleton.queue?.add(request)
    }

    private fun parseResponse(response: JSONObject, selectedFrame: FrameInfo, listOfPhotos: ArrayList<String>) {
        try {
            val streams = response.getJSONArray("streams")
            for (streamIndex in 0 until streams.length()) {
                val stream = streams.getJSONObject(streamIndex)
                val streamId = stream.getString("id")

                val photos = stream.getJSONArray("photos")
                for (photoIndex in 0 until photos.length()) {
                    val photo = photos.getJSONObject(photoIndex)
                    val photoId = photo.getString("id")

                    val url = MessageFormat.format(
                            Apis.API_ROOT_URL + "/public/api/" +
                                    "frames/{0}/streams/{1}/photos/{2}?access_key={3}",
                            selectedFrame.id, streamId, photoId, selectedFrame.accessKey)

                    listOfPhotos.add(url)
                }

            }
        } catch (e: JSONException) {
            e.printStackTrace()
        }

    }
}
