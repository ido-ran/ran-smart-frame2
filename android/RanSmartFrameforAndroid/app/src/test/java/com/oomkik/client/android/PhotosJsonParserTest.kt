package com.oomkik.client.android

import org.json.JSONObject
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class PhotosJsonParserTest {

    @Test
    fun parse_200_no_streams() {

        val subject = PhotosJsonParser()
        val json = JSONObject("{}")
        val frameInfo = FrameInfo("f1", "f1id", "acc")
        val result = subject.parseResponse(json, frameInfo)

        assertNull("no stream so result should be null", result)
    }

    @Test
    fun parse_200_streams_with_no_photos() {

        val subject = PhotosJsonParser()
        val json = JSONObject("""
            {
                "streams": []
            }
        """.trimIndent())
        val frameInfo = FrameInfo("f1", "f1id", "acc")
        val result = subject.parseResponse(json, frameInfo)

        assertNotNull("no stream so result should be null", result)
    }

}