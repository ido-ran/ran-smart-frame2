package com.oomkik.client.android

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.util.Log
import android.view.View
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import kotlinx.android.synthetic.main.activity_dream_settings.*

class DreamSettingsActivity : AppCompatActivity() {

    private lateinit var httpQ: RequestQueue
    lateinit var id: String
    lateinit var secret: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dream_settings)

        httpQ = Volley.newRequestQueue(this)

        getPairDeviceCode()

        button1.setOnClickListener(View.OnClickListener {
            this.finish()
        })
    }

    fun getPairDeviceCode() {
        val url = Apis.API_ROOT_URL + "/public/api/link/start"

        val request = JsonObjectRequest(Request.Method.POST, url, null, Response.Listener { response ->
            id = response.getString("id")
            secret = response.getString("secret")

            secretLabel.text = secret

                    // TODO: now that we have id and secret, keep requesting /link/start/<id> until
                    // we get successful response or timeout.
        },
        Response.ErrorListener { error ->
            Log.e("FullScreenActivity", "Fail to fetch start device link POST. " + error.message)
        })

        // Add the request to the RequestQueue.
        httpQ.add(request)
    }

}
