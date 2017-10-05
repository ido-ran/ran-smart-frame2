package android.ransmartframe.idoran.com.ransmartframeforandroid;

import android.content.Context;

import com.bumptech.glide.GlideBuilder;
import com.bumptech.glide.annotation.GlideModule;
import com.bumptech.glide.load.engine.cache.InternalCacheDiskCacheFactory;
import com.bumptech.glide.module.AppGlideModule;

/**
 * Created by raned on 24-Sep-17.
 */

@GlideModule
public class MyGlideModule extends AppGlideModule {

    private final int MAX_DISK_CACHE_SIZE = Integer.MAX_VALUE;

    @Override
    public void applyOptions(Context context, GlideBuilder builder) {
        super.applyOptions(context, builder);
        builder.setDiskCache(new InternalCacheDiskCacheFactory(context, MAX_DISK_CACHE_SIZE));
    }
}
