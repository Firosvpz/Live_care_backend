export interface IComplaint {
    userId: string;
    subject: string;
    message: string;
    response?: string;
    isResolved: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  