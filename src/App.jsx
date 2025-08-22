import React, { useState, useEffect, useRef } from 'react';
import { User, RefreshCw } from 'lucide-react';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [ishidden ,setIshidden] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false); // ✅ aylanish jarayoni

  const dropdownRef = useRef(null);

  const spinSound = new Audio('/spin.mp3');
  const winSound = new Audio('/win.mp3');
setInterval(() => {
  setIshidden(true)
}, 20000);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('https://fast.uysavdo.com/api/promotions/promocode-users');
      const data = await response.json();

      setParticipants(
        data?.users?.map(user => ({
          id: user.user_id,
          phone: user.phone || 'Telefon mavjud emas',
          promoCode: user.promocode || 'PROMO2025',
          lastName: user.last_name,
          firstName: user.first_name
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
    setIsSpinning(true); // ✅ boshlanganda modal ochiladi

    spinSound.currentTime = 0;
    spinSound.play();

    const animationDuration = 15000; // 
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

      // ✅ tugaganda modal yopilib, card joyiga qaytadi

    }, animationDuration);
  };

  const handleGiftSelect = (giftIndex) => {
    setSelectedGiftIndex(giftIndex);
    setIsDropdownOpen(false);
  };

  const saveResult = async (result) => {
    if (selectedGiftIndex === null) return;

    const selectedGift = gifts[selectedGiftIndex];

    try {
      await fetch('https://fast.uysavdo.com/api/promotions/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });

      await fetch('https://fast.uysavdo.com/api/promotions/assign-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prize: selectedGift.name.toLowerCase(),
          user_id: result.id
        })
      });
    } catch (error) {
      console.log("Ma'lumot yuborishda xatolik:", error);
    }

    const updatedGifts = [...gifts];
    if (updatedGifts[selectedGiftIndex].count > 0) {
      updatedGifts[selectedGiftIndex].count -= 1;
    }
    setGifts(updatedGifts);
    localStorage.setItem("gifts", JSON.stringify(updatedGifts));

    // ❌ Buni olib tashlaymiz:
    // setSelectedGiftIndex(null);
  };

  return (
    <div className='bg-[linear-gradient(116.82deg,#15A5A0_0%,#B4C29E_100%)] min-h-screen flex flex-col relative'>
      {/* Header */}
      <nav className={`pt-8 px-8 relative transition-all duration-500 ${isSpinning ? 'blur-sm' : ''}`}>
        <img
          src="logoMain.png"
          alt="Logo"
          className="cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        />
        {isDropdownOpen && (
          <ul
            ref={dropdownRef}
            className="dropdown menu w-52 rounded-box bg-base-100 mt-2 absolute z-50"
          >
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
      </nav>

      {/* Main Content */}
      <main className={`flex-1 flex items-center justify-center p-8 flex-col transition-all duration-500 ${isSpinning ? 'blur-sm' : ''}`}>
        <div className='max-w-[45%] w-full space-y-8'>
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

          {/* Winner Overlay (faqat aylanish vaqtida) */}
          {isSpinning && selectedParticipant && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-10 shadow-2xl border-l-8 border-teal-500 max-w-4xl w-full transform scale-110 transition-transform duration-700">
                <h3 className='text-teal-600 font-bold text-2xl flex items-center gap-2'>
                  <User className='w-6 h-6' /> Tanlangan Ishtirokchi
                </h3>
                <div className='mt-5 space-y-3 text-lg'>
                  <div className='flex justify-between'>
                    <span className='font-bold'>Telefon:</span>
                    <span>{selectedParticipant.phone}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-bold'>Promo kod:</span>
                    <span className='font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-full text-lg'>
                      {selectedParticipant.promoCode}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-bold'>Ism familiya:</span>
                    <span className='font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-sm'>
                      {selectedParticipant.lastName} {selectedParticipant.firstName}
                    </span>
                  </div>
                
                </div>


                {/* 🔥 Yangi tugma qo‘shildi */}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className={`p-8 text-center text-white/80 text-sm flex justify-end transition-all duration-500 ${isSpinning ? 'blur-sm' : ''}`}>
        <img className='absolute bottom-0 right-0' src="footer.png" alt="Footer" />
      </footer>

      {/* Winner Overlay (faqat aylanish vaqtida) */}
      {isSpinning && selectedParticipant && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 shadow-2xl border-l-8 border-teal-500 max-w-7xl w-full transform scale-120 transition-transform duration-700 py-20">
            <h3 className='text-teal-600 font-bold text-4xl flex items-center gap-2'>
              <User className='w-16 h-6' /> Tanlangan Ishtirokchi
            </h3>
            <div className='mt-5 space-y-3 text-lg'>
              <div className='flex justify-between'>
                <span className='font-bold text-2xl'>Telefon:</span>
                <span className='font-bold text-2xl'>{selectedParticipant.phone}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-bold text-2xl'>Promo kod:</span>
                <span className='font-bold text-2xl text-teal-600 bg-teal-50 px-4 py-2 rounded-full'>
                  {selectedParticipant.promoCode}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-bold text-2xl'>Ism familiya:</span>
                <span className='font-bold text-2xl text-teal-600 bg-teal-50 px-3 py-1 rounded-full '>
                  {selectedParticipant.lastName}
                  {selectedParticipant.firstName}
                </span>
              </div>
            </div>
               <div className={`mt-6  justify-center flex ` }>
                    <button
                      onClick={() => setIsSpinning(false)}
                      className={`bg-teal-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-700 ${ishidden ? 'block'  : 'hidden'}` }
                    >
                      Randomni qayta ishlatish
                    </button>
                  </div>
          </div>
         
        </div>
        
      )}
    </div>
  );
};

export default App;
