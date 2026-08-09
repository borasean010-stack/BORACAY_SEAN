import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace the contents inside <div id="dashboard-overlay"> ... </div>
# But it's easier to find specific comments.
# "<!-- 1. 영업 대시보드 -->" is at line 976
# "</script>" before "<div id="res-detail-modal"" is at line 1427

start_marker = "<!-- 1. 영업 대시보드 -->"
end_marker = '<div id="res-detail-modal" class="modal-overlay" style="display: none;">'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    exit(1)

new_dashboard = """
        <!-- 🐋 고래상어 관리 대시보드 -->
        <div id="db-whale-shark" class="db-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="margin:0; font-size:22px; font-weight:900;">🐋 고래상어 티켓 관리</h2>
                <button class="btn-db-close" onclick="closeDashboard()"><span class="material-icons">close</span> 닫기</button>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:30px;">
                <div class="db-card"><p style="color:#888; margin:0 0 10px;">총 구매 티켓</p><div style="font-size:26px; font-weight:900; color:#111;" id="ws-total-bought">0</div></div>
                <div class="db-card"><p style="color:#888; margin:0 0 10px;">총 사용 티켓</p><div style="font-size:26px; font-weight:900; color:#ff2d55;" id="ws-total-used">0</div></div>
                <div class="db-card"><p style="color:#888; margin:0 0 10px;">총 잔여 티켓</p><div style="font-size:26px; font-weight:900; color:#007aff;" id="ws-total-remain">0</div></div>
                <div class="db-card"><p style="color:#888; margin:0 0 10px;">오늘 현장 방문 (리버타드)</p><div style="font-size:26px; font-weight:900; color:#34c759;" id="ws-today-count">0</div></div>
            </div>

            <div class="db-card" style="margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">판매처별 현황</h3>
                    <button class="btn-action-outline" onclick="openAddAgencyModal()" style="border-radius:8px; padding:6px 12px; font-weight:bold;">+ 새 판매처 등록</button>
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; min-width:800px;">
                        <thead>
                            <tr style="border-bottom:2px solid #eee;">
                                <th style="padding:12px; text-align:left; color:#888; font-size:13px;">판매처명</th>
                                <th style="padding:12px; text-align:center; color:#888; font-size:13px;">누적 구매</th>
                                <th style="padding:12px; text-align:center; color:#888; font-size:13px;">누적 사용</th>
                                <th style="padding:12px; text-align:center; color:#888; font-size:13px; font-weight:bold; color:#007aff;">현재 잔여량</th>
                                <th style="padding:12px; text-align:center; color:#888; font-size:13px;">상태</th>
                                <th style="padding:12px; text-align:center; color:#888; font-size:13px;">QR 관리</th>
                                <th style="padding:12px; text-align:right; color:#888; font-size:13px;">관리 액션</th>
                            </tr>
                        </thead>
                        <tbody id="ws-agency-list">
                            <tr><td colspan="7" style="padding:30px; text-align:center; color:#aaa;">데이터를 불러오는 중...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    <style>
        .db-card { background:#fff; border-radius:16px; padding:24px; box-shadow:0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f0f0f0; transition: transform 0.2s; }
        .db-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }
        .db-card h3 { margin:0 0 10px; font-size:16px; color:#111; font-weight:800; }
        .btn-db-close { background:#fff; color:#333; border:1px solid #ddd; padding:10px 20px; border-radius:12px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition:0.2s; }
        .btn-db-close:hover { background:#f5f5f5; border-color:#ccc; }
        .badge { padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; }
        .badge-active { background:rgba(52,199,89,0.1); color:#34c759; }
        .badge-inactive { background:rgba(255,45,85,0.1); color:#ff2d55; }
        .btn-sm { padding:4px 8px; border:1px solid #ddd; background:#fff; border-radius:4px; font-size:11px; cursor:pointer; font-weight:bold; }
        .btn-sm:hover { background:#f9f9f9; }
    </style>

    <script>
        window.switchDashboard = function(tab) {
            document.getElementById('dashboard-overlay').style.display = 'block';
            document.querySelectorAll('.db-panel').forEach(p => p.style.display = 'none');
            const target = document.getElementById('db-' + tab);
            if(target) target.style.display = 'block';
        };

        window.closeDashboard = function() {
            document.getElementById('dashboard-overlay').style.display = 'none';
        };
    </script>

"""

new_content = content[:start_idx] + new_dashboard + "\n    " + content[end_idx:]

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement successful")
