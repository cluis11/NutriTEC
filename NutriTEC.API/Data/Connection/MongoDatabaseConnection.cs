using MongoDB.Driver;

namespace NutriTEC.API.Data.Connection
{
    public class MongoDatabaseConnection
    {
        private readonly IMongoDatabase _database;

        public MongoDatabaseConnection(IConfiguration configuration)
        {
            // 1. Leemos la cadena de conexión del appsettings.json
            var connectionString = configuration.GetConnectionString("MongoConnection");
            
            // 2. Creamos el cliente de Mongo (Singleton interno)
            var client = new MongoClient(connectionString);
            
            // 3. Extraemos el nombre de la base de datos directamente de la URL
            var mongoUrl = new MongoUrl(connectionString);
            var databaseName = mongoUrl.DatabaseName ?? "NutriTEC"; 

            // 4. Dejamos la base de datos lista para ser usada
            _database = client.GetDatabase(databaseName);
        }

        // Este método te devolverá la base de datos lista para interactuar con las colecciones
        public IMongoDatabase GetDatabase()
        {
            return _database;
        }
    }
}