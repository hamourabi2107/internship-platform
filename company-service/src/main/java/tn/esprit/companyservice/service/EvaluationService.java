package tn.esprit.companyservice.service;

import org.springframework.stereotype.Service;
import tn.esprit.companyservice.entity.Evaluation;
import tn.esprit.companyservice.repository.EvaluationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;

    public EvaluationService(EvaluationRepository evaluationRepository) {
        this.evaluationRepository = evaluationRepository;
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Optional<Evaluation> getEvaluationById(Long id) {
        return evaluationRepository.findById(id);
    }

    public List<Evaluation> getByInternship(Long internshipId) {
        return evaluationRepository.findByInternshipId(internshipId);
    }

    public List<Evaluation> getBySupervisor(Long supervisorId) {
        return evaluationRepository.findBySupervisorId(supervisorId);
    }

    public Evaluation createEvaluation(Evaluation evaluation) {
        calculateOverallGrade(evaluation);
        return evaluationRepository.save(evaluation);
    }

    public Optional<Evaluation> updateEvaluation(
            Long id,
            Evaluation evaluation) {

        return evaluationRepository.findById(id)
                .map(existingEvaluation -> {

                    existingEvaluation.setInternshipId(
                            evaluation.getInternshipId());
                    existingEvaluation.setSupervisorId(
                            evaluation.getSupervisorId());
                    existingEvaluation.setQuality(
                            evaluation.getQuality());
                    existingEvaluation.setPunctuality(
                            evaluation.getPunctuality());
                    existingEvaluation.setCommunication(
                            evaluation.getCommunication());
                    existingEvaluation.setAppreciation(
                            evaluation.getAppreciation());
                    existingEvaluation.setRemarks(
                            evaluation.getRemarks());

                    calculateOverallGrade(existingEvaluation);

                    return evaluationRepository.save(
                            existingEvaluation);
                });
    }

    public boolean deleteEvaluation(Long id) {

        if (!evaluationRepository.existsById(id)) {
            return false;
        }

        evaluationRepository.deleteById(id);
        return true;
    }

    private void calculateOverallGrade(Evaluation evaluation) {

        double grade =
                (evaluation.getQuality()
                        + evaluation.getPunctuality()
                        + evaluation.getCommunication()) / 3;

        evaluation.setOverallGrade(
                Math.round(grade * 100.0) / 100.0
        );
    }
}