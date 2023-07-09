import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromIni, fromSSO } from '@aws-sdk/credential-providers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type AwsCredentialIdentityProvider = ReturnType<typeof fromIni>;

/**
 * Áp dụng strategy pattern vào các cách
 * cung cấp credential (thông tin xác thực)
 * cho API client của AWS S3 (để upload ảnh).
 */

interface AwsCredsProvider {
  getCreds(): AwsCredentialIdentityProvider;
}

/**
 * Strategy cung cấp credential từ file INI.
 */
class AwsIniCreds implements AwsCredsProvider {
  getCreds() {
    return fromIni();
  }
}

/**
 * Strategy cung cấp credential từ SSO
 * (Tiện ích single sign-on của AWS để dùng chế độ development)
 */
class AwsSsoCreds implements AwsCredsProvider {
  getCreds() {
    return fromSSO();
  }
}

class ImageService {
  s3Client: S3Client;

  constructor(credsProvider: AwsCredsProvider) {
    this.s3Client = new S3Client({ credentials: credsProvider.getCreds() });
  }

  async getProfileImageUploadUrl(userId: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `'public/userProfileImages/${userId}.webp`,
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}

// Tùy vào app đang chạy ở chế độ production hay development mà
// chọn strategy cung cấp credential khác nhau
const awsCredsProvider =
  process.env.NODE_ENV === 'production' ? new AwsIniCreds() : new AwsSsoCreds();

export const imageService = new ImageService(awsCredsProvider);
