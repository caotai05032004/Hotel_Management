package com.dev.backend.service;

import com.dev.backend.constant.enums.FilterLogicType;
import com.dev.backend.constant.enums.SortDirection;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.FilterCriteria;
import com.dev.backend.dto.request.SortCriteria;
import com.dev.backend.exception.customize.InvalidFieldException;
import jakarta.persistence.Column;
import jakarta.persistence.EntityManager;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.criteria.*;
import lombok.Getter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.*;
import java.util.stream.Collectors;

public interface BaseService<T, ID> {

    T create(T entity);

    List<T> create(List<T> entities);

    T update(ID id, T entity);

    void delete(ID id);

    void delete(List<T> entities);

    T changeStatus(ID id, Integer status);

    List<T> getAll();

    Optional<T> getOne(ID id);

    boolean exists(ID id);

    long count();

    Page<T> filter(BaseFilterRequest request);

    public T updateFromMap(ID id, Map<String, Object> updates);

    @Getter
    @Service
    @Transactional
    abstract class BaseServiceImpl<T, ID> implements BaseService<T, ID> {

        protected final JpaRepository<T, ID> repository;
        protected final JpaSpecificationExecutor<T> specificationExecutor;
        private final String statusFieldName;
        private Class<T> entityClass;

        public BaseServiceImpl(JpaRepository<T, ID> repository, String statusFieldName) {
            this.repository = repository;
            this.statusFieldName = statusFieldName;

            if (!(repository instanceof JpaSpecificationExecutor)) {
                throw new IllegalArgumentException("Repository phải implement JpaSpecificationExecutor để sử dụng filter");
            }
            this.specificationExecutor = (JpaSpecificationExecutor<T>) repository;

            this.entityClass = getEntityClassFromGeneric();
        }

        public BaseServiceImpl(JpaRepository<T, ID> repository) {
            this(repository, "trangThai");
        }

        protected abstract EntityManager getEntityManager();

        @SuppressWarnings("unchecked")
        private Class<T> getEntityClassFromGeneric() {
            try {
                ParameterizedType parameterizedType = (ParameterizedType) getClass().getGenericSuperclass();
                return (Class<T>) parameterizedType.getActualTypeArguments()[0];
            } catch (Exception e) {
                throw new IllegalStateException("Không thể tự động detect entity class. Hãy override method getEntityClass()", e);
            }
        }

        protected Class<T> getEntityClass() {
            return this.entityClass;
        }

        // ================= CRUD METHODS =================

        @Override
        @Transactional
        public T create(T entity) {
            return repository.save(entity);
        }

        @Override
        @Transactional
        public T update(ID id, T entity) {
            Optional<T> optional = repository.findById(id);
            if (optional.isEmpty()) {
                throw new IllegalArgumentException("Entity not found for id: " + id);
            }

            setEntityId(entity, id);

            return repository.save(entity);
        }


        /**
         * Cập nhật entity từ HashMap, tự động bỏ qua trường @Id
         * @param id ID của entity cần update
         * @param updates HashMap chứa các trường cần cập nhật và giá trị mới
         * @return Entity đã được cập nhật
         */
        @Transactional
        public T updateFromMap(ID id, Map<String, Object> updates) {
            Optional<T> optional = repository.findById(id);
            T entity = optional.orElseThrow(() ->
                    new IllegalArgumentException("Entity not found for id: " + id));

            if (updates == null || updates.isEmpty()) {
                return entity;
            }

            Field idField = getIdField(entity.getClass());

            for (Map.Entry<String, Object> entry : updates.entrySet()) {
                String fieldName = entry.getKey();
                Object value = entry.getValue();

                try {
                    Field field = getField(entity.getClass(), fieldName);

                    // Bỏ qua trường @Id
                    if (field.equals(idField)) {
                        continue;
                    }

                    field.setAccessible(true);
                    Object convertedValue = convertValue(value, field.getType());
                    field.set(entity, convertedValue);

                } catch (NoSuchFieldException e) {
                    throw new InvalidFieldException(
                            String.format("Field '%s' không tồn tại trong entity %s",
                                    fieldName, getEntityClass().getSimpleName()));
                } catch (Exception e) {
                    throw new IllegalStateException(
                            String.format("Không thể cập nhật field '%s': %s",
                                    fieldName, e.getMessage()), e);
                }
            }

            return repository.save(entity);
        }

        @Override
        @Transactional
        public void delete(ID id) {
            repository.deleteById(id);
        }

        @Override
        @Transactional
        public void delete(List<T> entities){
            repository.deleteAll(entities);
        }

        @Override
        @Transactional
        public T changeStatus(ID id, Integer status) {
            Optional<T> optional = repository.findById(id);
            T entity = optional.orElseThrow(() -> new IllegalArgumentException("Entity not found for id: " + id));
            setStatus(entity, status);
            return repository.save(entity);
        }

        @Override
        @Transactional(readOnly = true)
        public List<T> getAll() {
            return repository.findAll();
        }

        @Override
        @Transactional(readOnly = true)
        public Optional<T> getOne(ID id) {
            return repository.findById(id);
        }

        @Override
        @Transactional(readOnly = true)
        public boolean exists(ID id) {
            return repository.existsById(id);
        }

        @Override
        @Transactional(readOnly = true)
        public long count() {
            return repository.count();
        }

        protected Set<String> getValidColumnFields() {
            Set<String> validFields = new HashSet<>();
            Class<?> currentClass = getEntityClass();

            // Duyệt qua tất cả các class trong hierarchy (bao gồm cả parent class)
            while (currentClass != null && currentClass != Object.class) {
                Field[] fields = currentClass.getDeclaredFields();

                for (Field field : fields) {
                    // Hỗ trợ @Column
                    if (field.isAnnotationPresent(Column.class)) {
                        validFields.add(field.getName());
                    }
                    // Hỗ trợ @JoinColumn (ManyToOne, OneToOne)
                    if (field.isAnnotationPresent(JoinColumn.class)) {
                        validFields.add(field.getName());
                    }
                    // Hỗ trợ @OneToMany, @ManyToMany
                    if (field.isAnnotationPresent(jakarta.persistence.OneToMany.class) ||
                            field.isAnnotationPresent(jakarta.persistence.ManyToMany.class)) {
                        validFields.add(field.getName());
                    }
                    // Hỗ trợ @ManyToOne, @OneToOne (không cần @JoinColumn)
                    if (field.isAnnotationPresent(jakarta.persistence.ManyToOne.class) ||
                            field.isAnnotationPresent(jakarta.persistence.OneToOne.class)) {
                        validFields.add(field.getName());
                    }
                }

                currentClass = currentClass.getSuperclass();
            }

            return validFields;
        }

        protected void validateFieldName(String fieldName) {
            Set<String> validFields = getValidColumnFields();

            // Nếu là nested field (vd: "user.name"), chỉ validate phần đầu tiên
            String firstPart = fieldName.split("\\.")[0];

            if (!validFields.contains(firstPart)) {
                throw new InvalidFieldException(
                        String.format("Field '%s' không tồn tại hoặc không có annotation hợp lệ trong entity %s. " +
                                        "Các field hợp lệ: %s",
                                firstPart, getEntityClass().getSimpleName(), validFields)
                );
            }
        }

        /**
         * Tạo Specification từ danh sách FilterCriteria với hỗ trợ AND/OR
         */
        protected Specification<T> createSpecification(List<FilterCriteria> filters) {
            return (root, query, criteriaBuilder) -> {
                if (filters == null || filters.isEmpty()) {
                    System.out.println("❌ Filters is null or empty");
                    return criteriaBuilder.conjunction();
                }

                List<Predicate> andPredicates = new ArrayList<>();
                List<Predicate> orPredicates = new ArrayList<>();

                for (int i = 0; i < filters.size(); i++) {
                    FilterCriteria filter = filters.get(i);

                    if (filter.getFieldName() == null || filter.getOperation() == null) {
                        System.out.println("⚠️ Skipped - fieldName or operation is null");
                        continue;
                    }

                    validateFieldName(filter.getFieldName());

                    Path<?> fieldPath = getFieldPath(root, filter.getFieldName());
                    Predicate predicate = createPredicate(criteriaBuilder, fieldPath, filter);

                    if (predicate != null) {
                        FilterLogicType logicType = filter.getLogicType() != null ?
                                filter.getLogicType() : FilterLogicType.AND;

                        if (logicType == FilterLogicType.OR) {
                            orPredicates.add(predicate);
                        } else {
                            andPredicates.add(predicate);
                        }
                    }
                }

                System.out.println("AND predicates: " + andPredicates.size());
                System.out.println("OR predicates: " + orPredicates.size());

                // Kết hợp tất cả predicates
                Predicate finalPredicate = null;

                if (!andPredicates.isEmpty()) {
                    finalPredicate = criteriaBuilder.and(andPredicates.toArray(new Predicate[0]));
                }

                if (!orPredicates.isEmpty()) {
                    Predicate orPredicate = criteriaBuilder.or(orPredicates.toArray(new Predicate[0]));
                    finalPredicate = finalPredicate != null ?
                            criteriaBuilder.and(finalPredicate, orPredicate) : orPredicate;
                }

                return finalPredicate != null ? finalPredicate : criteriaBuilder.conjunction();
            };
        }

        protected Path<?> getFieldPath(Root<T> root, String fieldName) {
            String[] parts = fieldName.split("\\.");
            Path<?> path = root.get(parts[0]);

            for (int i = 1; i < parts.length; i++) {
                path = path.get(parts[i]);
            }

            return path;
        }

        @SuppressWarnings({"rawtypes", "unchecked"})
        protected Predicate createPredicate(CriteriaBuilder cb, Path<?> path, FilterCriteria filter) {
            Object value = filter.getValue();
            if (value == null) return null;

            switch (filter.getOperation()) {
                case EQUALS:
                    return cb.equal(path, value);

                case LESS_THAN:
                    if (Comparable.class.isAssignableFrom(path.getJavaType())) {
                        return cb.lessThan((Expression<? extends Comparable>) path, (Comparable) value);
                    }
                    throw new IllegalArgumentException("Trường '" + filter.getFieldName() + "' không phải kiểu Comparable");

                case LESS_THAN_OR_EQUAL:
                    if (Comparable.class.isAssignableFrom(path.getJavaType())) {
                        return cb.lessThanOrEqualTo((Expression<? extends Comparable>) path, (Comparable) value);
                    }
                    throw new IllegalArgumentException("Trường '" + filter.getFieldName() + "' không phải kiểu Comparable");

                case GREATER_THAN:
                    if (Comparable.class.isAssignableFrom(path.getJavaType())) {
                        return cb.greaterThan((Expression<? extends Comparable>) path, (Comparable) value);
                    }
                    throw new IllegalArgumentException("Trường '" + filter.getFieldName() + "' không phải kiểu Comparable");

                case GREATER_THAN_OR_EQUAL:
                    if (Comparable.class.isAssignableFrom(path.getJavaType())) {
                        return cb.greaterThanOrEqualTo((Expression<? extends Comparable>) path, (Comparable) value);
                    }
                    throw new IllegalArgumentException("Trường '" + filter.getFieldName() + "' không phải kiểu Comparable");

                case LIKE:
                    if (value instanceof String str) {
                        return cb.like(cb.lower((Expression<String>) path), "%" + str.toLowerCase() + "%");
                    }
                    throw new IllegalArgumentException("LIKE chỉ áp dụng cho String");

                case ILIKE:
                    if (value instanceof String str) {
                        return cb.like(cb.lower((Expression<String>) path), "%" + str.toLowerCase() + "%");
                    }
                    throw new IllegalArgumentException("ILIKE chỉ áp dụng cho String");

                case IN:
                    if (value instanceof Collection<?> collection) {
                        return path.in(collection);
                    }
                    return path.in(value);

                case NOT_IN:
                    if (value instanceof Collection<?> collection) {
                        return cb.not(path.in(collection));
                    }
                    return cb.not(path.in(value));

                default:
                    throw new IllegalArgumentException("Không hỗ trợ operation: " + filter.getOperation());
            }
        }


        protected Pageable createPageable(List<SortCriteria> sorts, Integer page, Integer size) {
            for (SortCriteria sort : sorts) {
                validateFieldName(sort.getFieldName());
            }

            if (sorts.isEmpty()) {
                return PageRequest.of(page != null ? page : 0, size != null ? size : 20);
            }

            List<Sort.Order> orders = sorts.stream()
                    .map(sort -> {
                        Sort.Direction direction = sort.getDirection() == SortDirection.DESC ?
                                Sort.Direction.DESC : Sort.Direction.ASC;
                        return new Sort.Order(direction, sort.getFieldName());
                    })
                    .collect(Collectors.toList());

            Sort sortObj = Sort.by(orders);
            return PageRequest.of(page != null ? page : 0, size != null ? size : 20, sortObj);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<T> filter(BaseFilterRequest request) {
            try {
                Specification<T> spec = createSpecification(request.getFilters());
                Pageable pageable = createPageable(request.getSorts(), request.getPage(), request.getSize());

                return specificationExecutor.findAll(spec, pageable);

            } catch (Exception e) {
                if (e instanceof InvalidFieldException) {
                    throw e;
                }
                throw new RuntimeException("Lỗi khi thực hiện filter: " + e.getMessage(), e);
            }
        }

        // ================= PRIVATE HELPER METHODS =================

        private void setStatus(T entity, Integer status) {
            try {
                Field field = getField(entity.getClass(), statusFieldName);
                field.setAccessible(true);
                field.set(entity, status);
            } catch (Exception e) {
                throw new IllegalStateException("Unable to set status field '" + statusFieldName + "' via reflection", e);
            }
        }

        private Field getField(Class<?> clazz, String name) throws NoSuchFieldException {
            Class<?> current = clazz;
            while (current != null) {
                try {
                    return current.getDeclaredField(name);
                } catch (NoSuchFieldException ignored) {
                    current = current.getSuperclass();
                }
            }
            throw new NoSuchFieldException(name);
        }

        private Object convertValue(Object value, Class<?> targetType) {
            if (value == null) return null;

            if (targetType.equals(UUID.class) && value instanceof String str) {
                return UUID.fromString(str);
            }
            if (targetType.equals(Long.class) && value instanceof String str) {
                return Long.parseLong(str);
            }
            if (targetType.equals(Integer.class) && value instanceof String str) {
                return Integer.parseInt(str);
            }
            if (targetType.equals(Boolean.class) && value instanceof String str) {
                return Boolean.parseBoolean(str);
            }
            return value;
        }


        private void setEntityId(T entity, ID id) {
            try {
                Field idField = getIdField(entity.getClass());
                idField.setAccessible(true);
                idField.set(entity, id);
            } catch (Exception e) {
                throw new IllegalStateException("Không thể gán ID cho entity: " + e.getMessage(), e);
            }
        }

        private Field getIdField(Class<?> clazz) {
            Class<?> current = clazz;
            while (current != null && current != Object.class) {
                for (Field field : current.getDeclaredFields()) {
                    if (field.isAnnotationPresent(jakarta.persistence.Id.class)) {
                        return field;
                    }
                }
                current = current.getSuperclass();
            }
            throw new IllegalStateException("Không tìm thấy field @Id trong class " + clazz.getSimpleName());
        }
    }
}


