const AppError = require("../middlewares/AppError");
const MessageModel = require("../models/message.model");
const ProjectModel = require("../models/project.model");

// SERVICE: DASHBOARD SERVICE
exports.getDashboardService = async (userId) => {
    if (!userId) {
      throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
    }
  
    try {
      const projects = await ProjectModel.find({
        userId,
        deletedAt: null,
      }).lean();
  
      if (!projects.length) {
        return {
          summary: {
            delivered: 0,
            blocked: 0,
            activeProjects: 0,
            range: "No data yet",
          },
          projects: [],
        };
      }
  
      const earliestProjectDate = projects.reduce(
        (earliest, p) =>
          p.createdAt && p.createdAt < earliest ? p.createdAt : earliest,
        new Date()
      );
  
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
      const startDate =
        earliestProjectDate > sevenDaysAgo ? earliestProjectDate : sevenDaysAgo;
  
      const diffDays = Math.max(
        1,
        Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
      );
  
      const projectIds = projects.map((p) => p._id);
  
      const stats = await MessageModel.aggregate([
        {
          $match: {
            projectId: {
              $in: projectIds,
            },
            receivedAt: { $gte: new Date(startDate) },
          },
        },
        {
          $group: {
            _id: {
              projectId: "$projectId",
              handling: "$handling",
              deliveryStatus: "$deliveryStatus",
            },
            count: { $sum: 1 },
          },
        },
      ]);
  
      const statsMap = {};
      let totalDelivered = 0;
      let totalBlocked = 0;
  
      for (const row of stats) {
        const pId = row._id.projectId.toString();
        const handling = row._id.handling;
        const deliveryStatus = row._id.deliveryStatus;
  
        if (!statsMap[pId]) {
          statsMap[pId] = { delivered: 0, blocked: 0 };
        }
  
        const isDelivered =
          handling === "forwarded" && deliveryStatus === "delivered";
        if (isDelivered) {
          statsMap[pId].delivered += row.count;
          totalDelivered += row.count;
        } else {
          statsMap[pId].blocked += row.count;
          totalBlocked += row.count;
        }
      }
  
      const formattedProjects = projects.map((project) => {
        const pId = project._id.toString();
        const counts = statsMap[pId] || { delivered: 0, blocked: 0 };
  
        return {
          id: pId,
          name: project.name,
          status: project.runTimeStatus,
          inputProvider: project.setup?.inputProvider || null,
          destination:
            project.output?.type === "email"
              ? project.output?.config?.email ?? null
              : null,
          delivered: counts.delivered,
          blocked: counts.blocked,
        };
      });
  
      const activeProjects = projects.filter(
        (p) => p.runTimeStatus === "enabled"
      ).length;
  
      const range = `Last ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  
      return {
        summary: {
          delivered: totalDelivered,
          blocked: totalBlocked,
          activeProjects,
          range,
        },
        projects: formattedProjects,
      };
    } catch (err) {
      console.error("Dashboard Service Error:", err);
      if (err instanceof AppError) throw err;
      throw new AppError(
        "Failed to load dashboard data",
        500,
        "DASHBOARD_FETCH_FAILED"
      );
    }
  };
  