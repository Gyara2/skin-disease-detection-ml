package com.example.Backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature; // Añadido
import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Converter(autoApply = true)
public class JsonToMapConverter implements AttributeConverter<Map<String, Double>, String> {

    private final ObjectMapper objectMapper;

    public JsonToMapConverter() {
        this.objectMapper = new ObjectMapper();
        // ESTA ES LA CLAVE: Evita que Jackson use BigDecimal para números con 'e-17'
        // Obligándolo a usar Double, que es lo que espera tu Map<String, Double>
        this.objectMapper.configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, false);
    }

    @Override
    public String convertToDatabaseColumn(Map<String, Double> attribute) {
        // Validamos que el mapa no sea nulo antes de serializar
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public Map<String, Double> convertToEntityAttribute(String dbData) {
        // Validamos que la cadena de la base de datos no esté vacía
        if (dbData == null || dbData.isBlank()) {
            return new HashMap<>();
        }
        try {
            // Usamos TypeReference para asegurar que Jackson mapee correctamente tipos genéricos
            return objectMapper.readValue(dbData, new TypeReference<Map<String, Double>>() {});
        } catch (IOException e) {
            // Si hay un error, devolvemos un mapa vacío para evitar NullPointerException en la app
            return new HashMap<>();
        }
    }
}