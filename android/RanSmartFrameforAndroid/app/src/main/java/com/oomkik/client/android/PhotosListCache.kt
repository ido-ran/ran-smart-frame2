package com.oomkik.client.android

import android.app.Application
import android.util.Log
import java.io.File

class PhotosListCache(val app: Application) {

    private val TAG = "PhotosListCache"

    fun save(listOfPhotos: ArrayList<String>) {
        try {
            openFile().printWriter().use { output ->
                listOfPhotos.forEach { photoUrl ->
                    output.println(photoUrl)
                }
            }
        } catch (e: Exception) {
            // Ignore the exception and continue
            Log.e(TAG, "Fail to save photos-list cache", e)
        }
    }

    fun load(): List<String>? {
        return openFile().readLines()
    }

    fun openFile(): File {
        return File(app.filesDir, "photos-cache.txt")
    }

}