package testpassword.services

import redis.clients.jedis.Jedis
import redis.clients.jedis.JedisShardInfo
import testpassword.plugins.printErr
import java.sql.SQLException
import kotlin.runCatching

class DatabaseBusyException: SQLException()

object DBsLock {

    private var client: Jedis? = null

    operator fun invoke() =
        runCatching {
            Jedis(parseCredsFromEnv()).also { it.ping() }
        }.onSuccess {
            client = it
        }.onFailure {
            printErr(when (it) {
                is IndexOutOfBoundsException -> "REDIS_CACHE_CREDS should match pattern 'url:port;password'"
                is NumberFormatException -> "port should be in range [0; 65535]"
                else -> "Unexpected exception: ${it.stackTraceToString()}"
            })
        }

    private infix fun <T> isInit(onSuccess: () -> T): T =
        if (client != null) onSuccess() else throw IllegalStateException("you should call invoke() method before use it to initialize")

    private fun parseCredsFromEnv(): JedisShardInfo {
        val (url, pass) = System.getenv("REDIS_CACHE_CREDS").split(";").let { it[0] to it.getOrNull(1) }
        val (host, port) = url.split(":")
        return JedisShardInfo(host, port.toInt(), false).apply { password = pass }
    }

    operator fun contains(dbUrl: String): Boolean = isInit { client!!.get(dbUrl).toBoolean() }

    operator fun plus(dbUrl: String): Unit = isInit { client!!.set(dbUrl, true.toString()) }

    operator fun minus(dbUrl: String): Unit = isInit { client!!.set(dbUrl, false.toString()) }

    fun <T> executeLocking(dbUrl: String, lockingOps: () -> T): T =
        if (System.getenv("DEBUG").toBoolean()) lockingOps()
        else if (dbUrl !in this) {
            this + dbUrl
            try {
                val res = lockingOps()
                this - dbUrl
                res
            } catch (e: Exception) {
                this - dbUrl
                throw e
            }
        } else throw DatabaseBusyException()
}