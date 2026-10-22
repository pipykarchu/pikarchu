<script setup>
import portfolio from '../../content/workPortfolio.json'
import { withBase } from '../composables/useAssetPath'
</script>

<template>
  <div class="work-portfolio">
    <section id="work-portfolio" class="work-section" aria-labelledby="work-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">工作项目 / 2026</p>
          <h2 id="work-title">{{ portfolio.title }}</h2>
          <p class="section-intro">{{ portfolio.intro }}</p>
        </div>
        <nav class="section-links" aria-label="工作档案导航">
          <a href="#work-methods">工作方法</a>
          <a href="#work-archives">资料归档 <span aria-hidden="true">↓</span></a>
        </nav>
      </div>

      <div class="project-grid">
        <article v-for="(project, index) in portfolio.projects" :key="project.id" class="work-case">
          <div class="case-meta">
            <span>{{ String(index + 1).padStart(2, '0') }} / {{ project.category }}</span>
            <span class="stage">{{ project.stage }}</span>
          </div>
          <h3>{{ project.title }}</h3>
          <p class="case-role">{{ project.role }} · {{ project.period }}</p>
          <p class="case-summary">{{ project.summary }}</p>
          <ul class="deliverables" aria-label="交付材料">
            <li v-for="item in project.deliverables" :key="item">{{ item }}</li>
          </ul>

          <details class="case-details">
            <summary>查看设计与交付内容 <span aria-hidden="true">+</span></summary>
            <div class="case-body">
              <h4>面对的问题</h4>
              <p>{{ project.problem }}</p>
              <h4>我的参与</h4>
              <ul>
                <li v-for="item in project.contributions" :key="item">{{ item }}</li>
              </ul>
              <p class="case-scope">{{ project.scope }}</p>
            </div>
          </details>

          <footer class="case-footer">
            <p>{{ project.takeaway }}</p>
            <a :href="withBase(project.archive)" download>下载项目摘要 <span aria-hidden="true">↗</span></a>
          </footer>
        </article>
      </div>
    </section>

    <section id="work-methods" class="work-section methods-section" aria-labelledby="methods-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">工作方法</p>
          <h2 id="methods-title">把做过的事，变成下次能用的方法</h2>
          <p class="section-intro">来自项目中的模板、SOP 与工作流定制，为业务工作提供支撑。</p>
        </div>
      </div>
      <div class="method-grid">
        <article v-for="method in portfolio.methods" :key="method.id" class="method-item">
          <h3>{{ method.title }}</h3>
          <p>{{ method.description }}</p>
          <span class="method-output">沉淀：{{ method.output }}</span>
        </article>
      </div>
      <ol class="workflow" aria-label="产品交付工作流">
        <li v-for="(step, index) in portfolio.workflow" :key="step">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ step }}
        </li>
      </ol>
    </section>

    <section id="work-archives" class="work-section archives-section" aria-labelledby="archives-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">资料归档</p>
          <h2 id="archives-title">带走一份项目与方法摘要</h2>
          <p class="section-intro">按项目整理的公开摘要，方便了解我的参与和思考。</p>
        </div>
        <span class="archive-date">更新于 {{ portfolio.updatedAt }}</span>
      </div>
      <div class="archive-grid">
        <a v-for="archive in portfolio.archives" :key="archive.id" :href="withBase(archive.href)" class="archive-item" download>
          <div>
            <span class="archive-type">{{ archive.type }} · Markdown</span>
            <h3>{{ archive.title }}</h3>
          </div>
          <span class="download-mark" aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.work-portfolio {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
  color: var(--color-linear-text);
}
.work-section { padding: 48px 0; scroll-margin-top: 90px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 28px; }
.eyebrow { color: var(--color-linear-text-secondary); font-size: 12px; font-weight: 600; letter-spacing: .1em; margin: 0 0 10px; }
h2 { font-size: clamp(23px, 3vw, 32px); line-height: 1.4; font-weight: 650; letter-spacing: -.025em; margin: 0; text-wrap: pretty; }
.section-intro { margin: 12px 0 0; font-size: 15px; line-height: 1.8; color: var(--color-linear-text-secondary); }
.section-links { display: flex; gap: 16px; flex-shrink: 0; font-size: 13px; }
.section-links a { display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; color: var(--color-linear-text-secondary); }
.section-links a:hover, .case-footer a:hover { color: var(--color-linear-purple); }
.project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.work-case { display: flex; flex-direction: column; min-width: 0; padding: 26px; border: 1px solid var(--color-linear-border); border-radius: 18px; background: var(--color-linear-bg-secondary); }
.case-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--color-linear-text-tertiary); font-size: 12px; line-height: 1.7; }
.stage { padding: 3px 8px; border: 1px solid var(--color-linear-border); border-radius: 6px; white-space: nowrap; color: var(--color-linear-text-secondary); }
.work-case h3 { margin: 22px 0 8px; font-size: clamp(20px, 2.3vw, 25px); font-weight: 650; line-height: 1.45; text-wrap: pretty; }
.case-role { margin: 0; font-size: 12px; line-height: 1.8; color: var(--color-linear-text-tertiary); }
.case-summary { font-size: 16px; line-height: 1.9; margin: 20px 0 16px; color: var(--color-linear-text-secondary); }
.deliverables { display: flex; flex-wrap: wrap; gap: 7px; list-style: none; padding: 0; margin: 0 0 24px; }
.deliverables li { padding: 5px 9px; border-radius: 5px; background: var(--color-linear-bg-tertiary); color: var(--color-linear-text-secondary); font-size: 11px; line-height: 1.6; }
.case-details { margin-top: auto; border-top: 1px solid var(--color-linear-border); }
.case-details summary { display: flex; justify-content: space-between; align-items: center; gap: 16px; min-height: 52px; font-size: 14px; cursor: pointer; list-style: none; }
.case-details summary::-webkit-details-marker { display: none; }
.case-details summary span { font-size: 20px; color: var(--color-linear-text-tertiary); transition: transform .18s ease; }
.case-details[open] summary span { transform: rotate(45deg); }
.case-details summary:focus-visible { outline: 2px solid var(--color-linear-purple); outline-offset: 3px; border-radius: 4px; }
.case-body { padding: 0 0 20px; font-size: 14px; line-height: 1.9; color: var(--color-linear-text-secondary); }
.case-body h4 { margin: 14px 0 6px; font-size: 12px; color: var(--color-linear-text); font-weight: 600; }
.case-body p { margin: 0; }
.case-body ul { list-style: disc; padding-left: 19px; margin: 0; }
.case-body li + li { margin-top: 7px; }
.case-body .case-scope { margin-top: 16px; color: var(--color-linear-text-tertiary); font-size: 12px; }
.case-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 14px; padding-top: 17px; border-top: 1px solid var(--color-linear-border); }
.case-footer p { flex: 1 1 200px; margin: 0; font-size: 12px; line-height: 1.8; color: var(--color-linear-text-tertiary); }
.case-footer a { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-size: 12px; text-decoration: none; white-space: nowrap; }
.methods-section, .archives-section { border-top: 1px solid var(--color-linear-border); }
.method-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px; }
.method-item h3 { font-size: 17px; margin: 0 0 12px; font-weight: 600; }
.method-item p { margin: 0 0 16px; font-size: 14px; line-height: 1.9; color: var(--color-linear-text-secondary); }
.method-output { display: block; color: var(--color-linear-text-tertiary); font-size: 12px; line-height: 1.9; }
.workflow { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; list-style: none; margin: 32px 0 0; padding: 18px 0 0; border-top: 1px solid var(--color-linear-border); }
.workflow li { display: flex; align-items: center; gap: 10px; font-size: 14px; line-height: 2; }
.workflow li span { color: var(--color-linear-text-tertiary); font-size: 11px; font-variant-numeric: tabular-nums; }
.archive-date { color: var(--color-linear-text-tertiary); font-size: 12px; white-space: nowrap; }
.archive-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.archive-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px; min-height: 96px; text-decoration: none; border: 1px solid var(--color-linear-border); border-radius: 12px; background: var(--color-linear-bg-secondary); transition: border-color .18s ease, transform .18s ease; }
.archive-item:hover { border-color: var(--color-linear-purple); transform: translateY(-2px); }
.archive-type { font-size: 11px; color: var(--color-linear-text-tertiary); }
.archive-item h3 { margin: 7px 0 0; font-size: 14px; line-height: 1.7; font-weight: 550; }
.download-mark { font-size: 20px; color: var(--color-linear-text-secondary); }
@media (max-width: 850px) {
  .section-heading { align-items: start; flex-direction: column; gap: 12px; }
  .project-grid { gap: 14px; }
  .work-case { padding: 20px; }
  .case-meta { align-items: start; flex-direction: column; gap: 8px; }
  .method-grid, .archive-grid { gap: 18px; }
}
@media (max-width: 639px) {
  .work-portfolio { padding: 0 16px; }
  .work-section { padding: 32px 0; }
  .project-grid, .method-grid, .archive-grid { grid-template-columns: minmax(0, 1fr); }
  .method-grid { gap: 24px; }
  .case-meta { flex-direction: row; }
  .work-case { padding: 20px; }
  .workflow { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .section-links { gap: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .archive-item, .case-details summary span { transition: none; }
  .archive-item:hover { transform: none; }
}
</style>
