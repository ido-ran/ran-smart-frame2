package com.oomkik.client.android

import org.json.JSONException
import org.json.JSONObject
import java.text.MessageFormat

class PhotosJsonParser {

    /**
     * Parse Oomkik photo stream response.
     *
     * @return array of photos, or null if parsing exception occurred.
     */
    fun parseResponse(response: JSONObject, selectedFrame: FrameInfo): ArrayList<String>? {
        val listOfPhotos = ArrayList<String>()

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

            return listOfPhotos

        } catch (e: JSONException) {
            e.printStackTrace()
            return null
        }

    }
}