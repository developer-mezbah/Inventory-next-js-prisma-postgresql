const { default: Image } = require("next/image");
const { HiAdjustments } = require("react-icons/hi");

export default function CashSection({ openModal, currentCash, currencySymbol }) {
    return (
        <div className="w-full flex flex-col items-center text-center px-4 py-10">

            {/* Image */}
            <Image
                width={400}
                height={400}
                src="/cash.png"
                alt="Cash Illustration"
                className="h-auto mb-6"
            />

            {/* Text */}
            <p className="text-gray-600 max-w-md leading-relaxed mb-6">
                Whenever you choose payment type as cash in your invoices,
                that amount will be reflected in cash in hand.
            </p>
            <p className="text-gray-600 pb-3">
                Current Cash Balance: <span className="font-bold text-lg text-green-600">{currentCash} {currencySymbol}</span>
            </p>

            {/* Button */}
            <button onClick={openModal} className="flex cursor-pointer items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-md transition-all">
                <HiAdjustments className="text-xl" />
                Adjust Cash
            </button>
        </div>
    );
}