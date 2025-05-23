/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { reactive } from 'vue';
import * as Misskey from 'cherrypick-js';
import { v4 as uuid } from 'uuid';
import { apiUrl } from '@@/js/config.js';
import { $i } from '@/i.js';
import { alert } from '@/os.js';
import { i18n } from '@/i18n.js';
import { uploads } from '@/utility/upload.js';

// Maximum size for standard upload (95MB - Cloudflare制限を考慮)
const MAX_STANDARD_UPLOAD_SIZE = 95 * 1024 * 1024;

// PostgreSQLのinteger型の最大値制限に基づく最大ファイルサイズ (2GB)
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

// ファイルサイズに応じた最適なチャンクサイズを計算
function calculateOptimalChunkSize(fileSize: number): number {
	// 小さいファイル (95MB以下): 10MB チャンク
	if (fileSize <= 95 * 1024 * 1024) {
		return 10 * 1024 * 1024;
	} else if (fileSize <= 1024 * 1024 * 1024) {
		// 中サイズファイル (95MB〜1GB): 20MB チャンク
		return 20 * 1024 * 1024;
	} else {
		// 大きいファイル (1GB以上): 50MB チャンク
		return 50 * 1024 * 1024;
	}
}

/**
 * Handles file upload with multipart support for large files
 */
export async function uploadFileMultipart(
	file: File,
	folder?: string | Misskey.entities.DriveFolder | null,
	name?: string,
	sensitive?: boolean,
	force?: boolean,
): Promise<Misskey.entities.DriveFile> {
	if ($i == null) {
		throw new Error('Not logged in');
	}

	// ファイルサイズが制限を超えていないか確認
	if (file.size > MAX_FILE_SIZE) {
		// エラーをalert関数で表示
		await alert({
			type: 'error',
			title: i18n.ts._uploadMultipart.error,
			text: i18n.ts._uploadMultipart.overflow,
		});
		// エラー表示後に例外をスロー
		throw new Error('File too large');
	}

	const _folder = typeof folder === 'string' ? folder : folder?.id;
	const fileName = name ?? file.name ?? 'untitled';

	// If file is smaller than max standard upload size, use regular upload
	if (file.size <= MAX_STANDARD_UPLOAD_SIZE) {
		const formData = new FormData();
		formData.append('i', $i.token);
		formData.append('file', file);
		formData.append('name', fileName);
		if (_folder) {
			formData.append('folderId', _folder);
		}
		if (sensitive) {
			formData.append('isSensitive', 'true');
		}
		if (force) {
			formData.append('force', 'true');
		}

		return window.fetch(`${apiUrl}/drive/files/create`, {
			method: 'POST',
			body: formData,
		}).then(res => res.json());
	}

	// For larger files, use multipart upload
	// Step 1: Initiate multipart upload
	const id = uuid();
	const ctx = reactive({
		id,
		name: fileName,
		progressMax: file.size,
		progressValue: 0,
		img: file.type.startsWith('image/') ? window.URL.createObjectURL(file) : '',
	});

	uploads.value.push(ctx);

	try {
		// ファイルサイズに応じた最適なチャンクサイズを取得
		const chunkSize = calculateOptimalChunkSize(file.size);
		console.log(`File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, Using chunk size: ${(chunkSize / (1024 * 1024)).toFixed(2)}MB`);

		// Calculate total parts based on dynamic chunk size
		const totalParts = Math.ceil(file.size / chunkSize);

		// Step 1: Create multipart upload
		const createMultipartRes = await window.fetch(`${apiUrl}/drive/files/create-multipart-upload`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				i: $i.token,
				name: fileName,
				folderId: _folder,
				isSensitive: sensitive,
				force: force,
				totalSize: file.size,
				totalParts: totalParts,
			}),
		});

		if (!createMultipartRes.ok) {
			const error = await createMultipartRes.json();
			await alert({
				type: 'error',
				title: i18n.ts._uploadMultipart.error,
				text: error.error?.message || i18n.tsx._uploadMultipart.failedToCreateMultipart({ status: createMultipartRes.status, statusText: createMultipartRes.statusText }),
			});
			throw new Error('Failed to create multipart upload');
		}

		const { id: uploadId } = await createMultipartRes.json();

		// Step 2: Upload parts with dynamic queue
		let completedSize = 0;

		// Maximum number of concurrent uploads
		const MAX_CONCURRENT_UPLOADS = 5;
		const results: { partNumber: number }[] = [];

		// Create a queue of all parts that need to be uploaded
		const partQueue: number[] = [];
		for (let i = 1; i <= totalParts; i++) {
			partQueue.push(i);
		}

		// Process the queue with controlled concurrency
		const processQueue = async () => {
			const workers: Promise<void>[] = [];
			// アップロード失敗時のグローバルカウント
			let globalRetryCount = 0;
			const MAX_GLOBAL_RETRIES = 10;
			let isAborting = false;
			// 429レート制限エラーを検出したかどうか
			let isRateLimited = false;

			const processNext = async (): Promise<void> => {
				// レート制限発生時または処理中止中は何も処理しない
				if (isRateLimited || isAborting) {
					return;
				}

				// Get next part from queue
				const partNumber = partQueue.shift();
				if (partNumber === undefined) return;

				// Upload the part
				const start = (partNumber - 1) * chunkSize;
				const end = Math.min(partNumber * chunkSize, file.size);
				const chunk = file.slice(start, end);

				try {
					await uploadPart(uploadId, partNumber, chunk);
					completedSize += chunk.size;
					ctx.progressValue = completedSize;
					results.push({ partNumber });
				} catch (err) {
					// レート制限エラー(429)が発生した場合
					if (err instanceof RateLimitExceededError) {
						console.error('Rate limit exceeded, aborting upload:', err.message);
						isRateLimited = true;
						isAborting = true;
						await alert({
							type: 'error',
							title: i18n.ts._uploadMultipart.error,
							text: i18n.ts._uploadMultipart.rateLimitError,
						});
						throw new Error('Rate limit exceeded');
					}

					// Re-add failed part to the beginning of the queue for retry
					partQueue.unshift(partNumber);

					// エラーの重大度を評価
					// グローバルリトライ回数を超えた場合はアップロードを中止
					globalRetryCount++;
					if (globalRetryCount > MAX_GLOBAL_RETRIES) {
						isAborting = true;
						console.error(`Too many global retries (${globalRetryCount}), aborting multipart upload.`);
						await alert({
							type: 'error',
							title: i18n.ts._uploadMultipart.error,
							text: i18n.tsx._uploadMultipart.tooManyRetries({ retries: MAX_GLOBAL_RETRIES }),
						});
						throw new Error('Too many retries');
					}

					console.error(`Error uploading part ${partNumber}:`, err);

					// 少し待ってから次の処理を試行（制御フローの混雑を緩和）
					await new Promise(resolve => window.setTimeout(resolve, 500));
				}

				// Process next part if any remain and not aborting
				if (partQueue.length > 0) {
					return processNext();
				}
			};

			// Start workers
			for (let i = 0; i < Math.min(MAX_CONCURRENT_UPLOADS, totalParts); i++) {
				workers.push(processNext());
			}

			// Wait for all workers to complete
			await Promise.all(workers);
		};

		// Start processing the queue
		await processQueue();

		// Step 3: Complete multipart upload
		const completeMultipartRes = await window.fetch(`${apiUrl}/drive/files/complete-multipart-upload`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				i: $i.token,
				id: uploadId,
			}),
		});

		if (!completeMultipartRes.ok) {
			const error = await completeMultipartRes.json();
			await alert({
				type: 'error',
				title: i18n.ts._uploadMultipart.error,
				text: error.error?.message || i18n.tsx._uploadMultipart.failedToCreateMultipart({ status: completeMultipartRes.status, statusText: completeMultipartRes.statusText }),
			});
			throw new Error('Failed to complete multipart upload');
		}

		const driveFile = await completeMultipartRes.json();
		uploads.value = uploads.value.filter(x => x.id !== id);

		return driveFile;
	} catch (err) {
		uploads.value = uploads.value.filter(x => x.id !== id);
		console.error('Multipart upload failed:', err);

		await alert({
			type: 'error',
			title: i18n.ts._uploadMultipart.error,
			text: err instanceof Error ? err.message : 'undefined',
		});

		throw err;
	}
}

/**
 * レート制限エラーを表現する特別なエラークラス
 */
class RateLimitExceededError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RateLimitExceededError';
	}
}

/**
 * Uploads a single part/chunk of a multipart upload
 */
async function uploadPart(uploadId: string, partNumber: number, chunk: Blob): Promise<void> {
	if ($i == null) {
		throw new Error('Not logged in');
	}

	// リトライとバックオフの設定
	const MAX_RETRIES = 5;
	const INITIAL_RETRY_DELAY = 1000;

	let retryCount = 0;
	let retryDelay = INITIAL_RETRY_DELAY;

	// 無限ループを避けるために、最大リトライ回数まで試行
	while (retryCount <= MAX_RETRIES) {
		try {
			const formData = new FormData();
			formData.append('i', $i.token);
			formData.append('id', uploadId);
			formData.append('partNumber', partNumber.toString());
			formData.append('file', chunk);

			const response = await window.fetch(`${apiUrl}/drive/files/upload-multipart-part`, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const responseStatus = response.status;
				let errorMessage: string;

				try {
					const error = await response.json();
					errorMessage = error.error?.message || `HTTP ${responseStatus}`;
				} catch (err) {
					errorMessage = `Failed to parse error response: ${err}`;
				}

				// 429エラー（レート制限超過）の場合は特別なエラーをスロー
				if (responseStatus === 429) {
					throw new RateLimitExceededError(`レート制限を超過しました（パート ${partNumber}）: ${errorMessage}`);
				}

				// その他のエラー
				throw new Error(`Failed to upload part ${partNumber}: ${errorMessage}. Status: ${responseStatus}`);
			}

			// 成功したら終了
			return;
		} catch (err) {
			// 最大リトライ回数に達した場合はエラーを投げる
			if (retryCount >= MAX_RETRIES) {
				console.error(`Upload part ${partNumber} failed after ${MAX_RETRIES} attempts:`, err);
				throw err;
			}

			// 予期せぬエラー（ネットワーク切断など）の場合もリトライ
			retryCount++;
			console.warn(`Error uploading part ${partNumber}, retry attempt ${retryCount}/${MAX_RETRIES} after ${retryDelay}ms:`, err);
			await new Promise(resolve => window.setTimeout(resolve, retryDelay));
			retryDelay = Math.min(retryDelay * 2, 30000);
		}
	}

	// すべてのリトライが失敗した場合
	throw new Error(`Upload part ${partNumber} failed after exhausting all retries`);
}

/**
 * Detects if the browser can support multipart uploads
 */
export function canUseMultipartUpload(): boolean {
	// Check for necessary APIs: Fetch, Blob.slice, etc.
	return typeof Blob !== 'undefined' &&
		typeof Blob.prototype.slice !== 'undefined' &&
		typeof window.fetch !== 'undefined' &&
		typeof FormData !== 'undefined';
}
