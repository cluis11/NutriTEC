namespace NutriTEC.API.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

public class Retroalimentacion
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonElement("id_cliente")]
    [JsonPropertyName("idCliente")]
    public int IdCliente { get; set; } // FK hacia SQL Server

    [BsonElement("id_nutricionista")]
    [JsonPropertyName("idNutricionista")]
    public int IdNutricionista { get; set; } // FK hacia SQL Server

    [BsonElement("fecha_creacion")]
    [JsonPropertyName("fechaCreacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    [BsonElement("titulo")]
    [JsonPropertyName("asunto")] // 
    public string Titulo { get; set; } 

    [BsonElement("mensaje_inicial")]
    [JsonPropertyName("mensajeInicial")]
    public string MensajeInicial { get; set; }

    [BsonElement("respuestas")]
    [JsonPropertyName("respuestas")]
    public List<RespuestaForo> Respuestas { get; set; } = new List<RespuestaForo>();
}

public class RespuestaForo
{
    [BsonElement("id_respuesta")]
    [JsonPropertyName("idRespuesta")]
    public string IdRespuesta { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("remitente")]
    [JsonPropertyName("remitente")]
    public string Remitente { get; set; } // "Cliente" o "Nutricionista"

    [BsonElement("fecha")]
    [JsonPropertyName("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [BsonElement("mensaje")]
    [JsonPropertyName("contenido")] 
    public string Mensaje { get; set; }
}