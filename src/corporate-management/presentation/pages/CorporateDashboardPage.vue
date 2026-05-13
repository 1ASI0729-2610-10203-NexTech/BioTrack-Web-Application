<script setup>
import Button from 'primevue/button'
</script>

<template>
  <section class="bt-corporate-dashboard">
    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">Admin corporativo</p>
        <h1>Dashboard Corporativo</h1>
        <p class="text-muted">
          Metricas grupales de bienestar. Datos anonimizados y una base visual lista para evolucionar.
        </p>
      </div>

      <Button label="Exportar informe" class="bt-dashboard-export" />
    </header>

    <section class="bt-kpi-grid" aria-label="Resumen corporativo">
      <article class="bt-kpi-card bt-kpi-card--primary">
        <span>Colaboradores activos</span>
        <strong>247</strong>
        <small>12% vs. mes anterior</small>
      </article>

      <article class="bt-kpi-card">
        <span>Adherencia promedio</span>
        <strong>72%</strong>
        <div class="bt-mini-track"><span /></div>
      </article>

      <article class="bt-kpi-card">
        <span>IMC promedio grupal</span>
        <strong>24.8</strong>
        <small>Rango normal</small>
      </article>

      <article class="bt-kpi-card bt-kpi-card--success">
        <span>Licencias utilizadas</span>
        <strong>247/300</strong>
        <small>82% de capacidad</small>
      </article>
    </section>

    <section class="bt-dashboard-panels">
      <article class="bt-dashboard-panel bt-dashboard-panel--wide">
        <div class="bt-panel-header">
          <h3>Evolucion de adherencia mensual</h3>
          <span class="bt-panel-pill">Ultimos 6 meses</span>
        </div>
        <div class="bt-chart-placeholder">
          <span>Nov</span>
          <span>Dic</span>
          <span>Ene</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Abr</span>
        </div>
      </article>

      <article class="bt-dashboard-panel">
        <div class="bt-panel-header">
          <h3>Distribucion de objetivos</h3>
        </div>
        <div class="bt-goal-list">
          <div class="bt-goal-row">
            <span>Bajar de peso</span>
            <strong>42%</strong>
          </div>
          <div class="bt-goal-track bt-goal-track--blue"><span /></div>
          <div class="bt-goal-row">
            <span>Mantener peso</span>
            <strong>35%</strong>
          </div>
          <div class="bt-goal-track bt-goal-track--green"><span /></div>
          <div class="bt-goal-row">
            <span>Ganar masa</span>
            <strong>23%</strong>
          </div>
          <div class="bt-goal-track bt-goal-track--warning"><span /></div>
        </div>
        <p class="bt-panel-note">Datos anonimizados. No se exponen metricas individuales.</p>
      </article>
    </section>
  </section>
</template>
