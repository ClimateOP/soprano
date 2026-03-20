package com.climate_op.soprano

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MusicServiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "MusicServiceModule"

    @ReactMethod
    fun start(title: String, artist: String) {
        val intent = Intent(reactContext, MusicService::class.java).apply {
            putExtra("title", title)
            putExtra("artist", artist)
        }
        reactContext.startForegroundService(intent)
    }

    @ReactMethod
    fun stop() {
        val intent = Intent(reactContext, MusicService::class.java)
        reactContext.stopService(intent)
    }
}