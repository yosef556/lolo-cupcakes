package com.lolocupcakes.scheduling.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "business_closures")
public class BusinessClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "start_datetime", nullable = false)
    private Instant startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private Instant endDatetime;

    @Column(name = "reason_ar")
    private String reasonAr;

    public BusinessClosure() {}

    public BusinessClosure(UUID branchId, Instant startDatetime, Instant endDatetime, String reasonAr) {
        this.branchId = branchId;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
        this.reasonAr = reasonAr;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getBranchId() { return branchId; }
    public void setBranchId(UUID branchId) { this.branchId = branchId; }
    public Instant getStartDatetime() { return startDatetime; }
    public void setStartDatetime(Instant startDatetime) { this.startDatetime = startDatetime; }
    public Instant getEndDatetime() { return endDatetime; }
    public void setEndDatetime(Instant endDatetime) { this.endDatetime = endDatetime; }
    public String getReasonAr() { return reasonAr; }
    public void setReasonAr(String reasonAr) { this.reasonAr = reasonAr; }
}
