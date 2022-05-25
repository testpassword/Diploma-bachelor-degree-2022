package testpassword.plugins

fun printErr(vararg obj: Any): Unit = obj.forEach { System.err.println(it.toString()) }

infix operator fun String.minus(removable: String): String = this.replace(removable, "")

infix fun <S, T> Collection<S>.cartesianProduct(other : Collection<T>) : List<Pair<S, T>> =
    this.flatMap { s -> List(other.size) { s }.zip(other) }

fun <T> Collection<T>.powerset(): Set<Set<T>> =
    powerset(this, setOf(emptySet()))

private tailrec fun <T> powerset(left: Collection<T>, acc: Set<Set<T>>): Set<Set<T>> =
    if (left.isEmpty()) acc
    else powerset(
        left.drop(1),
        acc + acc.map { it + left.first() }
    )