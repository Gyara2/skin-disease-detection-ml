package com.example.Backend.Diagnostico;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico, UUID> {}
