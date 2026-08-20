# 🎯 Faaliyet Takip Portalı - Frontend

Bu proje, kurum/şirket içi etkinlik ve faaliyetlerin planlanması, katılım durumlarının yönetilmesi ve kullanıcı rollerinin organize edilmesi amacıyla geliştirilmiş modern bir web arayüzüdür.

## 🛠️ Kullanılan Teknolojiler
* Angular 17+ (Standalone Component Mimarisi)
* TypeScript
* HTML5 & CSS3 (Koyu / Açık Tema Desteği)
* RxJS & HttpClient

## ✨ Temel Özellikler
* Rol Tabanlı Erişim Kontrolü (RBAC): Admin ve Standart Kullanıcı rollerine göre dinamik buton ve menü kontrolleri.
* Gelişmiş Admin Yönetim Paneli: Sistemdeki kullanıcıları listeleme, rol güncelleme (Admin/Kullanıcı) ve kullanıcı silme işlemleri.
* Süper Admin Koruması: Ana yönetici hesabının kilitlenmesi, silinmesinin veya yetkisinin düşürülmesinin engellenmesi.
* Otomatik Faaliyet Yaşam Döngüsü: Tarihi geçen faaliyetlerin otomatik tamamlandı olarak işaretlenmesi ve geçmiş etkinliklere katılımın kısıtlanması.
* Kademeli Arşivleme: Tamamlanan faaliyetlerin 3 gün boyunca panoda kalması, 3 günden eski olanların admin arşivine aktarılması.
* Koyu / Açık Tema: Yerel depolama (LocalStorage) destekli anlık tema geçişi.
* Bildirimler & Detay Modalı: Etkinlik davet bildirimleri ve detaylı katılımcı durumu pencereleri.

## 🚀 Kurulum ve Çalıştırma

1. Depoyu klonlayın:
```bash
git clone https://github.com/AhmetEfeGucek/faaliyet-takip-frontend.git
cd faaliyet-takip-frontend
npm install
npm start
http://localhost:4200
