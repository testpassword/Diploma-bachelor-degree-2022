package testpassword

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.serialization.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import kotlinx.serialization.json.Json
import testpassword.routes.*
import testpassword.services.*
import java.rmi.ConnectException
import java.sql.SQLClientInfoException

fun Application.configureModules() =
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                ignoreUnknownKeys = true
            }
        )
    }

fun Application.configureSecurity() =
    install(CORS) {
        methods.addAll(HttpMethod.DefaultMethods)
        allowHeaders { true }
        allowNonSimpleContentTypes = true
        allowSameOrigin = true
        anyHost()
    }

fun Application.configureRouting() =
    routing {
        actions()
        support()
    }

fun Application.configureExceptionHandlers() =
    install(StatusPages) {
        exception<Exception> {
            val (status, msg) = when (it) {
                is DatabaseNotSupportedException -> HttpStatusCode.BadRequest to """
                    This database not supported yet. Supported: ${INSTANCES.values().joinToString(", ")}
                    """.trimIndent()
                is SQLClientInfoException -> HttpStatusCode.NotFound to """
                    Provided connectionUrl doesn't not match pattern: '${DBsSupport.CONNECTION_URL_PATTERN}'
                    """.trimIndent()
                is ConnectException -> HttpStatusCode.GatewayTimeout to """
                    Can't ping database. Please check it's availability and creds or try again later.
                    """.trimIndent()
                is IndexCreationError -> HttpStatusCode.InternalServerError to """
                    Error while creating database server specifix index for query:
                    ${it.localizedMessage}
                """.trimIndent()
                else -> {
                    it.printStackTrace()
                    HttpStatusCode.InternalServerError to it.localizedMessage
                }
            }
            call.respond(status, mapOf("details" to msg))
        }
    }

fun main() {
    embeddedServer(
        Netty,
        System.getenv("SERVICE_PORT").toIntOrNull() ?: 80,
        System.getenv("SERVICE_HOST") ?: "0.0.0.0"
    ) {
        DBsLock()
        configureModules()
        configureSecurity()
        configureExceptionHandlers()
        configureRouting()
    }.start(wait = true)
}