import React, { useState, useEffect, useRef } from 'react';
import { User, RefreshCw, Gift, ArrowLeft } from 'lucide-react';

// Dastlabki sovg‘alar
const initialGifts = [
  { name: "Xolodilnik", count: 2, image: "/fridge.png" },
  { name: "Kiryuvush mashinasi", count: 2, image: "/wash.png" },
  { name: "Konditsioner", count: 2, image: "/aircon.png" },
  { name: "Spark", count: 1, image: "/spark.png" },
  { name: "Televizor", count: 3, image: "/tv.png" },
];

// Frontend nomini backend nomiga map qilish
const giftKeyMap = {
  "Xolodilnik": "fridge",
  "Kiryuvush mashinasi": "washer",
  "Konditsioner": "conditioner",
  "Spark": "spark",
  "Televizor": "tv"
};

const App = () => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [isGiftAnimating, setIsGiftAnimating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [ishidden, setIshidden] = useState(false);
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  const [giftCounts, setGiftCounts] = useState({}); // Admin panel uchun

  const spinSound = useRef(new Audio('/spin.mp3'));
  const winSound = useRef(new Audio('/win.mp3'));

  // Component mount bo‘lganida
  useEffect(() => {
    fetchParticipants();
    const storedGifts = localStorage.getItem("gifts");
    if (storedGifts) {
      setGifts(JSON.parse(storedGifts));
    } else {
      localStorage.setItem("gifts", JSON.stringify(initialGifts));
      setGifts(initialGifts);
    }
  }, []);

  // Foydalanuvchilarni backend dan olish
  const fetchParticipants = async () => {
    try {
      const response = await fetch('https://fast.uysavdo.com/api/promotions/promocode-users');
      const data = await response.json();
      const users = data?.users?.map(user => ({
        id: user.user_id,
        phone: user.phone || 'Telefon mavjud emas',
        promoCode: user.promocode || 'PROMOCODE2025',
        lastName: user.last_name,
        firstName: user.first_name
      })) || [];

      setParticipants(users);
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
      setParticipants([]);
    }
  };

  // Random sovg'a tanlash
  const handleRandomGift = () => {
    const availableGifts = gifts.filter(g => g.count > 0);
    if (availableGifts.length === 0) {
      alert("Sovg‘alar tugadi!");
      return;
    }

    setIsGiftAnimating(true);
    setSelectedGift(null);

    let currentIndex = 0;
    const interval = setInterval(() => {
      setSelectedGift(availableGifts[currentIndex]);
      currentIndex = (currentIndex + 1) % availableGifts.length;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const giftIndex = Math.floor(Math.random() * availableGifts.length);
      setSelectedGift(availableGifts[giftIndex]);
      setIsGiftAnimating(false);
    }, 5000);
  };
// Component ichida state qo'shamiz
const [showFireworks, setShowFireworks] = useState(false);

// Foydalanuvchi tanlanganda
const startRandomSpin = async () => {
  if (!selectedGift) return;

  await fetchParticipants();
  if (participants.length === 0) return;

  setIsLoading(true);
  setIsAnimating(true);
  setIsSpinning(true);
  setIshidden(false);

  spinSound.current.currentTime = 0;
  spinSound.current.play();

  const interval = setInterval(() => {
    const currentIndex = Math.floor(Math.random() * participants.length);
    setSelectedParticipant(participants[currentIndex]);
  }, 100);

  setTimeout(async () => {
    clearInterval(interval);
    spinSound.current.pause();

    const finalParticipant = participants[Math.floor(Math.random() * participants.length)];
    const result = { ...finalParticipant, prize: selectedGift.name, selectedAt: new Date().toISOString() };

    setSelectedParticipant(result);
    setIsAnimating(false);
    setIsLoading(false);

    winSound.current.currentTime = 0;
    winSound.current.play();

    // 🔹 Bu yerda GIFni ko'rsatamiz
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 10000); // 5 soniyadan keyin yashirish

    await saveResult(result, selectedGift);
    await fetchParticipants();
    setTimeout(() => setIshidden(true), 10000);
  }, 10000);
};


  // Backend-ga natijani yuborish va sovg‘a countini kamaytirish
  const saveResult = async (result, selectedGift) => {
    try {
      // Natijani saqlash
      await fetch('https://fast.uysavdo.com/api/promotions/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });

      // Sovg‘ani foydalanuvchiga biriktirish
      const backendGiftKey = giftKeyMap[selectedGift.name];
      await fetch('https://fast.uysavdo.com/api/promotions/assign-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prize: backendGiftKey,
          user_id: result.id
        })
      });
    } catch (error) {
      console.log("Ma'lumot yuborishda xatolik:", error);
    }

    // Local storage va frontend countni yangilash
    const updatedGifts = [...gifts];
    const idx = updatedGifts.findIndex(g => g.name === selectedGift.name);
    if (updatedGifts[idx].count > 0) {
      updatedGifts[idx].count -= 1;
    }
    setGifts(updatedGifts);
    localStorage.setItem("gifts", JSON.stringify(updatedGifts));
  };

  // Spinni reset qilish
  const handleRestart = () => {
    setIsSpinning(false);
    setIshidden(false);
    setSelectedParticipant(null);
    setSelectedGift(null);
  };

  // Admin panel funksiyalari
  const handleLogoClick = () => setIsAdminPanelVisible(prev => !prev);
  const handleGiftCountChange = (giftName, value) => {
    setGiftCounts(prev => ({ ...prev, [giftName]: Number(value) }));
  };
  const saveGiftCounts = () => {
    const updatedGifts = gifts.map(gift => ({
      ...gift,
      count: giftCounts[gift.name] ?? gift.count
    }));
    setGifts(updatedGifts);
    localStorage.setItem("gifts", JSON.stringify(updatedGifts));
    alert("Sovg‘a countlari yangilandi!");
  };

  return (
    <div className='bg-[linear-gradient(116.82deg,#15A5A0_0%,#B4C29E_100%)] min-h-screen flex flex-col relative'>
      <nav className="pt-8 px-8 relative">
        <img src="/logoMain.png" alt="Logo" onClick={handleLogoClick} className="cursor-pointer" />
      </nav>

      <main className="flex-1 flex items-center justify-center p-8 flex-col">
        <div className='max-w-[45%] w-full space-y-8'>
          {/* Sovg'a karta */}
          <div className='bg-white rounded-3xl p-8 shadow-2xl'>
            <div className='text-center space-y-6'>
              <div className='flex justify-center'>
                <img src={selectedGift?.image || "/party-card.png"} alt="Selected Gift" className="w-32 h-32 object-contain" />
              </div>
              <div className='bg-gradient-to-r from-teal-500 to-lime-400 text-white px-6 py-2 rounded-full font-bold text-lg'>
                {selectedGift ? selectedGift.name : "PROMOCODE2025"}
              </div>
            </div>
          </div>

          <button
            onClick={handleRandomGift}
            disabled={isGiftAnimating}
            className='bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold w-full flex items-center justify-center gap-2'
          >
            <Gift className={`w-5 h-5 ${isGiftAnimating ? 'animate-spin' : ''}`} />
            {isGiftAnimating ? 'Sovga tanlanmoqda...' : 'Sovgani random tanlash'}
          </button>

          {selectedGift && !isGiftAnimating && (
            <button
              onClick={startRandomSpin}
              disabled={isLoading || participants.length === 0}
              className='bg-gradient-to-r from-teal-500 to-lime-400 hover:opacity-90 text-white px-8 py-3 rounded-full font-semibold w-full flex items-center justify-center gap-2'
            >
              <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
              {isLoading ? 'Tanlanmoqda...' : (participants.length === 0 ? 'Foydalanuvchilar yo‘q' : 'Foydalanuvchini random tanlash')}
            </button>
          )}
        </div>
      </main>

      <footer className="p-8 text-center text-white/80 text-sm flex justify-end">
        <img className='absolute bottom-0 right-0' src="/footer.png" alt="Footer" />
      </footer>

      {/* Admin panel */}
      {isAdminPanelVisible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white border shadow-lg p-6 rounded-xl z-50 w-96">
          <h2 className="font-bold text-xl mb-4 text-teal-600">Admin Panel - Sovg‘a Count</h2>
          {gifts.map(gift => (
            <div key={gift.name} className="flex justify-between items-center mb-3">
              <span>{gift.name}</span>
              <input
                type="number"
                min="0"
                value={giftCounts[gift.name] ?? gift.count}
                onChange={(e) => handleGiftCountChange(gift.name, e.target.value)}
                className="border rounded px-2 py-1 w-20"
              />
            </div>
          ))}
          <button onClick={saveGiftCounts} className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            Saqlash
          </button>
        </div>
      )}

      {/* Spin natija paneli */}
      {isSpinning && selectedParticipant && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-3xl p-10 shadow-2xl border-l-8 border-teal-500 max-w-4xl w-full transform scale-110 transition-transform duration-700 py-10 relative">
            <button onClick={handleRestart} className="absolute top-5 left-5 flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold">
              <ArrowLeft className="w-5 h-5" /> Orqaga
            </button>

            <h3 className='text-teal-600 font-bold text-3xl flex items-center gap-2 mt-5'>
              <User className='w-8 h-8' /> Tanlangan Ishtirokchi
            </h3>
            <div className='mt-5 space-y-4 text-xl'>
              <div className='flex justify-between'><span className='font-bold'>Telefon:</span><span>{selectedParticipant.phone}</span></div>
              <div className='flex justify-between'><span className='font-bold'>Promo kod:</span><span className='font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-full'>{selectedParticipant.promoCode}</span></div>
              <div className='flex justify-between'><span className='font-bold'>Ism familiya:</span><span className='font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full'>{selectedParticipant.lastName} {selectedParticipant.firstName}</span></div>
              <div className='flex justify-between items-center'>
                <span className='font-bold'>Sovg‘a:</span>
                <div className='flex items-center gap-3'>
                  {selectedGift?.image && <img src={selectedGift.image} alt={selectedGift.name} className="w-14 h-14 object-contain" />}
                  <span className='font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full'>{selectedGift.name}</span>
                </div>
              </div>
            </div>
            {/* Fireworks GIF */}
            {showFireworks && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <img src="/source.gif" alt="Fireworks" className="w-full h-full object-cover" />
              </div>
            )}

            <div className='mt-8 flex justify-center'>
              <button
                onClick={handleRestart}
                className={`bg-teal-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-700 ${ishidden ? 'block' : 'hidden'}`}
              >
                Randomni qayta ishlatish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foydalanuvchilar yo‘qligini ko‘rsatish */}
      {!isSpinning && participants.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/20">
          <div className="bg-white rounded-xl p-6 shadow-md text-center text-xl font-semibold text-red-600">
            Foydalanuvchilar mavjud emas!
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
