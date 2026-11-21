package dev.jongamer.bastionalbor.datos

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "generaciones")
data class Generacion(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val tipo: String,
    val prompt: String,
    val negativo: String?,
    val sistema: String?,
    val ajustesJson: String,
    val semilla: Long?,
    val creadoEn: Long,
    val uri: String,
    val nombre: String,
    val modelo: String?,
    val marco: String,
)

@Dao
interface GeneracionDao {
    @Query("SELECT * FROM generaciones ORDER BY creadoEn DESC")
    fun observar(): Flow<List<Generacion>>

    @Insert
    suspend fun insertar(item: Generacion): Long

    @Query("DELETE FROM generaciones WHERE id = :id")
    suspend fun borrar(id: Long)

    @Query("SELECT * FROM generaciones WHERE uri = :uri LIMIT 1")
    suspend fun porUri(uri: String): Generacion?

    @Query("SELECT * FROM generaciones WHERE nombre = :nombre LIMIT 1")
    suspend fun porNombre(nombre: String): Generacion?
}

@Database(entities = [Generacion::class], version = 1, exportSchema = false)
abstract class BastionDb : androidx.room.RoomDatabase() {
    abstract fun generaciones(): GeneracionDao
}
