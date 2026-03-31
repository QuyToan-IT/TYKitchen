package com.toan_yen.recipe_service.service;

import com.toan_yen.recipe_service.Entities.Recipe;
import com.toan_yen.recipe_service.Entities.Ingredient;
import com.toan_yen.recipe_service.Entities.Step;
import com.toan_yen.recipe_service.Entities.Nutrition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String reviewRecipeContent(Recipe recipe) {
        log.info("Bắt đầu kiểm duyệt công thức '{}' bằng Gemini.", recipe.getTitle());

        // ✅ Kiểm tra tiêu đề
        if (recipe.getTitle() == null || recipe.getTitle().isBlank() || recipe.getTitle().trim().length() < 3) {
            return "REJECTED: Tiêu đề không rõ ràng";
        }

        // ✅ Kiểm tra mô tả
        if (recipe.getDescription() == null || recipe.getDescription().isBlank() || recipe.getDescription().trim().length() < 10) {
            return "REJECTED: Mô tả món ăn không rõ ràng";
        }
        if (containsGarbage(recipe.getDescription())) {
            return "REJECTED: Mô tả món ăn chứa ký tự vô nghĩa";
        }

        // ✅ Kiểm tra nguyên liệu (chỉ cần có nghĩa, không rác)
        if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()
                || recipe.getIngredients().stream().anyMatch(i -> containsGarbage(i.getName()))) {
            return "REJECTED: Nguyên liệu chứa ký tự vô nghĩa";
        }

        // ✅ Kiểm tra bước thực hiện (chỉ cần có nghĩa, không rác)
        if (recipe.getSteps() == null || recipe.getSteps().isEmpty()
                || recipe.getSteps().stream().anyMatch(s -> containsGarbage(s.getInstruction()))) {
            return "REJECTED: Hướng dẫn nấu ăn chứa ký tự vô nghĩa";
        }

        // ✅ Kiểm tra dinh dưỡng
        List<Nutrition> nutritions = recipe.getNutritions();
        if (nutritions == null || nutritions.isEmpty()) {
            return "REJECTED: Thiếu thông tin dinh dưỡng";
        }

        // Kiểm tra có đủ các thành phần chính
        Map<String, List<String>> requiredKeys = Map.of(
            "CALO", List.of("CALO", "CALORIES"),
            "CHẤT BÉO", List.of("CHẤT BÉO", "FAT"),
            "PROTEIN", List.of("PROTEIN"),
            "CARBS", List.of("CARBS", "CARBOHYDRATES"),
            "CHOLESTEROL", List.of("CHOLESTEROL")
        );

        for (Map.Entry<String, List<String>> entry : requiredKeys.entrySet()) {
            boolean found = nutritions.stream().anyMatch(n ->
                n.getName() != null &&
                entry.getValue().stream().anyMatch(alias -> n.getName().toUpperCase().contains(alias)) &&
                n.getValue() != null &&
                !n.getValue().isBlank()
            );
            if (!found) {
                return "REJECTED: Thiếu hoặc sai thông tin dinh dưỡng: " + entry.getKey();
            }
        }

        // Nếu qua được validation thì mới gọi Gemini
        String prompt = buildPrompt(recipe);

        Map<String, Object> requestBody = Map.of(
                "contents", Collections.singletonList(
                        Map.of("parts", Collections.singletonList(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = apiUrl + "?key=" + apiKey;
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = restTemplate.postForObject(url, entity, Map.class);

            log.info("Gemini raw response: {}", responseBody);

            if (responseBody == null || !responseBody.containsKey("candidates")) {
                return "REJECTED: Không có phản hồi hợp lệ từ AI";
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "REJECTED: Không có phản hồi từ AI";
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null || !content.containsKey("parts")) {
                return "REJECTED: Phản hồi không có nội dung parts";
            }

            @SuppressWarnings("unchecked")
            List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");

            String resultText = Optional.ofNullable(parts)
                    .filter(p -> !p.isEmpty())
                    .map(p -> p.get(0).get("text"))
                    .orElse("REJECTED: Không có phản hồi từ AI");

            log.info("Phản hồi từ Gemini (parsed): {}", resultText);

            // ✅ Chuẩn hóa kết quả
            String normalized = resultText.trim().toUpperCase();
            if (normalized.equals("APPROVED")) {
                return "APPROVED";
            } else if (normalized.startsWith("REJECTED")) {
                return resultText;
            } else {
                return "REJECTED: Phản hồi không đúng định dạng";
            }

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API", e);
            return "REJECTED: Lỗi hệ thống khi gọi AI";
        }
    }

    private boolean containsGarbage(String text) {
        if (text == null) return true;
        String cleaned = text.replaceAll("[^\\p{L}\\p{N}\\s]", ""); // bỏ ký tự đặc biệt
        return cleaned.trim().length() < 2;
    }

    private String buildPrompt(Recipe recipe) {
        String ingredientsString = Optional.ofNullable(recipe.getIngredients())
                .orElse(Collections.emptyList())
                .stream()
                .map(Ingredient::getName)
                .collect(Collectors.joining(", "));

        String stepsString = Optional.ofNullable(recipe.getSteps())
                .orElse(Collections.emptyList())
                .stream()
                .map(Step::getInstruction)
                .collect(Collectors.joining(". "));

        String descriptionString = recipe.getDescription() != null ? recipe.getDescription() : "";

        String nutritionString = recipe.getNutritions().stream()
                .map(n -> String.format("%s: %s", n.getName(), n.getValue()))
                .collect(Collectors.joining("\n"));

        return String.format(
               "Bạn là một chuyên gia kiểm duyệt nội dung cho trang web ẩm thực 'Bếp Của Ty'.\n" +
                "Nhiệm vụ của bạn là đánh giá công thức nấu ăn dưới đây dựa trên các quy tắc sau:\n" +
                "1. Nội dung phải liên quan đến nấu ăn.\n" +
                "2. Không chứa ngôn từ thù hận, bạo lực, chính trị, hoặc nội dung người lớn.\n" +
                "3. QUAN TRỌNG: Các phần Mô tả, Nguyên liệu, Hướng dẫn nấu ăn và Dinh dưỡng chỉ cần có nghĩa, không chứa ký tự vô nghĩa.\n\n" +
                "--- NỘI DUNG CÔNG THỨC ---\n" +
                "Tiêu đề: %s\n" +
                "Mô tả: %s\n" +
                "Nguyên liệu: %s\n" +
                "Các bước: %s\n" +
                "Thông tin dinh dưỡng:\n%s\n" +
                "--- KẾT THÚC NỘI DUNG ---\n\n" +
                "Sau khi xem xét, hãy CHỈ trả về MỘT dòng duy nhất theo định dạng:\n" +
                "- Nếu hợp lệ và đầy đủ: APPROVED\n" +
                "- Nếu vi phạm hoặc không hợp lệ: REJECTED: [Nêu rõ lý do vi phạm]",
                recipe.getTitle(), descriptionString, ingredientsString, stepsString, nutritionString
        );
    }
}
