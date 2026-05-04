package com.example.Backend.Metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Componente que gestiona métricas relacionadas con predicciones del modelo de IA.
 * 
 * Expone las siguientes métricas:
 * - prediction_latency_seconds: Timer con latencia de predicciones (min, max, suma, conteo)
 * - prediction_success_total: Counter de predicciones completadas exitosamente
 * - prediction_error_total: Counter de predicciones con error
 * - prediction_requests_in_progress: Gauge con solicitudes de predicción activas en tiempo real
 */
@Component
public class PredictionMetrics {
    private static final Logger logger = LoggerFactory.getLogger(PredictionMetrics.class);
    
    private final Timer predictionLatency;
    private final Counter successCounter;
    private final Counter errorCounter;
    private final AtomicInteger requestsInProgress;
    private final DistributionSummary concurrentRequests;

    public PredictionMetrics(MeterRegistry meterRegistry) {
        // Timer para medir latencia de predicciones
        this.predictionLatency = Timer.builder("prediction_latency")
                .description("Latencia de predicciones del modelo en segundos")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry);

        // Counter para predicciones exitosas
        this.successCounter = Counter.builder("prediction_success")
                .description("Número total de predicciones completadas exitosamente")
                .register(meterRegistry);

        // Counter para predicciones con error
        this.errorCounter = Counter.builder("prediction_error")
                .description("Número total de predicciones que resultaron en error")
                .register(meterRegistry);

        // Gauge para requests en progreso - registrado directamente con el valor actual
        this.requestsInProgress = new AtomicInteger(0);
        meterRegistry.gauge("prediction_requests_in_progress",
                requestsInProgress,
                AtomicInteger::get);

        // DistributionSummary para registrar cuántos requests concurrentes había
        // cuando se completó cada predicción
        this.concurrentRequests = DistributionSummary.builder("prediction_concurrent_requests")
                .description("Distribución de requests concurrentes activos en el momento de completar cada predicción")
                .baseUnit("requests")
                .register(meterRegistry);
    }

    /**
     * Incrementa el contador de requests en progreso.
     */
    public void incrementRequestsInProgress() {
        requestsInProgress.incrementAndGet();
    }

    /**
     * Decrementa el contador de requests en progreso.
     * Nunca permite que el valor descienda por debajo de 0.
     * Registra si hay un intento de decremento cuando el valor ya es 0 (indica desbalance).
     */
    public void decrementRequestsInProgress() {
        int current;
        int next;
        do {
            current = requestsInProgress.get();
            // Si ya estamos en 0, no hacer nada pero registrar advertencia
            if (current == 0) {
                logger.warn("Intento de decrementar prediction_requests_in_progress cuando ya está en 0. " +
                        "Esto indica un desbalance en la lógica de increment/decrement.");
                return;
            }
            next = current - 1;
        } while (!requestsInProgress.compareAndSet(current, next));
    }

    /**
     * Obtiene el número actual de requests en progreso.
     */
    public int getCurrentRequestsInProgress() {
        return requestsInProgress.get();
    }

    /**
     * Incrementa el contador de predicciones exitosas.
     */
    public void recordSuccess() {
        successCounter.increment();
    }

    /**
     * Incrementa el contador de errores de predicción.
     */
    public void recordError() {
        errorCounter.increment();
    }

    /**
     * Ejecuta una acción y registra la latencia y resultado (éxito/error) automáticamente.
     * Mantiene el contador de requests en progreso durante toda la ejecución.
     * Captura la concurrencia ANTES de decrementar para medir correctamente.
     * 
     * @param action La acción a ejecutar (debe retornar un resultado)
     * @param <T> Tipo del resultado
     * @return El resultado de la acción
     * @throws Exception Si la acción lanza una excepción
     */
    public <T> T recordPrediction(PredictionAction<T> action) throws Exception {
        incrementRequestsInProgress();
        try {
            // Usar Timer.Sample para mayor control del timing
            Timer.Sample sample = Timer.start();
            try {
                T result = action.execute();
                recordSuccess();
                return result;
            } catch (Exception e) {
                recordError();
                throw e;
            } finally {
                // Registrar la latencia en el timer
                sample.stop(predictionLatency);
            }
        } finally {
            // Registrar la concurrencia JUSTO ANTES de decrementar
            // Esto captura el número real de requests en progreso en ese momento
            int concurrencyAtCompletion = requestsInProgress.get();
            concurrentRequests.record(concurrencyAtCompletion);
            logger.debug("Predicción completada con {} requests concurrentes en progreso", concurrencyAtCompletion);
            
            // Finalmente, decrementar este request
            decrementRequestsInProgress();
        }
    }

    /**
     * Interfaz funcional para acciones de predicción.
     */
    @FunctionalInterface
    public interface PredictionAction<T> {
        T execute() throws Exception;
    }
}
