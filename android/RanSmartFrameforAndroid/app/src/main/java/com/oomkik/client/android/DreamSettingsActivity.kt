package com.oomkik.client.android

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.os.Handler
import android.support.v7.app.AppCompatActivity
import android.util.Log
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import kotlinx.android.synthetic.main.activity_dream_settings.*

private const val TAG = "DreamSettingsActivity"
private const val NEXT_DEVICE_LINK_CHECK_DELAY_MS: Long = 6000

class DreamSettingsActivity : AppCompatActivity() {

    private val mHandler = Handler()

    private lateinit var httpQ: RequestQueue
    lateinit var deviceLinkId: String
    lateinit var secret: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dream_settings)

        httpQ = Volley.newRequestQueue(this)

        getPairDeviceCode()

        button1.setOnClickListener {
            this.finish()
        }
    }

    private fun getPairDeviceCode() {
        val url = Apis.API_ROOT_URL + "/public/api/link/start"

        val request = JsonObjectRequest(Request.Method.POST, url, null, Response.Listener { response ->
            deviceLinkId = response.getString("id")
            secret = response.getString("secret")

            secretLabel.text = secret

                    // TODO: now that we have deviceLinkId and secret, keep requesting /link/start/<deviceLinkId> until
                    // we get successful response or timeout.
            mCheckDeviceLinkMatch.run()
        },
        Response.ErrorListener { error ->
            Log.e(TAG, "Fail to fetch start device link POST. " + error.message)
            secretLabel.text = "Error"
        })

        // Add the request to the RequestQueue.
        httpQ.add(request)
    }

    private val mCheckDeviceLinkMatch = object : Runnable {
        override fun run() {
//            if (mActivityDestroyed) {
//                // The activity has been destroyed, ignore this delayed run.
//                return
//            }

            val url = Apis.API_ROOT_URL + "/public/api/link/start/$deviceLinkId"

            val request = JsonObjectRequest(Request.Method.GET, url, null, Response.Listener { response ->
                if (response.has("frame_id")) {
                    val frameId = response.getString("frame_id")
                    val accessKey = response.getString("access_key")
                    val frameName = response.getString("name")

                    saveSelectedFrame(FrameInfo(frameName, frameId, accessKey))

                    finish()
                } else {
                    mHandler.postDelayed(this, NEXT_DEVICE_LINK_CHECK_DELAY_MS)
                }
            },
                    Response.ErrorListener { error ->
                        Log.e(TAG, "Fail to fetch start device link POST. " + error.message)
                        secretLabel.text = "Error"
                    })

            httpQ.add(request)
        }
    }

    private fun saveSelectedFrame(frameInfo: FrameInfo) {
        getPreferences().edit()
                .putString("frameName", frameInfo.frameName)
                .putString("frameId", frameInfo.id)
                .putString("frameAccessKey", frameInfo.accessKey)
                .apply()
    }

    private fun getPreferences(): SharedPreferences {
        return getSharedPreferences("oomkik-preferences", Context.MODE_PRIVATE)
    }

}
