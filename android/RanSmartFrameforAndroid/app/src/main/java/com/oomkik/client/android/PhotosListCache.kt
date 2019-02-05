package com.oomkik.client.android

import android.app.Application
import android.util.Log
import java.io.File

class PhotosListCache(val app: Application) {

    private val TAG = "PhotosListCache"
    private val tracer = Tracer()

    fun save(listOfPhotos: ArrayList<String>) {
        try {
            openFile().printWriter().use { output ->
                listOfPhotos.forEach { photoUrl ->
                    output.println(photoUrl)
                }
            }

            tracer.event("PhotosListCache.save", mapOf(
                    "numOfLines" to listOfPhotos.size
            ))
        } catch (e: Exception) {
            // Ignore the exception and continue
            Log.e(TAG, "Fail to save photos-list cache", e)

            tracer.event("PhotosListCache.save.failed", mapOf(
                    "exception" to (e.message ?: "no-exception-message")
            ))
        }
    }

    fun load(): List<String>? {
        val lines = openFile().readLines()

        tracer.event("PhotosListCache.load", mapOf(
                "numOfLines" to lines.size
        ))

        return lines
    }

    private fun openFile(): File {
        return File(app.filesDir, "photos-cache.txt")
    }

}