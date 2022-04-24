package testpassword.models

import kotlinx.serialization.Serializable

@Serializable data class TestResult(
    val bestIndex: String,
    val timeBefore: Long,
    val timeAfter: Long,
    val diff: Long
)