import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ClinicalEventResponse } from "./clinical-event-response";

interface AuditLogResponse {
  id: string | number;
  patientId?: string | number | null;
  entityType: string;
  entityId: string;
  actionType: string;
  performedBy: string;
  performedAt: string;
  metadata?: string | Record<string, unknown> | null;
}

interface AuditLogPageResponse {
  content: AuditLogResponse[];
}

@Injectable({ providedIn: "root" })
export class ClinicalEventApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClinicalEventResponse[]> {
    return this.http
      .get<
        AuditLogPageResponse | AuditLogResponse[]
      >(`${this.baseUrl}?page=0&size=100`)
      .pipe(
        map((response) =>
          Array.isArray(response) ? response : response.content,
        ),
        map((logs) =>
          logs
            .filter((log) => log.entityType === "CLINICAL_EVENT")
            .map((log) => this.toClinicalEventResponse(log)),
        ),
      );
  }

  getByPatientId(id: string): Observable<ClinicalEventResponse[]> {
    return this.getAll().pipe(
      map((events) => events.filter((event) => event.patientId === id)),
    );
  }

  register(req: ClinicalEventResponse): Observable<ClinicalEventResponse> {
    const body = {
      patientId: Number(req.patientId),
      entityType: "CLINICAL_EVENT",
      entityId: req.id,
      actionType: "CLINICAL_NOTE_ADDED",
      performedBy: req.nurseName,
      performedAt: req.occurredAt,
      metadata: {
        patientName: req.patientName,
        nurseName: req.nurseName,
        eventType: req.eventType,
        severity: req.severity,
        title: req.title,
        description: req.description,
      },
    };

    return this.http
      .post<AuditLogResponse>(this.baseUrl, body)
      .pipe(map((log) => this.toClinicalEventResponse(log)));
  }

  private toClinicalEventResponse(
    log: AuditLogResponse,
  ): ClinicalEventResponse {
    const metadata = this.parseMetadata(log.metadata);

    return {
      id: String(log.entityId ?? log.id),
      patientId: log.patientId == null ? "0" : String(log.patientId),
      patientName: String(
        metadata["patientName"] ?? `Paciente #${log.patientId ?? "-"}`,
      ),
      nurseId: log.performedBy,
      nurseName: String(metadata["nurseName"] ?? log.performedBy),
      eventType: String(metadata["eventType"] ?? "Observación"),
      severity: String(metadata["severity"] ?? "Bajo"),
      title: String(metadata["title"] ?? "Evento clínico"),
      description: String(
        metadata["description"] ?? `${log.actionType} registrado en auditoría.`,
      ),
      occurredAt: log.performedAt,
    };
  }

  private parseMetadata(
    metadata?: string | Record<string, unknown> | null,
  ): Record<string, unknown> {
    if (!metadata) return {};
    if (typeof metadata === "object") return metadata;

    try {
      return JSON.parse(metadata);
    } catch {
      return { description: metadata };
    }
  }
}
