package com.lolocupcakes.catalog.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "option_groups")
public class OptionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name_ar", nullable = false)
    private String nameAr;

    @Column(name = "name_en")
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "selection_type", nullable = false)
    private SelectionType selectionType = SelectionType.SINGLE;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "min_selections", nullable = false)
    private Integer minSelections = 0;

    @Column(name = "max_selections", nullable = false)
    private Integer maxSelections = 1;

    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("displayOrder ASC")
    private List<OptionValue> values = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public OptionGroup() {}

    public OptionGroup(String nameAr, SelectionType selectionType, Boolean isRequired) {
        this.nameAr = nameAr;
        this.selectionType = selectionType;
        this.isRequired = isRequired;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNameAr() { return nameAr; }
    public void setNameAr(String nameAr) { this.nameAr = nameAr; }
    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }
    public SelectionType getSelectionType() { return selectionType; }
    public void setSelectionType(SelectionType selectionType) { this.selectionType = selectionType; }
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean required) { isRequired = required; }
    public Integer getMinSelections() { return minSelections; }
    public void setMinSelections(Integer minSelections) { this.minSelections = minSelections; }
    public Integer getMaxSelections() { return maxSelections; }
    public void setMaxSelections(Integer maxSelections) { this.maxSelections = maxSelections; }
    public List<OptionValue> getValues() { return values; }
    public void setValues(List<OptionValue> values) { this.values = values; }
    public Instant getCreatedAt() { return createdAt; }
}
