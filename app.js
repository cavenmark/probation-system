/* ====================================================================
   试用期员工学习管理系统 — 应用逻辑
   角色：新员工 / 带教老师 / 人力资源(HR)
   数据同步：后端 API + SSE 实时推送
==================================================================== */

/* ===== 第一部分：样本数据 ===== */

// 30 天入职学习计划（顾家家居场景）
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

// 用户数据
const SAMPLE_USERS = [
  { id: "u1", name: "陈思雨", role: "employee", dept: "门店运营中心", position: "导购员", mentorId: "u4", joinDate: "2026-07-15", avatarColor: "#2563eb" },
  { id: "u2", name: "王浩然", role: "employee", dept: "门店运营中心", position: "导购员", mentorId: "u4", joinDate: "2026-07-15", avatarColor: "#0891b2" },
  { id: "u3", name: "林晓彤", role: "employee", dept: "全屋定制中心", position: "设计顾问", mentorId: "u5", joinDate: "2026-07-20", avatarColor: "#7c3aed" },
  { id: "u4", name: "赵明辉", role: "mentor",   dept: "门店运营中心", position: "资深店长", avatarColor: "#16a34a" },
  { id: "u5", name: "刘佳琪", role: "mentor",   dept: "全屋定制中心", position: "设计主管", avatarColor: "#d97706" },
  { id: "u6", name: "HR管理员", role: "hr",      dept: "人力资源中心", position: "HRBP", avatarColor: "#dc2626" },
];

/* ===== 第二部分：API 数据层（后端同步）===== */

const API = {
  TOKEN_KEY: "probation_token",
  DATA_KEY: "probation_system_data",
  token: localStorage.getItem("probation_token") || null,
  _sse: null,
  _justSaved: false,
  online: false,  // 是否有后端服务器

  /* 加载全部数据（优先服务器，降级 localStorage）*/
  async load() {
    try {
      const res = await fetch("/api/data", { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error("fail");
      this.online = true;
      return res.json();
    } catch (e) {
      this.online = false;
      return this._localLoad();
    }
  },

  /* 保存全部数据 */
  save(data) {
    // 始终存 localStorage 作为备份
    this._localSave(data);
    if (this.online) {
      this._justSaved = true;
      this._doSave(data);
    }
  },

  /* 内部：实际执行保存（带自动重试） */
  async _doSave(data) {
    try {
      let res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + this.token },
        body: JSON.stringify(data),
      });

      // 401：服务器重启导致 token 失效，自动重新登录后重试
      if (res.status === 401 && State.currentUser) {
        console.log("[API] 保存失败(401)，自动重新登录...");
        try {
          if (State.currentUser.loginToken) {
            await this.qrLogin(State.currentUser.loginToken);
          } else {
            await this.login(State.currentUser.name);
          }
          // 用新 token 重试保存
          res = await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + this.token },
            body: JSON.stringify(data),
          });
        } catch (e) {
          console.error("[API] 重新登录失败:", e);
        }
      }

      if (!res.ok) {
        console.error("[API] 保存失败:", res.status);
        if (typeof toast === "function") toast("保存失败，请刷新页面重试", "danger");
        this._justSaved = false;
      }
    } catch (err) {
      console.error("[API] 保存出错:", err);
      if (typeof toast === "function") toast("网络错误，保存失败", "danger");
      this._justSaved = false;
    }
  },

  /* 重置为默认数据 */
  async reset() {
    if (this.online) {
      await fetch("/api/reset", {
        method: "POST",
        headers: { Authorization: "Bearer " + this.token },
      });
      this.token = null;
      localStorage.removeItem(this.TOKEN_KEY);
      return await this.load();
    } else {
      localStorage.removeItem(this.DATA_KEY);
      return this._localLoad();
    }
  },

  /* 登录 */
  async login(name) {
    if (this.online) {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("登录失败");
      const result = await res.json();
      this.token = result.token;
      localStorage.setItem(this.TOKEN_KEY, this.token);
      return result;
    } else {
      // 离线模式：直接返回用户
      const user = State.data.users.find(u => u.name === name);
      if (!user) throw new Error("用户不存在");
      this.token = "offline_" + user.id;
      localStorage.setItem(this.TOKEN_KEY, this.token);
      return { token: this.token, user };
    }
  },

  /* 扫码登录（通过 loginToken）*/
  async qrLogin(token) {
    if (this.online) {
      const res = await fetch("/api/login/qr?token=" + encodeURIComponent(token));
      if (!res.ok) throw new Error("令牌无效");
      const result = await res.json();
      this.token = result.token;
      localStorage.setItem(this.TOKEN_KEY, this.token);
      return result;
    } else {
      // 离线模式：从数据中查找用户
      const user = State.data.users.find(u => u.loginToken === token);
      if (!user) throw new Error("令牌无效");
      this.token = "offline_" + user.id;
      localStorage.setItem(this.TOKEN_KEY, this.token);
      return { token: this.token, user };
    }
  },

  /* 重新生成扫码令牌 */
  async regenerateToken(userId) {
    if (this.online) {
      const res = await fetch("/api/regenerate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + this.token },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("操作失败");
      const result = await res.json();
      // 更新本地数据中的令牌
      const user = State.data.users.find(u => u.id === userId);
      if (user) user.loginToken = result.loginToken;
      return result.loginToken;
    } else {
      // 离线模式：本地生成
      const user = State.data.users.find(u => u.id === userId);
      if (!user) throw new Error("用户不存在");
      user.loginToken = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      this._localSave(State.data);
      return user.loginToken;
    }
  },

  /* 验证已存储的 token */
  async checkSession() {
    if (!this.token) return null;
    if (!this.online) {
      // 离线模式：从 token 提取 userId
      if (this.token.startsWith("offline_")) {
        const userId = this.token.slice(8);
        return State.data.users.find(u => u.id === userId) || null;
      }
      return null;
    }
    try {
      const res = await fetch("/api/me", { headers: { Authorization: "Bearer " + this.token } });
      if (!res.ok) { this.logout(); return null; }
      const result = await res.json();
      return result.user;
    } catch { return null; }
  },

  logout() {
    this.token = null;
    localStorage.removeItem(this.TOKEN_KEY);
    if (this._sse) { this._sse.close(); this._sse = null; }
  },

  /* 启动 SSE 实时推送（仅在线模式）*/
  initSSE(onUpdate) {
    if (!this.online) return;
    if (this._sse) this._sse.close();
    this._sse = new EventSource("/api/events");
    this._sse.onmessage = (event) => {
      if (this._justSaved) { this._justSaved = false; return; }
      try {
        const newData = JSON.parse(event.data);
        onUpdate(newData);
      } catch (e) { /* ignore */ }
    };
  },

  /* ===== localStorage 降级方法 ===== */

  _localLoad() {
    const raw = localStorage.getItem(this.DATA_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fall through */ }
    }
    const data = this._initSampleData();
    this._localSave(data);
    return data;
  },

  _localSave(data) {
    localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
  },

  _initSampleData() {
    const today = new Date();
    const records = [];
    SAMPLE_USERS.filter(u => u.role === "employee").forEach(emp => {
      const joinDate = new Date(emp.joinDate);
      const daysSinceJoin = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24)) + 1;
      const trialDays = State.data?.settings?.trialDays || 30;
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
            id: `lr_${emp.id}_${d}`, employeeId: emp.id, day: d,
            date: recordDate.toISOString().split("T")[0], status, actualDuration,
            requiredDuration: plan.duration, summary,
            submittedAt: status === "submitted" || status === "approved" || status === "rejected" ? recordDate.toISOString() : null,
            reviewedBy, reviewedAt, reviewComment: reviewComment || "",
          });
        }
      }
    });
    return {
      users: JSON.parse(JSON.stringify(SAMPLE_USERS)).map(u => ({ ...u, loginToken: "lt_" + u.id + "_" + Math.random().toString(36).slice(2, 10) })),
      plan: JSON.parse(JSON.stringify(LEARNING_PLAN)),
      records, reminders: [],
      settings: { trialDays: 30, minSummaryWords: 50, defaultDuration: 60, orgName: "顾家家居", deptName: "人才发展中心" },
    };
  },
};

/* ===== 第三部分：状态管理 ===== */

const State = {
  data: null,
  currentUser: null,
  currentView: null,
  adminTab: "users",
  timer: { running: false, seconds: 0, intervalId: null, recordId: null },
};

/* ===== 第四部分：工具函数 ===== */

const Utils = {
  formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getMonth()+1}月${d.getDate()}日`;
  },
  formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  },
  formatDuration(minutes) {
    if (!minutes || minutes === 0) return "0分钟";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}小时${m > 0 ? m + "分钟" : ""}` : `${m}分钟`;
  },
  formatSeconds(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  },
  getAvatarChar(name) {
    return name ? name.charAt(0) : "?";
  },
  statusBadge(status) {
    const map = {
      pending:    { text: "待学习", cls: "badge-gray" },
      studying:   { text: "学习中", cls: "badge-primary" },
      submitted:  { text: "待审核", cls: "badge-warning" },
      approved:   { text: "已通过", cls: "badge-success" },
      rejected:   { text: "已驳回", cls: "badge-danger" },
    };
    const s = map[status] || map.pending;
    return `<span class="badge ${s.cls}">${s.text}</span>`;
  },
  getUser(id) { return State.data.users.find(u => u.id === id); },
  getEmployeeRecords(empId) { return State.data.records.filter(r => r.employeeId === empId).sort((a,b) => a.day - b.day); },
  getTodayRecord(empId) {
    const emp = this.getUser(empId);
    if (!emp) return null;
    const today = new Date().toISOString().split("T")[0];
    let record = State.data.records.find(r => r.employeeId === empId && r.date === today);
    if (!record) {
      // 计算第几天
      const joinDate = new Date(emp.joinDate);
      const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24)) + 1;
      const planLen = State.data.plan.length;
      const day = Math.min(daysSinceJoin, planLen);
      if (day > planLen) return null;
      const plan = State.data.plan[day - 1];
      record = {
        id: `lr_${empId}_${day}`,
        employeeId: empId,
        day: day,
        date: today,
        status: "pending",
        actualDuration: 0,
        requiredDuration: plan.duration,
        summary: "",
        submittedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewComment: "",
      };
      State.data.records.push(record);
      API.save(State.data);
    }
    return record;
  },
  getMentees(mentorId) {
    return State.data.users.filter(u => u.role === "employee" && u.mentorId === mentorId);
  },
  getPendingReviews(mentorId) {
    const mentees = this.getMentees(mentorId);
    const menteeIds = mentees.map(m => m.id);
    return State.data.records.filter(r => menteeIds.includes(r.employeeId) && r.status === "submitted");
  },
  getAllEmployees() {
    return State.data.users.filter(u => u.role === "employee");
  },
  getEmployeeProgress(empId) {
    const records = this.getEmployeeRecords(empId);
    const total = State.data.plan.length;
    const completed = records.filter(r => r.status === "approved").length;
    const submitted = records.filter(r => r.status === "submitted").length;
    const pending = records.filter(r => r.status === "pending" || r.status === "studying").length;
    const rejected = records.filter(r => r.status === "rejected").length;
    const percent = Math.round((completed / total) * 100);
    return { total, completed, submitted, pending, rejected, percent, currentDay: records.length };
  },
  getProgressStatus(progress) {
    if (progress.percent >= 80) return { text: "进度优秀", cls: "success", icon: "🟢" };
    if (progress.percent >= 50) return { text: "进度正常", cls: "primary", icon: "🔵" };
    if (progress.percent >= 20) return { text: "进度偏慢", cls: "warning", icon: "🟡" };
    return { text: "进度落后", cls: "danger", icon: "🔴" };
  },
};

/* ===== 第五部分：Toast 通知 ===== */

function toast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  const icons = { info: "ℹ️", success: "✅", warning: "⚠️", danger: "❌" };
  el.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ===== 第六部分：模态框 ===== */

const Modal = {
  open(title, bodyHtml, footerHtml = "") {
    const overlay = document.getElementById("modal-overlay");
    const box = document.getElementById("modal-box");
    box.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <span class="modal-close" onclick="Modal.close()">×</span>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ""}
    `;
    overlay.classList.remove("hidden");
    box.classList.remove("hidden");
    overlay.onclick = () => this.close();
  },
  close() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("modal-box").classList.add("hidden");
  },
};

/* ===== 第七部分：视图渲染 ===== */

const Views = {

  /* ----- 公共：侧边栏 ----- */
  renderSidebar() {
    const role = State.currentUser.role;
    const items = {
      employee: [
        { id: "today", icon: "📋", label: "今日任务" },
        { id: "history", icon: "📚", label: "学习记录" },
      ],
      mentor: [
        { id: "pending", icon: "📝", label: "待审核", badge: true },
        { id: "reviewed", icon: "✅", label: "审核记录" },
      ],
      hr: [
        { id: "dashboard", icon: "📊", label: "数据看板" },
        { id: "employees", icon: "👥", label: "员工进度" },
        { id: "reminders", icon: "🔔", label: "催促记录" },
        { id: "plan", icon: "📅", label: "学习计划" },
        { id: "admin", icon: "⚙️", label: "管理后台" },
      ],
    };
    const list = items[role] || [];
    let badgeHtml = "";
    if (role === "mentor") {
      const count = Utils.getPendingReviews(State.currentUser.id).length;
      if (count > 0) badgeHtml = `<span class="nav-badge">${count}</span>`;
    }
    const html = list.map(item => `
      <div class="nav-item ${State.currentView === item.id ? "active" : ""}" onclick="navigateTo('${item.id}')">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badge ? badgeHtml : ""}
      </div>
    `).join("");
    document.getElementById("sidebar").innerHTML = html;
  },

  /* ----- 新员工：今日任务 ----- */
  employeeToday() {
    const emp = State.currentUser;
    const record = Utils.getTodayRecord(emp.id);
    if (!record) {
      document.getElementById("content").innerHTML = `
        <div class="page-title">今日学习任务</div>
        <div class="empty-state">
          <div class="empty-icon">🎉</div>
          <div class="empty-text">恭喜！您已完成全部学习计划，无需新增任务。</div>
        </div>`;
      return;
    }
    const plan = State.data.plan[record.day - 1];

    // 检查是否有催促通知
    const reminders = State.data.reminders.filter(r => r.employeeId === emp.id && !r.read);
    let reminderHtml = "";
    if (reminders.length > 0) {
      reminderHtml = reminders.map(r => `
        <div class="reminder-banner">
          <span class="reminder-icon">⚠️</span>
          <span><strong>HR催促通知：</strong>${r.message} <span style="color:var(--c-text-muted);margin-left:8px;">${Utils.formatDateTime(r.sentAt)}</span></span>
        </div>
      `).join("");
      // 标记已读
      reminders.forEach(r => r.read = true);
      API.save(State.data);
    }

    const isCompleted = record.status === "submitted" || record.status === "approved" || record.status === "rejected";
    const canSubmit = State.timer.seconds > 0 || record.actualDuration > 0;

    let timerHtml = "";
    if (!isCompleted) {
      const requiredSec = record.requiredDuration * 60;
      const currentSec = record.actualDuration > 0 ? record.actualDuration * 60 : State.timer.seconds;
      const percent = Math.min(100, (currentSec / requiredSec) * 100);
      const metRequired = currentSec >= requiredSec;
      timerHtml = `
        <div class="timer-card">
          <div>
            <div class="timer-label">学习计时（要求：${Utils.formatDuration(record.requiredDuration)}）</div>
            <div class="timer-display" id="timer-display">${Utils.formatSeconds(currentSec)}</div>
            <div class="timer-progress" style="width:200px;margin-top:8px;">
              <div class="progress-bar"><div class="progress-fill ${metRequired ? 'success' : 'primary'}" style="width:${percent}%"></div></div>
            </div>
          </div>
          <div class="timer-controls">
            <button class="timer-btn" id="timer-start" onclick="Timer.toggle()" ${State.timer.running ? 'style="display:none"' : ''}>▶</button>
            <button class="timer-btn" id="timer-pause" onclick="Timer.toggle()" ${!State.timer.running ? 'style="display:none"' : ''}>⏸</button>
            <button class="timer-btn" onclick="Timer.stop()" title="结束计时">⏹</button>
          </div>
        </div>
      `;
    }

    let summaryHtml = "";
    if (!isCompleted) {
      summaryHtml = `
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">📝 学习总结</div>
          <div class="form-group">
            <label class="form-label">请撰写今日学习总结 <span class="required">*</span></label>
            <textarea class="form-textarea" id="summary-input" placeholder="请总结今天的学习收获、重点理解及实际应用计划（不少于100字）...">${record.summary || ""}</textarea>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:var(--c-text-muted);">提示：学习时长需达到${Utils.formatDuration(record.requiredDuration)}方可提交</span>
            <button class="btn btn-primary" id="submit-btn" onclick="Actions.submitSummary()">提交给带教老师审核</button>
          </div>
        </div>
      `;
    } else if (record.status === "submitted") {
      summaryHtml = `
        <div class="card" style="border-left:4px solid var(--c-warning);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <span class="badge badge-warning">⏳ 待审核</span>
            <span style="font-size:13px;color:var(--c-text-secondary);">已提交至带教老师 ${Utils.getUser(emp.mentorId)?.name || "—"}，等待审核确认</span>
          </div>
          <div style="font-size:13px;color:var(--c-text-secondary);margin-bottom:8px;">提交时间：${Utils.formatDateTime(record.submittedAt)}</div>
          <div style="background:var(--c-bg);padding:12px;border-radius:6px;font-size:13px;line-height:1.6;">${record.summary}</div>
        </div>
      `;
    } else if (record.status === "approved") {
      summaryHtml = `
        <div class="card" style="border-left:4px solid var(--c-success);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <span class="badge badge-success">✅ 审核通过</span>
            <span style="font-size:13px;color:var(--c-text-secondary);">带教老师 ${Utils.getUser(record.reviewedBy)?.name || "—"} 已确认</span>
          </div>
          <div style="font-size:13px;color:var(--c-text-secondary);margin-bottom:8px;">审核时间：${Utils.formatDateTime(record.reviewedAt)}</div>
          ${record.reviewComment ? `<div style="background:var(--c-success-light);padding:12px;border-radius:6px;font-size:13px;margin-bottom:12px;"><strong>审核评语：</strong>${record.reviewComment}</div>` : ""}
          <div style="background:var(--c-bg);padding:12px;border-radius:6px;font-size:13px;line-height:1.6;">${record.summary}</div>
        </div>
      `;
    } else if (record.status === "rejected") {
      summaryHtml = `
        <div class="card" style="border-left:4px solid var(--c-danger);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <span class="badge badge-danger">❌ 已驳回</span>
            <span style="font-size:13px;color:var(--c-text-secondary);">带教老师 ${Utils.getUser(record.reviewedBy)?.name || "—"} 要求重新提交</span>
          </div>
          ${record.reviewComment ? `<div style="background:var(--c-danger-light);padding:12px;border-radius:6px;font-size:13px;margin-bottom:12px;"><strong>驳回原因：</strong>${record.reviewComment}</div>` : ""}
          <div class="form-group">
            <label class="form-label">请修改学习总结后重新提交</label>
            <textarea class="form-textarea" id="summary-input" placeholder="请修改学习总结...">${record.summary || ""}</textarea>
          </div>
          <div style="text-align:right;">
            <button class="btn btn-primary" onclick="Actions.resubmitSummary()">重新提交</button>
          </div>
        </div>
      `;
    }

    document.getElementById("content").innerHTML = `
      ${reminderHtml}
      <div class="page-title">今日学习任务</div>
      <div class="page-desc">${emp.name}，今天是您入职第 ${record.day} 天，加油！💪</div>
      <div class="task-card">
        <div class="task-header">
          <div class="task-day">D${record.day}</div>
          <div>
            <div class="task-title">${plan.title}</div>
            <div class="task-meta">
              <span>📂 ${plan.category}</span>
              <span>⏱ 要求学习时长：${Utils.formatDuration(plan.duration)}</span>
              <span>${Utils.statusBadge(record.status)}</span>
            </div>
          </div>
        </div>
        <div class="task-content">${plan.content}</div>
        <ul class="task-points">
          ${plan.points.map(p => `<li>${p}</li>`).join("")}
        </ul>
      </div>
      ${timerHtml}
      ${summaryHtml}
    `;
  },

  /* ----- 新员工：学习记录 ----- */
  employeeHistory() {
    const emp = State.currentUser;
    const records = Utils.getEmployeeRecords(emp.id);
    const progress = Utils.getEmployeeProgress(emp.id);

    document.getElementById("content").innerHTML = `
      <div class="page-title">学习记录</div>
      <div class="page-desc">查看您的学习进度与历史记录</div>
      <div class="card">
        <div style="display:flex;align-items:center;gap:24px;">
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:14px;font-weight:600;">总体进度</span>
              <span style="font-size:14px;font-weight:600;">${progress.completed}/${progress.total} 天 (${progress.percent}%)</span>
            </div>
            <div class="progress-bar"><div class="progress-fill ${Utils.getProgressStatus(progress).cls}" style="width:${progress.percent}%"></div></div>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--c-success);">${progress.completed}</div><div style="font-size:12px;color:var(--c-text-secondary);">已通过</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--c-warning);">${progress.submitted}</div><div style="font-size:12px;color:var(--c-text-secondary);">待审核</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--c-danger);">${progress.rejected}</div><div style="font-size:12px;color:var(--c-text-secondary);">已驳回</div></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">每日学习详情</div>
        ${records.length === 0 ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">暂无学习记录</div></div>` : `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>天数</th><th>日期</th><th>学习内容</th><th>分类</th><th>学习时长</th><th>状态</th><th>审核评语</th></tr></thead>
            <tbody>
              ${records.map(r => {
                const plan = State.data.plan[r.day - 1];
                return `<tr>
                  <td><strong>Day ${r.day}</strong></td>
                  <td>${Utils.formatDate(r.date)}</td>
                  <td style="max-width:200px;">${plan?.title || "—"}</td>
                  <td><span class="badge badge-gray">${plan?.category || "—"}</span></td>
                  <td>${r.actualDuration > 0 ? Utils.formatDuration(r.actualDuration) : "—"}</td>
                  <td>${Utils.statusBadge(r.status)}</td>
                  <td style="max-width:180px;font-size:12px;color:var(--c-text-secondary);">${r.reviewComment || "—"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`}
      </div>
    `;
  },

  /* ----- 带教老师：待审核 ----- */
  mentorPending() {
    const pending = Utils.getPendingReviews(State.currentUser.id);
    document.getElementById("content").innerHTML = `
      <div class="page-title">待审核列表</div>
      <div class="page-desc">${pending.length > 0 ? `有 ${pending.length} 条学习总结等待您审核` : "暂无待审核内容"}</div>
      ${pending.length === 0 ? `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">所有学习总结已审核完毕</div></div>` :
        pending.map(r => {
          const emp = Utils.getUser(r.employeeId);
          const plan = State.data.plan[r.day - 1];
          return `<div class="review-item" onclick="Actions.openReview('${r.id}')">
            <div class="review-item-header">
              <div class="review-item-info">
                <span class="table-avatar" style="background:${emp.avatarColor}">${Utils.getAvatarChar(emp.name)}</span>
                <div>
                  <div style="font-weight:600;font-size:14px;">${emp.name} <span style="font-weight:400;color:var(--c-text-secondary);font-size:12px;">${emp.position}</span></div>
                  <div style="font-size:12px;color:var(--c-text-secondary);">Day ${r.day} · ${plan.title} · 提交于 ${Utils.formatDateTime(r.submittedAt)}</div>
                </div>
              </div>
              <span class="badge badge-warning">待审核</span>
            </div>
            <div style="display:flex;gap:16px;font-size:13px;color:var(--c-text-secondary);margin-bottom:8px;">
              <span>⏱ 学习时长：${Utils.formatDuration(r.actualDuration)}（要求 ${Utils.formatDuration(r.requiredDuration)}）</span>
            </div>
            <div class="review-item-summary">${r.summary}</div>
          </div>`;
        }).join("")
      }
    `;
  },

  /* ----- 带教老师：审核记录 ----- */
  mentorReviewed() {
    const mentees = Utils.getMentees(State.currentUser.id);
    const menteeIds = mentees.map(m => m.id);
    const reviewed = State.data.records
      .filter(r => menteeIds.includes(r.employeeId) && (r.status === "approved" || r.status === "rejected"))
      .sort((a,b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));

    document.getElementById("content").innerHTML = `
      <div class="page-title">审核记录</div>
      <div class="page-desc">已审核的学习总结历史</div>
      <div class="card">
        ${reviewed.length === 0 ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">暂无审核记录</div></div>` : `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>员工</th><th>天数</th><th>学习内容</th><th>学习时长</th><th>状态</th><th>审核时间</th><th>评语</th></tr></thead>
            <tbody>
              ${reviewed.map(r => {
                const emp = Utils.getUser(r.employeeId);
                const plan = State.data.plan[r.day - 1];
                return `<tr style="cursor:pointer;" onclick="Actions.openReviewDetail('${r.id}')">
                  <td><span class="table-avatar" style="background:${emp.avatarColor}">${Utils.getAvatarChar(emp.name)}</span>${emp.name}</td>
                  <td>Day ${r.day}</td>
                  <td style="max-width:160px;">${plan?.title || "—"}</td>
                  <td>${Utils.formatDuration(r.actualDuration)}</td>
                  <td>${Utils.statusBadge(r.status)}</td>
                  <td>${Utils.formatDateTime(r.reviewedAt)}</td>
                  <td style="max-width:150px;font-size:12px;color:var(--c-text-secondary);">${r.reviewComment || "—"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`}
      </div>
    `;
  },

  /* ----- HR：数据看板 ----- */
  hrDashboard() {
    const employees = Utils.getAllEmployees();
    const total = employees.length;
    const allRecords = State.data.records;
    const approvedCount = allRecords.filter(r => r.status === "approved").length;
    const submittedCount = allRecords.filter(r => r.status === "submitted").length;
    const totalPlanDays = total * State.data.plan.length;
    const overallPercent = Math.round((approvedCount / totalPlanDays) * 100);

    // 进度落后员工
    const slowEmployees = employees.filter(emp => {
      const p = Utils.getEmployeeProgress(emp.id);
      return p.percent < 50;
    });

    // 待审核数
    const pendingReviewCount = submittedCount;

    document.getElementById("content").innerHTML = `
      <div class="page-title">数据看板</div>
      <div class="page-desc">试用期员工学习进度总览</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--c-primary-light);">👥</div>
          <div class="stat-info">
            <div class="stat-value">${total}</div>
            <div class="stat-label">在培员工数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--c-success-light);">✅</div>
          <div class="stat-info">
            <div class="stat-value">${approvedCount}</div>
            <div class="stat-label">已通过学习任务</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--c-warning-light);">⏳</div>
          <div class="stat-info">
            <div class="stat-value">${pendingReviewCount}</div>
            <div class="stat-label">待审核任务</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--c-danger-light);">⚠️</div>
          <div class="stat-info">
            <div class="stat-value">${slowEmployees.length}</div>
            <div class="stat-label">进度落后员工</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">📈 整体完成率</div>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="flex:1;">
            <div class="progress-bar" style="height:16px;border-radius:8px;">
              <div class="progress-fill ${overallPercent >= 50 ? 'success' : 'warning'}" style="width:${overallPercent}%;border-radius:8px;"></div>
            </div>
          </div>
          <div style="font-size:24px;font-weight:700;color:var(--c-primary);">${overallPercent}%</div>
        </div>
        <div style="margin-top:8px;font-size:13px;color:var(--c-text-secondary);">已完成 ${approvedCount} / ${totalPlanDays} 个学习任务</div>
      </div>
      ${slowEmployees.length > 0 ? `
      <div class="card" style="border-left:4px solid var(--c-danger);">
        <div class="card-title" style="margin-bottom:16px;">⚠️ 需关注员工（进度低于50%）</div>
        ${slowEmployees.map(emp => {
          const p = Utils.getEmployeeProgress(emp.id);
          const mentor = Utils.getUser(emp.mentorId);
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--c-border);">
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="table-avatar" style="background:${emp.avatarColor}">${Utils.getAvatarChar(emp.name)}</span>
              <div>
                <div style="font-weight:600;font-size:14px;">${emp.name}</div>
                <div style="font-size:12px;color:var(--c-text-secondary);">${emp.dept} · 带教：${mentor?.name || "—"}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:120px;"><div class="progress-bar"><div class="progress-fill danger" style="width:${p.percent}%"></div></div></div>
              <span style="font-size:13px;font-weight:600;color:var(--c-danger);">${p.percent}%</span>
              <button class="btn btn-warning btn-sm" onclick="Actions.sendReminder('${emp.id}')">🔔 催促</button>
            </div>
          </div>`;
        }).join("")}
      </div>` : ""}
    `;
  },

  /* ----- HR：员工进度 ----- */
  hrEmployees() {
    const employees = Utils.getAllEmployees();
    document.getElementById("content").innerHTML = `
      <div class="page-title">员工学习进度</div>
      <div class="page-desc">查看所有试用期员工的学习进度详情</div>
      <div class="filter-bar">
        <select id="filter-status" onchange="Views.hrEmployees()">
          <option value="">全部状态</option>
          <option value="danger">进度落后</option>
          <option value="warning">进度偏慢</option>
          <option value="primary">进度正常</option>
          <option value="success">进度优秀</option>
        </select>
        <select id="filter-dept" onchange="Views.hrEmployees()">
          <option value="">全部部门</option>
          ${[...new Set(employees.map(e => e.dept))].map(d => `<option value="${d}">${d}</option>`).join("")}
        </select>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>员工</th><th>部门</th><th>岗位</th><th>带教老师</th><th>入职日期</th><th>当前天数</th><th>完成进度</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              ${employees.map(emp => {
                const p = Utils.getEmployeeProgress(emp.id);
                const st = Utils.getProgressStatus(p);
                const mentor = Utils.getUser(emp.mentorId);
                return `<tr>
                  <td><span class="table-avatar" style="background:${emp.avatarColor}">${Utils.getAvatarChar(emp.name)}</span>${emp.name}</td>
                  <td>${emp.dept}</td>
                  <td>${emp.position}</td>
                  <td>${mentor?.name || "—"}</td>
                  <td>${Utils.formatDate(emp.joinDate)}</td>
                  <td>Day ${p.currentDay}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div style="width:100px;"><div class="progress-bar"><div class="progress-fill ${st.cls}" style="width:${p.percent}%"></div></div></div>
                      <span style="font-size:12px;font-weight:600;">${p.percent}%</span>
                    </div>
                  </td>
                  <td><span class="badge badge-${st.cls === 'primary' ? 'primary' : st.cls}">${st.icon} ${st.text}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="Actions.viewEmployeeDetail('${emp.id}')">详情</button>
                    <button class="btn btn-warning btn-sm" onclick="Actions.sendReminder('${emp.id}')">催促</button>
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ----- HR：催促记录 ----- */
  hrReminders() {
    const reminders = State.data.reminders.sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
    document.getElementById("content").innerHTML = `
      <div class="page-title">催促记录</div>
      <div class="page-desc">已发送的催促通知历史</div>
      <div class="card">
        ${reminders.length === 0 ? `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-text">暂无催促记录</div></div>` : `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>员工</th><th>部门</th><th>当时进度</th><th>催促内容</th><th>发送时间</th><th>状态</th></tr></thead>
            <tbody>
              ${reminders.map(r => {
                const emp = Utils.getUser(r.employeeId);
                return `<tr>
                  <td><span class="table-avatar" style="background:${emp.avatarColor}">${Utils.getAvatarChar(emp.name)}</span>${emp.name}</td>
                  <td>${emp.dept}</td>
                  <td>${r.progressPercent || "—"}%</td>
                  <td style="max-width:250px;">${r.message}</td>
                  <td>${Utils.formatDateTime(r.sentAt)}</td>
                  <td>${r.read ? '<span class="badge badge-gray">已读</span>' : '<span class="badge badge-warning">未读</span>'}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`}
      </div>
    `;
  },

  /* ----- HR：学习计划（可编辑） ----- */
  hrPlan() {
    const categories = [...new Set(State.data.plan.map(p => p.category))];
    const totalDuration = State.data.plan.reduce((s, p) => s + p.duration, 0);
    document.getElementById("content").innerHTML = `
      <div class="page-title">学习计划管理</div>
      <div class="page-desc">共 ${State.data.plan.length} 天课程 · 总要求时长 ${Utils.formatDuration(totalDuration)} · 可自定义编制课程内容与学习时长</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${categories.map(cat => `<span class="badge badge-primary">${cat}（${State.data.plan.filter(p => p.category === cat).length}天）</span>`).join("")}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="Actions.importCourses()">📥 一键导入</button>
            <button class="btn btn-ghost btn-sm" onclick="Actions.downloadTemplate()">📄 下载模板</button>
            <button class="btn btn-primary btn-sm" onclick="Actions.addCourse()">➕ 新增课程</button>
            <button class="btn btn-ghost btn-sm" onclick="Actions.resetPlan()" style="color:var(--c-danger);">↺ 恢复默认</button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th style="width:60px;">天数</th><th>课程标题</th><th>分类</th><th style="width:90px;">要求时长</th><th>课程描述</th><th>学习要点</th><th style="width:120px;">操作</th></tr></thead>
            <tbody>
              ${State.data.plan.map((p, idx) => `
                <tr>
                  <td><strong>Day ${p.day}</strong></td>
                  <td style="font-weight:600;">${p.title}</td>
                  <td><span class="badge badge-gray">${p.category}</span></td>
                  <td><span style="font-weight:600;color:var(--c-primary);">${Utils.formatDuration(p.duration)}</span></td>
                  <td style="max-width:200px;font-size:12px;color:var(--c-text-secondary);">${p.content.length > 40 ? p.content.substring(0,40) + "..." : p.content}</td>
                  <td style="max-width:150px;font-size:12px;color:var(--c-text-secondary);">${p.points.length} 个要点</td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="Actions.editCourse(${idx})">编辑</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--c-danger);" onclick="Actions.deleteCourse(${idx})">删除</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ----- HR：管理后台 ----- */
  hrAdmin() {
    const tab = State.adminTab;
    const tabs = [
      { id: "users", icon: "👤", label: "人员管理" },
      { id: "qr", icon: "📱", label: "扫码登录" },
      { id: "settings", icon: "⚙️", label: "系统设置" },
      { id: "data", icon: "💾", label: "数据管理" },
    ];
    let tabContent = "";

    /* --- Tab: 人员管理 --- */
    if (tab === "users") {
      const employees = State.data.users.filter(u => u.role === "employee");
      const mentors = State.data.users.filter(u => u.role === "mentor");
      tabContent = `
        <div class="card">
          <div class="card-header">
            <div class="card-title">👤 新员工管理（${employees.length} 人）</div>
            <button class="btn btn-primary btn-sm" onclick="Actions.addUser('employee')">➕ 添加新员工</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>姓名</th><th>部门</th><th>岗位</th><th>带教老师</th><th>入职日期</th><th>操作</th></tr></thead>
              <tbody>
                ${employees.map(e => {
                  const mentor = Utils.getUser(e.mentorId);
                  return `<tr>
                    <td><span class="table-avatar" style="background:${e.avatarColor}">${Utils.getAvatarChar(e.name)}</span>${e.name}</td>
                    <td>${e.dept}</td>
                    <td>${e.position}</td>
                    <td>${mentor ? mentor.name : '<span style="color:var(--c-danger);">未分配</span>'}</td>
                    <td>${Utils.formatDate(e.joinDate)}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" onclick="Actions.editUser('${e.id}')">编辑</button>
                      <button class="btn btn-ghost btn-sm" style="color:var(--c-danger);" onclick="Actions.deleteUser('${e.id}')">删除</button>
                    </td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">🧑‍🏫 带教老师管理（${mentors.length} 人）</div>
            <button class="btn btn-primary btn-sm" onclick="Actions.addUser('mentor')">➕ 添加带教老师</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>姓名</th><th>部门</th><th>岗位</th><th>带教学员</th><th>操作</th></tr></thead>
              <tbody>
                ${mentors.map(m => {
                  const mentees = Utils.getMentees(m.id);
                  return `<tr>
                    <td><span class="table-avatar" style="background:${m.avatarColor}">${Utils.getAvatarChar(m.name)}</span>${m.name}</td>
                    <td>${m.dept}</td>
                    <td>${m.position}</td>
                    <td>${mentees.length > 0 ? mentees.map(me => me.name).join("、") : '<span style="color:var(--c-text-muted);">暂无</span>'}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" onclick="Actions.editUser('${m.id}')">编辑</button>
                      <button class="btn btn-ghost btn-sm" style="color:var(--c-danger);" onclick="Actions.deleteUser('${m.id}')">删除</button>
                    </td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    /* --- Tab: 扫码登录 --- */
    if (tab === "qr") {
      const loginUsers = State.data.users.filter(u => u.role !== "hr");
      const baseUrl = window.location.origin + window.location.pathname;
      tabContent = `
        <div class="card">
          <div class="card-header">
            <div class="card-title">📱 扫码登录二维码</div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-ghost btn-sm no-print" onclick="window.print()">🖨️ 打印全部</button>
            </div>
          </div>
          <div style="font-size:13px;color:var(--c-text-secondary);margin-bottom:16px;">
            将二维码发给对应员工/带教老师，扫码即可自动登录系统，无需输入姓名。<br>
            <strong>使用方式：</strong>微信/企业微信/手机相机扫码 → 浏览器打开 → 自动登录
          </div>
          <div class="qr-grid" id="qr-grid">
            ${loginUsers.map(u => {
              const token = u.loginToken || "";
              const loginUrl = baseUrl + "?t=" + token;
              const roleLabel = u.role === "employee" ? "新员工" : "带教老师";
              return `
                <div class="qr-card" data-uid="${u.id}">
                  <div class="qr-avatar" style="background:${u.avatarColor}">${Utils.getAvatarChar(u.name)}</div>
                  <div class="qr-name">${u.name}</div>
                  <div class="qr-role">${roleLabel} · ${u.position}</div>
                  <div class="qr-img" id="qr-img-${u.id}"></div>
                  <div class="qr-actions">
                    <button class="btn btn-ghost btn-sm" onclick="Actions.downloadQR('${u.id}')">📥 下载</button>
                    <button class="btn btn-ghost btn-sm" onclick="Actions.copyQrLink('${u.id}')">📋 复制链接</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--c-warning);" onclick="Actions.regenerateToken('${u.id}')">🔄 刷新令牌</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    /* --- Tab: 系统设置 --- */
    if (tab === "settings") {
      const s = State.data.settings;
      tabContent = `
        <div class="card">
          <div class="card-title" style="margin-bottom:20px;">⚙️ 系统参数设置</div>
          <div class="form-group">
            <label class="form-label">组织名称</label>
            <input class="form-input" id="set-orgName" value="${s.orgName}">
          </div>
          <div class="form-group">
            <label class="form-label">部门名称</label>
            <input class="form-input" id="set-deptName" value="${s.deptName}">
          </div>
          <div style="display:flex;gap:16px;">
            <div class="form-group" style="flex:1;">
              <label class="form-label">试用期天数</label>
              <input class="form-input" id="set-trialDays" type="number" min="7" max="180" value="${s.trialDays}">
              <div style="font-size:12px;color:var(--c-text-muted);margin-top:4px;">建议与学习计划天数一致</div>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">学习总结最少字数</label>
              <input class="form-input" id="set-minSummaryWords" type="number" min="10" step="10" value="${s.minSummaryWords}">
              <div style="font-size:12px;color:var(--c-text-muted);margin-top:4px;">员工提交总结的最低字数要求</div>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">默认学习时长（分钟）</label>
              <input class="form-input" id="set-defaultDuration" type="number" min="15" step="15" value="${s.defaultDuration}">
              <div style="font-size:12px;color:var(--c-text-muted);margin-top:4px;">新增课程时的默认时长</div>
            </div>
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn-primary" onclick="Actions.saveSettings()">💾 保存设置</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">📋 当前系统信息</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
              <div style="font-size:12px;color:var(--c-text-secondary);">课程总数</div>
              <div style="font-size:18px;font-weight:700;">${State.data.plan.length} 门</div>
            </div>
            <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
              <div style="font-size:12px;color:var(--c-text-secondary);">用户总数</div>
              <div style="font-size:18px;font-weight:700;">${State.data.users.length} 人</div>
            </div>
            <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
              <div style="font-size:12px;color:var(--c-text-secondary);">学习记录总数</div>
              <div style="font-size:18px;font-weight:700;">${State.data.records.length} 条</div>
            </div>
            <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
              <div style="font-size:12px;color:var(--c-text-secondary);">催促通知总数</div>
              <div style="font-size:18px;font-weight:700;">${State.data.reminders.length} 条</div>
            </div>
          </div>
        </div>
      `;
    }

    /* --- Tab: 数据管理 --- */
    if (tab === "data") {
      tabContent = `
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">💾 数据备份与导出</div>
          <div style="font-size:13px;color:var(--c-text-secondary);margin-bottom:16px;">将系统全部数据（用户、课程、学习记录、催促记录、设置）导出为 JSON 文件，可用于备份或迁移。</div>
          <button class="btn btn-primary" onclick="Actions.exportData()">📥 导出全部数据</button>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">📥 数据导入</div>
          <div style="font-size:13px;color:var(--c-text-secondary);margin-bottom:16px;">从之前导出的 JSON 文件恢复数据。<strong style="color:var(--c-danger);">注意：导入将覆盖当前所有数据。</strong></div>
          <label class="btn btn-ghost" style="cursor:pointer;">
            📁 选择 JSON 文件导入
            <input type="file" accept=".json" style="display:none;" onchange="Actions.importData(this)">
          </label>
        </div>
        <div class="card" style="border-left:4px solid var(--c-danger);">
          <div class="card-title" style="margin-bottom:16px;color:var(--c-danger);">⚠️ 危险操作</div>
          <div style="font-size:13px;color:var(--c-text-secondary);margin-bottom:16px;">
            <strong>重置系统：</strong>清除所有数据并恢复为初始默认状态（默认用户、30天学习计划、示例学习记录）。此操作不可撤销。
          </div>
          <button class="btn btn-danger" onclick="Actions.resetAllData()">🗑️ 重置系统为初始状态</button>
        </div>
      `;
    }

    document.getElementById("content").innerHTML = `
      <div class="page-title">管理后台</div>
      <div class="page-desc">管理系统人员、参数配置与数据</div>
      <div class="admin-tabs">
        ${tabs.map(t => `<div class="admin-tab ${tab === t.id ? "active" : ""}" onclick="Actions.switchAdminTab('${t.id}')">${t.icon} ${t.label}</div>`).join("")}
      </div>
      ${tabContent}
    `;

    /* 如果是扫码登录 Tab，渲染二维码 */
    if (tab === "qr") {
      const baseUrl = window.location.origin + window.location.pathname;
      State.data.users.filter(u => u.role !== "hr").forEach(u => {
        const container = document.getElementById("qr-img-" + u.id);
        if (container && typeof QRCode !== "undefined") {
          container.innerHTML = "";
          new QRCode(container, {
            text: baseUrl + "?t=" + (u.loginToken || ""),
            width: 160,
            height: 160,
            colorDark: "#1a1a1a",
            colorLight: "#ffffff",
          });
        }
      });
    }
  },
};

/* ===== 第八部分：计时器 ===== */

const Timer = {
  toggle() {
    if (State.timer.running) {
      this.pause();
    } else {
      this.start();
    }
  },
  start() {
    State.timer.running = true;
    const emp = State.currentUser;
    const record = Utils.getTodayRecord(emp.id);
    State.timer.recordId = record.id;

    // 如果是从已有时长恢复，减去已有秒数
    if (State.timer.seconds === 0 && record.actualDuration > 0) {
      State.timer.seconds = record.actualDuration * 60;
    }

    State.timer.intervalId = setInterval(() => {
      State.timer.seconds++;
      const display = document.getElementById("timer-display");
      if (display) display.textContent = Utils.formatSeconds(State.timer.seconds);

      // 更新进度条
      const requiredSec = record.requiredDuration * 60;
      const percent = Math.min(100, (State.timer.seconds / requiredSec) * 100);
      const fill = document.querySelector(".timer-progress .progress-fill");
      if (fill) {
        fill.style.width = percent + "%";
        if (State.timer.seconds >= requiredSec) fill.className = "progress-fill success";
      }
    }, 1000);

    document.getElementById("timer-start").style.display = "none";
    document.getElementById("timer-pause").style.display = "flex";
    toast("计时开始，专注学习！", "info");
  },
  pause() {
    State.timer.running = false;
    clearInterval(State.timer.intervalId);
    document.getElementById("timer-start").style.display = "flex";
    document.getElementById("timer-pause").style.display = "none";
    this.saveDuration();
    toast("计时已暂停，时长已保存", "warning");
  },
  stop() {
    if (State.timer.seconds === 0 && !State.timer.running) return;
    State.timer.running = false;
    clearInterval(State.timer.intervalId);
    this.saveDuration();
    toast(`学习结束，本次累计 ${Utils.formatDuration(Math.floor(State.timer.seconds / 60))}`, "success");
    State.timer.seconds = 0;
    Views.employeeToday();
  },
  saveDuration() {
    if (!State.timer.recordId) return;
    const record = State.data.records.find(r => r.id === State.timer.recordId);
    if (record) {
      const totalMinutes = Math.floor(State.timer.seconds / 60) + (record.actualDuration || 0);
      // 实际上我们用秒数累加，但存储为分钟
      // 更正：每次计时直接覆盖actualDuration为当前总分钟数
      record.actualDuration = Math.floor(State.timer.seconds / 60);
      if (record.status === "pending") record.status = "studying";
      API.save(State.data);
    }
  },
};

/* ===== 第九部分：操作动作 ===== */

const Actions = {
  /* 新员工：提交学习总结 */
  submitSummary() {
    const emp = State.currentUser;
    const record = Utils.getTodayRecord(emp.id);
    const summary = document.getElementById("summary-input").value.trim();

    if (!summary) { toast("请填写学习总结", "warning"); return; }
    if (summary.length < State.data.settings.minSummaryWords) { toast(`学习总结不少于${State.data.settings.minSummaryWords}字`, "warning"); return; }
    if (record.actualDuration < record.requiredDuration) {
      toast(`学习时长不足，要求${Utils.formatDuration(record.requiredDuration)}，当前${Utils.formatDuration(record.actualDuration)}`, "warning");
      return;
    }

    record.summary = summary;
    record.status = "submitted";
    record.submittedAt = new Date().toISOString();
    API.save(State.data);
    toast("学习总结已提交给带教老师！", "success");
    Views.employeeToday();
    Views.renderSidebar();
  },

  /* 新员工：重新提交（驳回后） */
  resubmitSummary() {
    const emp = State.currentUser;
    const record = Utils.getTodayRecord(emp.id);
    const summary = document.getElementById("summary-input").value.trim();

    if (!summary) { toast("请填写学习总结", "warning"); return; }
    if (summary.length < State.data.settings.minSummaryWords) { toast(`学习总结不少于${State.data.settings.minSummaryWords}字`, "warning"); return; }

    record.summary = summary;
    record.status = "submitted";
    record.submittedAt = new Date().toISOString();
    record.reviewedBy = null;
    record.reviewedAt = null;
    record.reviewComment = "";
    API.save(State.data);
    toast("学习总结已重新提交！", "success");
    Views.employeeToday();
  },

  /* 带教老师：打开审核弹窗 */
  openReview(recordId) {
    const record = State.data.records.find(r => r.id === recordId);
    if (!record) return;
    const emp = Utils.getUser(record.employeeId);
    const plan = State.data.plan[record.day - 1];

    Modal.open(
      "审核学习总结",
      `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <span class="table-avatar" style="background:${emp.avatarColor};width:36px;height:36px;font-size:14px;">${Utils.getAvatarChar(emp.name)}</span>
          <div>
            <div style="font-weight:600;">${emp.name}</div>
            <div style="font-size:12px;color:var(--c-text-secondary);">${emp.position} · ${emp.dept}</div>
          </div>
        </div>
        <div style="background:var(--c-primary-light);padding:12px;border-radius:6px;margin-bottom:16px;">
          <div style="font-weight:600;margin-bottom:4px;">Day ${record.day} · ${plan.title}</div>
          <div style="font-size:13px;color:var(--c-text-secondary);">📂 ${plan.category} · ⏱ 要求 ${Utils.formatDuration(record.requiredDuration)}</div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:16px;font-size:13px;">
          <div><span style="color:var(--c-text-secondary);">实际学习时长：</span><strong>${Utils.formatDuration(record.actualDuration)}</strong></div>
          <div><span style="color:var(--c-text-secondary);">提交时间：</span>${Utils.formatDateTime(record.submittedAt)}</div>
        </div>
        <div class="form-group">
          <label class="form-label">学习总结</label>
          <div style="background:var(--c-bg);padding:14px;border-radius:6px;font-size:13px;line-height:1.8;">${record.summary}</div>
        </div>
        <div class="form-group">
          <label class="form-label">审核评语</label>
          <textarea class="form-textarea" id="review-comment" placeholder="请输入审核评语..." style="min-height:80px;"></textarea>
        </div>
      `,
      `
        <button class="btn btn-danger" onclick="Actions.doReview('${recordId}', 'rejected')">❌ 驳回</button>
        <button class="btn btn-success" onclick="Actions.doReview('${recordId}', 'approved')">✅ 通过</button>
      `
    );
  },

  /* 带教老师：执行审核 */
  doReview(recordId, status) {
    const record = State.data.records.find(r => r.id === recordId);
    if (!record) return;
    const comment = document.getElementById("review-comment").value.trim();

    record.status = status;
    record.reviewedBy = State.currentUser.id;
    record.reviewedAt = new Date().toISOString();
    record.reviewComment = comment || (status === "approved" ? "审核通过" : "需修改后重新提交");

    API.save(State.data);
    Modal.close();
    toast(status === "approved" ? "已通过审核！" : "已驳回，等待学员重新提交", status === "approved" ? "success" : "warning");
    Views.mentorPending();
    Views.renderSidebar();
  },

  /* 带教老师：查看已审核详情 */
  openReviewDetail(recordId) {
    const record = State.data.records.find(r => r.id === recordId);
    if (!record) return;
    const emp = Utils.getUser(record.employeeId);
    const plan = State.data.plan[record.day - 1];

    Modal.open(
      "学习总结详情",
      `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <span class="table-avatar" style="background:${emp.avatarColor};width:36px;height:36px;font-size:14px;">${Utils.getAvatarChar(emp.name)}</span>
          <div>
            <div style="font-weight:600;">${emp.name}</div>
            <div style="font-size:12px;color:var(--c-text-secondary);">${emp.position}</div>
          </div>
        </div>
        <div style="background:var(--c-primary-light);padding:12px;border-radius:6px;margin-bottom:16px;">
          <div style="font-weight:600;">Day ${record.day} · ${plan.title}</div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:16px;font-size:13px;">
          <div><span style="color:var(--c-text-secondary);">学习时长：</span><strong>${Utils.formatDuration(record.actualDuration)}</strong></div>
          <div><span style="color:var(--c-text-secondary);">审核时间：</span>${Utils.formatDateTime(record.reviewedAt)}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:6px;">学习总结</div>
          <div style="background:var(--c-bg);padding:14px;border-radius:6px;font-size:13px;line-height:1.8;">${record.summary}</div>
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;margin-bottom:6px;">审核评语</div>
          <div style="background:${record.status === 'approved' ? 'var(--c-success-light)' : 'var(--c-danger-light)'};padding:14px;border-radius:6px;font-size:13px;">${record.reviewComment}</div>
        </div>
      `,
      `<button class="btn btn-ghost" onclick="Modal.close()">关闭</button>`
    );
  },

  /* HR：查看员工详情 */
  viewEmployeeDetail(empId) {
    const emp = Utils.getUser(empId);
    const records = Utils.getEmployeeRecords(empId);
    const progress = Utils.getEmployeeProgress(empId);
    const mentor = Utils.getUser(emp.mentorId);
    const st = Utils.getProgressStatus(progress);

    Modal.open(
      `${emp.name} · 学习详情`,
      `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <span class="table-avatar" style="background:${emp.avatarColor};width:40px;height:40px;font-size:16px;">${Utils.getAvatarChar(emp.name)}</span>
          <div>
            <div style="font-weight:600;font-size:16px;">${emp.name}</div>
            <div style="font-size:12px;color:var(--c-text-secondary);">${emp.dept} · ${emp.position}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
            <div style="font-size:12px;color:var(--c-text-secondary);">带教老师</div>
            <div style="font-weight:600;">${mentor?.name || "—"}</div>
          </div>
          <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
            <div style="font-size:12px;color:var(--c-text-secondary);">入职日期</div>
            <div style="font-weight:600;">${Utils.formatDate(emp.joinDate)}</div>
          </div>
          <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
            <div style="font-size:12px;color:var(--c-text-secondary);">当前天数</div>
            <div style="font-weight:600;">Day ${progress.currentDay} / 30</div>
          </div>
          <div style="background:var(--c-bg);padding:12px;border-radius:6px;">
            <div style="font-size:12px;color:var(--c-text-secondary);">完成进度</div>
            <div style="font-weight:600;color:var(--c-${st.cls === 'primary' ? 'primary' : st.cls});">${progress.percent}% (${st.text})</div>
          </div>
        </div>
        <div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:600;">学习进度</span>
            <span style="font-size:13px;">✅${progress.completed} ⏳${progress.submitted} ❌${progress.rejected} ⬜${progress.pending}</span>
          </div>
          <div class="progress-bar" style="height:12px;"><div class="progress-fill ${st.cls}" style="width:${progress.percent}%"></div></div>
        </div>
        <div style="margin-top:20px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px;">每日学习记录</div>
          <div style="max-height:300px;overflow-y:auto;">
            <table style="font-size:12px;">
              <thead><tr><th>天</th><th>内容</th><th>时长</th><th>状态</th></tr></thead>
              <tbody>
                ${records.map(r => {
                  const plan = State.data.plan[r.day - 1];
                  return `<tr><td>D${r.day}</td><td style="max-width:140px;">${plan?.title || "—"}</td><td>${r.actualDuration > 0 ? Utils.formatDuration(r.actualDuration) : "—"}</td><td>${Utils.statusBadge(r.status)}</td></tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">关闭</button>
        <button class="btn btn-warning" onclick="Modal.close();Actions.sendReminder('${empId}')">🔔 催促</button>
      `
    );
  },

  /* HR：发送催促 */
  sendReminder(empId) {
    const emp = Utils.getUser(empId);
    const progress = Utils.getEmployeeProgress(empId);
    const defaultMsg = `您当前的学习进度为 ${progress.percent}%（已完成${progress.completed}天），低于预期进度，请尽快完成学习任务并提交学习总结。`;

    Modal.open(
      `催促 — ${emp.name}`,
      `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <span class="table-avatar" style="background:${emp.avatarColor}">${Utils.getAvatarChar(emp.name)}</span>
          <div>
            <div style="font-weight:600;">${emp.name}</div>
            <div style="font-size:12px;color:var(--c-text-secondary);">当前进度：${progress.percent}% · Day ${progress.currentDay}</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">催促内容</label>
          <textarea class="form-textarea" id="reminder-message" placeholder="请输入催促内容...">${defaultMsg}</textarea>
        </div>
        <div style="font-size:12px;color:var(--c-text-muted);">催促通知将显示在员工今日任务页面顶部</div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-warning" onclick="Actions.doSendReminder('${empId}')">🔔 发送催促</button>
      `
    );
  },

  doSendReminder(empId) {
    const emp = Utils.getUser(empId);
    const progress = Utils.getEmployeeProgress(empId);
    const message = document.getElementById("reminder-message").value.trim() || "请尽快完成学习任务";

    State.data.reminders.push({
      id: "rm_" + Date.now(),
      employeeId: empId,
      message: message,
      sentAt: new Date().toISOString(),
      sentBy: State.currentUser.id,
      progressPercent: progress.percent,
      read: false,
    });
    API.save(State.data);
    Modal.close();
    toast(`已向 ${emp.name} 发送催促通知`, "success");
  },

  /* ===== 课程管理：新增课程 ===== */
  addCourse() {
    const categories = [...new Set(State.data.plan.map(p => p.category))];
    const nextDay = State.data.plan.length + 1;
    Modal.open(
      "新增课程",
      `
        <div class="form-group">
          <label class="form-label">课程标题 <span class="required">*</span></label>
          <input class="form-input" id="course-title" placeholder="如：产品知识培训">
        </div>
        <div style="display:flex;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">分类 <span class="required">*</span></label>
            <input class="form-input" id="course-category" list="category-list" placeholder="选择或输入分类" value="${categories[0] || ""}">
            <datalist id="category-list">${categories.map(c => `<option value="${c}">`).join("")}</datalist>
          </div>
          <div class="form-group" style="width:140px;">
            <label class="form-label">要求学习时长（分钟）<span class="required">*</span></label>
            <input class="form-input" id="course-duration" type="number" min="15" step="15" value="60">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">课程描述 <span class="required">*</span></label>
          <textarea class="form-textarea" id="course-content" placeholder="描述本课程的学习内容与目标..." style="min-height:80px;"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">学习要点（每行一个）</label>
          <textarea class="form-textarea" id="course-points" placeholder="要点1&#10;要点2&#10;要点3" style="min-height:100px;"></textarea>
        </div>
        <div style="font-size:12px;color:var(--c-text-muted);">该课程将排为 Day ${nextDay}</div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" onclick="Actions.saveCourse(true)">保存课程</button>
      `
    );
  },

  /* ===== 课程管理：编辑课程 ===== */
  editCourse(idx) {
    const course = State.data.plan[idx];
    if (!course) return;
    const categories = [...new Set(State.data.plan.map(p => p.category))];
    Modal.open(
      `编辑课程 — Day ${course.day}`,
      `
        <div class="form-group">
          <label class="form-label">课程标题 <span class="required">*</span></label>
          <input class="form-input" id="course-title" value="${course.title}">
        </div>
        <div style="display:flex;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">分类 <span class="required">*</span></label>
            <input class="form-input" id="course-category" list="category-list" value="${course.category}">
            <datalist id="category-list">${categories.map(c => `<option value="${c}">`).join("")}</datalist>
          </div>
          <div class="form-group" style="width:140px;">
            <label class="form-label">要求时长（分钟）<span class="required">*</span></label>
            <input class="form-input" id="course-duration" type="number" min="15" step="15" value="${course.duration}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">课程描述 <span class="required">*</span></label>
          <textarea class="form-textarea" id="course-content" style="min-height:80px;">${course.content}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">学习要点（每行一个）</label>
          <textarea class="form-textarea" id="course-points" style="min-height:100px;">${course.points.join("\n")}</textarea>
        </div>
        <div style="font-size:12px;color:var(--c-warning);">⚠️ 修改学习时长后，尚未提交的当日学习记录将自动更新要求时长</div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" onclick="Actions.saveCourse(false, ${idx})">保存修改</button>
      `
    );
  },

  /* ===== 课程管理：保存课程 ===== */
  saveCourse(isNew, idx) {
    const title = document.getElementById("course-title").value.trim();
    const category = document.getElementById("course-category").value.trim();
    const duration = parseInt(document.getElementById("course-duration").value);
    const content = document.getElementById("course-content").value.trim();
    const pointsRaw = document.getElementById("course-points").value.trim();

    if (!title) { toast("请填写课程标题", "warning"); return; }
    if (!category) { toast("请填写分类", "warning"); return; }
    if (!duration || duration < 15) { toast("学习时长至少15分钟", "warning"); return; }
    if (!content) { toast("请填写课程描述", "warning"); return; }

    const points = pointsRaw ? pointsRaw.split("\n").map(s => s.trim()).filter(s => s) : ["（待补充学习要点）"];

    if (isNew) {
      const nextDay = State.data.plan.length + 1;
      State.data.plan.push({ day: nextDay, title, category, duration, content, points });
      // 为所有员工创建该天的待学习记录（如果该天还没有记录的话）
      State.data.users.filter(u => u.role === "employee").forEach(emp => {
        const exists = State.data.records.find(r => r.employeeId === emp.id && r.day === nextDay);
        if (!exists) {
          const joinDate = new Date(emp.joinDate);
          const recordDate = new Date(joinDate);
          recordDate.setDate(recordDate.getDate() + nextDay - 1);
          State.data.records.push({
            id: `lr_${emp.id}_${nextDay}`,
            employeeId: emp.id, day: nextDay,
            date: recordDate.toISOString().split("T")[0],
            status: "pending", actualDuration: 0,
            requiredDuration: duration, summary: "",
            submittedAt: null, reviewedBy: null, reviewedAt: null, reviewComment: "",
          });
        }
      });
    } else {
      const course = State.data.plan[idx];
      const oldDuration = course.duration;
      course.title = title;
      course.category = category;
      course.duration = duration;
      course.content = content;
      course.points = points;
      // 更新尚未提交的记录的要求时长
      if (oldDuration !== duration) {
        State.data.records.forEach(r => {
          if (r.day === course.day && (r.status === "pending" || r.status === "studying")) {
            r.requiredDuration = duration;
          }
        });
      }
    }

    API.save(State.data);
    Modal.close();
    toast(isNew ? "课程已新增！" : "课程已更新！", "success");
    Views.hrPlan();
  },

  /* ===== 课程管理：删除课程 ===== */
  deleteCourse(idx) {
    const course = State.data.plan[idx];
    if (!course) return;
    const hasRecords = State.data.records.some(r => r.day === course.day && r.status !== "pending");
    Modal.open(
      "确认删除课程",
      `
        <div style="margin-bottom:16px;">
          <div style="font-size:14px;margin-bottom:8px;">确定要删除以下课程吗？</div>
          <div style="background:var(--c-danger-light);padding:12px;border-radius:6px;">
            <strong>Day ${course.day} · ${course.title}</strong>
          </div>
          ${hasRecords ? `<div style="margin-top:12px;font-size:13px;color:var(--c-danger);">⚠️ 该课程已有员工学习记录，删除后相关记录将一并移除，后续课程天数将自动前移。</div>` : `<div style="margin-top:12px;font-size:13px;color:var(--c-text-secondary);">该课程尚无学习记录，可安全删除。后续课程天数将自动前移。</div>`}
        </div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-danger" onclick="Actions.doDeleteCourse(${idx})">确认删除</button>
      `
    );
  },

  doDeleteCourse(idx) {
    const course = State.data.plan[idx];
    // 删除相关记录
    State.data.records = State.data.records.filter(r => r.day !== course.day);
    // 从计划中删除
    State.data.plan.splice(idx, 1);
    // 重新编号
    State.data.plan.forEach((p, i) => { p.day = i + 1; });
    // 重新编号记录中的 day 字段（基于日期匹配）
    // 实际上已删除该day的记录，其余记录的day可能需要调整
    // 简化处理：记录中day大于被删day的，day-1
    State.data.records.forEach(r => {
      if (r.day > course.day) r.day -= 1;
    });
    API.save(State.data);
    Modal.close();
    toast("课程已删除，后续天数已自动调整", "success");
    Views.hrPlan();
  },

  /* ===== 课程管理：一键导入 ===== */
  importCourses() {
    Modal.open(
      "一键导入课程",
      `
        <div style="background:var(--c-primary-light);padding:14px;border-radius:6px;margin-bottom:16px;font-size:13px;line-height:1.8;">
          <strong>导入格式说明：</strong><br>
          每行一门课程，字段用竖线 <code style="background:#fff;padding:1px 4px;border-radius:3px;">|</code> 分隔：<br>
          <code style="background:#fff;padding:2px 6px;border-radius:3px;font-size:12px;">课程标题 | 分类 | 时长(分钟) | 课程描述 | 要点1;要点2;要点3</code><br><br>
          <strong>示例：</strong><br>
          <code style="background:#fff;padding:2px 6px;border-radius:3px;font-size:12px;display:block;margin-top:4px;white-space:pre-wrap;">公司简介与发展历程 | 企业文化 | 60 | 了解公司发展历程与愿景 | 发展大事记;企业愿景使命;全球化布局
产品体系总览-沙发 | 产品知识 | 90 | 学习沙发产品线与材质工艺 | 产品系列定位;材质工艺;价格体系</code>
        </div>
        <div class="form-group">
          <label class="form-label">粘贴课程内容</label>
          <textarea class="form-textarea" id="import-text" placeholder="在此粘贴课程内容，每行一门课程..." style="min-height:200px;font-family:monospace;font-size:13px;"></textarea>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <label class="btn btn-ghost btn-sm" style="cursor:pointer;">
            📁 选择文件导入
            <input type="file" accept=".txt,.csv" style="display:none;" onchange="Actions.handleFileImport(this)">
          </label>
          <span style="font-size:12px;color:var(--c-text-muted);">支持 .txt / .csv 文件</span>
        </div>
        <div style="margin-top:12px;font-size:12px;color:var(--c-text-muted);">导入的课程将追加到现有计划末尾</div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" onclick="Actions.doImport()">📥 导入</button>
      `
    );
  },

  handleFileImport(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("import-text").value = e.target.result;
      toast("文件已读取，请检查内容后点击导入", "info");
    };
    reader.readAsText(file, "UTF-8");
  },

  doImport() {
    const text = document.getElementById("import-text").value.trim();
    if (!text) { toast("请粘贴或导入课程内容", "warning"); return; }

    const lines = text.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    if (lines.length === 0) { toast("未检测到有效课程内容", "warning"); return; }

    let success = 0, fail = 0;
    const startDay = State.data.plan.length + 1;

    lines.forEach((line, i) => {
      const parts = line.split("|").map(s => s.trim());
      if (parts.length < 4) { fail++; return; }

      const title = parts[0];
      const category = parts[1] || "未分类";
      const duration = parseInt(parts[2]) || 60;
      const content = parts[3] || "";
      const points = parts[4] ? parts[4].split(";").map(s => s.trim()).filter(s => s) : ["（待补充）"];

      if (!title || !content) { fail++; return; }

      const day = startDay + success;
      State.data.plan.push({ day, title, category, duration, content, points });

      // 为所有员工创建待学习记录
      State.data.users.filter(u => u.role === "employee").forEach(emp => {
        const exists = State.data.records.find(r => r.employeeId === emp.id && r.day === day);
        if (!exists) {
          const joinDate = new Date(emp.joinDate);
          const recordDate = new Date(joinDate);
          recordDate.setDate(recordDate.getDate() + day - 1);
          State.data.records.push({
            id: `lr_${emp.id}_${day}`,
            employeeId: emp.id, day,
            date: recordDate.toISOString().split("T")[0],
            status: "pending", actualDuration: 0,
            requiredDuration: duration, summary: "",
            submittedAt: null, reviewedBy: null, reviewedAt: null, reviewComment: "",
          });
        }
      });
      success++;
    });

    API.save(State.data);
    Modal.close();
    if (success > 0) {
      toast(`成功导入 ${success} 门课程${fail > 0 ? `，${fail} 行格式有误已跳过` : ""}`, "success");
      Views.hrPlan();
    } else {
      toast("导入失败，请检查格式（每行至少4个字段，用 | 分隔）", "danger");
    }
  },

  /* ===== 课程管理：下载模板 ===== */
  downloadTemplate() {
    const sample = `# 试用期学习计划课程模板
# 格式：课程标题 | 分类 | 时长(分钟) | 课程描述 | 要点1;要点2;要点3
# 每行一门课程，以 # 开头的行会被忽略
公司简介与发展历程 | 企业文化 | 60 | 了解公司发展历程、企业愿景与使命 | 发展大事记;企业愿景使命;全球化布局
企业文化与核心价值观 | 企业文化 | 60 | 深入学习企业品牌理念与行为准则 | 品牌理念;员工行为准则;社会责任
产品体系总览-沙发 | 产品知识 | 90 | 系统学习沙发产品线及材质工艺 | 产品系列定位;材质工艺;价格体系
门店运营基础流程 | 门店运营 | 60 | 学习门店日常运营标准流程 | 门店SOP;陈列标准;开闭店流程
数字化工具使用培训 | 系统操作 | 75 | 学习内部系统操作 | ERP操作;CRM流程;OA审批`;

    const blob = new Blob([sample], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "学习计划课程模板.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast("模板已下载，填写后可一键导入", "success");
  },

  /* ===== 课程管理：恢复默认计划 ===== */
  resetPlan() {
    Modal.open(
      "恢复默认学习计划",
      `<div style="font-size:14px;margin-bottom:12px;">确定要恢复为系统默认的学习计划吗？</div>
       <div style="font-size:13px;color:var(--c-danger);background:var(--c-danger-light);padding:12px;border-radius:6px;">⚠️ 此操作将覆盖当前所有自定义课程，已审核的学习记录不受影响，但未完成记录的要求时长将按默认计划更新。</div>`,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-danger" onclick="Actions.doResetPlan()">确认恢复</button>
      `
    );
  },

  doResetPlan() {
    // 恢复默认计划
    State.data.plan = JSON.parse(JSON.stringify(LEARNING_PLAN));
    // 更新未完成记录的要求时长
    State.data.records.forEach(r => {
      if (r.status === "pending" || r.status === "studying") {
        const plan = State.data.plan[r.day - 1];
        if (plan) r.requiredDuration = plan.duration;
      }
    });
    API.save(State.data);
    Modal.close();
    toast("已恢复默认学习计划", "success");
    Views.hrPlan();
  },

  /* ===== 管理后台：切换 Tab ===== */
  switchAdminTab(tabId) {
    State.adminTab = tabId;
    Views.hrAdmin();
  },

  /* ===== 管理后台：添加用户 ===== */
  addUser(role) {
    const mentors = State.data.users.filter(u => u.role === "mentor");
    const title = role === "employee" ? "添加新员工" : "添加带教老师";
    const today = new Date().toISOString().split("T")[0];
    Modal.open(
      title,
      `
        <div class="form-group">
          <label class="form-label">姓名 <span class="required">*</span></label>
          <input class="form-input" id="user-name" placeholder="请输入姓名">
        </div>
        <div style="display:flex;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">部门 <span class="required">*</span></label>
            <input class="form-input" id="user-dept" placeholder="如：门店运营中心">
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">岗位 <span class="required">*</span></label>
            <input class="form-input" id="user-position" placeholder="如：导购员">
          </div>
        </div>
        ${role === "employee" ? `
          <div style="display:flex;gap:16px;">
            <div class="form-group" style="flex:1;">
              <label class="form-label">带教老师 <span class="required">*</span></label>
              <select class="form-select" id="user-mentorId">
                ${mentors.length > 0 ? mentors.map(m => `<option value="${m.id}">${m.name}（${m.dept}）</option>`).join("") : '<option value="">暂无带教老师，请先添加</option>'}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">入职日期 <span class="required">*</span></label>
              <input class="form-input" id="user-joinDate" type="date" value="${today}">
            </div>
          </div>
        ` : ""}
        <div class="form-group">
          <label class="form-label">头像颜色</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${["#2563eb","#0891b2","#7c3aed","#16a34a","#d97706","#dc2626","#db2777","#4f46e5"].map(c =>
              `<label style="cursor:pointer;"><input type="radio" name="avatarColor" value="${c}" ${c === "#2563eb" ? "checked" : ""} style="display:none;"><span class="color-swatch" style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${c};border:2px solid transparent;"></span></label>`
            ).join("")}
          </div>
        </div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" onclick="Actions.saveUser('${role}', true)">保存</button>
      `
    );
  },

  /* ===== 管理后台：编辑用户 ===== */
  editUser(userId) {
    const user = Utils.getUser(userId);
    if (!user) return;
    const mentors = State.data.users.filter(u => u.role === "mentor" && u.id !== userId);
    Modal.open(
      `编辑用户 — ${user.name}`,
      `
        <div class="form-group">
          <label class="form-label">姓名 <span class="required">*</span></label>
          <input class="form-input" id="user-name" value="${user.name}">
        </div>
        <div style="display:flex;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">部门 <span class="required">*</span></label>
            <input class="form-input" id="user-dept" value="${user.dept}">
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">岗位 <span class="required">*</span></label>
            <input class="form-input" id="user-position" value="${user.position}">
          </div>
        </div>
        ${user.role === "employee" ? `
          <div style="display:flex;gap:16px;">
            <div class="form-group" style="flex:1;">
              <label class="form-label">带教老师</label>
              <select class="form-select" id="user-mentorId">
                ${mentors.map(m => `<option value="${m.id}" ${m.id === user.mentorId ? "selected" : ""}>${m.name}（${m.dept}）</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">入职日期</label>
              <input class="form-input" id="user-joinDate" type="date" value="${user.joinDate}">
            </div>
          </div>
        ` : ""}
        <div class="form-group">
          <label class="form-label">头像颜色</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${["#2563eb","#0891b2","#7c3aed","#16a34a","#d97706","#dc2626","#db2777","#4f46e5"].map(c =>
              `<label style="cursor:pointer;"><input type="radio" name="avatarColor" value="${c}" ${c === user.avatarColor ? "checked" : ""} style="display:none;"><span class="color-swatch" style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${c};border:2px solid ${c === user.avatarColor ? 'var(--c-text)' : 'transparent'};"></span></label>`
            ).join("")}
          </div>
        </div>
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" onclick="Actions.saveUser('${user.role}', false, '${userId}')">保存修改</button>
      `
    );
  },

  /* ===== 管理后台：保存用户 ===== */
  saveUser(role, isNew, userId) {
    const name = document.getElementById("user-name").value.trim();
    const dept = document.getElementById("user-dept").value.trim();
    const position = document.getElementById("user-position").value.trim();
    const avatarColor = document.querySelector('input[name="avatarColor"]:checked')?.value || "#2563eb";

    if (!name) { toast("请填写姓名", "warning"); return; }
    if (!dept) { toast("请填写部门", "warning"); return; }
    if (!position) { toast("请填写岗位", "warning"); return; }

    if (isNew) {
      const newId = "u" + Date.now();
      const user = { id: newId, name, role, dept, position, avatarColor, loginToken: "lt_" + newId + "_" + Math.random().toString(36).slice(2, 10) };
      if (role === "employee") {
        const mentorId = document.getElementById("user-mentorId")?.value;
        const joinDate = document.getElementById("user-joinDate")?.value || new Date().toISOString().split("T")[0];
        if (!mentorId) { toast("请先添加带教老师", "warning"); return; }
        user.mentorId = mentorId;
        user.joinDate = joinDate;
        // 生成学习记录
        const joinDateObj = new Date(joinDate);
        const daysSinceJoin = Math.floor((new Date() - joinDateObj) / (1000 * 60 * 60 * 24)) + 1;
        const planLen = State.data.plan.length;
        const completedDays = Math.min(Math.max(daysSinceJoin, 1), planLen);
        for (let d = 1; d <= completedDays; d++) {
          const plan = State.data.plan[d - 1];
          const recordDate = new Date(joinDateObj);
          recordDate.setDate(recordDate.getDate() + d - 1);
          State.data.records.push({
            id: `lr_${newId}_${d}`,
            employeeId: newId, day: d,
            date: recordDate.toISOString().split("T")[0],
            status: d < completedDays ? "pending" : "pending",
            actualDuration: 0, requiredDuration: plan.duration, summary: "",
            submittedAt: null, reviewedBy: null, reviewedAt: null, reviewComment: "",
          });
        }
      }
      State.data.users.push(user);
    } else {
      const user = Utils.getUser(userId);
      if (!user) return;
      user.name = name;
      user.dept = dept;
      user.position = position;
      user.avatarColor = avatarColor;
      if (role === "employee") {
        const newMentorId = document.getElementById("user-mentorId")?.value;
        const newJoinDate = document.getElementById("user-joinDate")?.value;
        if (newMentorId) user.mentorId = newMentorId;
        if (newJoinDate) user.joinDate = newJoinDate;
      }
    }

    API.save(State.data);
    Modal.close();
    toast(isNew ? "用户已添加！" : "用户信息已更新！", "success");
    Views.hrAdmin();
  },

  /* ===== 管理后台：删除用户 ===== */
  deleteUser(userId) {
    const user = Utils.getUser(userId);
    if (!user) return;
    const mentees = user.role === "mentor" ? Utils.getMentees(userId) : [];
    Modal.open(
      `确认删除 — ${user.name}`,
      `
        <div style="font-size:14px;margin-bottom:12px;">确定要删除用户 <strong>${user.name}</strong>（${user.role === "employee" ? "新员工" : "带教老师"}）吗？</div>
        ${user.role === "employee"
          ? `<div style="font-size:13px;color:var(--c-danger);background:var(--c-danger-light);padding:12px;border-radius:6px;">⚠️ 该员工的所有学习记录将一并删除，此操作不可撤销。</div>`
          : mentees.length > 0
            ? `<div style="font-size:13px;color:var(--c-danger);background:var(--c-danger-light);padding:12px;border-radius:6px;">⚠️ 该带教老师名下还有 ${mentees.length} 名学员（${mentees.map(m => m.name).join("、")}），删除后这些学员将变为未分配状态。</div>`
            : `<div style="font-size:13px;color:var(--c-text-secondary);">该带教老师名下无学员，可安全删除。</div>`
        }
      `,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-danger" onclick="Actions.doDeleteUser('${userId}')">确认删除</button>
      `
    );
  },

  doDeleteUser(userId) {
    const user = Utils.getUser(userId);
    if (!user) return;
    // 删除该用户的所有学习记录
    State.data.records = State.data.records.filter(r => r.employeeId !== userId);
    // 删除该用户相关的催促记录
    State.data.reminders = State.data.reminders.filter(r => r.employeeId !== userId && r.sentBy !== userId);
    // 如果是带教老师，解除带教关系
    if (user.role === "mentor") {
      State.data.users.forEach(u => { if (u.mentorId === userId) u.mentorId = null; });
    }
    // 从用户列表中删除
    State.data.users = State.data.users.filter(u => u.id !== userId);
    API.save(State.data);
    Modal.close();
    toast(`已删除用户 ${user.name}`, "success");
    Views.hrAdmin();
  },

  /* ===== 管理后台：保存系统设置 ===== */
  saveSettings() {
    const orgName = document.getElementById("set-orgName").value.trim();
    const deptName = document.getElementById("set-deptName").value.trim();
    const trialDays = parseInt(document.getElementById("set-trialDays").value);
    const minSummaryWords = parseInt(document.getElementById("set-minSummaryWords").value);
    const defaultDuration = parseInt(document.getElementById("set-defaultDuration").value);

    if (!orgName || !deptName) { toast("请填写组织名称和部门名称", "warning"); return; }
    if (!trialDays || trialDays < 7) { toast("试用期天数至少7天", "warning"); return; }
    if (!minSummaryWords || minSummaryWords < 10) { toast("总结最少字数至少10字", "warning"); return; }

    State.data.settings = { orgName, deptName, trialDays, minSummaryWords, defaultDuration: defaultDuration || 60 };
    API.save(State.data);
    toast("系统设置已保存！", "success");
  },

  /* ===== 管理后台：导出数据 ===== */
  exportData() {
    const dataStr = JSON.stringify(State.data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `试用期学习管理系统_数据备份_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("数据已导出", "success");
  },

  /* ===== 管理后台：导入数据 ===== */
  importData(input) {
    const file = input.files[0];
    if (!file) return;
    Modal.open(
      "确认导入数据",
      `<div style="font-size:14px;margin-bottom:12px;">已选择文件：<strong>${file.name}</strong></div>
       <div style="font-size:13px;color:var(--c-danger);background:var(--c-danger-light);padding:12px;border-radius:6px;">⚠️ 导入将覆盖当前所有数据，此操作不可撤销。建议先导出当前数据作为备份。</div>`,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-danger" onclick="Actions.doImportData('${file.name}')">确认导入</button>
      `
    );
    // 存储文件引用
    State._importFile = file;
  },

  doImportData(fileName) {
    if (!State._importFile) { toast("未选择文件", "warning"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.users || !data.plan || !data.records) {
          toast("文件格式不正确，缺少必要字段", "danger");
          return;
        }
        State.data = data;
        if (!State.data.settings) {
          State.data.settings = { trialDays: 30, minSummaryWords: 50, defaultDuration: 60, orgName: "顾家家居", deptName: "人才发展中心" };
        }
        API.save(State.data);
        Modal.close();
        toast("数据导入成功！", "success");
        Views.hrAdmin();
      } catch(err) {
        toast("文件解析失败，请检查格式", "danger");
      }
    };
    reader.readAsText(State._importFile, "UTF-8");
    State._importFile = null;
  },

  /* ===== 扫码登录：下载二维码 ===== */
  downloadQR(userId) {
    const container = document.getElementById("qr-img-" + userId);
    if (!container) return;
    const canvas = container.querySelector("canvas");
    const img = container.querySelector("img");
    const user = Utils.getUser(userId);
    let dataUrl;
    if (canvas) {
      dataUrl = canvas.toDataURL("image/png");
    } else if (img) {
      dataUrl = img.src;
    } else {
      toast("二维码未生成", "warning");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `扫码登录-${user.name}.png`;
    a.click();
    toast(`已下载 ${user.name} 的二维码`, "success");
  },

  /* ===== 扫码登录：复制链接 ===== */
  async copyQrLink(userId) {
    const user = Utils.getUser(userId);
    const baseUrl = window.location.origin + window.location.pathname;
    const link = baseUrl + "?t=" + (user.loginToken || "");
    try {
      await navigator.clipboard.writeText(link);
      toast(`已复制 ${user.name} 的登录链接`, "success");
    } catch {
      // 降级方案
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast(`已复制 ${user.name} 的登录链接`, "success");
    }
  },

  /* ===== 扫码登录：重新生成令牌 ===== */
  async regenerateToken(userId) {
    const user = Utils.getUser(userId);
    Modal.open(
      "刷新扫码令牌",
      `<div style="font-size:14px;margin-bottom:12px;">确定要为 <strong>${user.name}</strong> 重新生成扫码登录令牌吗？</div>
       <div style="font-size:13px;color:var(--c-warning);background:#fef3c7;padding:12px;border-radius:6px;">
         ⚠️ 操作后旧的二维码将失效，需要重新分享新的二维码给该用户。
       </div>`,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" onclick="Actions.doRegenerateToken('${userId}')">确认刷新</button>
      `
    );
  },

  async doRegenerateToken(userId) {
    try {
      await API.regenerateToken(userId);
      Modal.close();
      toast("令牌已刷新，请重新分享二维码", "success");
      Views.hrAdmin();
    } catch (e) {
      toast("操作失败，请重试", "danger");
    }
  },

  /* ===== 管理后台：重置系统 ===== */
  resetAllData() {
    Modal.open(
      "重置系统",
      `<div style="font-size:14px;margin-bottom:12px;">确定要重置系统吗？</div>
       <div style="font-size:13px;color:var(--c-danger);background:var(--c-danger-light);padding:12px;border-radius:6px;">
         ⚠️ 此操作将：<br>
         • 清除所有自定义用户和课程<br>
         • 清除所有学习记录和催促记录<br>
         • 恢复为系统默认的初始数据<br>
         <strong>此操作不可撤销！</strong>
       </div>`,
      `
        <button class="btn btn-ghost" onclick="Modal.close()">取消</button>
        <button class="btn btn-danger" onclick="Actions.doResetAllData()">确认重置</button>
      `
    );
  },

  async doResetAllData() {
    State.data = await API.reset();
    State.currentUser = null;
    API.logout();
    Modal.close();
    toast("系统已重置，请重新登录", "success");
    document.getElementById("main-view").classList.add("hidden");
    document.getElementById("login-view").classList.remove("hidden");
    showRoleCards();
  },
};

/* ===== 第十部分：导航与路由 ===== */

const ROUTES = {
  employee: { today: Views.employeeToday, history: Views.employeeHistory },
  mentor: { pending: Views.mentorPending, reviewed: Views.mentorReviewed },
  hr: { dashboard: Views.hrDashboard, employees: Views.hrEmployees, reminders: Views.hrReminders, plan: Views.hrPlan, admin: Views.hrAdmin },
};

function navigateTo(view) {
  State.currentView = view;
  Views.renderSidebar();
  const route = ROUTES[State.currentUser.role]?.[view];
  if (route) route.call(Views);
}

/* ===== 第十一部分：登录流程 ===== */

function showLoginPage() {
  document.getElementById("login-view").classList.remove("hidden");
  document.getElementById("main-view").classList.add("hidden");
  // 重置 HR 登录表单
  const hrForm = document.getElementById("hr-login-form");
  if (hrForm) hrForm.classList.add("hidden");
  const hrInput = document.getElementById("hr-name-input");
  if (hrInput) hrInput.value = "";
}

/* ----- 内置扫码器 ----- */
let _scannerStream = null;
let _scannerRAF = null;

function setupScanner() {
  const scanBtn = document.getElementById("scan-btn");
  const closeBtn = document.getElementById("scanner-close");

  if (scanBtn) {
    scanBtn.addEventListener("click", startScanner);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", stopScanner);
  }
}

async function startScanner() {
  const overlay = document.getElementById("scanner-overlay");
  const video = document.getElementById("scanner-video");
  const canvas = document.getElementById("scanner-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  try {
    _scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = _scannerStream;
    overlay.classList.remove("hidden");
  } catch (e) {
    toast("无法访问摄像头，请用微信扫码登录", "danger");
    return;
  }

  // 扫码循环
  function scan() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        // 解析二维码内容，提取 token
        let token = null;
        try {
          const scannedUrl = new URL(code.data);
          token = scannedUrl.searchParams.get("t");
        } catch {
          // 可能直接是 token 字符串
          token = code.data.trim();
        }

        if (token) {
          stopScanner();
          doQrLogin(token);
          return;
        }
      }
    }
    _scannerRAF = requestAnimationFrame(scan);
  }
  scan();
}

function stopScanner() {
  if (_scannerStream) {
    _scannerStream.getTracks().forEach(t => t.stop());
    _scannerStream = null;
  }
  if (_scannerRAF) {
    cancelAnimationFrame(_scannerRAF);
    _scannerRAF = null;
  }
  document.getElementById("scanner-overlay").classList.add("hidden");
}

async function doQrLogin(token) {
  try {
    const result = await API.qrLogin(token);
    enterMainView(result.user);
    toast(`登录成功，欢迎 ${result.user.name}！`, "success");
  } catch (e) {
    toast("二维码无效或已失效，请联系HR", "danger");
  }
}

/* ----- HR 管理员登录 ----- */
function setupHRLogin() {
  const toggle = document.getElementById("hr-login-toggle");
  const form = document.getElementById("hr-login-form");
  const btn = document.getElementById("hr-login-btn");
  const input = document.getElementById("hr-name-input");

  if (toggle) {
    toggle.addEventListener("click", () => {
      form.classList.toggle("hidden");
      if (!form.classList.contains("hidden")) input.focus();
    });
  }
  if (btn) {
    btn.addEventListener("click", async () => {
      const name = input.value.trim();
      if (!name) { toast("请输入姓名", "danger"); return; }
      try {
        const result = await API.login(name);
        if (result.user) {
          enterMainView(result.user);
        } else {
          const user = State.data.users.find(u => u.name === name);
          if (user) enterMainView(user);
        }
      } catch (e) {
        toast("登录失败，请检查姓名是否正确", "danger");
      }
    });
  }
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btn.click();
    });
  }
}

function enterMainView(user) {
  State.currentUser = user;
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("main-view").classList.remove("hidden");

  // 顶栏用户信息
  const u = State.currentUser;
  const roleLabels = { employee: "新员工", mentor: "带教老师", hr: "人力资源" };
  document.getElementById("topbar-user").innerHTML = `
    <div class="avatar" style="background:${u.avatarColor}">${Utils.getAvatarChar(u.name)}</div>
    <div>
      <div class="user-name">${u.name}</div>
    </div>
    <span class="user-role">${roleLabels[u.role]}</span>
  `;

  // 启动 SSE 实时推送
  API.initSSE((newData) => {
    State.data = newData;
    // 模态框打开或计时器运行中时，不刷新视图（避免打断操作）
    const modalOpen = !document.getElementById("modal-overlay").classList.contains("hidden");
    if (State.currentUser && State.currentView && !modalOpen && !State.timer.running) {
      navigateTo(State.currentView);
    }
  });

  // 默认导航
  const defaultView = { employee: "today", mentor: "pending", hr: "dashboard" }[u.role];
  navigateTo(defaultView);
  toast(`欢迎回来，${u.name}！`, "info");
}

async function login(userId) {
  const user = Utils.getUser(userId);
  if (!user) return;
  try {
    await API.login(user.name);
  } catch (e) {
    toast("登录失败，请重试", "danger");
    return;
  }
  enterMainView(user);
}

function logout() {
  if (State.timer.running) { clearInterval(State.timer.intervalId); }
  State.currentUser = null;
  State.timer = { running: false, seconds: 0, intervalId: null, recordId: null };
  API.logout();
  showLoginPage();
}

/* ===== 第十二部分：初始化 ===== */

async function init() {
  // 加载数据
  try {
    State.data = await API.load();
  } catch (e) {
    document.getElementById("login-view").innerHTML = `
      <div class="login-card">
        <h1 class="login-title" style="color:var(--c-danger);">无法连接服务器</h1>
        <p class="login-subtitle">请稍后重试，或联系管理员</p>
      </div>
    `;
    return;
  }

  // 设置 HR 登录表单
  setupHRLogin();
  // 设置内置扫码器
  setupScanner();

  // 退出登录按钮
  document.getElementById("logout-btn").addEventListener("click", logout);

  // 检查扫码登录（URL 中的 ?t=TOKEN）
  const urlParams = new URLSearchParams(window.location.search);
  const qrToken = urlParams.get("t");
  if (qrToken) {
    try {
      const result = await API.qrLogin(qrToken);
      // 清除 URL 中的 token 参数（避免刷新重复登录）
      window.history.replaceState({}, document.title, window.location.pathname);
      enterMainView(result.user);
      toast(`扫码登录成功，欢迎 ${result.user.name}！`, "success");
      return;
    } catch (e) {
      // 扫码失败：显示提示，不暴露用户列表
      document.querySelector(".login-subtitle").innerHTML = 
        '<span style="color:var(--c-danger);">二维码无效或已失效，请联系HR重新获取</span>';
      toast("扫码登录失败：令牌无效或已失效", "danger");
      return;
    }
  }

  // 检查是否有已存储的登录会话（自动登录）
  const savedUser = await API.checkSession();
  if (savedUser) {
    enterMainView(savedUser);
  }

  // 未登录状态：显示扫码登录引导页（默认已显示）
}

document.addEventListener("DOMContentLoaded", init);

/* ===== PWA Service Worker 注册 ===== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(() => {
      console.log("[PWA] Service Worker 注册成功");
    }).catch((err) => {
      console.log("[PWA] Service Worker 注册失败:", err);
    });
  });
}
