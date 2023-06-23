import { prismaClient } from './api-clients';

type PrismaTransactionFunc = typeof prismaClient.$transaction;
type PrismaTransaction = Parameters<PrismaTransactionFunc>[0];
export type PrismaTxClient = Parameters<PrismaTransaction>[0];
