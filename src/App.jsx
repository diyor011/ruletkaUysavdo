import React, { useState, useEffect } from 'react';
import { Phone, Hash, User, RefreshCw } from 'lucide-react';

const initialGifts = [
  { name: "Xolodilnik", count: 20 },
  { name: "Kiryuvush mashinasi", count: 20 },
  { name: "Konditsioner", count: 20 },
  { name: "Spark", count: 2 },
  { name: "Televizor", count: 20 },
];

const App = () => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [gifts, setGifts] = useState([]);
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ✅ dropdown state

  // 🎵 Ovozlar
  const spinSound = new Audio('/spin.mp3');
  const winSound = new Audio('/win.mp3');

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

  const fetchParticipants = async () => {
    try {
      const response = await fetch('https://fast.uysavdo.com/api/promotions/promocode-users');
      const data = await response.json();

      setParticipants(
        data?.users?.map(user => ({
          id: user.user_id,
          phone: user.phone || 'Telefon mavjud emas',
          promoCode: user.promocode || 'PROMO2025'
        })) || []
      );
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
      setParticipants([]);
    }
  };

  // Ruletka aylanishi
  const startRandomSpin = async () => {
    if (participants.length === 0 || selectedGiftIndex === null) return;

    setIsLoading(true);
    setIsAnimating(true);

    spinSound.currentTime = 0;
    spinSound.play();

    const animationDuration = 10000;
    const intervalTime = 100;

    const interval = setInterval(() => {
      const currentIndex = Math.floor(Math.random() * participants.length);
      setSelectedParticipant(participants[currentIndex]);
    }, intervalTime);

    setTimeout(() => {
      clearInterval(interval);
      spinSound.pause();

      const finalParticipant = participants[Math.floor(Math.random() * participants.length)];
      const result = { ...finalParticipant, selectedAt: new Date().toISOString() };

      setSelectedParticipant(result);
      setIsAnimating(false);
      setIsLoading(false);

      winSound.currentTime = 0;
      winSound.play();

      saveResult(result);
    }, animationDuration);
  };

  // Sovg‘a tanlash
  const handleGiftSelect = (giftIndex) => {
    setSelectedGiftIndex(giftIndex);
    setIsDropdownOpen(false); // ✅ tanlagandan keyin yopish
  };

  // Natijani saqlash va sovg‘ani kamaytirish
const saveResult = async (result) => {
  if (selectedGiftIndex === null) return;

  const selectedGift = gifts[selectedGiftIndex];

  try {
    // 1️⃣ Oldingi save-result API (optional)
    await fetch('https://fast.uysavdo.com/api/promotions/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });

    // 2️⃣ Yangi assign-prize API
    await fetch('https://fast.uysavdo.com/api/promotions/assign-prize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prize: selectedGift.name.toLowerCase(), // sovga nomi kichik harf
        user_id: result.id
      })
    });

  } catch (error) {
    console.log("Ma'lumot yuborishda xatolik:", error);
  }

  // Sovg‘a sonini kamaytirish
  const updatedGifts = [...gifts];
  if (updatedGifts[selectedGiftIndex].count > 0) {
    updatedGifts[selectedGiftIndex].count -= 1;
  }
  setGifts(updatedGifts);
  localStorage.setItem("gifts", JSON.stringify(updatedGifts));
  setSelectedGiftIndex(null);
};


  return (
    <div className='bg-[linear-gradient(116.82deg,#15A5A0_0%,#B4C29E_100%)] min-h-screen flex flex-col relative'>
      {/* Header */}
      <nav className='pt-8 px-8'>
        <img src="logo.png" alt="Logo" />
      </nav>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center p-8 flex-col'>
        <div className='max-w-md w-full space-y-8'>

          {/* Promo ruletka */}
          <div className='bg-white rounded-3xl p-8 shadow-2xl'>
            <div className='text-center space-y-6'>
              <div className='flex justify-center'>
                <img src="party-card.png" alt="Party Card" />
              </div>
              <div className='bg-[linear-gradient(116.82deg,#15A5A0_0%,#B4C29E_100%)] text-white px-6 py-2 rounded-full font-bold text-lg'>
                {isAnimating ? 'PROMO????' : selectedParticipant?.promoCode || 'PROMOCODE2025'}
              </div>
            </div>
          </div>

          {/* Sovg‘alar menyusi */}
          <div>
            <button
              className="p-2 rounded-xl shadow bg-[linear-gradient(116.82deg,#15A5A0_0%,#B4C29E_100%)] text-white w-full"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Sovgani tanlash
            </button>

            {isDropdownOpen && (
              <ul className="dropdown menu w-full rounded-box bg-base-100 mt-2">
                {gifts.map((gift, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleGiftSelect(index)}
                      disabled={gift.count === 0}
                      className="flex justify-between w-full"
                    >
                      <span>{gift.name}</span>
                      <span className="badge">{gift.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Randomni boshlash tugmasi */}
          {selectedGiftIndex !== null && (
            <button
              onClick={startRandomSpin}
              disabled={isLoading}
              className='bg-[linear-gradient(116.82deg,#15A5A0_0%,#B4C29E_100%)] hover:bg-teal-600 text-white px-8 py-3 rounded-full font-semibold w-full flex items-center justify-center gap-2'
            >
              <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
              {isLoading ? 'Tanlanmoqda...' : 'Randomni boshlash'}
            </button>
          )}

          {/* Natija */}
          {selectedParticipant && (
            <div className='bg-white rounded-3xl p-6 shadow-2xl border-l-4 border-teal-500'>
              <h3 className='text-teal-600 font-bold text-lg flex items-center gap-2'>
                <User className='w-5 h-5' /> Tanlangan Ishtirokchi
              </h3>
              <div className='mt-3 space-y-2'>
                <div className='flex justify-between'>
                  <span>Telefon:</span>
                  <span>{selectedParticipant.phone}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Promo kod:</span>
                  <span className='font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-sm'>
                    {selectedParticipant.promoCode}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className='p-8 text-center text-white/80 text-sm flex justify-end'>
        <img className='absolute bottom-0 right-0' src="footer.png" alt="Footer" />
      </footer>
    </div>
  );
};

export default App;
