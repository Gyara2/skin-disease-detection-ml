package com.example.Backend;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record RequestData(List<MultipartFile> imagenes) {
}
