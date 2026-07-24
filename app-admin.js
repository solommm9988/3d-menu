import { db, storage } from "./firebase-config.js";
import { doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const RESTAURANT_ID = "rest_001";

// 1. تحميل الهوية
export async function initBranding() {
  try {
    const docSnap = await getDoc(doc(db, "restaurants", RESTAURANT_ID));
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('brand-name').value = data.name || '';
      document.getElementById('brand-slug').value = data.slug || '';
      document.getElementById('brand-logo').value = data.logoUrl || '';
      document.getElementById('brand-phone').value = data.phone || '';
      document.getElementById('preview-menu-btn').href = `index.html?res=${data.slug}`;
    }
  } catch (err) {
    console.error("خطأ في تحميل الهوية:", err);
  }
}

// 2. حفظ الهوية
document.getElementById('form-branding')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('brand-name').value;
  const slug = document.getElementById('brand-slug').value;
  const logoUrl = document.getElementById('brand-logo').value;
  const phone = document.getElementById('brand-phone').value;

  try {
    await setDoc(doc(db, "restaurants", RESTAURANT_ID), { name, slug, logoUrl, phone }, { merge: true });
    alert('✅ تم حفظ الهوية في الفايربيس!');
    initBranding();
  } catch (err) {
    alert('❌ خطأ: ' + err.message);
  }
});

// 3. رفع طبق 3D
document.getElementById('form-add-product')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('prod-title').value;
  const price = document.getElementById('prod-price').value;
  const category = document.getElementById('prod-category').value;
  const description = document.getElementById('prod-desc').value;
  const file = document.getElementById('prod-file-3d').files[0];

  if (!file) return alert('اختر ملف 3D بصيغة .glb');

  const progressContainer = document.getElementById('upload-progress-container');
  const progressBar = document.getElementById('upload-bar');
  const progressText = document.getElementById('upload-percentage');
  progressContainer.classList.remove('hidden');

  const storageRef = ref(storage, `models/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressBar.style.width = progress + '%';
      progressText.innerText = Math.round(progress) + '%';
    }, 
    (err) => alert('خطأ أثناء الرفع: ' + err.message), 
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      await addDoc(collection(db, "products"), {
        restaurantId: RESTAURANT_ID,
        title, price, category, description,
        modelUrl: downloadURL,
        createdAt: new Date()
      });
      alert('🎉 تم رفع الطبق ونشره!');
      progressContainer.classList.add('hidden');
      document.getElementById('form-add-product').reset();
      loadDishesList();
    }
  );
});

// 4. جدول الأطباق
export async function loadDishesList() {
  try {
    const q = query(collection(db, "products"), where("restaurantId", "==", RESTAURANT_ID));
    const snap = await getDocs(q);
    const tbody = document.getElementById('dishes-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let count = 0;

    snap.forEach((d) => {
      count++;
      const item = d.data();
      tbody.innerHTML += `
        <tr class="hover:bg-slate-800/50 transition-all border-b border-slate-800/40">
          <td class="p-3 w-20 h-20">
            <model-viewer src="${item.modelUrl}" auto-rotate camera-controls disable-zoom class="w-full h-full bg-slate-950 rounded-xl"></model-viewer>
          </td>
          <td class="p-4 font-bold text-white">${item.title}</td>
          <td class="p-4 text-xs text-amber-400 font-semibold">${item.category}</td>
          <td class="p-4 font-black text-emerald-400">${item.price} ج.م</td>
          <td class="p-4 text-center">
            <button onclick="window.deleteDish('${d.id}')" class="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    });

    document.getElementById('stat-total-products').innerText = count;
    document.getElementById('stat-3d-count').innerText = count;
  } catch (err) {
    console.error("خطأ في جلب الأطباق:", err);
  }
}

window.deleteDish = async function(id) {
  if (confirm('هل تريد حذف هذا الطبق؟')) {
    await deleteDoc(doc(db, "products", id));
    loadDishesList();
  }
};

// تشغيل
initBranding();
loadDishesList();