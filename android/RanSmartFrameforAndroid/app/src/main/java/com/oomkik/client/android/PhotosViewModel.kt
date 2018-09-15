package com.oomkik.client.android

import android.arch.lifecycle.LiveData
import android.arch.lifecycle.MutableLiveData
import android.arch.lifecycle.ViewModel

class PhotosViewModel : ViewModel() {

    private var photos: MutableLiveData<List<String>> = MutableLiveData()

    init {
        photos.value = listOf(
                "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?cs=srgb&dl=beach-exotic-holiday-248797.jpg&fm=jpg",
                "https://images.pexels.com/photos/260573/pexels-photo-260573.jpeg?cs=srgb&dl=beach-boat-island-260573.jpg&fm=jpg"
        )
    }

    /**
     * Get the live data of list of photos.
     */
    fun getPhotos(): LiveData<List<String>> {
        return photos

    }
}
