import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Project: "Project";
    readonly Conversation: "Conversation";
    readonly Message: "Message";
    readonly Attachment: "Attachment";
    readonly UserWorkProfile: "UserWorkProfile";
    readonly Session: "Session";
    readonly PasswordReset: "PasswordReset";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly passwordHash: "passwordHash";
    readonly avatar: "avatar";
    readonly isVerified: "isVerified";
    readonly lastLoginAt: "lastLoginAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const ProjectScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly name: "name";
    readonly description: "description";
    readonly color: "color";
    readonly icon: "icon";
    readonly isArchived: "isArchived";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum];
export declare const ConversationScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly projectId: "projectId";
    readonly title: "title";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConversationScalarFieldEnum = (typeof ConversationScalarFieldEnum)[keyof typeof ConversationScalarFieldEnum];
export declare const MessageScalarFieldEnum: {
    readonly id: "id";
    readonly conversationId: "conversationId";
    readonly role: "role";
    readonly content: "content";
    readonly createdAt: "createdAt";
};
export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum];
export declare const AttachmentScalarFieldEnum: {
    readonly id: "id";
    readonly messageId: "messageId";
    readonly fileName: "fileName";
    readonly mimeType: "mimeType";
    readonly fileSize: "fileSize";
    readonly storagePath: "storagePath";
    readonly createdAt: "createdAt";
};
export type AttachmentScalarFieldEnum = (typeof AttachmentScalarFieldEnum)[keyof typeof AttachmentScalarFieldEnum];
export declare const UserWorkProfileScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly workCategory: "workCategory";
    readonly customInput: "customInput";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserWorkProfileScalarFieldEnum = (typeof UserWorkProfileScalarFieldEnum)[keyof typeof UserWorkProfileScalarFieldEnum];
export declare const SessionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly refreshTokenHash: "refreshTokenHash";
    readonly expiresAt: "expiresAt";
    readonly device: "device";
    readonly ipAddress: "ipAddress";
    readonly location: "location";
    readonly lastActiveAt: "lastActiveAt";
    readonly createdAt: "createdAt";
};
export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum];
export declare const PasswordResetScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly otpHash: "otpHash";
    readonly expiresAt: "expiresAt";
    readonly attempts: "attempts";
    readonly used: "used";
    readonly createdAt: "createdAt";
};
export type PasswordResetScalarFieldEnum = (typeof PasswordResetScalarFieldEnum)[keyof typeof PasswordResetScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
