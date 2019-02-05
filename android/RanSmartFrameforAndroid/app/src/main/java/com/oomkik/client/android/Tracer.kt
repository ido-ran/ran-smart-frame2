package com.oomkik.client.android

import com.google.firebase.database.FirebaseDatabase

class Tracer {

    fun event(type: String, values: Map<String, Any?>) {
        if (UniqueIdKeeper.uniqueId != null) {
            val database = FirebaseDatabase.getInstance().getReference()
            val uid = UniqueIdKeeper.uniqueId!!
            val traceRef = database.child("trace")

            val eventRef = traceRef.push()

            val allValues = HashMap<String, Any?>(values)
            allValues["uid"] = uid
            allValues["type"] = type

            val childUpdates = HashMap<String, Any>()
            childUpdates["/trace/${eventRef.key}"] = allValues
            database.updateChildren(childUpdates)
        }
    }
}
