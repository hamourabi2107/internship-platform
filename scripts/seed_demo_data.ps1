# scripts/seed_demo_data.ps1
# Script de peuplement de données réalistes de démonstration pour la soutenance PFE
$baseUrl = "http://192.168.56.10:8083"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Peuplement des données de démonstration ESPRIT STAGES" -ForegroundColor Cyan
Write-Host " Passerelle : $baseUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# ------------------------------------------------------------
# 1. ÉTUDIANTS (Students)
# ------------------------------------------------------------
Write-Host "`n1. Vérification et création des étudiants..." -ForegroundColor Yellow
$existingStudents = @()
try {
    $existingStudents = Invoke-RestMethod -Uri "$baseUrl/student" -Method Get
} catch {
    Write-Host "Impossible de récupérer les étudiants: $_" -ForegroundColor Red
}

$targetStudents = @(
    @{ firstName = "Mohamed"; lastName = "BenAli"; email = "mohamed.benali@esprit.tn"; phone = "12345678" }, # MAIN DEMO CASE
    @{ firstName = "Yassine"; lastName = "Trabelsi"; email = "yassine.trabelsi@esprit.tn"; phone = "21345678" },
    @{ firstName = "Mariem";  lastName = "Ben Salem"; email = "mariem.bensalem@esprit.tn"; phone = "23456789" },
    @{ firstName = "Nour";    lastName = "Haddad"; email = "nour.haddad@esprit.tn"; phone = "24567890" },
    @{ firstName = "Seif";    lastName = "Mejri"; email = "seif.mejri@esprit.tn"; phone = "25678901" },
    @{ firstName = "Amine";   lastName = "Ayari"; email = "amine.ayari@esprit.tn"; phone = "26789012" }
)

$studentMap = @{}
foreach ($s in $existingStudents) {
    $studentMap[$s.email.ToLower()] = $s
}

foreach ($target in $targetStudents) {
    $key = $target.email.ToLower()
    if (-not $studentMap.ContainsKey($key)) {
        try {
            $json = $target | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/student" -Method Post -Body $json -ContentType "application/json"
            $studentMap[$key] = $created
            Write-Host "  + Étudiant créé : $($created.firstName) $($created.lastName) (ID: $($created.id))" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur création étudiant $($target.email): $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  = Étudiant existant : $($studentMap[$key].firstName) $($studentMap[$key].lastName) (ID: $($studentMap[$key].id))" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------
# 2. ENTREPRISES (Companies)
# ------------------------------------------------------------
Write-Host "`n2. Vérification et création des entreprises..." -ForegroundColor Yellow
$existingCompanies = @()
try {
    $existingCompanies = Invoke-RestMethod -Uri "$baseUrl/companies" -Method Get
} catch {
    Write-Host "Impossible de récupérer les entreprises: $_" -ForegroundColor Red
}

$targetCompanies = @(
    @{ name = "Google Tunisia"; email = "contact@google.com"; phone = "22334455"; address = "Technopole El Ghazela, Ariana" }, # MAIN DEMO CASE
    @{ name = "Tech Solutions Tunisia"; email = "contact@techsolutions.tn"; phone = "71234567"; address = "Centre Urbain Nord, Tunis" },
    @{ name = "FinTech Solutions"; email = "rh@fintech.tn"; phone = "71345678"; address = "Les Berges du Lac 2, Tunis" },
    @{ name = "Digital Innovators"; email = "contact@digitalinnovators.tn"; phone = "71456789"; address = "Immeuble Alyssa, Lac 1, Tunis" },
    @{ name = "Smart Systems"; email = "jobs@smartsystems.tn"; phone = "71567890"; address = "Pôle Technologique de Sousse" },
    @{ name = "DataTech Tunisia"; email = "recrutement@datatech.tn"; phone = "71678901"; address = "Parc Technologique El Ghazela" }
)

$companyMap = @{}
foreach ($c in $existingCompanies) {
    $companyMap[$c.name.ToLower()] = $c
}

foreach ($target in $targetCompanies) {
    $key = $target.name.ToLower()
    if (-not $companyMap.ContainsKey($key)) {
        try {
            $json = $target | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/companies" -Method Post -Body $json -ContentType "application/json"
            $companyMap[$key] = $created
            Write-Host "  + Entreprise créée : $($created.name) (ID: $($created.id))" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur création entreprise $($target.name): $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  = Entreprise existante : $($companyMap[$key].name) (ID: $($companyMap[$key].id))" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------
# 3. ENCADRANTS (Supervisors)
# ------------------------------------------------------------
Write-Host "`n3. Vérification et création des encadrants..." -ForegroundColor Yellow
$existingSupervisors = @()
try {
    $existingSupervisors = Invoke-RestMethod -Uri "$baseUrl/supervisors" -Method Get
} catch {
    Write-Host "Impossible de récupérer les encadrants: $_" -ForegroundColor Red
}

$cGoogleId = if ($companyMap["google tunisia"]) { $companyMap["google tunisia"].id } else { 1 }
$cTechId   = if ($companyMap["tech solutions tunisia"]) { $companyMap["tech solutions tunisia"].id } else { 2 }
$cFinId    = if ($companyMap["fintech solutions"]) { $companyMap["fintech solutions"].id } else { 3 }
$cDigId    = if ($companyMap["digital innovators"]) { $companyMap["digital innovators"].id } else { 4 }
$cSmartId  = if ($companyMap["smart systems"]) { $companyMap["smart systems"].id } else { 5 }
$cDataId   = if ($companyMap["datatech tunisia"]) { $companyMap["datatech tunisia"].id } else { 6 }

$targetSupervisors = @(
    @{ firstName = "Ahmed"; lastName = "Mansour"; email = "ahmed.mansour@google.com"; phone = "22334455"; companyId = [long]$cGoogleId }, # MAIN DEMO CASE
    @{ firstName = "Karim"; lastName = "Jaziri"; email = "karim.jaziri@techsolutions.tn"; phone = "98123456"; companyId = [long]$cTechId },
    @{ firstName = "Sonia"; lastName = "Gharbi"; email = "sonia.gharbi@fintech.tn"; phone = "98234567"; companyId = [long]$cFinId },
    @{ firstName = "Mehdi"; lastName = "Bouazizi"; email = "mehdi.bouazizi@digitalinnovators.tn"; phone = "98345678"; companyId = [long]$cDigId },
    @{ firstName = "Hela";  lastName = "Chahed"; email = "hela.chahed@smartsystems.tn"; phone = "98456789"; companyId = [long]$cSmartId },
    @{ firstName = "Tarek"; lastName = "Ben Salah"; email = "tarek.bensalah@datatech.tn"; phone = "98567890"; companyId = [long]$cDataId }
)

$supervisorMap = @{}
foreach ($sup in $existingSupervisors) {
    $supervisorMap[$sup.email.ToLower()] = $sup
}

foreach ($target in $targetSupervisors) {
    $key = $target.email.ToLower()
    if (-not $supervisorMap.ContainsKey($key)) {
        try {
            $json = $target | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/supervisors" -Method Post -Body $json -ContentType "application/json"
            $supervisorMap[$key] = $created
            Write-Host "  + Encadrant créé : $($created.firstName) $($created.lastName) (ID: $($created.id))" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur création encadrant $($target.email): $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  = Encadrant existant : $($supervisorMap[$key].firstName) $($supervisorMap[$key].lastName) (ID: $($supervisorMap[$key].id))" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------
# 4. STAGES PFE (Internships)
# ------------------------------------------------------------
Write-Host "`n4. Vérification et création des stages PFE..." -ForegroundColor Yellow
$existingInternships = @()
try {
    $existingInternships = Invoke-RestMethod -Uri "$baseUrl/internships" -Method Get
} catch {
    Write-Host "Impossible de récupérer les stages: $_" -ForegroundColor Red
}

$s1Id = if ($studentMap["mohamed.benali@esprit.tn"]) { $studentMap["mohamed.benali@esprit.tn"].id } else { 1 }
$s2Id = if ($studentMap["yassine.trabelsi@esprit.tn"]) { $studentMap["yassine.trabelsi@esprit.tn"].id } else { 2 }
$s3Id = if ($studentMap["mariem.bensalem@esprit.tn"]) { $studentMap["mariem.bensalem@esprit.tn"].id } else { 3 }
$s4Id = if ($studentMap["nour.haddad@esprit.tn"]) { $studentMap["nour.haddad@esprit.tn"].id } else { 4 }
$s5Id = if ($studentMap["seif.mejri@esprit.tn"]) { $studentMap["seif.mejri@esprit.tn"].id } else { 5 }
$s6Id = if ($studentMap["amine.ayari@esprit.tn"]) { $studentMap["amine.ayari@esprit.tn"].id } else { 6 }

$targetInternships = @(
    # MAIN DEMO CASE (Must be PENDING for live acceptance during presentation)
    @{
        title = "PFE - Architecture Cloud & Microservices";
        company = "Google Tunisia";
        description = "Conception et déploiement d'une architecture distribuée DevOps avec Spring Cloud et Docker.";
        startDate = "2026-02-01";
        endDate = "2026-07-31";
        studentId = [long]$s1Id;
        status = "PENDING"
    },
    @{
        title = "PFE - Plateforme IoT & Edge Computing";
        company = "Tech Solutions Tunisia";
        description = "Supervision temps réel et télémétrie industrielle avec MQTT et microservices Kafka.";
        startDate = "2026-02-01";
        endDate = "2026-07-31";
        studentId = [long]$s2Id;
        status = "ACTIVE"
    },
    @{
        title = "PFE - Application Mobile Bancaire & Sécurité";
        company = "FinTech Solutions";
        description = "Implémentation d'une application bancaire mobile sécurisée avec authentification biométrique et PCI-DSS.";
        startDate = "2025-09-01";
        endDate = "2026-02-15";
        studentId = [long]$s3Id;
        status = "COMPLETED"
    },
    @{
        title = "PFE - Système de Recommandation par Intelligence Artificielle";
        company = "Digital Innovators";
        description = "Modélisation de modèles de Machine Learning et déploiement d'API d'inférence en production.";
        startDate = "2026-02-15";
        endDate = "2026-08-15";
        studentId = [long]$s4Id;
        status = "ACCEPTED"
    },
    @{
        title = "PFE - Automatisation DevOps & Infrastructure as Code";
        company = "Smart Systems";
        description = "Provisioning Kubernetes multi-clusters avec Terraform, Helm et pipelines Jenkins CI/CD.";
        startDate = "2025-09-01";
        endDate = "2026-02-01";
        studentId = [long]$s5Id;
        status = "COMPLETED"
    },
    @{
        title = "PFE - Data Pipeline Temps Réel & Analytics";
        company = "DataTech Tunisia";
        description = "Ingestion temps réel de flux de données massives avec Apache Spark Streaming et Elasticsearch.";
        startDate = "2026-03-01";
        endDate = "2026-08-31";
        studentId = [long]$s6Id;
        status = "PENDING"
    },
    @{
        title = "PFE - Analyse Prédictive pour la Santé Connectée";
        company = "Tech Solutions Tunisia";
        description = "Algorithmes de détection d'anomalies sur des signaux biomédicaux en streaming.";
        startDate = "2026-02-01";
        endDate = "2026-07-31";
        studentId = [long]$s2Id;
        status = "REJECTED"
    },
    @{
        title = "PFE - Micro-frontends & Architecture Modulaire Angular";
        company = "Google Tunisia";
        description = "Décomposition d'un portail d'entreprise complexe en micro-applications autonomes avec Module Federation.";
        startDate = "2026-02-01";
        endDate = "2026-07-31";
        studentId = [long]$s6Id;
        status = "ACTIVE"
    }
)

$internshipMap = @{}
foreach ($i in $existingInternships) {
    $internshipMap[$i.title.ToLower()] = $i
}

foreach ($target in $targetInternships) {
    $key = $target.title.ToLower()
    if (-not $internshipMap.ContainsKey($key)) {
        try {
            $json = $target | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/internships" -Method Post -Body $json -ContentType "application/json"
            $internshipMap[$key] = $created
            Write-Host "  + Stage créé : $($created.title) (Statut: $($created.status), ID: $($created.id))" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur création stage $($target.title): $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  = Stage existant : $($internshipMap[$key].title) (Statut: $($internshipMap[$key].status), ID: $($internshipMap[$key].id))" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------
# 5. APPROBATIONS / CANDIDATURES (Acceptances)
# ------------------------------------------------------------
Write-Host "`n5. Vérification et création des acceptances entreprise..." -ForegroundColor Yellow
$existingAcceptances = @()
try {
    $existingAcceptances = Invoke-RestMethod -Uri "$baseUrl/acceptances" -Method Get
} catch {
    Write-Host "Acceptances non disponibles: $_" -ForegroundColor DarkGray
}

$intMain = $internshipMap["pfe - architecture cloud & microservices"]
$intTech = $internshipMap["pfe - plateforme iot & edge computing"]
$intFin  = $internshipMap["pfe - application mobile bancaire & sécurité"]
$intDig  = $internshipMap["pfe - système de recommandation par intelligence artificielle"]
$intSmart= $internshipMap["pfe - automatisation devops & infrastructure as code"]

$targetAcceptances = @(
    @{ internshipId = [long]$intMain.id; companyId = [long]$cGoogleId; status = "PENDING"; reason = "En attente d examen par l encadrant" },
    @{ internshipId = [long]$intTech.id; companyId = [long]$cTechId; status = "ACCEPTED"; reason = "Compétences IoT validées" },
    @{ internshipId = [long]$intFin.id; companyId = [long]$cFinId; status = "ACCEPTED"; reason = "Profil retenu pour projet bancaire" },
    @{ internshipId = [long]$intDig.id; companyId = [long]$cDigId; status = "ACCEPTED"; reason = "Sujet validé par le responsable IA" },
    @{ internshipId = [long]$intSmart.id; companyId = [long]$cSmartId; status = "ACCEPTED"; reason = "Excellentes bases Linux et Docker" }
)

foreach ($acc in $targetAcceptances) {
    $exists = $existingAcceptances | Where-Object { $_.internshipId -eq $acc.internshipId -and $_.companyId -eq $acc.companyId }
    if (-not $exists) {
        try {
            $json = $acc | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/acceptances" -Method Post -Body $json -ContentType "application/json"
            Write-Host "  + Candidature enregistrée : Stage #$($acc.internshipId) -> $($acc.status)" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur acceptance: $_" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "  = Candidature existante pour Stage #$($acc.internshipId)" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------
# 6. TÂCHES / LIVRABLES (Task Approvals)
# ------------------------------------------------------------
Write-Host "`n6. Vérification et création des livrables / tâches..." -ForegroundColor Yellow
$existingTasks = @()
try {
    $existingTasks = Invoke-RestMethod -Uri "$baseUrl/task-approvals" -Method Get
} catch {
    Write-Host "Impossible de récupérer les tâches: $_" -ForegroundColor Red
}

$supMainId = if ($supervisorMap["ahmed.mansour@google.com"]) { $supervisorMap["ahmed.mansour@google.com"].id } else { 1 }
$supTechId = if ($supervisorMap["karim.jaziri@techsolutions.tn"]) { $supervisorMap["karim.jaziri@techsolutions.tn"].id } else { 2 }
$supFinId  = if ($supervisorMap["sonia.gharbi@fintech.tn"]) { $supervisorMap["sonia.gharbi@fintech.tn"].id } else { 3 }
$supSmartId= if ($supervisorMap["hela.chahed@smartsystems.tn"]) { $supervisorMap["hela.chahed@smartsystems.tn"].id } else { 5 }

$targetTasks = @(
    @{ internshipId = [long]$intMain.id; supervisorId = [long]$supMainId; taskDescription = "Sprint 1 : Architecture microservices et API Gateway"; status = "PENDING"; comment = "En attente de validation de l encadrant" },
    @{ internshipId = [long]$intMain.id; supervisorId = [long]$supMainId; taskDescription = "Sprint 2 : Implémentation du service d authentification JWT"; status = "PENDING"; comment = "Code soumis sur la branche feature/jwt" },
    @{ internshipId = [long]$intTech.id; supervisorId = [long]$supTechId; taskDescription = "Architecture des brokers MQTT et ingestion des données de capteurs"; status = "APPROVED"; comment = "Architecture robuste et conforme aux spécifications" },
    @{ internshipId = [long]$intFin.id; supervisorId = [long]$supFinId; taskDescription = "Implémentation de l authentification biométrique et cryptographie AES-256"; status = "APPROVED"; comment = "Audit de sécurité passé avec 100% de succès" },
    @{ internshipId = [long]$intSmart.id; supervisorId = [long]$supSmartId; taskDescription = "Pipeline Jenkins CI/CD et déploiement Kubernetes via Helm"; status = "APPROVED"; comment = "Déploiement zéro-downtime validé en staging" }
)

foreach ($task in $targetTasks) {
    $exists = $existingTasks | Where-Object { $_.internshipId -eq $task.internshipId -and $_.taskDescription -eq $task.taskDescription }
    if (-not $exists) {
        try {
            $json = $task | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/task-approvals" -Method Post -Body $json -ContentType "application/json"
            Write-Host "  + Livrable créé : $($created.taskDescription) (ID: $($created.id), Statut: $($created.status))" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur création livrable: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  = Livrable existant : $($task.taskDescription)" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------
# 7. ÉVALUATIONS ACADÉMIQUES (Evaluations)
# ------------------------------------------------------------
Write-Host "`n7. Vérification et création des évaluations académiques..." -ForegroundColor Yellow
$existingEvaluations = @()
try {
    $existingEvaluations = Invoke-RestMethod -Uri "$baseUrl/evaluations" -Method Get
} catch {
    Write-Host "Impossible de récupérer les évaluations: $_" -ForegroundColor Red
}

$targetEvaluations = @(
    # Stage #3 (FinTech Solutions, Mariem Ben Salem) -> COMPLETED
    @{
        internshipId = [long]$intFin.id;
        supervisorId = [long]$supFinId;
        quality = 19;
        punctuality = 18;
        communication = 19;
        appreciation = "Excellente stagiaire, travail rigoureux et autonome sur le module de sécurité financière.";
        remarks = "Projet de grande qualité, intégration parfaite dans l équipe Agile."
    },
    # Stage #5 (Smart Systems, Seif Mejri) -> COMPLETED
    @{
        internshipId = [long]$intSmart.id;
        supervisorId = [long]$supSmartId;
        quality = 16;
        punctuality = 16;
        communication = 16;
        appreciation = "Très bon travail technique sur l automatisation Kubernetes et Terraform.";
        remarks = "Excellente assiduité et respect scrupuleux des délais de livraison."
    }
)

foreach ($eval in $targetEvaluations) {
    $exists = $existingEvaluations | Where-Object { $_.internshipId -eq $eval.internshipId }
    if (-not $exists) {
        try {
            $json = $eval | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "$baseUrl/evaluations" -Method Post -Body $json -ContentType "application/json"
            Write-Host "  + Évaluation créée pour Stage #$($eval.internshipId) (Note calculée : $($created.overallGrade)/20)" -ForegroundColor Green
        } catch {
            Write-Host "  ! Erreur création évaluation: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  = Évaluation existante pour Stage #$($eval.internshipId) (Note: $($exists[0].overallGrade)/20)" -ForegroundColor Gray
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Peuplement terminé avec succès !" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
