package com.oomkik.client.android;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.webkit.WebView;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

public class SelectFrameActivity extends AppCompatActivity {

    private IntentIntegrator mBarcodeReadIntent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_frame);

//        processQRCode("oomkik\n" +
//                "1\n" +
//                "Lavie Eatty and Dani\n" +
//                "5650622250483712\n" +
//                "vrQQ4kFIgHkkTMQ83n2QXHSxUpotyYSD0biWWPBn");

//        oomkik
//        1
//        Lavie Eatty and Dani
//        5650622250483712
//        vrQQ4kFIgHkkTMQ83n2QXHSxUpotyYSD0biWWPBn

        mBarcodeReadIntent = new IntentIntegrator(this)
                .setPrompt("Scan Oomkik Frame QR-Code");

        mBarcodeReadIntent.initiateScan();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (result != null) {
            if (result.getContents() == null) {
                returnCancelResult();
            } else {
                processQRCode(result.getContents());
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    private void processQRCode(String data) {
        String[] parts = data.split("[\r\n]+");

        if (parts.length != 5 || !parts[0].equals("oomkik") || !parts[1].equals("1")) {
            Toast.makeText(this, "This is not an Oomkik frame QR Code", Toast.LENGTH_LONG).show();
        }

        String frameName = parts[2];
        String frameId = parts[3];
        String accessKey = parts[4];

        // TODO: we can probably do better validation here
        returnSelectedFrameResult(frameName, frameId, accessKey);
    }

    private void returnCancelResult() {
        setResult(RESULT_CANCELED);
        finish();
    }

    private void returnSelectedFrameResult(String frameName, String frameId, String accessKey) {
        Intent result = new Intent();

        result.putExtra("name", frameName);
        result.putExtra("id", frameId);
        result.putExtra("accessKey", accessKey);

        setResult(RESULT_OK, result);
        finish();
    }
}
