export enum VerificationMethod {
  SMS = "SMS",
  AUTHENTICATOR_APP = "AUTHENTICATOR_APP",
  RECOVERY_CODE = "RECOVERY_CODE",
  EMAIL_MAGIC_LINK = "EMAIL_MAGIC_LINK",
  EMAIL_OTP = "EMAIL_OTP",
  SECURITY_KEY = "SECURITY_KEY",
  PASSKEY = "PASSKEY",
  PUSH = "PUSH",
  IPROOV = "IPROOV",
  VERIFF = "VERIFF",
  IDVERSE = "IDVERSE",
}

type BaseAuthenticator = {
  userAuthenticatorId: string;
  createdAt: string;
  verifiedAt?: string;
  lastVerifiedAt?: string;
  isDefault: boolean;
};

export type AuthenticatorAppAuthenticator = BaseAuthenticator & {
  verificationMethod: VerificationMethod.AUTHENTICATOR_APP;
};

export enum OobChannel {
  SMS = "SMS",
  EMAIL_MAGIC_LINK = "EMAIL_MAGIC_LINK",
  EMAIL_OTP = "EMAIL_OTP",
}

export enum SmsChannel {
  DEFAULT = "DEFAULT",
  WHATSAPP = "WHATSAPP",
}

export type SmsAuthenticator = BaseAuthenticator & {
  oobChannel: OobChannel.SMS;
  previousSmsChannel: SmsChannel;
  verificationMethod: VerificationMethod.SMS;
  phoneNumber: string;
};

export type EmailMagicLinkAuthenticator = BaseAuthenticator & {
  oobChannel: OobChannel.EMAIL_MAGIC_LINK;
  verificationMethod: VerificationMethod.EMAIL_MAGIC_LINK;
  email: string;
};

export type EmailOtpAuthenticator = BaseAuthenticator & {
  oobChannel: OobChannel.EMAIL_OTP;
  verificationMethod: VerificationMethod.EMAIL_OTP;
  email: string;
};

type Device = {
  name: string;
  verifiedAt: string;
  deviceId: string;
  credentialId: string;
  credentialBackedUp?: boolean;
  credentialDeviceType?: "singleDevice" | "multiDevice";
  aaguidMapping?: {
    name: string;
    svgIconLight?: string;
    svgIconDark?: string;
  };
};

export type SecurityKeyAuthenticator = BaseAuthenticator & {
  verificationMethod: VerificationMethod.SECURITY_KEY;
  devices: Device[];
};

export type PasskeyAuthenticator = BaseAuthenticator & {
  verificationMethod: VerificationMethod.PASSKEY;
  webauthnCredential: Device;
};

export type PushAuthenticator = BaseAuthenticator & {
  verificationMethod: VerificationMethod.PUSH;
  deviceName: string;
  lastVerifiedAt: string;
};

export type IProovAuthenticator = BaseAuthenticator & {
  verificationMethod: VerificationMethod.IPROOV;
};

export type VeriffAuthenticator = BaseAuthenticator & {
  verificationMethod: VerificationMethod.VERIFF;
};

export type Authenticator =
  | AuthenticatorAppAuthenticator
  | SmsAuthenticator
  | EmailMagicLinkAuthenticator
  | EmailOtpAuthenticator
  | SecurityKeyAuthenticator
  | PushAuthenticator
  | IProovAuthenticator
  | VeriffAuthenticator
  | PasskeyAuthenticator;
