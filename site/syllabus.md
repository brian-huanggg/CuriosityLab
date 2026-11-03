# 書籍架構

## Part 0 序章

本書目標、讀者、程式碼 tag 對照、環境需求

## Part 1 Java 基礎與進階

> 參考型章節：可先讀，或由後續章節回頭查閱

- 現代 Java 17+：record、sealed、pattern matching、text block
- 集合、Stream、Optional 的正確用法
- 並行：Thread、Executor、CompletableFuture、Virtual Threads
- JVM：記憶體模型、GC、效能觀測
- Spring 核心：IoC、AOP、Bean 生命週期、自動配置原理
- 建置工具：Maven vs Gradle、多專案與 Version Catalog

## Part 2 基礎建設

- 系統全貌：平台核心 vs 產品模組
- Monorepo 與文件規劃（docs/ vs site/）
- Spring Boot 4 + Spring Modulith 骨架與邊界測試
- API 規範：統一回應、ProblemDetail、OpenAPI
- 資料層：MariaDB、Flyway、Spring Data JPA + Hibernate 7
- 多租戶：共享 Schema、@TenantId、租戶隔離測試
- 前端骨架：Vite + React + TS + MUI + TanStack Query + zh-TW
- 測試策略：JUnit、Testcontainers、Playwright
- 機密管理：Vault
- CI/CD：GitLab CI → Harbor → k3s (Helm)
- 可觀測性：OpenTelemetry + Prometheus/Loki/Tempo/Grafana

## Part 3 身分驗證

- Session vs Token：原理、取捨、適用情境
- 註冊、登入、Email 驗證
- 密碼安全：雜湊 vs 加密、Argon2id/bcrypt、鹽與 pepper
- Redis：快取模式與 Spring Session 高可用
- 雙因素驗證 TOTP 與復原碼
- Passkey / WebAuthn
- Spring Authorization Server + BFF：token 只留在伺服器端
- Session 與裝置管理、登出與撤銷
- Identity 維運：指標與告警

## Part 4 成員管理

- 組織模型：租戶、部門樹、階層查詢（closure table vs 遞迴 CTE）
- 使用者與群組
- RBAC：角色、權限、動態選單
- ABAC：屬性與政策；與 RBAC 的比較及混合設計
- 資料權限（Data Scope）
- 前端權限：路由守衛、按鈕級權限
- 稽核日誌設計：誰、何時、對什麼、做了什麼
- 稽核日誌進階：防竄改（hash chain）、保留政策、查詢與匯出

## Part 5 資安攻防

> 測試你剛建好的系統

- 威脅建模：STRIDE、攻擊面盤點
- 以 OWASP ASVS 與 API Security Top 10 檢核 Identity 與 Member
- 認證層的常見風險與防禦
- 授權層的常見風險：越權存取、租戶隔離失效，以自動化測試證明隔離
- 安全測試進 CI：SAST、相依套件掃描、映像掃描（Harbor 內建 Trivy）、DAST baseline
- 偵測與回應：從稽核日誌到 Grafana 告警
- 滲透測試實作：範圍、授權、紀錄與報告

## Part 6 程式碼產生器

- 由資料表產生 Entity / Repository / API / 前端頁面
- 範本設計，讓產生的程式碼自帶權限與稽核

## Part 7 儲存核心

- 物件儲存與 S3 API；MinIO 固定版本（digest）部署
- Presigned URL vs 串流代理：效能、安全、成本比較
- Multipart 與斷點續傳
- 中繼資料、去重、配額
- 平台 Storage API

## Part 8 待辦事項

> 第一個完整的垂直切片

- 垂直切片範本
- 領域模型與重複規則
- 拖曳排序與樂觀更新
- 通知中心（核心）
- v1.0 里程碑：部署、儀表板、告警、發布

## Part 9 系統設計原理 (DDIA)

> 通往分散式產品的橋樑

- 可靠性、可擴展性、可維護性
- 複製與一致性模型
- 分割、交易與隔離等級
- 事件驅動、Outbox 與最終一致性
- 時間、順序與衝突，為 CRDT 鋪路

## Part 10 雲端硬碟

版本控制、ACL 與分享繼承、同步協定與衝突處理

## Part 11 文件協作

區塊編輯器、CRDT（Yjs）原理與同步伺服器、全文搜尋

## Part 12 即時通訊

WebSocket、在線狀態、服務拆分

## Part 13 郵件

IMAP/SMTP 概念、收信管線、附件

## Part 14 AI 平台

Spring AI、MariaDB Vector、跨模組 RAG、權限感知檢索

## Part 15 維運進階

擴展、備份、成本

## 附錄

中英術語對照、疑難排解
