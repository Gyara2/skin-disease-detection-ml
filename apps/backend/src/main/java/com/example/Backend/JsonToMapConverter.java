package com.example.Backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/** Convertidor JPA para mapear un Map<String, Double> a una columna JSON en la base de datos.
 * Este convertidor utiliza Jackson para serializar y deserializar el mapa a formato JSON.
 */
@Converter(autoApply = true)
public class JsonToMapConverter implements AttributeConverter<Map<String, Double>, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Double> attribute) {
        try { return objectMapper.writeValueAsString(attribute); }
        catch (JsonProcessingException e) { return null; }
    }

    @Override
    public Map<String, Double> convertToEntityAttribute(String dbData) {
        try { return objectMapper.readValue(dbData, new TypeReference<Map<String, Double>>() {}); }
        catch (IOException e) { return new HashMap<>(); }
    }
}
