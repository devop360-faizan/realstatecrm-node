const prisma = require("../config/db.config");

class AdminSettingsService {
  /**
   * Get System Settings with all API Keys & Configs
   */
  async getSystemSettings() {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "default-settings" },
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "default-settings",
          trialLengthDays: 14,
          defaultPlanName: "Starter",
          dataRegion: "eu-north-1",
          uploadCapMB: 25,
          s3Enabled: true,
          awsAccessKeyId: "",
          awsSecretAccessKey: "",
          awsRegion: "eu-north-1",
          awsBucket: "freehold-crm-storage",

          stripeEnabled: true,
          stripePublicKey: "",
          stripeSecretKey: "",
          stripeWebhookSecret: "",

          sesEnabled: true,
          sesAccessKeyId: "",
          sesSecretAccessKey: "",
          sesRegion: "eu-north-1",
          sesSenderEmail: "no-reply@freehold.app",

          isMaintenanceMode: false,
        },
      });
    }

    const [totalAgencies, totalUsers] = await Promise.all([
      prisma.agency.count(),
      prisma.user.count(),
    ]);

    return {
      defaults: {
        trialLengthDays: settings.trialLengthDays,
        defaultPlanName: settings.defaultPlanName,
        dataRegion: settings.dataRegion,
        uploadCapMB: settings.uploadCapMB,
      },
      integrations: {
        s3: {
          enabled: settings.s3Enabled,
          accessKeyId: settings.awsAccessKeyId || "",
          secretAccessKey: settings.awsSecretAccessKey || "",
          region: settings.awsRegion || "eu-north-1",
          bucket: settings.awsBucket || "freehold-crm-storage",
        },
        stripe: {
          enabled: settings.stripeEnabled,
          publicKey: settings.stripePublicKey || "",
          secretKey: settings.stripeSecretKey || "",
          webhookSecret: settings.stripeWebhookSecret || "",
        },
        ses: {
          enabled: settings.sesEnabled,
          accessKeyId: settings.sesAccessKeyId || "",
          secretAccessKey: settings.sesSecretAccessKey || "",
          region: settings.sesRegion || "eu-north-1",
          senderEmail: settings.sesSenderEmail || "no-reply@freehold.app",
        },
      },
      platformHealth: {
        apiUptime30Days: "99.98%",
        medianResponseMs: "118 ms",
        queueDepthJobs: 14,
        failedJobs24h: 0,
        storageUsedTB: "1.42 TB",
        activeAgenciesCount: totalAgencies,
        registeredUsersCount: totalUsers,
      },
      maintenance: {
        isMaintenanceMode: settings.isMaintenanceMode,
        notice: "Maintenance mode shows a notice to every agency and blocks writes. Use it for migrations only.",
      },
      updatedAt: settings.updatedAt,
    };
  }

  /**
   * Update System Settings & API Keys
   */
  async updateSystemSettings(data) {
    const {
      trialLengthDays,
      defaultPlanName,
      dataRegion,
      uploadCapMB,

      // S3
      s3Enabled,
      awsAccessKeyId,
      awsSecretAccessKey,
      awsRegion,
      awsBucket,

      // Stripe
      stripeEnabled,
      stripePublicKey,
      stripeSecretKey,
      stripeWebhookSecret,

      // SES
      sesEnabled,
      sesAccessKeyId,
      sesSecretAccessKey,
      sesRegion,
      sesSenderEmail,

      isMaintenanceMode,
    } = data;

    const updateData = {};

    if (trialLengthDays !== undefined) updateData.trialLengthDays = Number(trialLengthDays);
    if (defaultPlanName !== undefined) updateData.defaultPlanName = defaultPlanName;
    if (dataRegion !== undefined) updateData.dataRegion = dataRegion;
    if (uploadCapMB !== undefined) updateData.uploadCapMB = Number(uploadCapMB);

    // S3
    if (s3Enabled !== undefined) updateData.s3Enabled = Boolean(s3Enabled);
    if (awsAccessKeyId !== undefined) updateData.awsAccessKeyId = awsAccessKeyId;
    if (awsSecretAccessKey !== undefined) updateData.awsSecretAccessKey = awsSecretAccessKey;
    if (awsRegion !== undefined) updateData.awsRegion = awsRegion;
    if (awsBucket !== undefined) updateData.awsBucket = awsBucket;

    // Stripe
    if (stripeEnabled !== undefined) updateData.stripeEnabled = Boolean(stripeEnabled);
    if (stripePublicKey !== undefined) updateData.stripePublicKey = stripePublicKey;
    if (stripeSecretKey !== undefined) updateData.stripeSecretKey = stripeSecretKey;
    if (stripeWebhookSecret !== undefined) updateData.stripeWebhookSecret = stripeWebhookSecret;

    // SES
    if (sesEnabled !== undefined) updateData.sesEnabled = Boolean(sesEnabled);
    if (sesAccessKeyId !== undefined) updateData.sesAccessKeyId = sesAccessKeyId;
    if (sesSecretAccessKey !== undefined) updateData.sesSecretAccessKey = sesSecretAccessKey;
    if (sesRegion !== undefined) updateData.sesRegion = sesRegion;
    if (sesSenderEmail !== undefined) updateData.sesSenderEmail = sesSenderEmail;

    if (isMaintenanceMode !== undefined) updateData.isMaintenanceMode = Boolean(isMaintenanceMode);

    const updated = await prisma.systemSetting.upsert({
      where: { id: "default-settings" },
      update: updateData,
      create: {
        id: "default-settings",
        ...updateData,
      },
    });

    return updated;
  }

  /**
   * Toggle Maintenance Mode
   */
  async toggleMaintenanceMode() {
    const current = await this.getSystemSettings();
    const newMode = !current.maintenance.isMaintenanceMode;

    const updated = await prisma.systemSetting.update({
      where: { id: "default-settings" },
      data: { isMaintenanceMode: newMode },
    });

    return {
      isMaintenanceMode: updated.isMaintenanceMode,
      message: updated.isMaintenanceMode
        ? "Maintenance mode ENABLED. Platform writes blocked for agencies."
        : "Maintenance mode DISABLED. Platform fully operational.",
    };
  }
}

module.exports = new AdminSettingsService();
