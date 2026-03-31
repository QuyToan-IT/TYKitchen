package com.toan_yen.recipe_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class RecipeEnhanceService {

    private final RestTemplate restTemplate;

    @Value("${gemini.suggestion.key}")
    private String apiKey;

    @Value("${gemini.suggestion.url}")
    private String apiUrl;

    public RecipeEnhanceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** ✨ Luôn viết lại mô tả món ăn và chỉ trả về duy nhất một lựa chọn */
    public Map<String, Object> enhanceDescription(String description) {
        String prompt = buildPrompt(description);
        String result = callGemini(prompt);

        return Map.of("result", result); // ✅ chỉ 1 kết quả duy nhất
    }

    /** 🔧 Hàm gọi Gemini API */
    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String fullUrl = apiUrl + "?key=" + apiKey;
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("👉 Gửi request tới Gemini: {}", fullUrl);
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = restTemplate.postForObject(fullUrl, entity, Map.class);

            if (responseBody == null || !responseBody.containsKey("candidates")) {
                return "Không có phản hồi hợp lệ từ Gemini";
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "Không có kết quả từ Gemini";
            }

            // ✅ Chỉ lấy candidate đầu tiên
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            if (content == null || !content.containsKey("parts")) {
                return "Không có nội dung từ Gemini";
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                return "Không có nội dung từ Gemini";
            }

            Object text = parts.get(0).get("text"); // ✅ chỉ lấy part đầu tiên
            String raw = text != null ? text.toString().trim() : "";

            return cleanSuggestionText(raw);

        } catch (HttpClientErrorException.TooManyRequests e) {
            // xử lý quota vượt quá
            String body = e.getResponseBodyAsString();
            int delaySeconds = 10;
            try {
                Pattern pattern = Pattern.compile("\"retryDelay\":\\s*\"(\\d+)s\"");
                Matcher matcher = pattern.matcher(body);
                if (matcher.find()) {
                    delaySeconds = Integer.parseInt(matcher.group(1));
                }
            } catch (Exception ex) {
                log.warn("⚠️ Không parse được retryDelay, dùng mặc định {} giây", delaySeconds);
            }

            log.warn("⚠️ Quota vượt quá, sẽ thử lại sau {} giây", delaySeconds);
            try {
                Thread.sleep(delaySeconds * 1000L);
                return callGemini(prompt);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return "Lỗi hệ thống khi retry Gemini";
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi gọi Gemini API với prompt:\n{}", prompt, e);
            return "Lỗi hệ thống khi gọi Gemini";
        }
    }

    /** 🧹 Hàm lọc bỏ lời dẫn không cần thiết */
    private String cleanSuggestionText(String raw) {
        if (raw == null) return "";
        return raw
            .replaceAll("(?i)^tuyệt vời!?\\s*", "")
            .replaceAll("(?i)^đúng vậy!?\\s*", "")
            .replaceAll("(?i)^bạn muốn.*?\\n", "")
            .replaceAll("(?i)^bạn có.*?\\n", "")
            .replaceAll("(?i)^nếu bạn.*?\\n", "")
            .replaceAll("(?i)^bạn là.*?\\n", "")
            .replaceAll("(?i)^với vai trò.*?\\n", "")
            .replaceAll("(?i)^viết lại mô tả.*?:\\s*", "")
            .trim();
    }

    /** 📌 Prompt ép buộc chỉ trả về một mô tả duy nhất */
    private String buildPrompt(String description) {
        return "Hãy viết lại mô tả món ăn này sao cho hấp dẫn, súc tích. " +
               "Chỉ trả về DUY NHẤT một mô tả tốt nhất, không đưa nhiều lựa chọn.\n" +
               "Không hỏi người dùng, không gợi ý địa điểm:\n" +
               description;
    }
}
