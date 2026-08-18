/* ====================================================================
   试用期员工学习管理系统 — 后端服务器
   提供 API + 实时同步(SSE) + 静态文件托管
==================================================================== */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const webpush = require("web-push");

const PORT = process.env.PORT || 3456;
const DATA_FILE = path.join(__dirname, "data.json");

/* ===== Web Push 配置 ===== */

const VAPID_PUBLIC_KEY = "BLpT0y0T2V88v9TZPxrP4GQL5VE2bFcAR7DhFBW3T2vctHF_7LnriJ656hbNiGcbVmfMTw0ZJC97UdJAd8oOF60";
const VAPID_PRIVATE_KEY = "03NRaAlFzcJPjy6M6Y0hAvqu3PHG6QR-lLGCfN4mVOk";

webpush.setVapidDetails(
  "mailto:hr@kukahome.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/* ===== 样本数据（与前端一致）===== */

const LEARNING_PLAN = [
  { day: 1,  title: "公司简介与发展历程", category: "企业文化", duration: 60, content: "了解顾家家居自2003年创立以来的发展历程、上市历程、全球化布局，理解企业愿景与使命。", points: ["顾家家居发展大事记与里程碑", "企业愿景、使命、价值观", "全球化战略与市场布局"] },
  { day: 2,  title: "企业文化与核心价值观", category: "企业文化", duration: 60, content: "深入学习顾家家居\"因爱而生\"的品牌理念，理解企业精神与行为准则，树立正确的职业态度。", points: ["品牌理念与企业文化体系", "员工行为准则与职业素养", "企业社会责任实践"] },
  { day: 3,  title: "组织架构与部门职能", category: "企业文化", duration: 45, content: "熟悉公司整体组织架构，了解各中心/部门的职能定位与协作关系，明确自身岗位在组织中的位置。", points: ["公司组织架构图与汇报关系", "各中心/部门职能说明", "跨部门协作流程"] },
  { day: 4,  title: "产品体系总览 — 沙发品类", category: "产品知识", duration: 90, content: "系统学习顾家沙发产品线，包括功能沙发、布艺沙发、真皮沙发等系列，了解材质工艺与价格区间。", points: ["沙发产品系列与定位", "材质工艺（真皮/布艺/科技布）", "价格体系与目标客群"] },
  { day: 5,  title: "产品体系总览 — 软床与床垫", category: "产品知识", duration: 90, content: "学习顾家软床及床垫产品线，了解人体工学设计、材质特点及核心卖点。", points: ["软床产品系列与风格", "床垫材质与人体工学设计", "核心卖点与竞品对比"] },
  { day: 6,  title: "产品体系总览 — 全屋定制", category: "产品知识", duration: 90, content: "了解顾家全屋定制业务模式，学习定制衣柜、橱柜等产品体系及设计流程。", points: ["全屋定制业务模式", "定制产品体系与工艺", "设计流程与交付周期"] },
  { day: 7,  title: "门店运营基础流程", category: "门店运营", duration: 60, content: "学习门店日常运营标准流程，包括开店准备、客户接待、门店陈列维护等。", points: ["门店日常运营SOP", "门店陈列标准与维护", "开店/闭店流程"] },
  { day: 8,  title: "客户服务与沟通技巧", category: "门店运营", duration: 60, content: "掌握客户接待礼仪与沟通话术，学习需求挖掘与客户关系维护技巧。", points: ["客户接待礼仪与话术", "需求挖掘技巧（FABE法则）", "客户关系维护与回访"] },
  { day: 9,  title: "销售流程与成交技巧", category: "门店运营", duration: 90, content: "学习完整销售流程，从获客到成交的全链路技巧，掌握异议处理与促单方法。", points: ["销售漏斗与转化管理", "异议处理技巧", "促单与成交话术"] },
  { day: 10, title: "数字化工具使用培训", category: "系统操作", duration: 75, content: "学习公司内部系统操作，包括ERP、CRM、OA系统的基本功能与日常使用。", points: ["ERP系统基础操作", "CRM客户管理流程", "OA审批与协同"] },
  { day: 11, title: "订单管理与交付流程", category: "系统操作", duration: 60, content: "了解从下单到交付的完整流程，掌握订单系统操作及异常处理。", points: ["订单录入与审核流程", "生产排期与物流配送", "交付异常处理机制"] },
  { day: 12, title: "售后服务与客诉处理", category: "门店运营", duration: 60, content: "学习售后服务标准与客诉处理流程，提升客户满意度与复购率。", points: ["售后服务标准与响应时效", "客诉分级处理流程", "客户满意度提升策略"] },
  { day: 13, title: "竞品分析与市场洞察", category: "市场分析", duration: 75, content: "分析主要竞争对手的产品、价格、渠道策略，了解家居行业市场趋势。", points: ["主要竞品对比分析", "家居行业市场趋势", "顾家差异化竞争优势"] },
  { day: 14, title: "门店数据分析基础", category: "市场分析", duration: 60, content: "学习门店关键经营指标（进店率、转化率、客单价、连带率）及数据驱动决策方法。", points: ["核心经营指标解读", "数据看板使用方法", "数据驱动改善案例"] },
  { day: 15, title: "阶段性考核 — 前两周复盘", category: "考核评估", duration: 90, content: "对前两周学习内容进行系统复盘，完成阶段性测试，查漏补缺。", points: ["知识体系梳理与复盘", "阶段性在线测试", "薄弱点分析与改进计划"] },
  { day: 16, title: "产品搭配与全屋方案设计", category: "产品知识", duration: 90, content: "学习不同风格的全屋产品搭配方案，掌握方案设计与呈现技巧。", points: ["主流家装风格与搭配", "全屋方案设计方法", "方案呈现与讲解技巧"] },
  { day: 17, title: "促销活动与营销执行", category: "门店运营", duration: 60, content: "了解门店促销活动类型与执行流程，学习活动方案策划与落地。", points: ["促销活动类型与节奏", "活动方案策划要点", "活动执行与复盘"] },
  { day: 18, title: "VIP客户管理与服务", category: "门店运营", duration: 60, content: "学习VIP客户分级管理体系，掌握高价值客户的维护与深度开发技巧。", points: ["VIP客户分级标准", "专属服务权益设计", "高价值客户深度开发"] },
  { day: 19, title: "团队协作与门店会议", category: "综合素养", duration: 45, content: "学习门店团队协作机制，了解日常会议、周会、月度复盘的流程与要点。", points: ["门店团队角色分工", "日常会议流程与要点", "团队目标对齐方法"] },
  { day: 20, title: "职业发展规划与晋升路径", category: "综合素养", duration: 45, content: "了解顾家家居员工职业发展通道与晋升机制，制定个人成长计划。", points: ["双通道职业发展体系", "晋升标准与评估流程", "个人发展计划(IDP)制定"] },
  { day: 21, title: "门店实操 — 客户接待模拟", category: "实操演练", duration: 120, content: "在带教老师指导下进行客户接待模拟演练，覆盖接待、需求挖掘、方案推荐全流程。", points: ["接待礼仪实战演练", "需求挖掘话术实操", "带教老师点评与反馈"] },
  { day: 22, title: "门店实操 — 产品讲解演练", category: "实操演练", duration: 120, content: "针对核心产品线进行讲解演练，掌握产品卖点提炼与客户化表达。", points: ["核心产品卖点提炼", "客户化讲解话术", "竞品对比话术演练"] },
  { day: 23, title: "门店实操 — 异议处理与促单", category: "实操演练", duration: 120, content: "模拟客户异议场景，练习异议处理与促单技巧，提升成交能力。", points: ["常见异议类型与应对", "促单时机把握", "成交话术实战"] },
  { day: 24, title: "门店实操 — 订单录入与交付", category: "实操演练", duration: 90, content: "实操订单录入系统，了解交付全流程节点，模拟异常处理。", points: ["ERP订单录入实操", "交付流程节点管理", "异常订单处理模拟"] },
  { day: 25, title: "门店实操 — 独立接待考核", category: "实操演练", duration: 180, content: "在带教老师观察下独立完成客户接待全流程，作为转正考核的重要参考。", points: ["独立接待真实客户", "全流程能力综合评估", "带教老师评分与反馈"] },
  { day: 26, title: "客户回访与关系维护", category: "门店运营", duration: 60, content: "学习客户回访标准流程与话术，实操老客户回访并记录反馈。", points: ["回访标准与话术", "客户反馈记录与分析", "复购与转介绍引导"] },
  { day: 27, title: "门店经营数据分析实操", category: "市场分析", duration: 75, content: "基于门店真实数据，分析经营状况并提出改善建议。", points: ["门店数据看板实操", "经营问题诊断", "改善建议撰写"] },
  { day: 28, title: "试用期总结撰写", category: "考核评估", duration: 90, content: "系统梳理试用期学习成果与工作表现，撰写试用期总结报告。", points: ["学习成果回顾与梳理", "工作表现自评", "不足与改进方向"] },
  { day: 29, title: "转正答辩准备", category: "考核评估", duration: 90, content: "准备转正答辩PPT，梳理亮点与成长，进行模拟答辩。", points: ["答辩PPT结构与要点", "个人亮点与案例梳理", "模拟答辩与带教反馈"] },
  { day: 30, title: "转正答辩与评估", category: "考核评估", duration: 120, content: "进行正式转正答辩，由带教老师、店长、HR共同评估，确定转正结果。", points: ["正式转正答辩", "多维评估打分", "转正结果沟通与反馈"] },
];

const SAMPLE_USERS = [
  { id: "u1", name: "陈思雨", role: "employee", dept: "门店运营中心", position: "导购员", mentorId: "u4", joinDate: "2026-07-15", avatarColor: "#2563eb" },
  { id: "u2", name: "王浩然", role: "employee", dept: "门店运营中心", position: "导购员", mentorId: "u4", joinDate: "2026-07-15", avatarColor: "#0891b2" },
  { id: "u3", name: "林晓彤", role: "employee", dept: "全屋定制中心", position: "设计顾问", mentorId: "u5", joinDate: "2026-07-20", avatarColor: "#7c3aed" },
  { id: "u4", name: "赵明辉", role: "mentor",   dept: "门店运营中心", position: "资深店长", avatarColor: "#16a34a" },
  { id: "u5", name: "刘佳琪", role: "mentor",   dept: "全屋定制中心", position: "设计主管", avatarColor: "#d97706" },
  { id: "u6", name: "HR管理员", role: "hr",      dept: "人力资源中心", position: "HRBP", avatarColor: "#dc2626" },
];

function initSampleData() {
  const today = new Date();
  const records = [];

  SAMPLE_USERS.filter(u => u.role === "employee").forEach(emp => {
    const joinDate = new Date(emp.joinDate);
    const daysSinceJoin = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24)) + 1;
    const trialDays = 30;
    const completedDays = Math.min(daysSinceJoin, trialDays);

    for (let d = 1; d <= completedDays; d++) {
      const recordDate = new Date(joinDate);
      recordDate.setDate(recordDate.getDate() + d - 1);
      const plan = LEARNING_PLAN[d - 1];

      let status, actualDuration, summary, reviewedBy, reviewedAt, reviewComment;

      if (d < completedDays - 1) {
        status = Math.random() > 0.1 ? "approved" : "rejected";
        actualDuration = plan.duration + Math.floor(Math.random() * 30) - 10;
        summary = `今日学习了${plan.title}，重点掌握了${plan.points[0]}。通过学习，我对${plan.category}有了更深入的理解，后续将在实际工作中应用所学知识。`;
        reviewedBy = emp.mentorId;
        reviewedAt = new Date(recordDate.getTime() + 86400000).toISOString();
        reviewComment = status === "approved" ? "总结认真，理解到位，继续加油！" : "总结不够具体，请补充实际案例。";
      } else if (d < completedDays) {
        status = "submitted";
        actualDuration = plan.duration + Math.floor(Math.random() * 20);
        summary = `今天学习了${plan.title}，内容包括${plan.content.substring(0, 40)}...通过学习掌握了核心知识点，对日常工作有帮助。`;
      } else if (d === completedDays) {
        status = "pending";
        actualDuration = 0;
        summary = "";
      }

      if (d <= completedDays) {
        records.push({
          id: `lr_${emp.id}_${d}`,
          employeeId: emp.id,
          day: d,
          date: recordDate.toISOString().split("T")[0],
          status: status,
          actualDuration: actualDuration,
          requiredDuration: plan.duration,
          summary: summary,
          submittedAt: status === "submitted" || status === "approved" || status === "rejected" ? recordDate.toISOString() : null,
          reviewedBy: reviewedBy,
          reviewedAt: reviewedAt,
          reviewComment: reviewComment || "",
        });
      }
    }
  });

  // 为每个用户生成固定登录令牌（基于用户ID，重启后不变）
  const users = JSON.parse(JSON.stringify(SAMPLE_USERS)).map(u => ({
    ...u,
    loginToken: "gkjj_" + u.id + "_2026",
  }));

  return {
    users: users,
    plan: JSON.parse(JSON.stringify(LEARNING_PLAN)),
    records: records,
    reminders: [],
    pushSubscriptions: {},
    settings: {
      trialDays: 30,
      minSummaryWords: 50,
      defaultDuration: 60,
      orgName: "顾家家居",
      deptName: "人才发展中心",
    },
  };
}

/* ===== 服务器状态 ===== */

let appData = null;
const tokens = new Map();   // token -> userId
let sseClients = [];        // SSE 连接列表

/* ===== GitHub 数据持久化 ===== */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = "cavenmark/probation-system";
const GITHUB_BRANCH = "main";
const GITHUB_DATA_PATH = "data.json";
let githubDataSha = null;
let githubSaveTimeout = null;

async function loadFromGitHub() {
  if (!GITHUB_TOKEN) return null;
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=${GITHUB_BRANCH}`;
    const resp = await fetch(url, {
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "probation-system",
      },
    });
    if (!resp.ok) {
      console.log(`[GitHub] 远程数据不存在或无法访问 (${resp.status})`);
      return null;
    }
    const data = await resp.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const parsed = JSON.parse(content);
    if (parsed && parsed.users && parsed.plan) {
      console.log(`[GitHub] 数据加载成功（${parsed.users.length} 用户，${parsed.records.length} 记录）`);
      githubDataSha = data.sha;
      return parsed;
    }
  } catch (e) {
    console.error("[GitHub] 加载失败:", e.message);
  }
  return null;
}

async function saveToGitHub() {
  if (!GITHUB_TOKEN) return;
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`;
    const content = Buffer.from(JSON.stringify(appData, null, 2)).toString("base64");
    const body = JSON.stringify({
      message: "auto: sync data",
      content: content,
      branch: GITHUB_BRANCH,
      ...(githubDataSha ? { sha: githubDataSha } : {}),
    });
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "probation-system",
      },
      body: body,
    });
    if (resp.ok) {
      const data = await resp.json();
      githubDataSha = data.content.sha;
      console.log("[GitHub] 数据同步成功");
    } else {
      const errText = await resp.text();
      console.error(`[GitHub] 保存失败 (${resp.status}):`, errText.slice(0, 200));
      if (resp.status === 409 || resp.status === 422) {
        // SHA 冲突：只更新 SHA，不覆盖 appData（保护本地新数据）
        try {
          const url2 = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=${GITHUB_BRANCH}`;
          const resp2 = await fetch(url2, {
            headers: {
              "Authorization": `token ${GITHUB_TOKEN}`,
              "Accept": "application/vnd.github+json",
              "User-Agent": "probation-system",
            },
          });
          if (resp2.ok) {
            const d = await resp2.json();
            githubDataSha = d.sha;
            console.log("[GitHub] SHA 已更新，重试保存...");
            // 用新 SHA 重试一次
            const retryBody = JSON.stringify({
              message: "auto: sync data (retry)",
              content: Buffer.from(JSON.stringify(appData, null, 2)).toString("base64"),
              branch: GITHUB_BRANCH,
              sha: githubDataSha,
            });
            const retryResp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`, {
              method: "PUT",
              headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "User-Agent": "probation-system",
              },
              body: retryBody,
            });
            if (retryResp.ok) {
              const retryData = await retryResp.json();
              githubDataSha = retryData.content.sha;
              console.log("[GitHub] 重试保存成功");
            }
          }
        } catch (e2) {
          console.error("[GitHub] 重试失败:", e2.message);
        }
      }
    }
  } catch (e) {
    console.error("[GitHub] 保存错误:", e.message);
  }
}

function debouncedSaveToGitHub() {
  if (!GITHUB_TOKEN) return;
  if (githubSaveTimeout) clearTimeout(githubSaveTimeout);
  githubSaveTimeout = setTimeout(() => {
    saveToGitHub().catch(() => {});
  }, 3000);
}

/* ===== 工具函数 ===== */

function saveDataFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2));
  } catch (e) {
    console.error("Failed to save data file:", e.message);
  }
  debouncedSaveToGitHub();
}

function loadDataFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to load data file:", e.message);
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
  });
}

function authUser(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return tokens.get(token) || null;
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

function serveStatic(pathname, res) {
  const routes = {
    "/":                  { file: "index.html",        type: "text/html; charset=utf-8" },
    "/index.html":        { file: "index.html",        type: "text/html; charset=utf-8" },
    "/styles.css":        { file: "styles.css",        type: "text/css; charset=utf-8" },
    "/app.js":            { file: "app.js",            type: "application/javascript; charset=utf-8" },
    "/manifest.json":     { file: "manifest.json",     type: "application/manifest+json; charset=utf-8" },
    "/sw.js":             { file: "sw.js",             type: "application/javascript; charset=utf-8" },
    "/icon-192.png":      { file: "icon-192.png",      type: "image/png" },
    "/icon-512.png":      { file: "icon-512.png",      type: "image/png" },
    "/apple-touch-icon.png": { file: "apple-touch-icon.png", type: "image/png" },
  };
  const route = routes[pathname];
  if (!route) return false;
  fs.readFile(path.join(__dirname, route.file), (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": route.type });
    res.end(data);
  });
  return true;
}

function broadcastUpdate() {
  const payload = JSON.stringify(appData);
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // 连接已断开，忽略
    }
  });
}

/* ===== HTTP 服务器 ===== */

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  /* --- 静态文件 --- */
  if (req.method === "GET" && serveStatic(pathname, res)) return;

  /* --- API: 登录 --- */
  if (pathname === "/api/login" && req.method === "POST") {
    const body = await readBody(req);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "请求格式错误" }); }
    const name = (parsed.name || "").trim();
    const user = appData.users.find((u) => u.name === name);
    if (!user) return sendJSON(res, 401, { error: "用户不存在，请检查姓名" });
    const token = crypto.randomUUID();
    tokens.set(token, user.id);
    return sendJSON(res, 200, { token, user, data: appData });
  }

  /* --- API: 扫码登录（通过 loginToken 自动登录）--- */
  if (pathname === "/api/login/qr" && req.method === "GET") {
    const qrToken = url.searchParams.get("token");
    if (!qrToken) return sendJSON(res, 400, { error: "缺少令牌参数" });
    const user = appData.users.find((u) => u.loginToken === qrToken);
    if (!user) return sendJSON(res, 401, { error: "令牌无效或已失效" });
    const authToken = crypto.randomUUID();
    tokens.set(authToken, user.id);
    return sendJSON(res, 200, { token: authToken, user, data: appData });
  }

  /* --- API: 重新生成扫码令牌（需 HR 登录）--- */
  if (pathname === "/api/regenerate-token" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const body = await readBody(req);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "请求格式错误" }); }
    const targetUser = appData.users.find((u) => u.id === parsed.userId);
    if (!targetUser) return sendJSON(res, 404, { error: "用户不存在" });
    targetUser.loginToken = crypto.randomUUID();
    saveDataFile();
    broadcastUpdate();
    return sendJSON(res, 200, { ok: true, loginToken: targetUser.loginToken });
  }

  /* --- API: 获取当前用户 --- */
  if (pathname === "/api/me" && req.method === "GET") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const user = appData.users.find((u) => u.id === userId);
    if (!user) return sendJSON(res, 401, { error: "用户不存在" });
    return sendJSON(res, 200, { user });
  }

  /* --- API: 获取全部数据（公开，供登录前加载用户列表）--- */
  if (pathname === "/api/data" && req.method === "GET") {
    return sendJSON(res, 200, appData);
  }

  /* --- API: 上传附件到 GitHub --- */
  if (pathname === "/api/upload" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const user = appData.users.find((u) => u.id === userId);
    if (!user || user.role !== "hr") return sendJSON(res, 403, { error: "无权限" });

    const body = await readBody(req);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "请求格式错误" }); }

    const filename = (parsed.filename || "unnamed").trim();
    const contentType = parsed.contentType || "application/octet-stream";
    const base64Data = parsed.base64Data;
    if (!base64Data) return sendJSON(res, 400, { error: "缺少文件数据" });

    // 检查文件大小（GitHub Contents API 限制 100MB）
    const sizeBytes = Math.floor(base64Data.length * 0.75);
    if (sizeBytes > 100 * 1024 * 1024) {
      return sendJSON(res, 413, { error: "文件大小超过 100MB 限制" });
    }

    // 生成安全文件名
    const safeName = filename.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, "_");
    const timestamp = Date.now();
    const ext = safeName.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "";
    const githubPath = `attachments/${timestamp}_${safeName}`;

    if (GITHUB_TOKEN) {
      try {
        const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${githubPath}`;
        const resp = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "probation-system",
          },
          body: JSON.stringify({
            message: `upload: ${filename}`,
            content: base64Data,
            branch: GITHUB_BRANCH,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          return sendJSON(res, 200, {
            success: true,
            attachment: {
              name: filename,
              size: sizeBytes,
              type: contentType,
              ext: ext,
              githubPath: githubPath,
              uploadedAt: new Date().toISOString(),
            },
          });
        } else {
          const errText = await resp.text();
          console.error("[Upload] GitHub 上传失败:", resp.status, errText.slice(0, 200));
          return sendJSON(res, 500, { error: `附件上传失败 (${resp.status})` });
        }
      } catch (e) {
        console.error("[Upload] 错误:", e.message);
        return sendJSON(res, 500, { error: "附件上传失败" });
      }
    } else {
      return sendJSON(res, 500, { error: "服务器未配置文件存储（GITHUB_TOKEN 未设置）" });
    }
  }

  /* --- API: 下载附件（GitHub 代理）--- */
  if (pathname.startsWith("/api/attachment") && req.method === "GET") {
    const filePath = url.searchParams.get("path");
    if (!filePath) return sendJSON(res, 400, { error: "缺少文件路径" });
    if (GITHUB_TOKEN) {
      try {
        const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
        const resp = await fetch(apiUrl, {
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "probation-system",
          },
        });
        if (!resp.ok) return sendJSON(res, 404, { error: "文件不存在" });
        const data = await resp.json();
        const buffer = Buffer.from(data.content, "base64");
        // 推断 Content-Type
        const ext = (filePath.match(/\.([a-zA-Z0-9]+)$/) || [])[1]?.toLowerCase() || "";
        const mimeTypes = {
          pdf: "application/pdf", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          mp4: "video/mp4", avi: "video/x-msvideo", mov: "video/quicktime", wmv: "video/x-ms-wmv", flv: "video/x-flv",
          mp3: "audio/mpeg", wav: "audio/wav",
          jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", bmp: "image/bmp",
          txt: "text/plain", csv: "text/csv", html: "text/html",
          zip: "application/zip", rar: "application/x-rar-compressed", "7z": "application/x-7z-compressed",
        };
        const ct = mimeTypes[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": ct,
          "Content-Length": buffer.length,
          "Content-Disposition": `inline; filename="${(data.name || "file")}"`,
        });
        res.end(buffer);
        return;
      } catch (e) {
        console.error("[Attachment] 下载失败:", e.message);
        return sendJSON(res, 500, { error: "文件下载失败" });
      }
    }
    return sendJSON(res, 500, { error: "文件存储未配置" });
  }

  /* --- API: 删除附件 --- */
  if (pathname === "/api/attachment/delete" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const user = appData.users.find((u) => u.id === userId);
    if (!user || user.role !== "hr") return sendJSON(res, 403, { error: "无权限" });
    const body = await readBody(req);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "请求格式错误" }); }
    const filePath = parsed.path;
    if (!filePath || !GITHUB_TOKEN) return sendJSON(res, 400, { error: "参数错误" });
    try {
      // 先获取 SHA
      const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
      const resp = await fetch(apiUrl, {
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github+json", "User-Agent": "probation-system" },
      });
      if (!resp.ok) return sendJSON(res, 404, { error: "文件不存在" });
      const data = await resp.json();
      // 删除文件
      const delResp = await fetch(apiUrl, {
        method: "DELETE",
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "probation-system" },
        body: JSON.stringify({ message: `delete: ${data.name}`, branch: GITHUB_BRANCH, sha: data.sha }),
      });
      if (delResp.ok) return sendJSON(res, 200, { ok: true });
      return sendJSON(res, 500, { error: "删除失败" });
    } catch (e) {
      return sendJSON(res, 500, { error: "删除失败" });
    }
  }

  /* --- API: 保存数据（需登录）--- */
  if (pathname === "/api/save" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const body = await readBody(req);
    let newData;
    try {
      newData = JSON.parse(body);
    } catch {
      return sendJSON(res, 400, { error: "数据解析失败" });
    }
    if (!newData.users || !newData.plan || !newData.records) {
      return sendJSON(res, 400, { error: "数据格式不正确" });
    }
    // 保护 pushSubscriptions 不被客户端覆盖
    const oldPushSubs = appData.pushSubscriptions || {};
    appData = newData;
    appData.pushSubscriptions = newData.pushSubscriptions || oldPushSubs;
    saveDataFile();
    broadcastUpdate();
    return sendJSON(res, 200, { ok: true });
  }

  /* --- API: 重置为默认数据（需登录）--- */
  if (pathname === "/api/reset" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    // 清除所有 token，强制重新登录
    tokens.clear();
    appData = initSampleData();
    saveDataFile();
    broadcastUpdate();
    return sendJSON(res, 200, { ok: true, data: appData });
  }

  /* --- API: SSE 实时推送 --- */
  if (pathname === "/api/events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    // 发送当前数据
    res.write(`data: ${JSON.stringify(appData)}\n\n`);
    sseClients.push(res);
    req.on("close", () => {
      sseClients = sseClients.filter((c) => c !== res);
    });
    return;
  }

  /* --- API: 获取 VAPID 公钥 --- */
  if (pathname === "/api/push/vapid-public" && req.method === "GET") {
    return sendJSON(res, 200, { publicKey: VAPID_PUBLIC_KEY });
  }

  /* --- API: 订阅推送通知 --- */
  if (pathname === "/api/push/subscribe" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const body = await readBody(req);
    let sub;
    try { sub = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "数据解析失败" }); }

    if (!appData.pushSubscriptions) appData.pushSubscriptions = {};
    if (!appData.pushSubscriptions[userId]) appData.pushSubscriptions[userId] = [];

    // 避免重复订阅
    const exists = appData.pushSubscriptions[userId].find(s => s.endpoint === sub.endpoint);
    if (!exists) {
      appData.pushSubscriptions[userId].push(sub);
      saveDataFile();
    }
    return sendJSON(res, 200, { ok: true });
  }

  /* --- API: 退订推送通知 --- */
  if (pathname === "/api/push/unsubscribe" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const body = await readBody(req);
    let sub;
    try { sub = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "数据解析失败" }); }

    if (appData.pushSubscriptions && appData.pushSubscriptions[userId]) {
      appData.pushSubscriptions[userId] = appData.pushSubscriptions[userId].filter(
        s => s.endpoint !== sub.endpoint
      );
      saveDataFile();
    }
    return sendJSON(res, 200, { ok: true });
  }

  /* --- API: 发送催促（含推送通知）--- */
  if (pathname === "/api/remind" && req.method === "POST") {
    const userId = authUser(req);
    if (!userId) return sendJSON(res, 401, { error: "未登录" });
    const body = await readBody(req);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return sendJSON(res, 400, { error: "数据解析失败" }); }

    const { employeeId, message } = parsed;
    const emp = appData.users.find(u => u.id === employeeId);
    if (!emp) return sendJSON(res, 404, { error: "员工不存在" });

    // 计算进度
    const empRecords = appData.records.filter(r => r.employeeId === employeeId);
    const completed = empRecords.filter(r => r.status === "approved").length;
    const total = appData.plan.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 添加催促记录
    const reminder = {
      id: "rm_" + Date.now(),
      employeeId: employeeId,
      message: message || "请尽快完成学习任务",
      sentAt: new Date().toISOString(),
      sentBy: userId,
      progressPercent: percent,
      read: false,
    };
    appData.reminders.push(reminder);
    saveDataFile();
    broadcastUpdate();

    // 发送 Web Push 通知
    const subs = (appData.pushSubscriptions && appData.pushSubscriptions[employeeId]) || [];
    const pushPayload = JSON.stringify({
      title: "学习催促提醒",
      body: message || "请尽快完成今日学习任务",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "reminder-" + employeeId,
      data: { url: "/?t=" + (emp.loginToken || "") },
    });

    let pushSent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, pushPayload);
        pushSent++;
      } catch (err) {
        console.error("[Push] 发送失败:", err.statusCode, err.message?.slice(0, 100));
        // 410 Gone: 订阅已失效，删除它
        if (err.statusCode === 410 || err.statusCode === 404) {
          appData.pushSubscriptions[employeeId] = appData.pushSubscriptions[employeeId].filter(
            s => s.endpoint !== sub.endpoint
          );
        }
      }
    }
    if (pushSent > 0) saveDataFile();

    return sendJSON(res, 200, { ok: true, pushSent, reminder });
  }

  /* --- 404 --- */
  sendJSON(res, 404, { error: "Not found" });
});

/* ===== 初始化 ===== */

async function start() {
  // 1. 优先从 GitHub 加载（跨部署持久化）
  const githubData = await loadFromGitHub();
  if (githubData) {
    appData = githubData;
    saveDataFile(); // 同步到本地
    console.log("[数据] 从 GitHub 加载成功");
  } else {
    // 2. 尝试从本地文件加载
    const fileData = loadDataFile();
    if (fileData && fileData.users && fileData.plan) {
      appData = fileData;
      console.log(`[数据] 从 data.json 加载成功（${appData.users.length} 用户，${appData.plan.length} 课程，${appData.records.length} 记录）`);
    } else {
      // 3. 初始化样本数据
      appData = initSampleData();
      saveDataFile();
      console.log("[数据] 初始化样本数据完成");
    }
  }

  server.timeout = 300000; // 5 分钟超时（支持大文件上传）
  server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  试用期员工学习管理系统`);
    console.log(`  服务地址: http://localhost:${PORT}`);
    console.log(`  GitHub持久化: ${GITHUB_TOKEN ? "已启用" : "未启用"}`);
    console.log(`========================================\n`);
  });
}

start();
