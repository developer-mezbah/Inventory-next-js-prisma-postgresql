import { useState } from "react";

const SelectOnlyToggle = ({ originalData, selectedItems, setImageData }) => {
  const handleToggle = () => {
    setIsSelectedOnly((prev) => !prev);
  };
  const [checked, setChcked] = useState(false);

  const handleSelectItems = () => {
    if (checked === true) {
      setChcked(false);
      setImageData(originalData);
    } else {
      setChcked(true);
      const matchingData = originalData.filter((obj) =>
        selectedItems.includes(obj.img_url)
      );
      setImageData(matchingData);
    }
  };
  return (
    <div onClick={handleSelectItems} className="items-center space-x-2">
      <div className="flex items-center cursor-pointer space-x-2">
        {/* <input type="checkbox" className="hidden" /> */}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
            checked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-400"
          }`}
        >
          {checked && <div className="w-3 h-3 bg-white rounded-full"></div>}
        </div>
        <button className="text-sm text-gray-700">Selected Only</button>
      </div>
    </div>
  );
};

export default SelectOnlyToggle;