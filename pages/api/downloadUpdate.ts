import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { VersionService } from '../../utils/services';

/**
 * API endpoint to get DNS configurations.
 * Requires admin privileges.
 * @param _req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function downloadUpdate(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const versionService = VersionService.getInstance();
    // await versionService.downloadNewVersion();
    // // Wait before backing up;
    // await new Promise(r => setTimeout(r, 1000));
    // await versionService.createBackup();
    await versionService.installUpdate();
    res.status(200).end();
    // Restart the application after sending the OK response
    versionService.restart();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default apiRequireAdmin(downloadUpdate);

export const config = {
  api: {
    externalResolver: true
  }
};
