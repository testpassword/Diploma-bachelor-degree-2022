package testpassword.plugins

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*

suspend infix fun ApplicationCall.ok(msg: String): Unit = this.respond(HttpStatusCode.OK, msg)

suspend infix fun ApplicationCall.badRequest(msg: String): Unit = this.respond(HttpStatusCode.BadRequest, msg)