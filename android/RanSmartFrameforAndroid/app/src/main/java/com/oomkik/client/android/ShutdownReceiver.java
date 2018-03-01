package com.oomkik.client.android;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;

/**
 *
 */
public class ShutdownReceiver extends BroadcastReceiver
{
    public static final String ACTION_SHUTDOWN = "com.oomkik.client.android.ShutdownReceiver.ACTION_SHUTDOWN";

    @Override
    public void onReceive(Context context, Intent intent) {
        System.out.println("shutting down...");

        Intent sendMsgIntent = new Intent("quit-please");
        LocalBroadcastManager lbm = LocalBroadcastManager.getInstance(context);
        lbm.sendBroadcast(sendMsgIntent);
    }
}