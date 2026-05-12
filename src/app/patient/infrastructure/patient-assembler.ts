import { Patient, PatientStatusEnum } from '../domain/model/patient.entity';
import { PatientResponse } from './patient-response';
import { RegisterPatientCommand } from '../domain/model/register-patient.command';
import { RegisterPatientRequest } from './register-patient.request';

export class PatientAssembler {
  static toEntity(response: PatientResponse): Patient {
    return new Patient(
      response.id, response.code, response.firstName, response.lastName,
      response.documentNumber, new Date(response.dateOfBirth), response.gender,
      response.phone, response.email, response.status as PatientStatusEnum, response.roomNumber,
    );
  }

  static toEntityList(responses: PatientResponse[]): Patient[] {
    return responses.map(r => PatientAssembler.toEntity(r));
  }

  static toRequest(command: RegisterPatientCommand): RegisterPatientRequest {
    return {
      firstName: command.firstName, lastName: command.lastName,
      documentNumber: command.documentNumber, dateOfBirth: command.dateOfBirth.toISOString(),
      gender: command.gender, phone: command.phone, email: command.email, roomNumber: command.roomNumber,
    };
  }
}
