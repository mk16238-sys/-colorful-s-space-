    // ================= State =================
    const STORAGE_KEY = 'nabiMaterialRegistry_v3';
    const DEFAULT_MATERIALS = [
      { name: '物料1', stock: 20 },
      { name: '物料2', stock: 20 },
    ];

    let state = { materials: DEFAULT_MATERIALS.map(m => ({ name: m.name, stock: m.stock, items: [] })) };
    let activeIndex = 0;
    let pendingDeleteIdx = -1;
    let pendingRemoveMaterial = -1; // 物料设置弹窗中待删除的物料索引
    let pendingBatchDelete = false;

    // ===== 容器端能力：版本判断 + 本地缓存（替代 localStorage）=====
    var STORAGE_MIN_CLIENT_VERSION = 9460;

    function getMiniTool() { return (window.xhs && window.xhs.miniTool) || null; }
    function getClientVersion(buildVersion) {
      return Math.floor((Number(buildVersion) || 0) / 1000);
    }
    function isClientVersionAtLeast(buildVersion, minimum) {
      return getClientVersion(buildVersion) >= minimum;
    }
    function readBuildVersion(launchOptions) {
      var env = launchOptions && launchOptions.miniToolEnv;
      return Number(env && env.buildVersion) || 0;
    }
    function getBuildVersionSync() {
      return readBuildVersion(window.xhs && window.xhs.launchOptions);
    }
    function getBuildVersionAsync() {
      var mt = getMiniTool();
      if (!mt || typeof mt.getLaunchOptions !== 'function') return Promise.resolve(0);
      return mt.getLaunchOptions().then(function (o) {
        return readBuildVersion(o);
      })['catch'](function () { return 0; });
    }
    function canUseAppStorage(buildVersion) {
      var mt = getMiniTool();
      return isClientVersionAtLeast(buildVersion, STORAGE_MIN_CLIENT_VERSION) &&
        !!mt && typeof mt.setStorage === 'function' && typeof mt.getStorage === 'function';
    }
    function safeParse(text) {
      try { return JSON.parse(text); } catch (e) { return null; }
    }
    function fallbackSet(key, value) {
      try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
    }
    function fallbackGet(key) {
      try { var raw = localStorage.getItem(key); return raw ? safeParse(raw) : null; } catch (e) { return null; }
    }

    function setLocalData(key, data) {
      var serialized;
      try { serialized = JSON.stringify(data); } catch (e) { return Promise.resolve(false); }
      if (typeof serialized !== 'string') return Promise.resolve(false);

      function write() {
        if (canUseAppStorage(buildVersionRef)) {
          return getMiniTool().setStorage({ key: key, data: serialized })
            .then(function () { return true; })
            ['catch'](function () { return fallbackSet(key, serialized); });
        }
        return Promise.resolve(fallbackSet(key, serialized));
      }

      var buildVersionRef = getBuildVersionSync();
      if (buildVersionRef) return write();
      return getBuildVersionAsync().then(function (v) {
        buildVersionRef = v;
        return write();
      });
    }

    function getLocalData(key) {
      function read() {
        if (canUseAppStorage(buildVersionRef)) {
          return getMiniTool().getStorage({ key: key }).then(function (res) {
            return res && res.data ? safeParse(res.data) : null;
          })['catch'](function () { return fallbackGet(key); });
        }
        return Promise.resolve(fallbackGet(key));
      }

      var buildVersionRef = getBuildVersionSync();
      if (buildVersionRef) return read();
      return getBuildVersionAsync().then(function (v) {
        buildVersionRef = v;
        return read();
      });
    }

    function hydrateState(data) {
      if (!data || !data.materials) return;
      data.materials.forEach(m => { if (typeof m.stock !== 'number') m.stock = 0; });
      state = data;
    }

    function saveState() { setLocalData(STORAGE_KEY, state); }

    function getFilteredItems() {
      const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
      return state.materials[activeIndex].items
        .map((it, idx) => Object.assign({}, it, { originalIndex: idx }))
        .filter(it => !q || it.id.toLowerCase().includes(q) || it.exchange.toLowerCase().includes(q));
    }

    function renderTabs() {
      const tabs = document.getElementById('tabs');
      tabs.innerHTML = state.materials.map((m, i) => `
        <button class="tab ${i === activeIndex ? 'active' : ''}" data-act="switchTab" data-arg="${i}">${escapeHtml(m.name)}</button>
      `).join('');
    }

    function renderStats() {
      const m = state.materials[activeIndex];
      const registered = m.items.length;
      const received = m.items.filter(x => x.received).length;
      const canExchange = m.stock - registered;
      const pending = m.stock - received;
      document.getElementById('stats').innerHTML = `
        <div class="stat-item${canExchange < 0 ? ' warn' : ''}">
          <span class="num">${m.stock}</span>
          <span class="label">总库存</span>
        </div>
        <div class="stat-item">
          <span class="num">${registered}</span>
          <span class="label">已登记</span>
        </div>
        <div class="stat-item${canExchange < 0 ? ' warn' : ''}">
          <span class="num">${canExchange}</span>
          <span class="label">可换</span>
        </div>
        <div class="stat-item${pending < 0 ? ' warn' : ''}">
          <span class="num">${pending}</span>
          <span class="label">待派发</span>
        </div>
      `;
    }

    function renderRows() {
      const list = getFilteredItems();
      const rows = document.getElementById('rows');
      const headHTML = `
        <div class="data-head">
          <span class="dh-check">领取</span>
          <span class="dh-index">#</span>
          <span class="dh-id">小红书ID</span>
          <span class="dh-ex">互换物</span>
          <span class="dh-del"></span>
          <span class="dh-move"></span>
        </div>
      `;
      if (!list.length) {
        // 空状态：去掉卡片底色与实线边框，只留虚线外框（背景与页面底色一致）
        rows.classList.add('is-empty');
        rows.innerHTML = `<div class="empty-state">暂无记录，点击底部「添加记录」开始登记</div>`;
        return;
      }
      rows.classList.remove('is-empty');
      rows.innerHTML = headHTML + list.map((it, i) => `
        <div class="data-item ${it.received ? 'received' : ''}">
          <div class="di-check ${it.received ? 'checked' : ''}" data-idx="${it.originalIndex}"></div>
          <div class="di-index">${i + 1}</div>
          <div class="di-id" contenteditable="true" data-idx="${it.originalIndex}" data-field="id">${escapeHtml(it.id)}</div>
          <div class="di-ex" contenteditable="true" data-idx="${it.originalIndex}" data-field="exchange">${escapeHtml(it.exchange)}</div>
          <button class="di-del" data-idx="${it.originalIndex}">×</button>
          <button class="di-move" data-idx="${it.originalIndex}" title="调整顺序">⇅</button>
        </div>
      `).join('');

      // Bind events via delegation to keep delete/checks responsive after re-render
      rows.querySelectorAll('.di-check').forEach(el => {
        el.addEventListener('click', () => {
          toggleReceived(parseInt(el.dataset.idx, 10));
        });
      });
      rows.querySelectorAll('.di-del').forEach(el => {
        el.addEventListener('click', () => {
          askDelete(parseInt(el.dataset.idx, 10));
        });
      });
      rows.querySelectorAll('.di-move').forEach(el => {
        el.addEventListener('pointerdown', e => {
          startDrag(e, parseInt(el.dataset.idx, 10));
        });
      });
      rows.querySelectorAll('.di-id, .di-ex').forEach(el => {
        el.addEventListener('focus', () => {
          el.dataset.original = el.textContent;
        });
        el.addEventListener('blur', () => {
          const idx = parseInt(el.dataset.idx, 10);
          const field = el.dataset.field;
          const original = el.dataset.original || '';
          let value = el.textContent.trim().replace(/\s+/g, ' ');
          if (!value) {
            el.textContent = original;
            return;
          }
          if (value !== original) {
            state.materials[activeIndex].items[idx][field] = value;
            saveState();
            el.dataset.original = value;
            showToast('已更新');
          }
        });
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
          if (e.key === 'Escape') {
            el.textContent = el.dataset.original || '';
            el.blur();
          }
        });
      });
    }

    function render() {
      renderTabs();
      renderStats();
      renderRows();
    }

    function switchTab(i) {
      activeIndex = i;
      document.getElementById('searchInput').value = '';
      render();
    }

    function pushItem(id, exchange) {
      id = (id || '').trim();
      exchange = (exchange || '').trim();
      if (!id || !exchange) return false;
      state.materials[activeIndex].items.push({ id, exchange, received: false });
      saveState();
      render();
      return true;
    }

    // ===== Add sheet =====
    function openAddSheet() {
      document.getElementById('sheetTitle').textContent = '添加记录 · ' + state.materials[activeIndex].name;
      document.getElementById('sheetId').value = '';
      document.getElementById('sheetExchange').value = '';
      document.getElementById('sheetOverlay').classList.add('show');
      document.getElementById('sheet').classList.add('show');
      setTimeout(() => document.getElementById('sheetId').focus(), 300);
    }
    function closeAddSheet() {
      document.getElementById('sheetOverlay').classList.remove('show');
      document.getElementById('sheet').classList.remove('show');
    }
    function confirmAddSheet() {
      const id = document.getElementById('sheetId').value;
      const exchange = document.getElementById('sheetExchange').value;
      if (!pushItem(id, exchange)) { showToast('请填写完整'); return; }
      closeAddSheet();
      showToast('已添加');
    }

    // ===== Export sheet =====
    function openExportSheet() {
      document.getElementById('exportSheetOverlay').classList.add('show');
      document.getElementById('exportSheet').classList.add('show');
    }
    function closeExportSheet() {
      document.getElementById('exportSheetOverlay').classList.remove('show');
      document.getElementById('exportSheet').classList.remove('show');
    }

    // ===== Delete sheet (replaces native confirm) =====
    function askDelete(idx) {
      pendingBatchDelete = false;
      pendingDeleteIdx = idx;
      const item = state.materials[activeIndex].items[idx];
      document.getElementById('deleteSheetText').textContent =
        `是否删除「${item.id} · ${item.exchange}」？`;
      document.getElementById('deleteSheet').querySelector('h3').textContent = '确认删除';
      document.getElementById('deleteSheetOverlay').classList.add('show');
      document.getElementById('deleteSheet').classList.add('show');
    }
    function askBatchDelete() {
      pendingBatchDelete = true;
      pendingDeleteIdx = -1;
      const count = state.materials[activeIndex].items.length;
      document.getElementById('deleteSheetText').textContent =
        count === 0 ? '当前物料没有记录' : `确认删除当前物料的全部 ${count} 条记录？`;
      document.getElementById('deleteSheet').querySelector('h3').textContent = '批量删除';
      document.getElementById('deleteSheetOverlay').classList.add('show');
      document.getElementById('deleteSheet').classList.add('show');
    }
    function closeDeleteSheet() {
      document.getElementById('deleteSheetOverlay').classList.remove('show');
      document.getElementById('deleteSheet').classList.remove('show');
      pendingDeleteIdx = -1;
      pendingBatchDelete = false;
      pendingRemoveMaterial = -1;
    }
    function confirmDelete() {
      if (pendingRemoveMaterial >= 0) {
        const removed = stockDraft ? stockDraft.splice(pendingRemoveMaterial, 1)[0] : null;
        pendingRemoveMaterial = -1;
        closeDeleteSheet();
        renderStockEditor();
        showToast(removed ? `已删除「${removed.name || '该物料'}」` : '已删除');
        return;
      }
      if (pendingBatchDelete) {
        const count = state.materials[activeIndex].items.length;
        state.materials[activeIndex].items = [];
        saveState();
        render();
        closeDeleteSheet();
        showToast(count > 0 ? `已清空 ${count} 条记录` : '暂无记录可删除');
        return;
      }
      if (pendingDeleteIdx < 0) return;
      state.materials[activeIndex].items.splice(pendingDeleteIdx, 1);
      saveState();
      render();
      closeDeleteSheet();
      showToast('已删除');
    }
    document.getElementById('deleteSheetConfirm').addEventListener('click', confirmDelete);

    // ===== Drag to reorder =====
    let drag = null;
    function startDrag(e, idx) {
      // 搜索过滤时禁用拖拽（位置会错乱）
      const q = (document.getElementById('searchInput').value || '').trim();
      if (q) { showToast('请先清空搜索再调整顺序'); return; }
      const row = e.currentTarget.closest('.data-item');
      if (!row) return;
      e.preventDefault();
      // 快照每行的「自然中心」clientY（此时尚未施加任何 transform）。
      // 拖拽过程中会给其他行加 translateY 让位，若每次都用 getBoundingClientRect() 现算，
      // 会读到被自己挪动过的位置，形成反馈回路 —— 表现就是「向上拖总是少一格」。
      const rowRect = row.getBoundingClientRect();
      const centers = [...document.querySelectorAll('#rows .data-item')].map(r => {
        const rc = r.getBoundingClientRect();
        return rc.top + rc.height / 2;
      });
      drag = {
        idx: idx,                    // 拖拽项在 items 数组中的下标
        row: row,
        rect: rowRect,
        rowH: rowRect.height,
        centers: centers,            // 全部行的自然中心（下标与行序一致）
        startY: e.clientY,           // 手指按下处（手柄垂直居中，≈ 行中心）
        shiftY: 0,                   // 手指总位移
        target: idx,                 // 目标插入位置（others 序列中）
        active: false                // 是否已越过拖拽阈值
      };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
      e.currentTarget.addEventListener('pointermove', onDragMove);
      e.currentTarget.addEventListener('pointerup', onDragEnd);
      e.currentTarget.addEventListener('pointercancel', onDragEnd);
    }

    function onDragMove(e) {
      if (!drag) return;
      const dy = e.clientY - drag.startY;
      drag.shiftY = dy;
      if (!drag.active) {
        if (Math.abs(dy) < 8) return;   // 阈值：防止轻触误拖
        drag.active = true;
        drag.row.classList.add('dragging');
        // 其他行开启平滑让位
        document.querySelectorAll('#rows .data-item').forEach(r => {
          if (r !== drag.row) r.classList.add('shift');
        });
      }
      // 拖拽行跟手
      drag.row.style.transform = `translateY(${dy}px)`;

      // 计算目标插入位置：被拖行的中心 = 按下点 + 位移，与各行的「自然中心」比较。
      // 这里必须用 startDrag 时快照的 centers，不能用 getBoundingClientRect()（会被自身 transform 污染）。
      const others = [...document.querySelectorAll('#rows .data-item')].filter(r => r !== drag.row);
      const fingerY = drag.startY + dy;
      let target = 0;
      for (let i = 0; i < drag.centers.length; i++) {
        if (i === drag.idx) continue;              // 被拖行本身不参与比较
        if (drag.centers[i] < fingerY) target++;    // 落在这行之后
      }
      drag.target = target;
      const rowH = drag.rowH;
      others.forEach((r, i) => {
        let shift = 0;
        if (drag.idx < target) {
          if (i >= drag.idx && i < target) shift = -rowH;
        } else if (drag.idx > target) {
          if (i < drag.idx && i >= target) shift = rowH;
        }
        r.style.transform = shift ? `translateY(${shift}px)` : '';
      });
    }

    function onDragEnd(e) {
      if (!drag) return;
      const d = drag;
      drag = null;
      const el = e.currentTarget;
      el.removeEventListener('pointermove', onDragMove);
      el.removeEventListener('pointerup', onDragEnd);
      el.removeEventListener('pointercancel', onDragEnd);
      if (!d.active) return;   // 未达阈值，视为点击，不做处理
      const items = state.materials[activeIndex].items;
      // d.target 已是「去掉拖拽项后的 others 序列」中的插入下标，
      // splice 掉拖拽项后数组恰好就是 others，因此 insertAt 直接等于 target。
      // （曾误加 `if (d.idx < target) insertAt = target - 1`，导致向下拖拽少一格）
      const insertAt = d.target;
      const [moved] = items.splice(d.idx, 1);
      items.splice(insertAt, 0, moved);
      saveState();
      render();
      showToast('已调整顺序');
    }

    // ===== Items =====
    function toggleReceived(idx) {
      state.materials[activeIndex].items[idx].received = !state.materials[activeIndex].items[idx].received;
      saveState();
      render();
    }

    function selectAllReceived(v) {
      state.materials[activeIndex].items.forEach(it => it.received = v);
      saveState();
      render();
      showToast(v ? '已全部标记领取' : '已取消标记');
    }

    // ===== Tools menu =====
    function openToolsMenu() {
      document.getElementById('modalTitle').textContent = '工具箱';
      document.getElementById('modalBody').innerHTML = `
        <div class="tools-grid">
          <button class="btn btn-secondary" data-act="closeModal,openImport"><span>📥</span>批量导入</button>
          <button class="btn btn-secondary" data-act="closeModal,openStockSettings"><span>⚙️</span>物料设置</button>
          <button class="btn btn-secondary" data-act="closeModal,askBatchDelete"><span>🗑️</span>批量删除</button>
        </div>
      `;
      document.getElementById('modalFooter').innerHTML = `
        <button class="btn btn-secondary" data-act="closeModal" style="width:100%">关闭</button>
      `;
      document.getElementById('modal').classList.add('show');
    }

    function openImport() {
      document.getElementById('modalTitle').textContent = '批量导入 / 编辑';
      document.getElementById('modalBody').innerHTML = `
        <p style="margin-top:0;color:var(--muted);font-size:13px;">
          每行一条记录，格式：<code>小红书ID | 互换物</code>（竖线、制表符或空格均可）
        </p>
        <textarea class="import-area" id="importArea" placeholder="例如：&#10;欧阳娜娜最爱的33 | 记忆盒子&#10;种大运 | 手作数据线"></textarea>
      `;
      document.getElementById('modalFooter').innerHTML = `
        <button class="btn btn-secondary" data-act="closeModal">取消</button>
        <button class="btn btn-primary" data-act="doImport">导入到当前物料</button>
      `;
      document.getElementById('modal').classList.add('show');
    }

    function doImport() {
      const raw = document.getElementById('importArea').value || '';
      const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);
      let count = 0;
      lines.forEach(line => {
        const parts = line.split(/[|\t]/).map(s => s.trim());
        if (parts.length >= 2) {
          state.materials[activeIndex].items.push({ id: parts[0], exchange: parts[1], received: false });
          count++;
        } else {
          const space = line.split(/\s+/);
          if (space.length >= 2) {
            state.materials[activeIndex].items.push({ id: space[0], exchange: space.slice(1).join(' '), received: false });
            count++;
          }
        }
      });
      saveState();
      closeModal();
      render();
      showToast(`成功导入 ${count} 条记录`);
    }

    function exportJSON() {
      // 容器禁用 a[download] 与 blob 下载，改为展示可选中文本供手动复制
      const text = JSON.stringify(state, null, 2);
      document.getElementById('modalTitle').textContent = '备份数据';
      document.getElementById('modalBody').innerHTML =
        '<p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#8C7E6B">当前环境不支持文件下载，请长按下方文本选择复制后自行保存。</p>' +
        '<textarea readonly style="width:100%;height:240px;font-size:12px;line-height:1.5;padding:10px;' +
        'border:1px solid #D8D2C2;border-radius:8px;background:#F7F5EF;color:#4A3F35;' +
        '-webkit-user-select:auto;user-select:auto;box-sizing:border-box">' + escapeHtml(text) + '</textarea>';
      document.getElementById('modal').classList.add('show');
    }

    let stockDraft = null; // 设置弹窗编辑中的物料草稿（深拷贝，取消即丢弃）

    function openStockSettings() {
      stockDraft = JSON.parse(JSON.stringify(state.materials));
      renderStockEditor();
    }

    function renderStockEditor() {
      document.getElementById('modalTitle').textContent = '设置物料名称与库存';
      if (!stockDraft.length) stockDraft = [{ name: '', stock: 0, items: [] }];
      const inputs = stockDraft.map((m, i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <input type="text" value="${escapeHtml(m.name)}" id="name_${i}"
            placeholder="物料名称"
            style="flex:1;min-width:0;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;font-size:14px">
          <input type="number" min="0" value="${m.stock}" id="stock_${i}"
            style="width:88px;padding:8px;border:1.5px solid var(--line);border-radius:10px;font-size:14px;text-align:center">
          <button type="button" data-act="askRemoveMaterial" data-arg="${i}"
            style="flex:none;width:34px;height:34px;border:none;border-radius:10px;background:#F6E3DA;color:#C06B4B;font-size:15px;line-height:1;cursor:pointer"
            title="删除此物料">✕</button>
        </div>
      `).join('');
      document.getElementById('modalBody').innerHTML = `
        <p style="margin-top:0;color:var(--muted);font-size:13px">
          左侧改名称、中间改总数量，点 ✕ 删除物料，点下方按钮增加物料。将实时计算「可换」与「待派发」。
        </p>${inputs}`;
      document.getElementById('modalFooter').innerHTML = `
        <button class="btn btn-secondary" data-act="addMaterialRow"><span>＋</span>添加物料</button>
        <button class="btn btn-secondary" data-act="closeModal">取消</button>
        <button class="btn btn-primary" data-act="saveStock">保存</button>
      `;
      document.getElementById('modal').classList.add('show');
    }

    function addMaterialRow() {
      stockDraft.push({ name: '', stock: 0, items: [] });
      renderStockEditor();
      const el = document.getElementById('name_' + (stockDraft.length - 1));
      if (el) { el.focus(); el.select(); }
    }

    function askRemoveMaterial(i) {
      const m = stockDraft[i];
      if (!m) return;
      pendingRemoveMaterial = i;
      const nameEl = document.getElementById('name_' + i);
      const displayName = (nameEl && nameEl.value.trim()) || m.name || '该物料';
      const count = m.items.length;
      document.getElementById('deleteSheetText').textContent =
        count > 0
          ? `将删除「${displayName}」及其 ${count} 条登记记录，删除后不可恢复！`
          : `确定删除物料「${displayName}」？`;
      document.getElementById('deleteSheet').querySelector('h3').textContent = '删除物料';
      document.getElementById('deleteSheetOverlay').classList.add('show');
      document.getElementById('deleteSheet').classList.add('show');
    }

    function saveStock() {
      stockDraft.forEach((m, i) => {
        const nameEl = document.getElementById('name_' + i);
        const name = (nameEl ? nameEl.value : '').trim();
        if (name) m.name = name;
        const v = parseInt(document.getElementById('stock_' + i).value, 10);
        m.stock = (isNaN(v) || v < 0) ? 0 : v;
      });
      // 空名称补位，避免出现无名物料
      stockDraft.forEach((m, i) => { if (!m.name.trim()) m.name = '未命名物料' + (i + 1); });
      if (!stockDraft.length) stockDraft = [{ name: '未命名物料', stock: 0, items: [] }];
      state.materials = stockDraft;
      stockDraft = null;
      if (activeIndex >= state.materials.length) activeIndex = Math.max(0, state.materials.length - 1);
      saveState();
      closeModal();
      render();
      showToast('名称与库存已保存');
    }

    function closeModal() { document.getElementById('modal').classList.remove('show'); stockDraft = null; }
    function closeModalOnBackdrop(e) { if (e.target.id === 'modal') closeModal(); }

    // ===== Long image export (registration) =====
    function buildExportHTML(all = false, includeHeader = true) {
      const sections = all ? state.materials : [state.materials[activeIndex]];
      let html = `
        <div style="width:520px;background:#DFDCCF;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;color:#4A3F35;box-sizing:border-box">
          ${includeHeader ? '<img src="header.png" style="width:100%;display:block;margin-bottom:18px">' : ''}
      `;
      sections.forEach(m => {
        const received = m.items.filter(x => x.received).length;
        html += `<div style="margin-bottom:22px">
          <div style="font-size:16px;font-weight:700;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #4A3F35">${escapeHtml(m.name)}</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:rgba(201,168,124,0.18)">
              <th style="border:1px solid #D8D2C2;padding:8px;width:50px;white-space:nowrap">序号</th>
              <th style="border:1px solid #D8D2C2;padding:8px">小红书ID</th>
              <th style="border:1px solid #D8D2C2;padding:8px">互换物</th>
              <th style="border:1px solid #D8D2C2;padding:8px;width:60px;white-space:nowrap">状态</th>
            </tr></thead>
            <tbody>
              ${m.items.length ? m.items.map((it, i) => `
                <tr>
                  <td style="border:1px solid #D8D2C2;padding:8px">${i + 1}</td>
                  <td style="border:1px solid #D8D2C2;padding:8px">${escapeHtml(it.id)}</td>
                  <td style="border:1px solid #D8D2C2;padding:8px">${escapeHtml(it.exchange)}</td>
                  <td style="border:1px solid #D8D2C2;padding:8px;color:${it.received ? '#7FA86B' : '#8C7E6B'};font-weight:${it.received ? '700' : '400'}">${it.received ? '✓' : ''}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="border:1px solid #D8D2C2;padding:10px;text-align:center;color:#8C7E6B">暂无记录</td></tr>'}
            </tbody>
          </table>
        </div>`;
      });
      html += `<div style="text-align:center;color:#8C7E6B;font-size:12px;margin-top:8px;padding-bottom:2px">生成时间：${new Date().toLocaleString()}</div>`;
      html += `</div>`;
      return html;
    }

    function captureCurrent() {
      doCapture(buildExportHTML(false, false), `当前物料_${state.materials[activeIndex].name}.png`);
    }
    function captureAll() {
      doCapture(buildExportHTML(true, false), '全部物料名单.png');
    }
    function doCapture(html, filename) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const el = tmp.firstElementChild;
      captureToImage(el, filename);
    }

    function captureToImage(el, filename) {
      const holder = document.createElement('div');
      holder.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;z-index:-1;';
      holder.appendChild(el);
      document.body.appendChild(holder);
      showToast('正在生成长图...');
      html2canvas(el, {
        scale: 2,
        backgroundColor: '#DFDCCF',
        useCORS: true,
        logging: false
      }).then(canvas => {
        if (holder.parentNode) document.body.removeChild(holder);
        saveCanvasImage(canvas, filename);
      }).catch(err => {
        if (holder.parentNode) document.body.removeChild(holder);
        console.error(err);
        showToast('当前环境不支持生成长图');
      });
    }

    // ===== Save image：优先容器相册 API，非容器环境降级为预览 =====
    function saveCanvasImage(canvas, filename) {
      var mt = getMiniTool();
      var dataUrl;
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch (e) {
        showToast('生成失败，请重试');
        return;
      }

      if (mt && typeof mt.saveImageToPhotosAlbum === 'function') {
        var viaTempFile = (typeof mt.writeTempFile === 'function')
          ? mt.writeTempFile({ data: dataUrl }).then(function (res) {
              return (res && res.filePath) || null;
            })['catch'](function () { return null; })
          : Promise.resolve(null);

        viaTempFile.then(function (filePath) {
          return mt.saveImageToPhotosAlbum({ filePath: filePath || dataUrl });
        }).then(function () {
          showToast('已保存到相册');
        })['catch'](function (err) {
          console.log('saveImageToPhotosAlbum failed', err);
          showPreviewToSave(dataUrl);
        });
        return;
      }

      // 非容器环境（如浏览器预览）：展示图片，提示长按保存
      showPreviewToSave(dataUrl);
    }

    // 全屏预览 + 长按保存（容器相册 API 不可用时的降级路径）
    function showPreviewToSave(dataUrl) {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;';
      overlay.innerHTML = '<div style="color:#fff;font-size:14px;line-height:1.6;margin-bottom:12px;text-align:center">已生成图片<br><b>长按图片</b>即可保存到相册</div>' +
        '<img alt="长按保存" style="max-width:100%;max-height:76vh;border-radius:12px;-webkit-user-select:auto;user-select:auto;-webkit-touch-callout:default">' +
        '<button style="margin-top:16px;padding:10px 30px;border:none;border-radius:999px;background:#fff;color:#222;font-size:15px;font-weight:600">关 闭</button>';
      const img = overlay.querySelector('img');
      img.src = dataUrl;
      overlay.querySelector('button').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
      showToast('长按图片保存');
    }

    // ===== Utilities =====
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => t.classList.remove('show'), 1800);
    }

    // ===== 事件委托：容器禁止行内事件与内联脚本，统一用 addEventListener =====
    const ACTIONS = {
      openExportSheet: openExportSheet,
      closeExportSheet: closeExportSheet,
      openToolsMenu: openToolsMenu,
      openAddSheet: openAddSheet,
      closeAddSheet: closeAddSheet,
      confirmAddSheet: confirmAddSheet,
      closeDeleteSheet: closeDeleteSheet,
      closeModal: closeModal,
      closeModalOnBackdrop: closeModalOnBackdrop,
      captureCurrent: captureCurrent,
      captureAll: captureAll,
      // 索引类参数必须转数字：switchTab 内部用 activeIndex 做严格比较
      switchTab: function (i) { switchTab(Number(i)); },
      askRemoveMaterial: function (i) { askRemoveMaterial(Number(i)); },
      openImport: openImport,
      doImport: doImport,
      askBatchDelete: askBatchDelete,
      openStockSettings: openStockSettings,
      addMaterialRow: addMaterialRow,
      saveStock: saveStock,
      renderRows: renderRows
    };

    function closestAttr(node, attr) {
      while (node && node !== document) {
        if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute(attr)) return node;
        node = node.parentNode;
      }
      return null;
    }

    // 自下而上解析：先遇到 data-act 就执行；先遇到 data-stop 边界则吞掉事件
    // （不能先查 data-stop——弹窗容器 .modal 自身带 data-stop，会吞掉内部所有按钮）
    function resolveAction(node) {
      while (node && node !== document) {
        if (node.nodeType === 1 && node.hasAttribute) {
          if (node.hasAttribute('data-act')) return { el: node, blocked: false };
          if (node.hasAttribute('data-stop')) return { el: null, blocked: true };
        }
        node = node.parentNode;
      }
      return { el: null, blocked: false };
    }

    function runActions(el, currentEvent) {
      const names = (el.getAttribute('data-act') || '').split(',');
      const arg = el.getAttribute('data-arg');
      const passEvent = el.getAttribute('data-evt') === '1';
      names.forEach(function (name) {
        const fn = ACTIONS[name];
        if (typeof fn !== 'function') return;
        if (passEvent) fn(currentEvent);
        else if (arg !== null && arg !== '') fn(arg);
        else fn();
      });
    }

    document.addEventListener('click', function (e) {
      const r = resolveAction(e.target);
      if (r.el) { runActions(r.el, e); return; }
      if (r.blocked) { e.stopPropagation(); }
    });

    document.addEventListener('input', function (e) {
      const el = closestAttr(e.target, 'data-input');
      if (!el) return;
      const fn = ACTIONS[el.getAttribute('data-input')];
      if (typeof fn === 'function') fn();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const el = closestAttr(e.target, 'data-enter');
      if (!el) return;
      const fn = ACTIONS[el.getAttribute('data-enter')];
      if (typeof fn === 'function') fn();
    });

    // Initial render
    render();

    // 异步读取容器缓存后刷新（容器 Storage 为异步 API）
    getLocalData(STORAGE_KEY).then(function (data) {
      hydrateState(data);
      render();
    });
