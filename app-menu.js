import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const restaurantSlug = urlParams.get('res') || 'burger-co';

async function initMenu() {
  try {
    // 1. جلب المطعم
    const qRes = query(collection(db, "restaurants"), where("slug", "==", restaurantSlug));
    const resSnap = await getDocs(qRes);

    if (resSnap.empty) {
      document.getElementById('res-name').innerText = "المطعم غير مسجل";
      return;
    }

    const resData = resSnap.docs[0].data();
    const resId = resSnap.docs[0].id;

    document.getElementById('res-name').innerText = resData.name;
    document.getElementById('res-logo').src = resData.logoUrl || 'https://via.placeholder.com/100';
    document.getElementById('res-phone').innerText = resData.phone;
    document.getElementById('res-phone-btn').href = `tel:${resData.phone}`;
    document.title = `${resData.name} | المنيو التفاعلي 3D`;

    // 2. جلب الأطباق
    const qProd = query(collection(db, "products"), where("restaurantId", "==", resId));
    const prodSnap = await getDocs(qProd);

    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    prodSnap.forEach(d => {
      const item = d.data();
      grid.innerHTML += `
        <div class="product-card glass-panel rounded-2xl overflow-hidden flex flex-col justify-between">
          <div class="model-3d-box h-60 p-2">
            <span class="badge-3d">360° VIEW</span>
            <model-viewer src="${item.modelUrl}" alt="${item.title}" auto-rotate camera-controls disable-zoom class="w-full h-full"></model-viewer>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-white text-lg">${item.title}</h3>
                <span class="font-black text-amber-400 text-lg">${item.price} ج.م</span>
              </div>
              <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">${item.description}</p>
            </div>
            <button onclick="window.open3DModal('${item.title}', '${item.price} ج.م', '${item.description}', '${item.modelUrl}')" 
                    class="w-full bg-slate-800/80 hover:bg-amber-500 hover:text-black font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2">
              <span>👁️ معاينة ثلاثية الأبعاد كاملة</span>
            </button>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("خطأ المنيو:", err);
  }
}

initMenu();