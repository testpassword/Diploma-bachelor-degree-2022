package testpassword.routes

import io.ktor.application.*
import io.ktor.response.*
import io.ktor.routing.*
import testpassword.services.CONSUMER
import testpassword.services.INSTANCES
import testpassword.services.Report

fun Route.support() =
    route("/support") {
        route("formats/") {
            get {
                call.respond(Report.FORMATS.values())
            }
        }

        route("consumers/") {
            get {
                call.respond(CONSUMER.values())
            }
        }

        route("instances/") {
            get {
                call.respond(INSTANCES.values())
            }
        }
    }

