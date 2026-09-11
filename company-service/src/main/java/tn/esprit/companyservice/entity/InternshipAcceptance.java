package tn.esprit.companyservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "internship_acceptances")
public class InternshipAcceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Long internshipId;

    @NotNull
    private Long companyId;

    @NotNull
    @Pattern(
            regexp = "PENDING|ACCEPTED|REJECTED",
            message = "Status must be PENDING, ACCEPTED or REJECTED"
    )
    private String status;

    private String reason;

    public InternshipAcceptance() {
    }

    public InternshipAcceptance(Long internshipId,
                                Long companyId,
                                String status,
                                String reason) {
        this.internshipId = internshipId;
        this.companyId = companyId;
        this.status = status;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}