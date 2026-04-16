const IMAGE_MIME_PREFIX = 'image/';

export const validateImageFile = (file: File): string | null => {
  if (!file.type || !file.type.startsWith(IMAGE_MIME_PREFIX)) {
    return 'Selecciona un archivo de imagen valido.';
  }

  if (file.size === 0) {
    return 'La imagen seleccionada esta vacia.';
  }

  return null;
};

export const fileToImageBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !== 'string' ||
        !reader.result.startsWith('data:image/')
      ) {
        reject(new Error('No se pudo convertir la imagen seleccionada.'));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };

    reader.readAsDataURL(file);
  });
};

export const toRawBase64 = (value: string): string => {
  const commaIndex = value.indexOf(',');
  return commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
};
