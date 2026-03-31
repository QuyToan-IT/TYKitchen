package com.toan_yen.recipe_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageDTO {
    private String imageUrl;
    private boolean isThumbnail;
}
