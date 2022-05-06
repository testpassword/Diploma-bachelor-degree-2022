package testpassword.models

import kotlinx.serialization.Serializable

@Serializable data class TestResult(
    val bestIndex: String,
    val timeBefore: Long,
    val timeAfter: Long,
    val diff: Long
)

@Serializable class IndexResult {
    val indexStatement: String
    val timeTaken: Long
    val diff: Long
    constructor(index: String, origTime: Long, time: Long) {
        this.indexStatement = index
        this.timeTaken = time
        this.diff = origTime - time
    }
}