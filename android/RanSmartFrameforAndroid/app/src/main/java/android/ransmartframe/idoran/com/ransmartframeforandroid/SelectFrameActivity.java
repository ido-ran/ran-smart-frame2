package android.ransmartframe.idoran.com.ransmartframeforandroid;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class SelectFrameActivity extends AppCompatActivity {

    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_frame);

        mWebView = (WebView) findViewById(R.id.web_view);
        mWebView.getSettings().setJavaScriptEnabled(true);
        mWebView.setWebViewClient(new WebViewClient());

        mWebView.addJavascriptInterface(new JSWebInterface(), "AndroidApp");

        // Clear cookies to clear any previous login cookies
        CookieManager.getInstance().removeAllCookie();

        mWebView.loadUrl(Apis.API_ROOT_URL + "/select-frame");
    }

    public class JSWebInterface {

        @JavascriptInterface
        public void selectFrame(String frameName, String frameId, String accessKey) {
            // Clear cookies to clear the login cookies
            CookieManager.getInstance().removeAllCookie();

            Intent result = new Intent();
            result.putExtra("name", frameName);
            result.putExtra("id", frameId);
            result.putExtra("accessKey", accessKey);

            setResult(RESULT_OK, result);
            finish();
        }
    }
}
