package com.toan_yen.recipe_service.service;

import com.toan_yen.recipe_service.Entities.*;
import com.toan_yen.recipe_service.dto.RecipeDTO;
import com.toan_yen.recipe_service.dto.UserDTO;
import com.toan_yen.recipe_service.repository.CategoryRepository;
import com.toan_yen.recipe_service.service.ModerationService;
import com.toan_yen.recipe_service.repository.RecipeRepository;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
@Slf4j
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    private final ModerationService moderationService; // ✅ Thêm ModerationService

    @Autowired
    private RestTemplate restTemplate;
    @Value("${user.service.url}")
    private String userServiceUrl;
    @Value("${recipe.upload-dir}")
    private String uploadDir;

    public RecipeService(RecipeRepository recipeRepository, CategoryRepository categoryRepository, ModerationService moderationService) {
        this.recipeRepository = recipeRepository;
        this.categoryRepository = categoryRepository;
        this.moderationService = moderationService; // ✅ Khởi tạo
    }

public RecipeDTO getLatestRecipeByCategory(String categoryName, String token) {
    // SỬA: Thêm RecipeStatus.ACCEPTED vào tham số
    Recipe recipe = recipeRepository.findTopByCategory_NameAndStatusOrderByCreatedAtDesc(categoryName, RecipeStatus.APPROVED);
    return convertToDTO(recipe, token);
}
private String extractUserRole(String token) {
        String rawToken = token.replace("Bearer ", "");
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(rawToken)
                .getBody();
        // Giả định key là "role"
        return claims.get("role", String.class); 
    }
    // Tạo thư mục upload nếu chưa tồn tại
    private void createUploadDirIfNotExist() {
        File dir = new File(uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            log.error("Không thể tạo thư mục uploads: {}", uploadDir);
            throw new RuntimeException("Không thể tạo thư mục uploads: " + uploadDir);
        }
    }

    // Hàm gọi sang user-service có kèm token
    private UserDTO getUserInfo(Long userId, String token) {
        if (userId == null)
            return null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<UserDTO> response = restTemplate.exchange(
                    userServiceUrl + userId,
                    HttpMethod.GET,
                    entity,
                    UserDTO.class);

            return response.getBody();
        } catch (Exception e) {
            log.warn("Không thể lấy thông tin user với id {}", userId, e);
            return null;
        }
    }

    // 🔑 Secret key để parse JWT
    private final String secretKey = "DangQuyToan23102004LuuThiKimYen19032004";

    // Lấy userId từ JWT token (API mới)
    private Long extractUserId(String token) {
        String rawToken = token.replace("Bearer ", "");
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(rawToken)
                .getBody();
        return claims.get("userId", Long.class);
    }

    // Convert entity -> DTO
    // Convert entity -> DTO
    public RecipeDTO convertToDTO(Recipe recipe, String token) {
        RecipeDTO dto = new RecipeDTO();
        dto.setId(recipe.getId());
        dto.setTitle(recipe.getTitle());
        dto.setDescription(recipe.getDescription());
        dto.setCookTime(recipe.getCookTime());
        dto.setServings(recipe.getServings());
        dto.setDifficulty(recipe.getDifficulty());
        dto.setUserId(recipe.getUserId());
        dto.setStatus(recipe.getStatus());
        dto.setRejectionReason(recipe.getRejectionReason());
        dto.setModeratedByUserId(recipe.getModeratedByUserId());
        // Thời gian tạo theo giờ VN
        if (recipe.getCreatedAt() != null) {
            String createdAtVN = recipe.getCreatedAt()
                    .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            dto.setCreatedAt(createdAtVN);
        }

        dto.setCategoryId(recipe.getCategory() != null ? recipe.getCategory().getId() : null);
        dto.setCategoryName(recipe.getCategory() != null ? recipe.getCategory().getName() : null);
        dto.setMainImageUrl(recipe.getMainImageUrl());

        // Người tạo
        UserDTO user = getUserInfo(recipe.getUserId(), token);
        if (user != null) {
            dto.setCreatorName(user.getFullName());
            dto.setCreatorEmail(user.getEmail());
        } else {
            dto.setCreatorName("Không rõ");
        }

        // Nguyên liệu
        if (recipe.getIngredients() != null) {
            dto.setIngredients(recipe.getIngredients().stream()
                    .map(i -> {
                        String quantity = i.getQuantity() != null ? i.getQuantity() : "";
                        String name = i.getName() != null ? i.getName() : "";
                        return (quantity + " " + name).trim();
                    })
                    .filter(s -> !s.isBlank()) // bỏ chuỗi rỗng
                    .toList());
        }

        // Gia vị
        if (recipe.getSpices() != null) {
            dto.setSpices(recipe.getSpices().stream()
                    .map(s -> {
                        String quantity = s.getQuantity() != null ? s.getQuantity() : "";
                        String name = s.getName() != null ? s.getName() : "";
                        return (quantity + " " + name).trim();
                    })
                    .filter(s -> !s.isBlank())
                    .toList());
        }

        // Dinh dưỡng
        if (recipe.getNutritions() != null) {
            dto.setNutritions(recipe.getNutritions().stream()
                    .map(n -> {
                        String name = n.getName() != null ? n.getName() : "";
                        String value = n.getValue() != null ? n.getValue() : "";
                        return (name + (value.isEmpty() ? "" : ":" + value)).trim();
                    })
                    .filter(s -> !s.isBlank())
                    .toList());
        }

        // Các bước
        if (recipe.getSteps() != null) {
            dto.setSteps(recipe.getSteps().stream()
                    .map(Step::getInstruction)
                    .filter(s -> s != null && !s.isBlank())
                    .toList());
        }

        // Hình ảnh
        if (recipe.getImages() != null) {
            dto.setImageUrls(recipe.getImages().stream()
                    .map(Image::getUrl)
                    .filter(url -> url != null && !url.isBlank())
                    .toList());
        }
        if (recipe.getModeratedAt() != null) {
             String moderatedAtVN = recipe.getModeratedAt()
                    .atZone(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
             dto.setModeratedAt(moderatedAtVN);
        }
        return dto;
    }

    // Tạo recipe mới
    public RecipeDTO createRecipe(RecipeDTO dto, MultipartFile mainImage, List<MultipartFile> otherImages, String token)
            throws IOException {
    
        // 1. Lấy User ID và Role từ DTO (đã được frontend gửi lên)
        Long userId = dto.getUserId();
        String userRole = extractUserRole(token); // Vẫn lấy role từ token để phân quyền

        if (userId == null) {
            // Lỗi này xảy ra nếu frontend không gửi userId hoặc backend không đọc được
            throw new RuntimeException("Bắt buộc phải có User ID để tạo công thức.");
        }

    Recipe recipe = new Recipe();
    recipe.setTitle(dto.getTitle());
    recipe.setDescription(dto.getDescription());
    recipe.setCookTime(dto.getCookTime());
    recipe.setServings(dto.getServings());
    recipe.setDifficulty(dto.getDifficulty());
    recipe.setUserId(userId);
    recipe.setCreatedAt(LocalDateTime.now());
    
    // 2. Xử lý trạng thái duyệt bài (Moderation Status)
    if ("admin".equalsIgnoreCase(userRole)) {
        // Nếu là Admin, tự động duyệt và ghi lại Admin ID
        recipe.setStatus(RecipeStatus.APPROVED);
        recipe.setModeratedByUserId(userId);
        recipe.setModeratedAt(LocalDateTime.now());
    } else {
        // Nếu là User thường, đặt trạng thái chờ duyệt (PENDING)
        recipe.setStatus(RecipeStatus.PENDING);
    }
            
    Category category = categoryRepository.findById(dto.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
    recipe.setCategory(category);

    createUploadDirIfNotExist();

    // 3. Ảnh chính
    if (mainImage != null && !mainImage.isEmpty()) {
        String mainImageName = System.currentTimeMillis() + "_" + mainImage.getOriginalFilename();
        File mainFile = new File(uploadDir, mainImageName);
        mainImage.transferTo(mainFile);
        recipe.setMainImageUrl(mainImageName);
    }

    // 4. Ảnh phụ (Sử dụng code cũ)
    if (otherImages != null && !otherImages.isEmpty()) {
        List<Image> imageList = new ArrayList<>();
        for (MultipartFile file : otherImages) {
            if (file != null && !file.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File f = new File(uploadDir, fileName);
                file.transferTo(f);

                Image img = new Image();
                img.setUrl(fileName);
                img.setRecipe(recipe);
                imageList.add(img);
            }
        }
        recipe.setImages(imageList);
    }

    // 5. Ingredients (Sử dụng code cũ)
    if (dto.getIngredients() != null) {
        List<Ingredient> ingList = new ArrayList<>();
        for (String s : dto.getIngredients()) {
            Ingredient ing = new Ingredient();
            ing.setName(s);
            ing.setRecipe(recipe);
            ingList.add(ing);
        }
        recipe.setIngredients(ingList);
    }

    // 6. Spices (Sử dụng code cũ)
    if (dto.getSpices() != null) {
        List<Spice> spiceList = new ArrayList<>();
        for (String s : dto.getSpices()) {
            Spice sp = new Spice();
            sp.setName(s);
            sp.setRecipe(recipe);
            spiceList.add(sp);
        }
        recipe.setSpices(spiceList);
    }

    // 7. Nutritions (Sử dụng code cũ)
    if (dto.getNutritions() != null) {
        List<Nutrition> nutList = new ArrayList<>();
        for (String s : dto.getNutritions()) {
            String[] parts = s.split(":", 2);
            Nutrition nut = new Nutrition();
            nut.setName(parts[0].trim());
            nut.setValue(parts.length > 1 ? parts[1].trim() : "");
            nut.setRecipe(recipe);
            nutList.add(nut);
        }
        recipe.setNutritions(nutList);
    }

    // 8. Steps (Sử dụng code cũ)
    if (dto.getSteps() != null) {
        List<Step> stepList = new ArrayList<>();
        int stepNum = 1;
        for (String s : dto.getSteps()) {
            Step st = new Step();
            st.setStepNumber(stepNum++);
            st.setInstruction(s);
            st.setRecipe(recipe);
            stepList.add(st);
        }
        recipe.setSteps(stepList);
    }

    // 9. Lưu vào database và trả về DTO
    Recipe saved = recipeRepository.save(recipe);

    // 10. ✅ KÍCH HOẠT TỰ ĐỘNG DUYỆT BẰNG AI (NẾU LÀ USER THƯỜNG)
    if (recipe.getStatus() == RecipeStatus.PENDING) {
        moderationService.autoModerateRecipe(saved.getId());
    }

    return convertToDTO(saved, token); 
}

// Cập nhật: Áp dụng lọc cho API public (Chỉ lấy ACCEPTED)
    public List<RecipeDTO> getAllRecipes(String token) {
        // Thay vì findAll(), chỉ lấy các bài đã ACCEPTED
        List<Recipe> recipes = recipeRepository.findAllByStatusOrderByCreatedAtDesc(RecipeStatus.APPROVED); 
        return recipes.stream()
                .map(r -> convertToDTO(r, token))
                .collect(Collectors.toList());
    }

    // Lấy recipe theo id
    public RecipeDTO getRecipeById(Long id, String token) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return convertToDTO(recipe, token);
    }
    

    // Xóa recipe
    public void deleteRecipe(Long id, String token) {
        // Kiểm tra xem recipe có tồn tại không
        if (!recipeRepository.existsById(id)) {
            throw new RuntimeException("Recipe không tồn tại với id " + id);
        }

        // Thực hiện xóa
        recipeRepository.deleteById(id);
        log.info("Đã xóa recipe với id {}", id);
    }

    // Cập nhật recipe theo id
    public RecipeDTO updateRecipe(Long id, RecipeDTO dto, String token) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe không tồn tại với id " + id));

        recipe.setTitle(dto.getTitle());
        recipe.setDescription(dto.getDescription());
        recipe.setCookTime(dto.getCookTime());
        recipe.setServings(dto.getServings());
        recipe.setDifficulty(dto.getDifficulty());

        // Luôn cập nhật userId từ token để đảm bảo đúng chủ sở hữu
        Long userId = extractUserId(token);
        if (userId == null) {
            throw new RuntimeException("Token không hợp lệ, không tìm thấy userId");
        }
        recipe.setUserId(userId);

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
            recipe.setCategory(category);
        }

        // Ingredients
        recipe.getIngredients().clear();
        if (dto.getIngredients() != null) {
            dto.getIngredients().forEach(s -> {
                Ingredient ing = new Ingredient();
                ing.setName(s);
                ing.setRecipe(recipe);
                recipe.getIngredients().add(ing);
            });
        }

        // Spices
        recipe.getSpices().clear();
        if (dto.getSpices() != null) {
            dto.getSpices().forEach(s -> {
                Spice sp = new Spice();
                sp.setName(s);
                sp.setRecipe(recipe);
                recipe.getSpices().add(sp);
            });
        }

        // Nutritions
        recipe.getNutritions().clear();
        if (dto.getNutritions() != null) {
            dto.getNutritions().forEach(s -> {
                String[] parts = s.split(":", 2);
                Nutrition nut = new Nutrition();
                nut.setName(parts[0].trim());
                nut.setValue(parts.length > 1 ? parts[1].trim() : "");
                nut.setRecipe(recipe);
                recipe.getNutritions().add(nut);
            });
        }

        // Steps
        recipe.getSteps().clear();
        if (dto.getSteps() != null) {
            int stepNum = 1;
            for (String s : dto.getSteps()) {
                Step st = new Step();
                st.setStepNumber(stepNum++);
                st.setInstruction(s);
                st.setRecipe(recipe);
                recipe.getSteps().add(st);
            }
        }

        Recipe saved = recipeRepository.save(recipe);
        return convertToDTO(saved, token);
    }

    // Upload ảnh đại diện cho recipe
    public String uploadMainImage(Long id, MultipartFile file) throws IOException {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe không tồn tại với id " + id));

        createUploadDirIfNotExist();

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File targetFile = new File(uploadDir, filename);
        file.transferTo(targetFile);

        recipe.setMainImageUrl(filename);
        recipeRepository.save(recipe);

        log.info("Đã upload ảnh mới cho recipe {}: {}", id, filename);
        return filename;
    }

    /*public List<RecipeDTO> getRecipesByCategoryName(String categoryName, String token) {
        List<Recipe> recipes = recipeRepository.findByCategory_Name(categoryName);
        return recipes.stream()
                .map(r -> convertToDTO(r, token))
                .collect(Collectors.toList());
    }

    public List<RecipeDTO> searchRecipesByTitle(String keyword, String token) {
    List<Recipe> matched = recipeRepository.findByTitleContainingIgnoreCase(keyword);
    return matched.stream()
            .map(r -> convertToDTO(r, token))
            .collect(Collectors.toList());
}*/
 public List<RecipeDTO> filterRecipes(String category, String search, String time, String difficulty, String sort, String token) {
 List<Recipe> all = sort != null && sort.equalsIgnoreCase("asc")
        ? recipeRepository.findAllByStatusOrderByCreatedAtAsc(RecipeStatus.APPROVED)
        : recipeRepository.findAllByStatusOrderByCreatedAtDesc(RecipeStatus.APPROVED);

    return all.stream()
        .filter(r -> {
            // Lọc theo category
            if (category != null && !category.isBlank()) {
                if (r.getCategory() == null ||
                    !r.getCategory().getName().equalsIgnoreCase(category)) {
                    return false;
                }
            }

            // Lọc theo search (tiêu đề)
            if (search != null && !search.isBlank()) {
                if (r.getTitle() == null ||
                    !r.getTitle().toLowerCase().contains(search.toLowerCase())) {
                    return false;
                }
            }

            // Lọc theo difficulty
            if (difficulty != null && !difficulty.isBlank()) {
                if (r.getDifficulty() == null ||
                    !r.getDifficulty().getLabel().equalsIgnoreCase(difficulty.trim())) {
                    return false;
                }
            }

            // Lọc theo time
            if (time != null && !time.isBlank()) {
                try {
                    String cookTimeStr = r.getCookTime();
                    if (cookTimeStr == null || cookTimeStr.isBlank()) return false;

                    String numeric = cookTimeStr.replaceAll("\\D+", "");
                    if (numeric.isBlank()) return false;

                    int minutes = Integer.parseInt(numeric);

                    return switch (time) {
                        case "short" -> minutes < 30;
                        case "medium" -> minutes >= 30 && minutes <= 60;
                        case "long" -> minutes > 60;
                        default -> true;
                    };
                } catch (Exception e) {
                    // Nếu cookTime không parse được thì bỏ qua món ăn đó
                    return false;
                }
            }

            return true;
        })
        .map(r -> convertToDTO(r, token))
        .toList();
}
// ✅ Lấy danh sách recipe của user hiện tại
public List<RecipeDTO> getRecipesByCurrentUser(String token) {
    Long userId = extractUserId(token);
    if (userId == null) {
        throw new RuntimeException("Token không hợp lệ, không tìm thấy userId");
    }

    List<Recipe> recipes = recipeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    return recipes.stream()
            .map(r -> convertToDTO(r, token))
            .toList();
}
// ✅ THÊM PHƯƠNG THỨC NÀY
// Lấy danh sách recipe theo ID danh mục (chỉ bài đã duyệt)
public List<RecipeDTO> getRecipesByCategoryId(Long categoryId, String token) {
    List<Recipe> recipes = recipeRepository.findByCategoryIdAndStatus(categoryId, RecipeStatus.APPROVED);
    return recipes.stream()
            .map(r -> convertToDTO(r, token))
            .toList();
}
// ✅ THÊM PHƯƠNG THỨC NÀY
// Lấy danh sách recipe theo trạng thái để duyệt bài
public List<RecipeDTO> getRecipesByStatus(RecipeStatus status, String token) {
    List<Recipe> recipes = recipeRepository.findAllByStatusOrderByCreatedAtDesc(status);
    return recipes.stream()
            .map(r -> convertToDTO(r, token))
            .toList();
}
}
